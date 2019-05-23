import React from "react";
import {
  Alert,
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  StatusBar
} from "react-native";
import { Button, Input, Icon } from "react-native-elements";
import firebase from "firebase";

export class LogIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      isDriver: false
    };
  }

  handleSignIn = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.username, this.state.password)
      .catch(error => {
        console.error(error);
      });
  };

  handleRegister = () => {
    let callback = () => this.handleSignIn();

    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.username, this.state.password)
      .then(callback)
      .catch(error => {
        console.error(error);
        Alert.alert(error);
      });
  };

  render() {
    return (
      <KeyboardAvoidingView behavior={"padding"} style={styles.SignUpView}>
        <View style={styles.credentialsView}>
          <Input
            placeholder="Usuario"
            leftIcon={
              <Icon name="person" size={24} color="black" style={styles.Icon} />
            }
            inputContainerStyle={styles.Input}
            leftIconContainerStyle={{ marginRight: 15 }}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={text => this.setState({ username: text })}
          />
          <Input
            placeholder="Contraseña"
            leftIcon={
              <Icon
                name="vpn-key"
                size={24}
                color="black"
                style={styles.Icon}
              />
            }
            inputContainerStyle={styles.Input}
            leftIconContainerStyle={{ marginRight: 15 }}
            autoComplete="password"
            secureTextEntry={true}
            onChangeText={text => this.setState({ password: text })}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button title="Iniciar Sesión" onPress={this.handleSignIn} />
        </View>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("SignIn");
          }}
          style={{ marginTop: 5 }}
        >
          <Text style={{ color: "white", textDecorationLine: "underline" }}>
            Registrarse
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  SignUpView: {
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height,
    marginTop: StatusBar.currentHeight
  },
  credentialsView: {
    width: Dimensions.get("window").width * 0.8
  },

  Input: {
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 15,
    padding: 5
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%"
  }
});
