import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Icon, Button } from "react-native-elements";

class Asking extends Component {
  render() {
    let precio = this.props.price;

    if (precio === undefined) {
      precio = null;
    } else {
      precio = precio.toFixed(2);
    }

    console.log("Orden recibida", this.props.order);

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text style={styles.heading}>Carrera Recibida</Text>
        <Text flex={1}>{"\n"}</Text>
        <Text style={styles.title}>{this.props.order.origin.name}</Text>
        <Text style={styles.subtitle}>
          {this.props.order.origin.address}
        </Text>
        <View flex={1}>
          <Icon name="angle-down" type="font-awesome" color="#FF9800" />
        </View>
        <Text style={styles.title}>
          {this.props.order.destination.name}
        </Text>
        <Text style={styles.subtitle}>
          {this.props.order.destination.address}
        </Text>
        <Text flex={1}>{"\n"}</Text>
        <Text style={styles.price}>Por {this.props.order.price}</Text>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row"
          }}
        >
          <Button
            containerStyle={{ flex: 1, marginRight: 5 }}
            buttonStyle={{ height: 75 }}
            title="Aceptar"
            onPress={this.props.onAccept}
          />
          <Button
            containerStyle={{ flex: 1, marginLeft: 5 }}
            buttonStyle={{ height: 75 }}
            title="Rechazar"
            onPress={this.props.onReject}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  heading:{
    fontSize: 25,
    flex: 2
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1
  },

  subtitle: {
    fontSize: 15,
    flex: 1
  },

  precio:{
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default Asking;
