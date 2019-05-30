import React, { Component } from "react";

class Asking extends Component() {
  render() {
    let precio = this.props.price;

    if (precio === undefined) {
      precio = null;
    } else {
      precio = precio.toFixed(2);
    }

    console.log("precio", precio);

    let contenido =
      "De " +
      this.state.order.origin.address +
      " a " +
      this.state.order.destination.name +
      " Por L. " +
      precio;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Icon name="local-taxi" size={100} color="#4CAF50" />
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 25
          }}
        >
          {contenido}
        </Text>
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

export default Asking;
