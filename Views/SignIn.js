import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text
} from "react-native";
import firebase from "firebase";
import "@firebase/firestore";
import { Input, Button, Icon, Image } from "react-native-elements";

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: "", placa: "" };
  }
  handleSignIn = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.username, this.state.password)
      .then(value => {
        console.log(value);
      })
      .catch(error => console.error(error));
  };
  render() {
    return (
      <View style={styles.SignUpView}>
        <View style={styles.credentialsView}>
          <KeyboardAvoidingView behavior="padding">
            <Input
              placeholder="Usuario"
              leftIcon={
                <Icon
                  name="person"
                  size={24}
                  color="black"
                  style={styles.Icon}
                />
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
              secureTextEntry
              onChangeText={text => this.setState({ password: text })}
            />
            <Input
              placeholder="Placa"
              leftIcon={
                <Icon
                  name="directions-car"
                  size={24}
                  color="black"
                  style={styles.Icon}
                />
              }
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={text => this.setState({ placa: text })}
            />
          </KeyboardAvoidingView>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              width: "100%"
            }}
          >
            <TouchableOpacity>
              <Image
                source={{ uri: "" }}
                style={{ width: 200, height: 200 }}
                PlaceholderContent={
                  <View style={{ backgroundColor: "gray" }}>
                    <Icon name="camera" size={50} />
                    <Text>Foto de perfil</Text>
                  </View>
                }
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={{ uri: "" }}
                style={{ width: 200, height: 200 }}
                PlaceholderContent={
                  <View style={{ backgroundColor: "gray" }}>
                    <Icon name="camera" size={50} />
                    <Text>Foto de perfil</Text>
                  </View>
                }
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={{ uri: "" }}
                style={{ width: 200, height: 200 }}
                PlaceholderContent={
                  <View style={{ backgroundColor: "gray" }}>
                    <Icon name="camera" size={50} />
                    <Text>Foto de perfil</Text>
                  </View>
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button title="Registrate" onPress={this.handleSignIn} />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  SignUpView: {
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height
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

export default SignIn;
