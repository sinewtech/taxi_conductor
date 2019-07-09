import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Icon, Button } from "react-native-elements";

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
          <Text style={styles.price}>Por L. {this.props.order.price.toFixed(2)}</Text>
        </View>
        <View style={styles.buttonView}>
          <Button
            containerStyle={{ flex: 1 }}
            buttonStyle={styles.buttonReject}
            title="X"
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
    fontSize: 25,
    flex: 1,
    fontWeight: "bold",
  },

  title: {
    fontSize: 22,
    //fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    display: "none",
  },

  price: {
    marginBottom: 7,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  textView: {
    paddingLeft: 15,
    paddingRight: 15,
    flex: 3,
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
