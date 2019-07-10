import React, { Component } from "react";
import { View, Text, Linking, StyleSheet } from "react-native";
import { Button, Icon } from "react-native-elements";
import * as Constants from "../Constants";

export class NavigatingToClient extends Component {
  render() {
    return (
      <View style={styles.navigating}>
        {/*<Icon name="local-taxi" size={100} color="#4CAF50" />*/}
        <Text style={styles.heading}>Navegando hacia el Cliente</Text>
        <View style={styles.contentView}>
          <View style={styles.clientView}>
            <View style={styles.textView}>
              <Text style={styles.tertiaryText}>Recogiendo a</Text>
              <Text style={styles.primaryText}>
                {this.props.order.userName}
              </Text>
              <Text style={styles.secondaryText}>
                {this.props.order.userPhone}
              </Text>
            </View>
            <Icon
              name="phone"
              reverse
              raised
              containerStyle={styles.callButton}
              color={Constants.COLOR_GREEN}
              onPress={() => {
                Linking.openURL(`tel:${this.props.order.userPhone}`);
              }}
            />
          </View>

          <View style={styles.directionView}>
            <Icon
              name="location-on"
              containerStyle={styles.locationIcon}
              color={Constants.COLOR_ORANGE}
              size={30}
            />
            <View style={styles.textView} flex={3}>
              <Text style={{ ...styles.primaryText, width: "auto" }}>
                {this.props.order.origin.name}
              </Text>
              <Text style={{ ...styles.secondaryText, width: "auto" }}>
                {this.props.order.origin.address}
              </Text>
            </View>
          </View>
        </View>

        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          title="Ya llegué y estoy esperando al cliente"
          onPress={this.props.next}
        />
      </View>
    );
  }
}

export class WaitingClient extends Component {
  render() {
    return (
      <View style={styles.navigating}>
        {/*<Icon name="local-taxi" size={100} color="#4CAF50" />*/}
        <Text style={styles.heading}>Esperando al Cliente</Text>
        <View style={styles.contentView}>
          <View style={styles.clientView}>
            <View style={styles.textView}>
              <Text style={styles.tertiaryText}>Esperando a</Text>
              <Text style={styles.primaryText}>
                {this.props.order.userName}
              </Text>
              <Text style={styles.secondaryText}>
                {this.props.order.userPhone}
              </Text>
            </View>
            <Icon
              name="phone"
              reverse
              raised
              containerStyle={styles.callButton}
              color={Constants.COLOR_GREEN}
              onPress={() => {
                Linking.openURL(`tel:${this.props.order.userPhone}`);
              }}
            />
          </View>
        </View>
        <Text style={{ ...styles.disclaimer, marginBottom: 15 }}>
          Indicar falsos abordajes está sujeto a sanciones.
        </Text>
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          title="El cliente ya abordó la unidad"
          onPress={this.props.next}
        />
      </View>
    );
  }
}

export class NavigatingToDestination extends Component {
  render() {
    return (
      <View style={styles.navigating}>
        {/*<Icon name="local-taxi" size={100} color="#4CAF50" />*/}
        <Text style={styles.heading}>Navegando hacia el Destino</Text>
        <View style={styles.contentView}>
          <View style={styles.directionView}>
            <Icon
              name="location-on"
              containerStyle={styles.locationIcon}
              color={Constants.COLOR_ORANGE}
              size={30}
            />
            <View style={styles.textView} flex={3}>
              <Text style={{ ...styles.primaryText, width: "auto" }}>
                {this.props.order ? this.props.order.destination.name : "Destino del cliente"}
              </Text>
              <Text style={{ ...styles.secondaryText, width: "auto" }}>
                {this.props.order ? this.props.order.destination.address : "Para acá vamos"}
              </Text>
            </View>
          </View>
        </View>
        <Text
          style={{
            ...styles.disclaimer,
            paddingTop: 12,
            marginTop: 10,
            paddingBottom: 12,
            borderTopColor: "lightgray",
            borderTopWidth: 1,
          }}>
          Indicar falsas llegadas está sujeto a sanciones.
        </Text>
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          title="Ya llegamos al destino del cliente"
          onPress={this.props.next}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  navigating: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 22,
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: Constants.COLOR_ORANGE,
    color: "white",
  },

  contentView: {
    padding: 10,
    width: "100%",
    flex: 3,
  },

  clientView: {
    flex: 3,
    flexDirection: "row",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },

  directionView: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  textView: {
    flex: 3,
  },

  callButton: {
    flex: 1,
  },

  locationIcon: {
    flex: 1,
  },

  primaryText: {
    fontSize: 22,
    fontWeight: "bold",
    //width: "100%",
  },

  secondaryText: {
    fontSize: 18,
    //width: "100%",
  },

  tertiaryText: {
    fontSize: 14,
    //width: "100%",
  },

  disclaimer: {
    fontSize: 12,
    color: "gray",
    //width: "100%",
  },

  buttonContainer: {
    flex: 1,
    width: "100%",
  },

  button: {
    height: 50,
    backgroundColor: Constants.COLOR_BLUE,
  },
});
