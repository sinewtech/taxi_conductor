import React, { Component } from "react";
import { LogIn } from "./src/Views/LogIn";
import UserValidator from "./src/Components/UserValidator";
import {
  createStackNavigator,
  createDrawerNavigator,
  createSwitchNavigator,
  createAppContainer,
  DrawerItems,
  SafeAreaView,
} from "react-navigation";
import Home from "./src/Views/Home";
import SignUp from "./src/Views/SignUp";
import firebase from "./firebase";
import { Icon, Avatar } from "react-native-elements";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import LogOut from "./src/Components/LogOut";

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
const drawerContent = props => (
  <SafeAreaView forceInset={{ top: "always", horizontal: "never" }}>
    <View style={styles.drawerHeaderView}>
      <View style={styles.avatarView}>
        <Avatar rounded title="B" />
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>
          {firebase.auth().currentUser ? firebase.auth().currentUser.displayName : "Nombre"}
        </Text>
      </View>
    </View>
    <ScrollView>
      <DrawerItems {...props} />
    </ScrollView>
  </SafeAreaView>
);

const homeIcon = <Icon name="home" color="#616161" />;
const logoutIcon = <Icon name="logout" type="material-community" color="#616161" />;

const AppStack = createDrawerNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: ({ navigation }) => ({
        title: "Inicio",
        drawerIcon: homeIcon,
      }),
    },
    UserValidator: {
      screen: LogOut,
      navigationOptions: ({ navigation }) => ({
        title: "Cerrar sesión",
        drawerIcon: logoutIcon,
      }),
    },
  },
  {
    contentComponent: drawerContent,
  }
);

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
const styles = StyleSheet.create({
  drawerHeaderView: {
    height: "20%",
    flexDirection: "row",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 16,
  },

  headerInfo: {
    flex: 3,
    justifyContent: "center",
  },

  avatarView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },

  avatar: {
    height: 25,
    width: 25,
  },
});
export default App;
