import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions
} from "react-native";
import { Input, Button, Icon } from "react-native-elements";
class SignIn extends Component {
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
              onChangeText={text => this.setState({ username: text })}
            />
          </KeyboardAvoidingView>
          <Button
            icon={<Icon name="camera" size={24} color="black" />}
            buttonStyle={{
              backgroundColor: "white",
              borderRadius: 5,
              marginBottom: 15,
              padding: 5
            }}
            titleStyle={{ color: "black" }}
            title="Foto de perfil"
          />
          <Button
            icon={<Icon name="camera" size={24} color="black" />}
            buttonStyle={{
              backgroundColor: "white",
              borderRadius: 5,
              marginBottom: 15,
              padding: 5
            }}
            titleStyle={{ color: "black" }}
            title="Foto de perfil (auto)"
          />
          <Button
            icon={<Icon name="camera" size={24} color="black" />}
            buttonStyle={{
              backgroundColor: "white",
              borderRadius: 5,
              marginBottom: 15,
              padding: 5
            }}
            titleStyle={{ color: "black" }}
            title="Foto de costado (auto)"
          />
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
