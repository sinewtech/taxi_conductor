import React, { Component } from "react";
import { View, Text, Platform } from "react-native";
import { ButtonGroup, Button } from "react-native-elements";
import {
  TaskManager,
  Constants,
  Location,
  Permissions,
  Notifications
} from "expo";
import firebase from "@firebase/app";
import "@firebase/firestore";

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
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      this._getLocationAsync();
    }
    firebase
      .firestore()
      .collection("drivers")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then(snap => {
        this.setState({ selectedIndex: snap.exportVal() });
      });
  }
  registerPush() {
    registerForPushNotificationsAsync()
      .then(pushToken => {
        console.log(pushToken);
        if (pushToken) {
          console.log("entre :V");
          db.collection("drivers")
            .doc(this.state.userUID)
            .get()
            .then(DocumentSnapshot => {
              let pushTokens = [];
              if (DocumentSnapshot.exists) {
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
                .set({
                  email: this.state.user.email,
                  username: "test",
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
      this._handleNotification.bind(this)
    );

    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.deactivate(); // works best when the goBack is async
      return true;
    });

    this._getLocationAsync = this._getLocationAsync.bind(this);
  }
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };
  static getcurrentuser = () => {
    return firebase.auth().currentUser.uid;
  };
  constructor() {
    super();
    this.state = {
      selectedIndex: 0
    };
    let save = user => {
      this.setState({ user });

      if (user) {
        this.setState({ userUID: user.uid });
      }
    };
    let register = () => this.registerPush();

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("aqui toy :v");
        save(user);
        register();
      } else {
        save(null);
      }
    });
    this.updateIndex = this.updateIndex.bind(this);
  }
  updateIndex(selectedIndex) {
    this.setState({ selectedIndex });
    firebase
      .database()
      .ref()
      .child("users/drivers/" + firebase.auth().currentUser.uid + "/status")
      .set(selectedIndex);
  }
  render() {
    const buttons = ["Fuera de trabajo", "Libre", "En Carrera"];
    const { selectedIndex } = this.state;

    return (
      <View>
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
        />
        <Text>No Identificacion: {firebase.auth().currentUser.uid}</Text>
        <Text>Nombre: {firebase.auth().currentUser.displayName}</Text>
        <Text>Correo: {firebase.auth().currentUser.email}</Text>
        <Button
          title="Cerrar sesion"
          onPress={() => {
            firebase.auth().signOut();
          }}
        />
      </View>
    );
  }
}

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
