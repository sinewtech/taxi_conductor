import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
  TouchableNativeFeedback
} from "react-native";
import { Avatar } from "react-native-elements";

const INFO_HEIGHT = Dimensions.get("window").height * 0.05;

export default class Driver extends Component {
  constructor(props) {
    super(props);

    let statusColor = "black";
    let statusText = "-";
    let loading = true;

    switch (props.status) {
      case 0:
        statusColor = "#f44336";
        statusText = "Fuera de T.";
        break;
      case 1:
        statusColor = "#4CAF50";
        statusText = "Libre";
        break;
      case 2:
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
      prevStatus: -1
    };
  }

  componentWillReceiveProps = props => {
    console.log(
      "Props received.",
      props.status,
      this.state.prevStatus,
      this.state.loading
    );

    if (this.state.prevStatus !== props.status) {
      switch (props.status) {
        case 0:
          this.setState({
            statusColor: "#f44336",
            statusText: "Fuera de T.",
            loading: false,
            prevStatus: props.status
          });
          break;
        case 1:
          this.setState({
            statusColor: "#4CAF50",
            statusText: "Libre",
            loading: false,
            prevStatus: props.status
          });
          break;
        case 2:
          this.setState({
            statusColor: "#FF9800",
            statusText: "En Carrera",
            loading: false,
            prevStatus: props.status
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
        <Text style={styles.driverStatusText}>{this.state.statusText}</Text>
      );
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
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.SelectableBackground()}
          onPress={() => {
            if (this.props.status !== 1 && this.props.status !== 0)
              Alert.alert(
                "Error",
                "No puedes cambiar tu estado en este momento."
              );
            else
              Alert.alert(
                "Cambiando Estado",
                "¿Estas seguro de que quieres cambiar tu estado?",
                [
                  { text: "Regresar" },
                  {
                    text: "Cambiar Estado",
                    onPress: () => {
                      switch (this.props.status) {
                        case 0: {
                          this.props.updateDriverStatus(1);
                          break;
                        }
                        case 1: {
                          this.props.updateDriverStatus(0);
                          break;
                        }
                      }
                    }
                  }
                ]
              );
          }}
        >
          <View
            style={styles.driverStatus}
            backgroundColor={this.state.statusColor}
          >
            {driverStatusContent}
          </View>
        </TouchableNativeFeedback>
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
    zIndex: 1,
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
