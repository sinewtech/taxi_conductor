import React, { Component } from "react";
import { LogIn } from "./Views/LogIn";
import Waiting from "./Components/Waiting";
import {
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer
} from "react-navigation";
import Home from "./Views/Home";
import SignUp from "./Views/SignUp";
import firebase from "firebase";
class App extends Component {
  componentWillUnmount() {
    if (firebase.auth().currentUser) {
      firebase
        .database()
        .ref()
        .child("locations/" + firebase.auth().currentUser.uid + "/status")
        .set(0);
    }
  }
  
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
      AuthLoading: Waiting,
      App: AppStack,
      Auth: AuthStack
    },
    {
      initialRouteName: "AuthLoading"
    }
  )
);
export default App;
