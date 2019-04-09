import React, { Component } from "react";
import { LogIn } from "./Views/LogIn";
import Waiting from "./Components/Waiting";
import {
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer
} from "react-navigation";
import Home from "./Views/Home";
import firebase from "firebase";
import SignIn from "./Views/SignIn";

firebase.initializeApp({
  apiKey: "AIzaSyBkCxRqmYLXkznasnf-MRTROWVJcORIGcw",
  authDomain: "taxiapp-sinewave.firebaseapp.com",
  databaseURL: "https://taxiapp-sinewave.firebaseio.com",
  projectId: "taxiapp-sinewave",
  storageBucket: "taxiapp-sinewave.appspot.com",
  messagingSenderId: "503391985374"
});

class App extends Component {
  render() {
    return <MyApp />;
  }
}
const AppStack = createStackNavigator({
  Home: { screen: Home, navigationOptions: { headerTitle: "Inicio" } }
});
const AuthStack = createStackNavigator({
  LogIn: {
    screen: LogIn,
    navigationOptions: {
      header: null
    }
  },
  SignIn: {
    screen: SignIn,
    navigationOptions: {
      header: null
    }
  }
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
