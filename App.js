import React, { Component } from "react";
import { LogIn } from "./Views/LogIn";
import UserValidator from "./Components/UserValidator";
import {
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer
} from "react-navigation";
import Home from "./Views/Home";
import SignUp from "./Views/SignUp";
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

const AppStack = createStackNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      header: null
    }
  }
});

const AuthStack = createStackNavigator({
  LogIn: {
    screen: LogIn,
    navigationOptions: {
      header: null
    }
  },
  SignIn: {
    screen: SignUp,
    navigationOptions: {
      header: null
    }
  },
  initialRouteName: "SignUp"
});

const MyApp = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: UserValidator,
      App: AppStack,
      Auth: AuthStack
    },
    {
      initialRouteName: "AuthLoading"
    }
  )
);

export default App;
