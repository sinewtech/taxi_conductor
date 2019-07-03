import React, { Component } from "react";
import firebase from "../../firebase";
import Waiting from "./Waiting";
import { Alert } from "react-native";

class UserValidator extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("hay usuario");
        console.log(user.emailVerified);
        if (user.emailVerified === true) {
          console.log("esta verificado");
          firebase
            .firestore()
            .collection("drivers")
            .doc(user.uid)
            .get()
            .then(snap => {
              console.log("existe", snap.exists);
              if (snap.exists) {
                this.props.navigation.navigate("App");
              } else {
                Alert.alert(
                  "Usuario no encontrado",
                  "No hemos encontrado este usuario en el sistema. Por favor intenta de nuevo.",
                  [
                    {
                      text: "Ok",
                    },
                  ]
                );
                firebase.auth().signOut();
                this.props.navigation.navigate("Auth");
              }
            });
        }
        if (
          user.emailVerified === false &&
          new Date(user.metadata.creationTime).getTime() + 5 * 60 < new Date().getTime()
        ) {
          console.log("wenas");
          console.log("no esta verificado");
          Alert.alert(
            "Confirmacion",
            "Por favor verique su correo.",
            [
              {
                text: "OK",
                onPress: () => {
                  firebase
                    .auth()
                    .currentUser.sendEmailVerification()
                    .then(value => {
                      firebase.auth().signOut();
                      console.log(value);
                    });
                  this.props.navigation.navigate("Auth");
                },
              },
              {
                text: "Cancel",
                onPress: () => {
                  this.props.navigation.navigate("Auth");
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          this.props.navigation.navigate("App");
        }
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
