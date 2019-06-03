import React, { Component } from "react";
import { View, Dimensions, ActivityIndicator } from "react-native";

class Waiting extends Component {
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