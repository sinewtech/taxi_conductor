import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Icon, Button, Divider } from "react-native-elements";
import * as Constants from "../Constants";

class Asking extends Component {
  render() {
    console.log("Orden recibida", this.props.order);

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Text style={styles.heading}>Carrera Recibida</Text>
        <View style={styles.textView}>
          <Text style={styles.title}>{this.props.order.origin.name}</Text>
          <Text style={styles.subtitle}>{this.props.order.origin.address}</Text>
          <View flex={1}>
            <Icon name="angle-down" type="font-awesome" color="#FF9800" />
          </View>
          <Text style={styles.title}>{this.props.order.destination.name}</Text>
          <Text style={styles.subtitle}>{this.props.order.destination.address}</Text>
        </View>
        <Text style={styles.price}>Por L. {this.props.order.price.toFixed(2)}</Text>
        <View style={styles.buttonView}>
          <Button
            containerStyle={{ flex: 2 }}
            buttonStyle={styles.buttonReject}
            title="Rechazar"
            onPress={this.props.onReject}
          />
          <Button
            containerStyle={{ flex: 5 }}
            buttonStyle={styles.buttonAccept}
            title="Aceptar"
            onPress={this.props.onAccept}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: Constants.COLOR_ORANGE,
    color: "white"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    flex: 1,
    textAlign: "center",
  },

  price: {
    paddingBottom: 7,
    paddingTop: 7,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    flex: 1,
    borderTopColor: "lightgray",
    borderTopWidth: 1,
  },

  textView: {
    paddingLeft: 15,
    paddingRight: 15,
    flex: 3,
    width: "100%",
    paddingBottom: 10,
    paddingTop: 10,
  },

  buttonView: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonAccept: {
    height: "100%",
    borderRadius: 0,
    backgroundColor: "#4CAF50",
  },

  buttonReject: {
    height: "100%",
    borderRadius: 0,
    backgroundColor: "#f44336",
  },
});

export default Asking;
