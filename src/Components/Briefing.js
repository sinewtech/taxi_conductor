import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default class Driver extends Component {
  constructor() {
    super();

    this.state = {
      time: new Date()
    };
  }

  tick = () => {
    this.setState({
      time: new Date()
    });
  };

  componentDidMount = () => {
    this.intervalID = setInterval(() => this.tick(), 30000);
  };

  componentWillUnmount = () => {
    clearInterval(this.intervalID);
  };

  getFormattedDate = () => {
    return (
      this.state.time.getDate() +
      " de " +
      meses[this.state.time.getMonth()] +
      ", " +
      this.state.time.getFullYear()
    );
  };

  getFormattedTime = () => {
    let d = this.state.time;

    var hr = d.getHours();
    var min = d.getMinutes();

    if (min < 10) {
      min = "0" + min;
    }

    if (hr > 12) {
      hr -= 12;
    }

    return hr + ":" + min;
  };

  getMeridian = () => {
    if (this.state.time.getHours() >= 12) {
      return "  pm";
    } else {
      return "  am";
    }
  };

  render() {
    return (
      <View style={styles.briefing}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{this.getFormattedTime()}</Text>
          <Text style={styles.meridian}>{this.getMeridian()}</Text>
        </View>

        <Text>{this.getFormattedDate()}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  briefing: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
    paddingBottom: 15,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  time: {
    fontSize: 60,
  },
});
