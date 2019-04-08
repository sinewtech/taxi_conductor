import React, { Component } from "react";
import { View, Text, Platform } from "react-native";
import { ButtonGroup } from "react-native-elements";
import { TaskManager, Constants, Location, Permissions } from "expo";
import firebase from "firebase";
class Home extends Component {
  componentDidMount() {
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      this._getLocationAsync();
    }
  }
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }
    Location.startLocationUpdatesAsync("sinewave location", {
      accuracy: Location.Accuracy.Balanced
    });
  };
  static getcurrentuser = () => {
    return firebase.auth().currentUser.uid;
  };
  constructor() {
    super();
    this.state = {
      selectedIndex: 0
    };
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
    const buttons = ["Fuera de trabajo", "En Carrea", "En Descanso"];
    const { selectedIndex } = this.state;

    return (
      <View>
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
        />
        <Text>{firebase.auth().currentUser.uid}</Text>
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
        .then(res => res.json())
        .then(Response => {
          console.log("success:", Response);
        })
        .catch(error => console.log(error));
    }
  }
);
