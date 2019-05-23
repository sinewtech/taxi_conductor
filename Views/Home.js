import React, { Component } from "react";
import { ButtonGroup, Button, Icon, Avatar } from "react-native-elements";
import { Text, View, BackHandler, StatusBar, StyleSheet } from "react-native";
import {
  Permissions,
  Notifications,
  TaskManager,
  MapView,
  Location
} from "expo";
import firebase from "@firebase/app";
import "@firebase/firestore";
const INITIAL_REGION = {
  latitude: 14.0723,
  longitude: -87.1921,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
};
firebase.initializeApp({
  apiKey: "AIzaSyBkCxRqmYLXkznasnf-MRTROWVJcORIGcw",
  authDomain: "taxiapp-sinewave.firebaseapp.com",
  databaseURL: "https://taxiapp-sinewave.firebaseio.com",
  projectId: "taxiapp-sinewave",
  storageBucket: "taxiapp-sinewave.appspot.com",
  messagingSenderId: "503391985374"
});
let db = firebase.firestore();
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== "granted") {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // Get the token that uniquely identifies this device
  //console.log("Asking for push token...");
  let token = "_";

  try {
    token = await Notifications.getExpoPushTokenAsync();
  } catch (e) {
    console.error(e);
  }

  return token;
}
class Home extends Component {
  componentWillUnmount() {
    Location.stopLocationUpdatesAsync("sinewave location");
  }

  componentDidMount() {
    Location.startLocationUpdatesAsync("sinewave location", {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 6
    });
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
  }

  registerPush = () => {
    registerForPushNotificationsAsync()
      .then(pushToken => {
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
                    pushTokens.push(deviceJson[token]);
                  }
                }
              } else {
                pushTokens.push(pushToken);
              }
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

    // this._notificationSubscription = Notifications.addListener(
    //   this._handleNotification.bind(this)
    // );

    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.deactivate(); // works best when the goBack is async
      return true;
    });
  };

  static getcurrentuser = () => {
    return firebase.auth().currentUser.uid;
  };

  constructor() {
    super();
    this.state = {
      selectedIndex: 0,
      user: {}
    };
  }

  updateIndex = selectedIndex => {
    this.setState({ selectedIndex });
    firebase
      .database()
      .ref()
      .child("locations/" + firebase.auth().currentUser.uid + "/status")
      .set(selectedIndex);
  };

  render() {
    const buttons = ["Fuera de trabajo", "Libre", "En Carrera"];
    const { selectedIndex } = this.state;

    return (
      <View style={{ flex: 1, marginTop: StatusBar.currentHeight }}>
        <MapView style={{ flex: 1 }} initialRegion={INITIAL_REGION} />
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
