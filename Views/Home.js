import React, { Component } from "react";
import { ButtonGroup, Button, Icon, Avatar } from "react-native-elements";
import { Text, View, BackHandler, StyleSheet, Alert } from "react-native";
import {
  Permissions,
  Notifications,
  TaskManager,
  MapView,
  Location,
  Marker
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
      Location.startLocationUpdatesAsync("sinewave location", {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 1
      });
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
  async getPoly() {
    await fetch(
      "https://maps.googleapis.com/maps/api/directions/json?key=" +
        API_KEY +
        "&origin=" +
        this.state.origin.lat +
        "," +
        this.state.origin.lng +
        "&destination=" +
        this.state.destination.lat +
        "," +
        this.state.destination.lng
    )
      .then(response => response.json())
      .then(responseJson => {
        //console.log(JSON.stringify(responseJson));
        if (responseJson.status == "OK") {
          // console.log(responseJson.routes[0].overview_polyline);
          polyline = decodePolyline(
            responseJson.routes[0].overview_polyline.points
          );
          //console.log(polyline);
          this.setState({ polyline });
        } else {
          console.log("Status failed");
        }
      });
  }

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
  _handleNotification = notification => {
    console.log("notificationwenas", notification);
    if (notification.data.id === 2) {
      console.log("notifica", notification);
      firebase
        .database()
        .ref()
        .child("quotes/" + notification.data.currentOrder.uid + "/")
        .once("value", snap => {
          let data = snap.exportVal();
          console.log("data", data);
          this.setState({ origin: data.origin, destination: data.destination });
          this.getPoly();
        });
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
  constructor() {
    super();
    this.state = {
      selectedIndex: 0,
      user: {},
      origin: {},
      destination: {}
    };
  }

  render() {
    const buttons = ["Fuera de trabajo", "Libre", "En Carrera"];
    const { selectedIndex } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          showsUserLocation={true}
          followsUserLocation={true}
          initialRegion={INITIAL_REGION}
        >
          {this.state.origin.lat ? (
            <Marker
              title="Origen"
              description="Donde ese encuentra el cliente"
              pinColor="red"
              coordinate={this.state.origin}
            />
          ) : null}
          {this.state.destination.lat ? (
            <Marker
              title="Destindo"
              description="Adonde desea ir el cliente"
              pinColor="red"
              coordinate={this.state.destination}
            />
          ) : null}
        </MapView>
        <View style={styles.datacontainer}>
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
            selectedIndex={selectedIndex}
            buttons={buttons}
          />
        </View>
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
  datacontainer: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 25,
    position: "absolute",
    top: 0
  },
  mapcontainer: { flex: 1 }
});

export default Home;
TaskManager.defineTask(
  "sinewave location",
  ({ data: { locations }, error }) => {
    if (error) {
      // check `error.message` for more details.
      return;
    } else {
      console.log(locations);
      locations[0].user = Home.getcurrentuser();
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
