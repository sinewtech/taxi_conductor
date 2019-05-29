import React, { Component } from "react";
import { ButtonGroup, Button, Icon, Avatar } from "react-native-elements";
import { Text, View, BackHandler, StyleSheet, Alert } from "react-native";
import {
  Permissions,
  Notifications,
  TaskManager,
  MapView,
  Location
} from "expo";
import firebase from "firebase";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyBkCxRqmYLXkznasnf-MRTROWVJcORIGcw",
    authDomain: "taxiapp-sinewave.firebaseapp.com",
    databaseURL: "https://taxiapp-sinewave.firebaseio.com",
    projectId: "taxiapp-sinewave",
    storageBucket: "taxiapp-sinewave.appspot.com",
    messagingSenderId: "503391985374"
  });
}
import "@firebase/firestore";
const INITIAL_REGION = {
  latitude: 14.0723,
  longitude: -87.1921,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
};
const API_KEY = "AIzaSyApNgtxFBp0SXSHljP_xku6peNCzjTFWM4";
const decodePolyline = require("decode-google-map-polyline");
const buttons = ["Fuera de trabajo", "Libre", "En Carrera"];

const DRIVER_STATE_NONE = 0;
const DRIVER_STATE_ASKING = 1;
const DRIVER_STATE_GOING_TO_CLIENT = 2;
const DRIVER_STATE_GOING_TO_DESTINATION = 3;

const DRIVER_NOTIFICATION_ADS = 0;
const DRIVER_NOTIFICATION_CONFIRMING = 2;
const DRIVER_NOTIFICATION_CONFIRMED = 3;

const LOCATION_TASK_NAME = "SINEWAVE_LOCATION";
let db = firebase.firestore();
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
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
  componentDidMount = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      Alert.alert(
        "Servicios GPS",
        "Por favor deje que el app pueda trabajar con el gps"
      );
    }
    let tiene = await Location.getProviderStatusAsync();
    if (tiene.gpsAvailable) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 6000,
        distanceInterval: 2
      });
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced
        },
        location => {
          this.setState({
            driverposition: {
              lat: location.coords.latitude,
              lng: location.coords.longitude
            }
          });
        }
      );
    } else {
      Alert.alert("Servicios GPS", "Por favor active los servicios GPS");
    }

    firebase
      .database()
      .ref()
      .child("locations/" + firebase.auth().currentUser.uid + "/status")
      .once("value", snap => {
        this.setState({ selectedIndex: snap.exportVal() });
      });

    let save = user => {
      if (user) {
        this.setState({ userUID: user.uid });
      }
    };

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .firestore()
          .collection("drivers")
          .doc(user.uid)
          .get()
          .then(value => {
            let data = value.data();
            this.setState({ user: data });
          });
        save(user);
        this.registerPush();
      } else {
        save(null);
      }
    });
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
          let polyline = decodePolyline(
            responseJson.routes[0].overview_polyline.points
          );
          this.setState({ polyline });
        } else {
          console.log("Status failed");
        }
      });
  };
  getState = () => {
    switch (this.state.driverstate) {
      case DRIVER_STATE_NONE: {
        return (
          <View>
            <View style={styles.profiledata}>
              <View style={{ paddingRight: 12 }}>
                <Avatar
                  rounded
                  source={{ uri: this.state.user.profile }}
                  style={{ width: 100, height: 100 }}
                  activeOpacity={0.7}
                />
              </View>
              <View style={{ paddingLeft: 12 }}>
                <Text>{this.state.user.username}</Text>
                <Text>{this.state.user.name}</Text>
                <Button
                  title="Cerrar sesion"
                  onPress={() => {
                    firebase.auth().signOut();
                  }}
                />
              </View>
            </View>
            <ButtonGroup
              onPress={this.updateIndex}
              selectedIndex={this.state.selectedIndex}
              buttons={buttons}
            />
          </View>
        );
      }
      case DRIVER_STATE_ASKING: {
        let precio = this.state.order.price;
        if (precio === undefined) {
          precio = null;
        } else {
          precio = precio.toFixed(2);
        }
        console.log("precio", precio);
        let contenido =
          "De " +
          this.state.order.origin.address +
          " a " +
          this.state.order.destination.name +
          " Por L. " +
          precio;
        if (this.state.ismanual === true) {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Icon name="local-taxi" size={100} color="#4CAF50" />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 25
                }}
              >
                {contenido}
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <Button
                  containerStyle={{ flex: 1, marginRight: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Aceptar"
                  onPress={() => {
                    Alert.alert("Navegacion", "Vamos hacia el cliente");
                    firebase
                      .database()
                      .ref()
                      .child("/quotes/" + this.state.orderuid + "/status")
                      .set(3);
                    this.setState({
                      driverstate: DRIVER_STATE_GOING_TO_CLIENT
                    });
                  }}
                />
                <Button
                  containerStyle={{ flex: 1, marginLeft: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Rechazar"
                  onPress={() => {
                    Alert.alert(
                      "Rechazar",
                      "Estas a punto de rechazar una carrera",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            firebase
                              .database()
                              .ref()
                              .child(
                                "/quotes/" + this.state.orderuid + "/status"
                              )
                              .set(4);
                            this.setState({
                              order: { origin: {}, destination: {} },
                              driverstate: DRIVER_STATE_NONE
                            });
                          }
                        },
                        {
                          text: "REGRESAR"
                        }
                      ],
                      { cancelable: false }
                    );
                  }}
                />
              </View>
            </View>
          );
        } else {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Icon name="local-taxi" size={100} color="#4CAF50" />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 25
                }}
              >
                {contenido}
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <Button
                  containerStyle={{ flex: 1, marginRight: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Aceptar"
                  onPress={() => {
                    firebase
                      .database()
                      .ref()
                      .child("/quotes/" + this.state.orderuid + "/status")
                      .set(3);
                    Alert.alert("Navegacion", "Vamos hacia el cliente");
                    this.getPoly(
                      this.state.driverposition,
                      this.state.order.origin
                    );
                    this.setState({
                      driverstate: DRIVER_STATE_GOING_TO_CLIENT
                    });
                  }}
                />
                <Button
                  containerStyle={{ flex: 1, marginLeft: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Rechazar"
                  onPress={() => {
                    Alert.alert(
                      "Rechazar",
                      "Estas a punto de rechazar una carrera",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            firebase
                              .database()
                              .ref()
                              .child(
                                "/quotes/" + this.state.orderuid + "/status"
                              )
                              .set(4);
                            this.setState({
                              order: { origin: {}, destination: {} },
                              driverstate: DRIVER_STATE_NONE
                            });
                          }
                        },
                        {
                          text: "REGRESAR"
                        }
                      ],
                      { cancelable: false }
                    );
                  }}
                />
              </View>
            </View>
          );
        }
      }
      case DRIVER_STATE_GOING_TO_CLIENT: {
        if (this.state.ismanual === true) {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Icon name="local-taxi" size={100} color="#4CAF50" />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 25
                }}
              >
                ¿Te encuentras con tu cliente?
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <Button
                  containerStyle={{ flex: 1, marginRight: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Si"
                  onPress={() => {
                    Alert.alert(
                      "Navegacion",
                      "Vamos hacia el destino del cliente",
                      [
                        {
                          text: "ok",
                          onPress: () => {
                            this.setState({
                              driverstate: DRIVER_STATE_GOING_TO_DESTINATION
                            });
                          }
                        }
                      ],
                      { cancelable: false }
                    );
                  }}
                />
              </View>
            </View>
          );
        } else {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Icon name="local-taxi" size={100} color="#4CAF50" />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 25
                }}
              >
                ¿Llegaste a la ubicación del cliente?
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <Button
                  containerStyle={{ flex: 1, marginRight: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Si"
                  onPress={() => {
                     console.log(
                       "Confirmando status para orden",
                       this.state.orderuid
                     );

                     firebase
                       .database()
                       .ref()
                       .child(
                         "/quotes/" +
                           this.state.orderuid +
                           "/status"
                       )
                       .set(5)
                       .then(() =>
                         console.log("Status enviado")
                       )
                       .catch(e => console.error(e));
                       
                    Alert.alert(
                      "Navegacion",
                      "Vamos hacia el destino del cliente",
                      [{ text: "ok" }],
                      { cancelable: false }
                    );
                    console.log("destination", this.state.destination);
                    this.setState({
                      driverstate: DRIVER_STATE_GOING_TO_DESTINATION
                    });
                    this.getPoly(
                      this.state.driverposition,
                      this.state.order.destination
                    );
                  }}
                />
              </View>
            </View>
          );
        }
      }
      case DRIVER_STATE_GOING_TO_DESTINATION: {
        if (this.state.ismanual === true) {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Icon name="local-taxi" size={100} color="#4CAF50" />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 25
                }}
              >
                ¿Haz terminado tu desplazamiento?
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <Button
                  containerStyle={{ flex: 1, marginRight: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Si"
                  onPress={() => {
                    Alert.alert(
                      "Navegacion",
                      "Gracias por cuidar de nuestro cliente",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            this.setState({
                              driverstate: DRIVER_STATE_NONE,
                              order: { origin: {}, destination: {} },
                              polyline: []
                            });
                          }
                        },
                        {
                          text: "Cancelar"
                        }
                      ],
                      { cancelable: false }
                    );
                  }}
                />
              </View>
            </View>
          );
        } else {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Icon name="local-taxi" size={100} color="#4CAF50" />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 25
                }}
              >
                ¿Haz terminado tu desplazamiento?
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <Button
                  containerStyle={{ flex: 1, marginRight: 5 }}
                  buttonStyle={{ height: 75 }}
                  title="Si"
                  onPress={() => {
                    Alert.alert(
                      "Navegacion",
                      "Gracias por cuidar de nuestro cliente",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            this.setState({
                              driverstate: DRIVER_STATE_NONE,
                              order: { origin: {}, destination: {} },
                              polyline: []
                            });
                          }
                        },
                        {
                          text: "Cancelar"
                        }
                      ],
                      { cancelable: false }
                    );
                  }}
                />
              </View>
            </View>
          );
        }
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
                console.log("existe");
                let deviceJson = DocumentSnapshot.data()["pushDevices"];
                for (var token in deviceJson) {
                  if (deviceJson[token] === pushToken) {
                    console.log("Pushtoken ya existe para usuario.");
                    return;
                  } else {
                    console.log("agregue :v");
                    pushTokens.push(pushToken);
                  }
                }
              } else {
                pushTokens.push(pushToken);
              }
              console.log("celulares", pushTokens);
              db.collection("drivers")
                .doc(this.state.userUID)
                .update({
                  pushDevices: pushTokens
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

    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );

    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.deactivate(); // works best when the goBack is async
      return true;
    });
  };
  deactivate = () => {
    this.setState({ order: { origin: {}, destination: {} } });
  };
  _handleNotification = notification => {
    console.log("notificationwenas", notification);
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
              ismanual: notification.data.order.manual
            });
            if (
              data.origin.lat &&
              data.origin.lng &&
              data.destination.lat &&
              data.destination.lng
            ) {
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
              ismanual: notification.data.order.manual
            });
          });
      } else if (notification.data.id === DRIVER_NOTIFICATION_CONFIRMED) {
        this.setState({ driverstate: DRIVER_STATE_ASKING });
      }
    }
  };
  static getcurrentuser = () => {
    return firebase.auth().currentUser.uid;
  };

  updateIndex = selectedIndex => {
    this.setState({ selectedIndex });
    firebase
      .database()
      .ref()
      .child("locations/" + firebase.auth().currentUser.uid + "/status")
      .set(selectedIndex);
  };

  drawPolyline = () => {
    var coords = [];
    this.state.polyline.map(point => {
      coords.push({
        latitude: point.lat,
        longitude: point.lng
      });
    });

    return coords;
  };

  constructor() {
    super();
    this.state = {
      driverstate: 0,
      selectedIndex: 0,
      user: {},
      order: { origin: {}, destination: {} },
      polyline: []
    };
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          showsUserLocation
          showsTraffic
          followsUserLocation
          showsMyLocationButton
          loadingBackgroundColor="#FF9800"
          initialRegion={INITIAL_REGION}
        >
          {this.state.order.origin.lat && this.state.order.origin.lat ? (
            <MapView.Marker
              title="Origen"
              description="Donde ese encuentra el cliente"
              pinColor="#4CAF50"
              coordinate={{
                latitude: this.state.order.origin.lat,
                longitude: this.state.order.origin.lng
              }}
            />
          ) : null}
          {this.state.order.destination.lat &&
          this.state.order.destination.lng ? (
            <MapView.Marker
              title="Destino"
              description="Adonde desea ir el cliente"
              pinColor="#FF9800"
              coordinate={{
                latitude: this.state.order.destination.lat,
                longitude: this.state.order.destination.lng
              }}
            />
          ) : null}
          {this.state.order.origin.lat &&
          this.state.order.origin.lat &&
          this.state.order.destination.lat &&
          this.state.order.destination.lng ? (
            <MapView.Polyline
              strokeWidth={4}
              strokeColor="#03A9F4"
              coordinates={this.drawPolyline()}
            />
          ) : null}
        </MapView>
        <View style={styles.statecontainer}>{this.getState()}</View>
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
    height: 100
  },
  profiledata: { flexDirection: "row" },
  statecontainer: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 25,
    position: "absolute",
    bottom: 10
  },
  mapcontainer: { flex: 1 }
});

export default Home;
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data: { locations }, error }) => {
    if (error) {
      return;
    } else {
      // let location = locations[0];
      // let pos = {
      //   lat: location.coords.latitude,
      //   lng: location.coords.longitude
      // };
      // console.log("nueva pos", pos);
      // await Home.upload_data(pos);
      locations[0].user = Home.getcurrentuser();
      console.log("punto", locations[0]);
      fetch(
        "https://us-central1-taxiapp-sinewave.cloudfunctions.net/location/",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(locations[0])
        }
      )
        .then(res => res.text())
        .then(Response => {
          console.log("success:", Response);
        })
        .catch(error => console.log(error));
    }
  }
);
