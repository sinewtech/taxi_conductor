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
import firebase from "@firebase/app";

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
        timeInterval: 10000,
        distanceInterval: 4
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
      console.log("cambio :v");
      if (user) {
        console.log(user.uid);
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
  async getPoly(origin, destination) {
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
          //console.log(polyline);
          this.setState({ polyline });
        } else {
          console.log("Status failed");
        }
      });
  }
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
        let contenido =
          "De " +
          this.state.origin.address +
          " a " +
          this.state.destination.name;
        return (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
                  this.getPoly(this.state.driverposition, {
                    lat: this.state.origin.lat,
                    lng: this.state.origin.lng
                  });
                  this.setState({ driverstate: DRIVER_STATE_GOING_TO_CLIENT });
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
                          this.setState({
                            origin: {},
                            destination: {},
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
      case DRIVER_STATE_GOING_TO_CLIENT: {
        return (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
                    [{ text: "ok" }],
                    { cancelable: false }
                  );
                  this.getPoly(this.state.driverposition, {
                    lat: this.state.destination.lat,
                    lng: this.state.destination.lng
                  });
                  this.setState({
                    driverstate: DRIVER_STATE_GOING_TO_DESTINATION,
                    origin: {}
                  });
                }}
              />
            </View>
          </View>
        );
      }
      case DRIVER_STATE_GOING_TO_DESTINATION: {
        return (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
                            origin: {},
                            destination: {},
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
    this.setState({ origen: {}, destination: {} });
  };
  _handleNotification = notification => {
    console.log("notificationwenas", notification);
    if (notification.data) {
      if (notification.data.id === 2) {
        this.setState({ driverstate: DRIVER_STATE_ASKING });
        console.log("notifica", notification);
        firebase
          .database()
          .ref()
          .child("quotes/" + notification.data.order.uid + "/")
          .once("value", snap => {
            let data = snap.exportVal();
            console.log("data", data);
            this.setState({
              origin: data.origin,
              destination: data.destination
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
      } else if (notification.data.id === 2 && notification.order.manual) {
        this.setState({ driverstate: DRIVER_STATE_ASKING });
      }
    }
  };
  static upload_data = location => {
    firebase
      .database()
      .ref()
      .child("locations/" + firebase.auth().currentUser.uid + "/position")
      .set(location);
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
    console.log("state", this.state.polyline);
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
      origin: {},
      destination: {},
      polyline: []
    };
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          showsUserLocation={true}
          followsUserLocation={true}
          initialRegion={INITIAL_REGION}
        >
          {this.state.origin.lat && this.state.origin.lat ? (
            <MapView.Marker
              title="Origen"
              description="Donde ese encuentra el cliente"
              pinColor="#4CAF50"
              coordinate={{
                latitude: this.state.origin.lat,
                longitude: this.state.origin.lng
              }}
            />
          ) : null}
          {this.state.destination.lat && this.state.destination.lng ? (
            <MapView.Marker
              title="Destino"
              description="Adonde desea ir el cliente"
              pinColor="#FF9800"
              coordinate={{
                latitude: this.state.destination.lat,
                longitude: this.state.destination.lng
              }}
            />
          ) : null}
          {this.state.origin.lat &&
          this.state.origin.lat &&
          this.state.destination.lat &&
          this.state.destination.lng ? (
            <MapView.Polyline
              strokeWidth={4}
              strokeColor="#2196f3"
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
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data: { locations }, error }) => {
  if (error) {
    // check `error.message` for more details.
    return;
  } else {
    let location = locations[0];
    console.log(location);
    let pos = {
      lat: location.coords.latitude,
      lng: location.coords.longitude
    };
    Home.upload_data(pos);
    // locations[0].user = Home.getcurrentuser();
    // fetch(
    //   "https://us-central1-taxiapp-sinewave.cloudfunctions.net/location/",
    //   {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(locations[0])
    //   }
    // )
    //   .then(res => res.text())
    //   .then(Response => {
    //     console.log("success:", Response);
    //   })
    //   .catch(error => console.log(error));
  }
});
