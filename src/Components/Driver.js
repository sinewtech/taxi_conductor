import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
  TouchableNativeFeedback,
} from "react-native";
import { Avatar } from "react-native-elements";
import * as Constants from "../Constants";

const INFO_HEIGHT = Dimensions.get("window").height * 0.05;

export default class Driver extends Component {
  constructor(props) {
    super(props);

    let statusColor = "black";
    let statusText = "-";
    let loading = true;

    switch (props.status) {
      case Constants.DRIVER_STATUS_NOT_WORKING:
        statusColor = "#f44336";
        statusText = "Fuera de T.";
        break;
      case Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE:
        statusColor = "#4CAF50";
        statusText = "Libre";
        break;
      case Constants.DRIVER_STATUS_ON_A_DRIVE:
        statusColor = "#FF9800";
        statusText = "En Carrera";
        break;
      default:
        loading = true;
        break;
    }

    this.state = {
      loading,
      statusColor,
      statusText,
      prevStatus: -1,
    };
  }

  componentWillReceiveProps = props => {
    if (this.state.prevStatus !== props.status) {
      switch (props.status) {
        case Constants.DRIVER_STATUS_NOT_WORKING:
          this.setState({
            statusColor: "#f44336",
            statusText: "Fuera de Trabajo",
            loading: false,
            prevStatus: props.status,
          });
          break;
        case Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE:
          this.setState({
            statusColor: "#4CAF50",
            statusText: "Libre",
            loading: false,
            prevStatus: props.status,
          });
          break;
        case Constants.DRIVER_STATUS_ON_A_DRIVE:
          this.setState({
            statusColor: "#FF9800",
            statusText: "En Carrera",
            loading: false,
            prevStatus: props.status,
          });
          break;
        case Constants.DRIVER_STATUS_CONFIRMING_DRIVE:
          this.setState({
            statusColor: "#FF9800",
            statusText: "Confirmando",
            loading: false,
            prevStatus: props.status,
          });
          break;
        default:
          this.setState({ loading: true });
          break;
      }
    }
  };

  render() {
    let driverStatusContent = <ActivityIndicator color="white" />;

    if (!this.state.loading) {
      driverStatusContent = (
        <Text style={styles.driverStatusText} numberOfLines={1}>
          {this.state.statusText}
        </Text>
      );
    }

    return (
      <View style={styles.driverContainer} elevation={this.props.elevation}>
        <View style={styles.avatarView}>
          <TouchableNativeFeedback
            onPress={this.props.openDrawer}
            onLongPress={this.props.devToggle}>
            <Avatar
              containerStyle={styles.avatarContainer}
              imageProps={{ resizeMode: "cover" }}
              source={{ uri: this.props.avatar }}
              activeOpacity={0.7}
            />
          </TouchableNativeFeedback>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverCode} numberOfLines={1}>
            {this.props.username ? this.props.username : "-"}
          </Text>
          <Text style={styles.driverName} numberOfLines={1}>
            {this.props.name ? this.props.name : "Cargando..."}
          </Text>
        </View>
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.SelectableBackground()}
          onPress={() => {
            if (this.props.status !== 1 && this.props.status !== 0)
              Alert.alert("Error", "No puedes cambiar tu estado en este momento.");
            else
              Alert.alert("Cambiando Estado", "¿Estas seguro de que quieres cambiar tu estado?", [
                { text: "Regresar" },
                {
                  text: "Cambiar Estado",
                  onPress: () => {
                    switch (this.props.status) {
                      case 0: {
                        this.props.updateDriverStatus(Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE);
                        break;
                      }
                      case 1: {
                        this.props.updateDriverStatus(Constants.DRIVER_STATUS_NOT_WORKING);
                        break;
                      }
                    }
                  },
                },
              ]);
          }}>
          <View style={styles.driverStatus} backgroundColor={this.state.statusColor}>
            {driverStatusContent}
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avatarView: {
    flex: 1,
  },

  avatarContainer: {
    height: INFO_HEIGHT,
    width: "100%",
  },

  driverContainer: {
    zIndex: 1,
    borderRadius: 5,
    height: INFO_HEIGHT,
    width: "92%",
    backgroundColor: "white",
    flexDirection: "row",
    margin: "4%",
    position: "absolute",
    top: 0,
    overflow: "hidden",
  },

  driverInfo: {
    flex: 4,
    height: INFO_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },

  driverCode: {
    fontWeight: "bold",
    flex: 2,
    textAlign: "center",
    fontSize: 20,
  },

  driverName: {
    flex: 5,
    textAlign: "left",
    fontSize: 15,
  },

  driverStatus: {
    flex: 2,
    height: INFO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingLeft: 3,
    paddingRight: 3,
  },

  driverStatusText: {
    flex: 1,
    color: "white",
    textAlign: "center",
  },
});
