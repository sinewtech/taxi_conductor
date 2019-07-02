import React, { Component } from "react";
import { Button, Icon } from "react-native-elements";
import { Text, View, BackHandler, StyleSheet, Alert, Platform, Dimensions } from "react-native";
import { Notifications } from "expo";
// import KeepAwake from "expo-keep-awake";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import * as TaskManager from "expo-task-manager";
import * as Permissions from "expo-permissions";
import Driver from "../Components/Driver";
import Briefing from "../Components/Briefing";
import Asking from "../Components/Asking";
import firebase from "../../firebase";
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableHighlight,
} from "react-native-gesture-handler";

const INITIAL_REGION = {
  latitude: 14.0723,
  longitude: -87.1921,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const DEBUG_MODE = false;

const API_KEY = "AIzaSyApNgtxFBp0SXSHljP_xku6peNCzjTFWM4";
const decodePolyline = require("decode-google-map-polyline");

const DRIVER_STATE_NONE = 0;
const DRIVER_STATE_ASKING = 1;
const DRIVER_STATE_GOING_TO_CLIENT = 2;
const DRIVER_STATE_CLIENT_IS_WITH_HIM = 3;
const DRIVER_STATE_GOING_TO_DESTINATION = 4;

const DRIVER_NOTIFICATION_ADS = 0;
const DRIVER_NOTIFICATION_CONFIRMING = 2;
const DRIVER_NOTIFICATION_CONFIRMED = 3;

const DRIVER_STATUS_NOT_WORKING = 0;
const DRIVER_STATUS_LOOKING_FOR_DRIVE = 1;
const DRIVER_STATUS_ON_A_DRIVE = 2;
const DRIVER_STATUS_CONFIRMING_DRIVE = 3;

const STATE_HEIGHT = {
  0: "25%",
  1: "50%",
};

const LOCATION_TASK_NAME = "TAXI_DRIVER_LOCATION";

let db = firebase.firestore();
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    Notifications.createChannelAndroidAsync("carreras", {
      name: "Carreras",
      priority: "max",
      vibrate: [0, 250, 250, 250],
      sound: true,
    });
    Notifications.createChannelAndroidAsync("ads", {
      name: "Ads",
      priority: "max",
      vibrate: [0, 250, 250, 250],
      sound: true,
    });
  }
  let token = "_";

  try {
    token = await Notifications.getExpoPushTokenAsync();
  } catch (e) {
    console.error(e);
  }

  return token;
}

class Home extends Component {
  constructor() {
    super();
    this.state = {
      driverState: DRIVER_STATE_NONE,
      selectedIndex: 0,
      user: {},
      order: { origin: {}, destination: {}, manual: true },
      polyline: [],
    };

    if (DEBUG_MODE) {
      this.state.driverState = DRIVER_STATE_ASKING;
      this.state.order = {
        origin: {
          name: "Universidad Tecnológica Centroamericana",
          //address: "frente a Residencial, V-782 Boulevard Kennedy, Tegucigalpa",
          address: null,
        },
        destination: {
          name: "Universidad Nacional Autónoma de Honduras",
          //address: "Bulevar Suyapa, Tegucigalpa, M.D.C, Honduras, Centroamérica ",
          address: null,
        },
        manual: true,
        price: 420.69,
      };
    }
  }

  updateUser = userdata => {
    userdata === null ? this.setState({ userUID: null }) : this.setState(userdata);
  };
  componentWillUnmount = async () => {
    Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).then(value => {
      console.log(value);
    });
  };

  componentDidMount = async () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .firestore()
          .collection("drivers")
          .doc(user.uid)
          .get()
          .then(value => {
            let data = value.data();
            this.updateUser({ user: data, userUID: user.uid });
            this.registerPush();
          });

        firebase
          .database()
          .ref()
          .child("locations/" + firebase.auth().currentUser.uid + "/status")
          .on("value", snap => {
            this.setState({ driverStatus: snap.exportVal(), selectedIndex: snap.exportVal() });
          });
      } else {
        this.updateUser(null);
      }
    });

    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== "granted") {
      Alert.alert("Servicios GPS", "Por favor activa los servicios de GPS para continuar.");
    }

    let tiene = await Location.getProviderStatusAsync();

    if (tiene.gpsAvailable) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 6000,
        distanceInterval: 2,
        foregroundService: {
          notificationTitle: "Servicios de Ubicación",
          notificationBody: "Tu ubicación está siendo monitoreada por la central.",
          notificationColor: "#FF9800",
        },
      });

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
        },

        location => {
          this.setState({
            driverposition: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
          });
        }
      );
    } else {
      Alert.alert("Servicios GPS", "Por favor activa los servicios de GPS para continuar.");
    }
  };

  getPoly = async (origin, destination) => {
    await fetch(
      "https://maps.googleapis.com/maps/api/directions/json?key=" +
        API_KEY +
        "&origin=" +
        origin.lat +
        "," +
        origin.lng +
        "&destination=" +
        destination.lat +
        "," +
        destination.lng
    )
      .then(response => response.json())
      .then(responseJson => {
        //console.log(JSON.stringify(responseJson));
        if (responseJson.status == "OK") {
          // console.log(responseJson.routes[0].overview_polyline);
          let polyline = decodePolyline(responseJson.routes[0].overview_polyline.points);

          this.setState({ polyline });
        } else {
          console.log("Status failed");
        }
      });
  };

  clear = () => {
    this.setState({
      driverState: DRIVER_STATE_NONE,
      order: { origin: {}, destination: {} },
      polyline: [],
    });
  };

  getState = () => {
    switch (this.state.driverState) {
      case DRIVER_STATE_NONE: {
        return <Briefing />;
      }
      case DRIVER_STATE_ASKING: {
        return (
          <Asking
            price={this.state.order.price}
            isManual={this.state.isManual}
            order={this.state.order}
            onAccept={() => {
              Alert.alert("Navegación", "Vamos hacia el cliente", [
                {
                  text: "OK",
                  onPress: () => {
                    this.updateDriverStatus(DRIVER_STATUS_ON_A_DRIVE);
                    firebase
                      .database()
                      .ref()
                      .child("/quotes/" + this.state.orderuid + "/status")
                      .set(3);
                    if (!this.state.isManual) {
                      this.getPoly(this.state.driverposition, this.state.order.origin);
                    }

                    this.setState({
                      driverState: DRIVER_STATE_GOING_TO_CLIENT,
                    });
                  },
                },
              ]);
            }}
            onReject={() => {
              Alert.alert(
                "Rechazando",
                "Estas a punto de rechazar una carrera.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      firebase
                        .database()
                        .ref()
                        .child("/quotes/" + this.state.orderuid + "/status")
                        .set(4);
                      this.setState({
                        order: { origin: {}, destination: {} },
                        polyline: [],
                        driverState: DRIVER_STATE_NONE,
                      });
                      this.updateDriverStatus(DRIVER_STATUS_LOOKING_FOR_DRIVE);
                    },
                  },
                  {
                    text: "REGRESAR",
                  },
                ],
                { cancelable: false }
              );
            }}
          />
        );
      }
      case DRIVER_STATE_GOING_TO_CLIENT: {
        this.updateDriverStatus(DRIVER_STATUS_ON_A_DRIVE);
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Icon name="local-taxi" size={100} color="#4CAF50" />
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 25,
              }}>
              ¿Llegaste a la ubicación del cliente?
            </Text>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}>
              <Button
                containerStyle={{ flex: 1, marginRight: 5 }}
                buttonStyle={{ height: 75 }}
                title="Si"
                onPress={() => {
                  console.log("Confirmando status para orden", this.state.orderuid);

                  Alert.alert(
                    "Notificando al cliente",
                    "Le notificaremos tu llegada al cliente.",
                    [
                      {
                        text: "ok",
                        onPress: () => {
                          firebase
                            .database()
                            .ref()
                            .child("/quotes/" + this.state.orderuid + "/status")
                            .set(5)
                            .then(() => console.log("Status enviado"))
                            .catch(e => console.error(e));

                          this.setState({
                            driverState: DRIVER_STATE_CLIENT_IS_WITH_HIM,
                          });
                        },
                      },
                    ],
                    { cancelable: false }
                  );
                  console.log("destination", this.state.destination);
                }}
              />
            </View>
          </View>
        );
      }

      case DRIVER_STATE_CLIENT_IS_WITH_HIM: {
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Icon name="local-taxi" size={100} color="#4CAF50" />
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 25,
              }}>
              {"¿El cliente ya abordó a la unidad?"}
            </Text>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}>
              <Button
                containerStyle={{ flex: 1, marginRight: 5 }}
                buttonStyle={{ height: 75 }}
                title="Si"
                onPress={() => {
                  console.log("Confirmando status para orden", this.state.orderuid);

                  Alert.alert(
                    "Navegacion",
                    "Vamos hacia el destino del cliente.",
                    [
                      {
                        text: "ok",
                        onPress: () => {
                          firebase
                            .database()
                            .ref()
                            .child("/quotes/" + this.state.orderuid + "/status")
                            .set(6)
                            .then(() => console.log("Status enviado"))
                            .catch(e => console.error(e));
                        },
                      },
                    ],
                    { cancelable: false }
                  );
                  console.log("destination", this.state.destination);

                  this.setState({
                    driverState: DRIVER_STATE_GOING_TO_DESTINATION,
                  });
                  if (!this.state.isManual) {
                    this.getPoly(this.state.driverposition, this.state.order.destination);
                  }
                }}
              />
            </View>
          </View>
        );
      }

      case DRIVER_STATE_GOING_TO_DESTINATION: {
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Icon name="local-taxi" size={100} color="#4CAF50" />
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 25,
              }}>
              ¿Haz terminado tu desplazamiento?
            </Text>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}>
              <Button
                containerStyle={{ flex: 1, marginRight: 5 }}
                buttonStyle={{ height: 75 }}
                title="Si"
                onPress={() => {
                  Alert.alert(
                    "Terminando Desplazamiento",
                    "¿Has terminado la carrera?",
                    [
                      {
                        text: "No",
                      },
                      {
                        text: "Sí",
                        onPress: () => {
                          this.updateDriverStatus(DRIVER_STATUS_LOOKING_FOR_DRIVE);

                          firebase
                            .database()
                            .ref()
                            .child("/quotes/" + this.state.orderuid + "/status")
                            .set(7)
                            .then(() => console.log("Status enviado"))
                            .catch(e => console.error(e));

                          this.clear();

                          Alert.alert(
                            "Carrera terminada",
                            "Gracias por cuidar a nuestro cliente.",
                            [{ text: "Cerrar" }]
                          );
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }}
              />
            </View>
          </View>
        );
      }
    }
  };
  registerPush = () => {
    registerForPushNotificationsAsync()
      .then(pushToken => {
        console.log(pushToken);
        if (pushToken) {
          db.collection("drivers")
            .doc(this.state.userUID)
            .get()
            .then(DocumentSnapshot => {
              let pushTokens = [];
              if (DocumentSnapshot.data()["pushDevices"]) {
                let deviceJson = DocumentSnapshot.data()["pushDevices"];
                for (var token in deviceJson) {
                  if (deviceJson[token] === pushToken) {
                    console.log("Pushtoken ya existe para usuario.");
                    return;
                  } else {
                    console.log("Agregando nuevo PushToken", pushToken);
                    pushTokens.push(pushToken);
                  }
                }
              } else {
                pushTokens.push(pushToken);
              }
              db.collection("drivers")
                .doc(this.state.userUID)
                .update({
                  pushDevices: pushTokens,
                });
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          console.error("Pushtoken nulo");
        }
      })
      .catch(e => console.error(e));

    this._notificationSubscription = Notifications.addListener(this._handleNotification);

    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.deactivate(); // works best when the goBack is async
      return true;
    });
  };

  deactivate = () => {
    this.setState({ order: { origin: {}, destination: {} } });
  };

  _handleNotification = notification => {
    console.log("Notificación recibida", notification);

    if (notification.data) {
      if (notification.data.id === DRIVER_NOTIFICATION_CONFIRMING) {
        firebase
          .database()
          .ref()
          .child("quotes/" + notification.data.order.uid + "/")
          .once("value", snap => {
            let data = snap.exportVal();
            this.setState({
              order: data,
              orderuid: notification.data.order.uid,
              isManual: notification.data.order.manual,
            });
            this.updateDriverStatus(DRIVER_STATUS_CONFIRMING_DRIVE);

            console.log("Estado", this.state);

            if (
              !this.state.isManual &&
              this.state.order.origin !== undefined &&
              this.state.order.destination !== undefined
            ) {
              console.log("Dibujando ruta...");
              this.getPoly(data.origin, data.destination);
            }
          });
      } else if (
        notification.data.id === DRIVER_NOTIFICATION_CONFIRMING &&
        notification.order.manual
      ) {
        firebase
          .database()
          .ref()
          .child("quotes/" + notification.data.order.uid + "/")
          .once("value", snap => {
            let data = snap.exportVal();
            this.setState({
              order: data,
              orderuid: notification.data.order.uid,
              isManual: notification.data.order.manual,
            });
            this.updateDriverStatus(DRIVER_STATUS_CONFIRMING_DRIVE);
          });
      } else if (notification.data.id === DRIVER_NOTIFICATION_CONFIRMED) {
        if (this.state.order.manual)
          firebase
            .database()
            .ref()
            .child("quotes/" + notification.data.order.uid + "/")
            .once("value", snap => {
              let data = snap.exportVal();
              console.log("Orden manual recibida:", data);

              this.setState({
                order: data,
                orderuid: notification.data.order.uid,
                isManual: notification.data.order.manual,
                driverState: DRIVER_STATE_ASKING,
              });
              this.updateDriverStatus(DRIVER_STATUS_CONFIRMING_DRIVE);
            });
        else this.setState({ driverState: DRIVER_STATE_ASKING });
      }
    }
  };
  static getcurrentuser = () => {
    return firebase.auth().currentUser.uid;
  };

  updateDriverStatus = selectedIndex => {
    if (this.state.selectedIndex !== selectedIndex) {
      this.setState({ selectedIndex });
      firebase
        .database()
        .ref()
        .child("locations/" + firebase.auth().currentUser.uid + "/status")
        .set(selectedIndex);
    }
  };

  drawPolyline = () => {
    var coords = [];

    this.state.polyline.map(point => {
      coords.push({
        latitude: point.lat,
        longitude: point.lng,
      });
    });

    return coords;
  };

  render() {
    let originMarker = null;
    let destinationMarker = null;
    let polyline = null;

    if (this.state.order) {
      if (this.state.isManual === false) {
        console.log("Preparando componentes para marcadores...", this.state.order);

        originMarker = (
          <MapView.Marker
            title="Origen"
            description="Donde ese encuentra el cliente."
            pinColor="#4CAF50"
            coordinate={{
              latitude: this.state.order.origin.lat,
              longitude: this.state.order.origin.lng,
            }}
          />
        );

        destinationMarker = (
          <MapView.Marker
            title="Destino"
            description="Lleva al cliente acá."
            pinColor="#FF9800"
            coordinate={{
              latitude: this.state.order.destination.lat,
              longitude: this.state.order.destination.lng,
            }}
          />
        );

        polyline = (
          <MapView.Polyline
            strokeWidth={4}
            strokeColor="#03A9F4"
            coordinates={this.drawPolyline()}
          />
        );
      }
    }

    return (
      <View style={{ flex: 1 }}>
        {/* <KeepAwake /> */}
        <MapView
          style={{ flex: 1 }}
          showsTraffic
          showsUserLocation
          showsMyLocationButton
          loadingBackgroundColor="#FF9800"
          initialRegion={INITIAL_REGION}
          ref={ref => (this.map = ref)}
          mapPadding={{
            /*bottom:
              Dimensions.get("window").height *
              (Number.parseFloat(STATE_HEIGHT[this.state.driverState]) / 100),*/
            top: Dimensions.get("window").height * 0.1,
            left: 0,
            right: 0,
          }}>
          {this.state.order.origin.lat && this.state.order.origin.lng ? originMarker : null}
          {this.state.order.destination.lat && this.state.order.destination.lng
            ? destinationMarker
            : null}
          {this.state.polyline.length > 0 ? polyline : null}
        </MapView>
        <View
          style={styles.stateContainer}
          //height={STATE_HEIGHT[this.state.driverState]}
          maxHeight={
            STATE_HEIGHT[this.state.driverState]
              ? Dimensions.get("window").height *
                (Number.parseFloat(STATE_HEIGHT[this.state.driverState]) / 100)
              : null
          }
          elevation={3}>
          {this.getState()}
        </View>
        <View style={styles.centerNavigationView}>
          <TouchableHighlight
            flex={1}
            onPress={() => {
              if (this.map) {
                this.map.animateCamera({
                  pitch: 90,
                  heading: 180,
                  altitude: 10,
                  zoom: 60,
                });
              }
            }}>
            <Text>Olo</Text>
          </TouchableHighlight>
        </View>
        <Driver
          elevation={3}
          avatar={this.state.user.profile}
          name={this.state.user.name}
          username={this.state.user.username}
          signOut={firebase.auth().signOut}
          status={this.state.driverStatus}
          updateDriverStatus={this.updateDriverStatus}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
  },

  profiledata: { flexDirection: "row" },

  stateContainer: {
    width: "92%",
    marginLeft: "4%",
    marginRight: "4%",
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
    overflow: "hidden",
    bottom: "2%",
  },

  mapcontainer: { flex: 1 },

  centerNavigationView: {
    position: "absolute",
    top: "50%",
    left: "5%",
    zIndex: 10,
    backgroundColor: "red",
    borderRadius: 100,
    height: 25,
    width: 25,
  },
});

export default Home;
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data: { locations }, error }) => {
  if (error) {
    return;
  } else {
    locations[0].user = Home.getcurrentuser();

    fetch("https://us-central1-taxiapp-sinewave.cloudfunctions.net/location/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(locations[0]),
    })
      .then(res => res.text())
      .then(Response => {
        console.log("success:", Response);
      })
      .catch(error => console.log(error));
  }
});
