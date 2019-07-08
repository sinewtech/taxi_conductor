import React, { Component } from "react";
import { Button, Icon } from "react-native-elements";
import {
  Text,
  View,
  BackHandler,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  ToastAndroid,
} from "react-native";
import { Notifications } from "expo";
import KeepAwake from "expo-keep-awake";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import * as TaskManager from "expo-task-manager";
import * as Permissions from "expo-permissions";
import Driver from "../Components/Driver";
import Briefing from "../Components/Briefing";
import Asking from "../Components/Asking";
import firebase from "../../firebase";
import * as Constants from "../Constants";
const decodePolyline = require("decode-google-map-polyline");

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
  constructor(props) {
    super(props);

    this.state = {
      driverState: Constants.DRIVER_STATE_NONE,
      //driverState: Constants.DRIVER_STATE_ASKING,
      //driverState: Constants.DRIVER_STATE_GOING_TO_CLIENT,
      selectedIndex: 0,
      user: {},
      order: { origin: {}, destination: {}, manual: true },
      /*order: {
        destination: {
          address: "UNAH, Tegucigalpa, Honduras",
          lat: 14.0846099,
          lng: -87.16208569999999,
          name: "Universidad Nacional Autónoma de Honduras",
          placeId: "ChIJAAAAAAAAAAARSMV-oKtMiMk",
        },
        dispatchdatetime: "Thu Jul 04 2019 22:26:09 GMT-0600 (Central Standard Time)",
        driver: "ttYjTWJG29Xf7NhYs1IhcnJlvm32",
        origin: {
          address: "Santa Lucia, Honduras",
          lat: 14.1156621,
          lng: -87.1030485,
          name: "Cerca de Santa Lucia",
        },
        price: 123,
        status: 7,
        userUid: "icZlnhSMmsTgQV1r5XAzgZ2OKmi1",
        usingGps: true,
      },*/
      polyline: [],
      navigating: false,
      navigationCentered: false,
    };

    if (Constants.DEBUG_MODE) {
      this.state.driverState = Constants.DRIVER_STATE_ASKING;
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

  goToUserLocation = () => {
    if (this.map && this.state.driverPosition) {
      this.map.animateToRegion({
        latitude: this.state.driverPosition.lat,
        longitude: this.state.driverPosition.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  updateUser = userdata => {
    userdata === null ? this.setState({ userUID: null }) : this.setState(userdata);
  };

  //Cambia el valor de devMode en el state this.state.user.dev te dice si el usuario tiene permiso de dev, this.state.dev te dice si esta activo
  devToggle = () => {
    if (this.state.userUID !== null && this.state.user.dev) {
      userdata = this.state;
      userdata.dev = !userdata.dev;
      this.setState({ userdata });
      this.state.dev === true
        ? console.log("DEV MODE: ON")
        : (Platform.OS === "android" ? ToastAndroid.show("User Mode", ToastAndroid.LONG) : null,
          console.log("DEV MODE: OFF"));
    }
  };

  componentWillUnmount = async () => {
    Location.stopLocationUpdatesAsync(Constants.LOCATION_TASK_NAME).then(value => {
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
            console.log("\nDEV: " + data.dev);
            //mira si tiene el campo de "dev", y si lo tiene hace el dev mode true
            if (data.dev) {
              this.updateUser({ user: data, userUID: user.uid, dev: true });
            } else {
              this.updateUser({ user: data, userUID: user.uid, dev: false });
            }
            this.registerPush();
          });

        firebase
          .database()
          .ref()
          .child("locations/" + firebase.auth().currentUser.uid + "/status")
          .on("value", snap => {
            this.setState({ driverStatus: snap.exportVal(), selectedIndex: snap.exportVal() });
          });
        firebase
          .database()
          .ref()
          .child("quotes/")
          .once("value", snap => {
            snap.forEach(datasnap => {
              let order = datasnap.exportVal();
              if (order.driver === user.uid) {
                switch (order.status) {
                  case Constants.QUOTE_STATUS_PRICE_ACCEPTED: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_ASKING,
                      destination: order.destination,
                      origin: order.origin,
                      isManual: !order.usingGps,
                    });
                    if (order.usingGps) {
                      this.getPoly(order.origin, order.destination);
                    }
                    break;
                  }
                  case Constants.QUOTE_STATUS_DRIVER_GOING_TO_CLIENT: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_GOING_TO_CLIENT,
                      destination: order.destination,
                      origin: order.origin,
                      isManual: !order.usingGps,
                    });
                    if (order.usingGps) {
                      this.getPoly(this.state.driverpostion, order.origin);
                    }
                    break;
                  }
                  case Constants.QUOTE_STATUS_WAITING_CLIENT: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_CLIENT_IS_WITH_HIM,
                      destination: order.destination,
                      isManual: !order.usingGps,
                      origin: order.origin,
                    });
                    break;
                  }
                  case Constants.QUOTE_STATUS_CLIENT_ABORDED: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_GOING_TO_DESTINATION,
                      destination: order.destination,
                      origin: order.origin,
                      isManual: !order.usingGps,
                    });
                    if (order.usingGps) {
                      this.getPoly(this.state.driverPosition, order.destination);
                    }

                    break;
                  }
                  default:
                    break;
                }
              }
            });
          });
      } else {
        this.updateUser(null);
      }
    });

    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== "granted") {
      Alert.alert("Servicios GPS", "Por favor activa los servicios de GPS para continuar.");
    }

    let loc = await Location.getProviderStatusAsync();

    if (loc.gpsAvailable) {
      await Location.startLocationUpdatesAsync(Constants.LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
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
          accuracy: Location.Accuracy.BestForNavigation,
        },

        async location => {
          this.setState({
            driverPosition: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
          });

          //console.log("Navigating", this.state.navigating);
          //console.log("Centered", this.state.navigationCentered);

          if (this.state.navigating && this.state.navigationCentered) {
            //this.goToUserLocation();
            this.map.animateCamera({
              center: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              heading: location.coords.heading,
              pitch: 70,
              zoom: 50,
            });
          }
        }
      );
    } else {
      Alert.alert("Servicios GPS", "Por favor activa los servicios de GPS para continuar.");
    }
  };

  getPoly = async (origin, destination) => {
    await fetch(
      "https://maps.googleapis.com/maps/api/directions/json?key=" +
        Constants.API_KEY +
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
      driverState: Constants.DRIVER_STATE_NONE,
      order: { origin: {}, destination: {} },
      polyline: [],
    });
  };

  updateOrderStatus = status => {
    firebase
      .database()
      .ref()
      .child("/quotes/" + this.state.orderuid + "/status")
      .set(status);
  };

  getState = () => {
    switch (this.state.driverState) {
      case Constants.DRIVER_STATE_NONE: {
        return <Briefing />;
      }
      case Constants.DRIVER_STATE_ASKING: {
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
                    this.updateDriverStatus(Constants.DRIVER_STATUS_ON_A_DRIVE);
                    this.updateOrderStatus(Constants.QUOTE_STATUS_DRIVER_GOING_TO_CLIENT);
                    if (!this.state.isManual) {
                      this.getPoly(this.state.driverPosition, this.state.order.origin);
                    }

                    this.setState({
                      driverState: Constants.DRIVER_STATE_GOING_TO_CLIENT,
                      navigating: true,
                      navigationCentered: true,
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
                      this.updateOrderStatus(Constants.QUOTE_STATUS_DRIVER_DENNIED);

                      this.setState({
                        order: { origin: {}, destination: {} },
                        polyline: [],
                        driverState: Constants.DRIVER_STATE_NONE,
                      });
                      this.updateDriverStatus(Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE);
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
      case Constants.DRIVER_STATE_GOING_TO_CLIENT: {
        this.updateDriverStatus(Constants.DRIVER_STATUS_ON_A_DRIVE);
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
                          this.updateOrderStatus(Constants.QUOTE_STATUS_WAITING_CLIENT);
                          this.setState({
                            driverState: Constants.DRIVER_STATE_CLIENT_IS_WITH_HIM,
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

      case Constants.DRIVER_STATE_CLIENT_IS_WITH_HIM: {
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
                          this.updateOrderStatus(Constants.QUOTE_STATUS_CLIENT_ABORDED);
                        },
                      },
                    ],
                    { cancelable: false }
                  );
                  console.log("destination", this.state.destination);

                  this.setState({
                    driverState: Constants.DRIVER_STATE_GOING_TO_DESTINATION,
                  });
                  if (!this.state.isManual) {
                    this.getPoly(this.state.driverPosition, this.state.order.destination);
                  }
                }}
              />
            </View>
          </View>
        );
      }

      case Constants.DRIVER_STATE_GOING_TO_DESTINATION: {
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
                          this.setState({
                            navigating: false,
                            navigationCentered: false,
                            order: null,
                          });
                          this.map.animateCamera({
                            latitude: Constants.INITIAL_REGION.latitude,
                            longitude: Constants.INITIAL_REGION.longitude,
                            heading: 0,
                            pitch: 0,
                            zoom: 10,
                          });
                          this.updateDriverStatus(Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE);
                          this.updateOrderStatus(Constants.QUOTE_STATUS_FINISHED);

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
          firebase
            .firestore()
            .collection("drivers")
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
              firebase
                .firestore()
                .collection("drivers")
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
      console.log("notification id", notification.data.id);
      if (notification.data.id === Constants.DRIVER_NOTIFICATION_CONFIRMING) {
        firebase
          .database()
          .ref()
          .child("quotes/" + notification.data.order.uid + "/")
          .once("value", async snap => {
            let data = snap.exportVal();
            await this.setState({
              order: data,
              orderuid: notification.data.order.uid,
              isManual: notification.data.order.manual,
            });
            this.updateDriverStatus(Constants.DRIVER_STATUS_CONFIRMING_DRIVE);

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
        notification.data.id === Constants.DRIVER_NOTIFICATION_CONFIRMING &&
        notification.order.manual
      ) {
        firebase
          .database()
          .ref()
          .child("quotes/" + notification.data.order.uid + "/")
          .once("value", async snap => {
            let data = snap.exportVal();
            await this.setState({
              order: data,
              orderuid: notification.data.order.uid,
              isManual: notification.data.order.manual,
            });
            this.updateDriverStatus(Constants.DRIVER_STATUS_CONFIRMING_DRIVE);
          });
      } else if (notification.data.id === Constants.DRIVER_NOTIFICATION_CONFIRMED) {
        if (this.state.order.manual)
          firebase
            .database()
            .ref()
            .child("quotes/" + notification.data.order.uid + "/")
            .once("value", async snap => {
              let data = snap.exportVal();
              console.log("Orden manual recibida:", data);

              await this.setState({
                order: data,
                orderuid: notification.data.order.uid,
                isManual: notification.data.order.manual,
                driverState: Constants.DRIVER_STATE_ASKING,
              });
              this.updateDriverStatus(Constants.DRIVER_STATUS_CONFIRMING_DRIVE);
            });
        else this.setState({ driverState: Constants.DRIVER_STATE_ASKING });
      } else if (notification.data.id === Constants.QUOTE_STATUS_CLIENT_CANCELED) {
        this.updateDriverStatus(Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE);
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
        <KeepAwake />
        <MapView
          style={{ flex: 1 }}
          onMapReady={() => this.goToUserLocation()}
          onPanDrag={() => this.setState({ navigationCentered: false })}
          showsTraffic
          showsUserLocation
          loadingBackgroundColor="#FF9800"
          initialRegion={Constants.INITIAL_REGION}
          ref={ref => (this.map = ref)}
          mapPadding={{
            /*bottom:
                Dimensions.get("window").height *
                (Number.parseFloat(STATE_HEIGHT[this.state.driverState]) / 100),*/
            top: Dimensions.get("window").height * 0.1,
            left: 0,
            right: 0,
          }}>
          {this.state.order
            ? this.state.order.origin.lat && this.state.order.origin.lng
              ? originMarker
              : null
            : null}
          {this.state.order
            ? this.state.order.destination.lat && this.state.order.destination.lng
              ? destinationMarker
              : null
            : null}
          {this.state.polyline.length > 0 ? polyline : null}
        </MapView>

        <View
          style={styles.stateContainer}
          maxHeight={
            Constants.STATE_HEIGHT[this.state.driverState]
              ? Dimensions.get("window").height *
                (Number.parseFloat(Constants.STATE_HEIGHT[this.state.driverState]) / 100)
              : null
          }
          elevation={3}>
          {this.getState()}
        </View>
        {/*<View style={styles.centerNavigationView}>
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
            </View>*/}
        <Driver
          elevation={3}
          avatar={this.state.user.profile}
          name={this.state.user.firstName + " " + this.state.user.lastName}
          username={this.state.user.username}
          signOut={firebase.auth().signOut}
          status={this.state.driverStatus}
          updateDriverStatus={this.updateDriverStatus}
          devToggle={this.devToggle}
          openDrawer={() => {
            this.props.navigation.openDrawer();
            console.log("drawer");
          }}
        />
        <View style={styles.locationButtonView}>
          <Icon
            name="gps-fixed"
            reverse
            raised
            containerStyle={styles.locationButton}
            color={Constants.COLOR_ORANGE}
            onPress={() => {
              if (this.state.navigating) this.setState({ navigationCentered: true });
              else this.goToUserLocation();
            }}
          />
        </View>
        {Platform.OS === "android" && this.state.user.dev
          ? ToastAndroid.show("Dev mode", ToastAndroid.LONG)
          : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  locationButton: {
    elevation: 3,
  },

  locationButtonView: {
    position: "absolute",
    top: "10%",
    right: "2%",
  },

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
TaskManager.defineTask(Constants.LOCATION_TASK_NAME, async ({ data: { locations }, error }) => {
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
        console.log("Location task response:", Response);
      })
      .catch(error => console.log(error));
  }
});
