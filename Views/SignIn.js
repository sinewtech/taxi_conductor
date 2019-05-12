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
import { ImagePicker } from "expo";

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      mail: "",
      password: "",
      placa: "",
      carro: "",
      perfil: "",
      perfilcarro: ""
    };
  }
  _pickImage = async id => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    console.log(result);

    if (!result.cancelled) {
      if (id === 0) {
        await this.setState({ perfilcarro: result.uri });
      } else if (id === 1) {
        await this.setState({ carro: result.uri });
      } else {
        await this.setState({ perfil: result.uri });
      }
    }
    console.log(this.state);
  };

  urlToBlob = url => {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(xhr.response);
        }
      };
      xhr.open("GET", url);
      xhr.responseType = "blob"; // convert type
      xhr.send();
    });
  };

  handleSignIn = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.mail, this.state.password)
      .then(async userdata => {
        //drivers database
        await firebase
          .firestore()
          .collection("drivers")
          .doc(userdata.user.uid)
          .set({
            email: userdata.user.email,
            username: this.state.username,
            placa: this.state.placa
          });

        //upload images :v
        await this.urlToBlob(this.state.carro)
          .then(value => {
            firebase
              .storage()
              .ref()
              .child("images/" + userdata.user.uid + "/lateralcar")
              .put(value);
          })
          .catch(error => {
            console.log("error1", error);
          });

        await this.urlToBlob(this.state.perfilcarro)
          .then(value => {
            firebase
              .storage()
              .ref()
              .child("images/" + userdata.user.uid + "/profilecar")
              .put(value);
          })
          .catch(error => {
            console.log("error2", error);
          });

        await this.urlToBlob(this.state.perfil)
          .then(value => {
            firebase
              .storage()
              .ref()
              .child("images/" + userdata.user.uid + "/profile")
              .put(value);
          })
          .catch(error => {
            console.log("error3", error);
          });
      })
      .catch(error => console.error(error));
  };

  render() {
    return (
      <View style={styles.SignUpView}>
        <View style={styles.credentialsView}>
          <KeyboardAvoidingView behavior="padding">
            <Input
              placeholder="Correo"
              leftIcon={
                <Icon name="mail" size={24} color="black" style={styles.Icon} />
              }
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={text => this.setState({ mail: text })}
            />
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
              onChangeText={text => this.setState({ placa: text })}
            />
          </KeyboardAvoidingView>
          <View>
            <TouchableOpacity
              onPress={() => {
                this._pickImage(0);
              }}
              style={{ marginTop: 5 }}
            >
              <Image
                source={{ uri: this.state.perfilcarro }}
                style={{ width: 100, height: 100 }}
                PlaceholderContent={
                  <View
                    style={{
                      backgroundColor: "gray",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 100,
                      height: 100
                    }}
                  >
                    <Icon name="camera" size={50} />
                    <Text>Foto de perfil de carro</Text>
                  </View>
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this._pickImage(1);
              }}
              style={{ marginTop: 5 }}
            >
              <Image
                source={{ uri: this.state.carro }}
                style={{ width: 100, height: 100 }}
                PlaceholderContent={
                  <View
                    style={{
                      backgroundColor: "gray",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 100,
                      height: 100
                    }}
                  >
                    <Icon name="camera" size={50} />
                    <Text>Foto lateral del carro</Text>
                  </View>
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this._pickImage(2);
              }}
              style={{ marginTop: 5 }}
            >
              <Image
                source={{ uri: this.state.perfil }}
                style={{ width: 100, height: 100 }}
                PlaceholderContent={
                  <View
                    style={{
                      backgroundColor: "gray",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 100,
                      height: 100
                    }}
                  >
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
