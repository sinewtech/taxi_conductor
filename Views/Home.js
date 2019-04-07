import React, { Component } from "react";
import { View, Text, Alert } from "react-native";
import { Button } from "react-native-elements";
import firebase from "firebase";
class Home extends Component {
  render() {
    return (
      <View>
        <Button
          onPress={() => {
            firebase.auth().signOut();
          }}
          title="wenas"
        />
      </View>
    );
  }
}

export default Home;
