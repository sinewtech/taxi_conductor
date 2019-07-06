import React, { Component } from "react";
import { LogIn } from "./src/Views/LogIn";
import UserValidator from "./src/Components/UserValidator";
import {
  createStackNavigator,
  createDrawerNavigator,
  createSwitchNavigator,
  createAppContainer,
} from "react-navigation";
import Home from "./src/Views/Home";
import SignUp from "./src/Views/SignUp";
import firebase from "firebase";

// Ignorar los warnings de firebase

import { YellowBox } from "react-native";
import _ from "lodash";

YellowBox.ignoreWarnings(["Setting a timer"]);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf("Setting a timer") <= -1) {
    _console.warn(message);
  }
};

// Termina ignorar los warnings de firebase

class App extends Component {
  componentWillUnmount = async () => {
    if (firebase.auth().currentUser) {
      await firebase
        .database()
        .ref()
        .child("locations/" + firebase.auth().currentUser.uid + "/status")
        .set(0);
    }
  };

  render() {
    return <MyApp />;
  }
}

const AppStack = createDrawerNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      header: null,
    },
  },
});

const AuthStack = createStackNavigator({
  LogIn: {
    screen: LogIn,
    navigationOptions: {
      header: null,
    },
  },
  SignUp: {
    screen: SignUp,
    navigationOptions: {
      header: null,
    },
  },
  initialRouteName: "SignUp",
});

const MyApp = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: UserValidator,
      App: AppStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: "AuthLoading",
    }
  )
);

export default App;
