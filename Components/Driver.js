import React, { Component } from "react";
import { Text, View, StyleSheet, Button, Dimensions } from "react-native";
import { Avatar } from "react-native-elements";

const INFO_HEIGHT = Dimensions.get("window").height * 0.05;

export default class Driver extends Component {
  render() {
    let statusColor = "black";
    let statusText = "-";

    switch (this.props.status) {
        case 0:
            statusColor = "#f44336";
            statusText = "Fuera de T.";
            break;
        case 1:
            statusColor = "#4CAF50";
            statusText = "Libre";
            break
        case 2:
            statusColor = "#FF9800"
            statusText = "En Carrera";
            break;
        default:
            break;
    }

    return (
      <View style={styles.driverContainer} elevation={this.props.elevation}>
        <View style={styles.avatarView}>
          <Avatar
            containerStyle={styles.avatarContainer}
            imageProps={{ resizeMode: "cover" }}
            source={{ uri: this.props.avatar }}
            activeOpacity={0.7}
          />
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverCode}>
            {this.props.username ? this.props.username : "-"}
          </Text>
          <Text style={styles.driverName}>
            {this.props.name ? this.props.name : "Cargando..."}
          </Text>
        </View>
        <View style={styles.driverStatus} backgroundColor={statusColor}>
          <Text style={styles.driverStatusText}>{statusText}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avatarView: {
    flex: 1
  },

  avatarContainer: {
    height: INFO_HEIGHT,
    width: "100%"
  },

  driverContainer: {
    borderRadius: 5,
    height: INFO_HEIGHT,
    width: "92%",
    backgroundColor: "white",
    flexDirection: "row",
    margin: "4%",
    position: "absolute",
    top: 0,
    overflow: "hidden"
  },

  driverInfo: {
    flex: 4,
    height: INFO_HEIGHT,
    flexDirection: "row",
    alignItems: "center"
  },

  driverCode: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontSize: 20
  },

  driverName: {
    flex: 4,
    textAlign: "left",
    fontSize: 15
  },

  driverStatus: {
    flex: 2,
    height: INFO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },

  driverStatusText: {
    flex: 1,
    color: "white",
    textAlign: "center"
  }
});
