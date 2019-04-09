import React from "react";
import { View, Dimensions, ActivityIndicator } from "react-native";
import firebase from "firebase";
class Waiting extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .database()
          .ref("/users/drivers/" + user.uid)
          .once("value", snap => {
            if (snap.exists) {
              this.props.navigation.navigate("App");
            }
          });
      } else {
        this.props.navigation.navigate("Auth");
      }
    });
  }
  render() {
    return (
      <View
        style={{
          backgroundColor: "#FF9800",
          justifyContent: "center",
          alignItems: "center",
          height: Dimensions.get("window").height,
          width: Dimensions.get("window").width
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }
}
export default Waiting;
