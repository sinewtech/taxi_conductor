import React, { Component } from "react";
import firebase from "firebase";
import Waiting from "./Waiting";

class UserValidator extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .firestore()
          .collection("drivers")
          .doc(user.uid)
          .get()
          .then(snap => {
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
    return <Waiting />;
  }
}

export default UserValidator;
