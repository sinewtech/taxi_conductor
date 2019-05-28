import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
  Alert,
  ScrollView
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
      perfilcarro: "",
      name: "",
      phone: ""
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
    let CanContinue = true;
    console.log(this.state);
    for (key in this.state) {
      if (this.state[key].length === 0) {
        CanContinue = false;
        break;
      }
    }
    if (!CanContinue) {
      Alert.alert("Error", "Por favor Ingrese sus datos");
      return;
    } else {
      if (
        !/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(
          this.state.mail
        )
      ) {
        Alert.alert("Correo", "Por favor use un formato de correo valido.");
        return;
      }
      if (!/^[A-Z]{1}\d{1,}$/.test(this.state.username)) {
        Alert.alert("Codigo de empleado", "Por favor use el formato indicado.");
        return;
      }
      if (!/^[A-Za-z0-9]{6,}$/.test(this.state.password)) {
        Alert.alert(
          "Contraseña",
          "Por favor que la contraseña sea mayor a 6 caracteres."
        );
        return;
      }
      if (!/^([A-Z]{3})\ ([0-9]{4})$/.test(this.state.placa)) {
        Alert.alert("Placa", "Por favor siga el formato indicado.");
        return;
      }
      if (!/^\+504\ \d{4}-\d{4}$/.test(this.state.phone)) {
        Alert.alert("Numero de telefono", "Por favor use el formato indicado.");
        return;
      }
      if (this.state.perfil.length == 0) {
        Alert.alert("Imagen de perfil", "Por favor seleccione una imagen.");
        return;
      }
      if (this.state.perfilcarro.length == 0) {
        Alert.alert(
          "Imagen de perfil del carro",
          "Por favor seleccione una imagen."
        );
        return;
      }
      if (this.state.carro.length == 0) {
        Alert.alert(
          "Imagen Lateral  del carro",
          "Por favor seleccione una imagen."
        );
        return;
      }

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
              placa: this.state.placa,
              name: this.state.name,
              phone: this.state.phone
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
    }
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.SignUpView}>
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
              placeholder="Codigo Letra#"
              leftIcon={
                <Icon
                  name="hashtag"
                  type="font-awesome"
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
              placeholder="Placa 3Letras XXXX"
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
            <Input
              placeholder="Numero de telefono +504 xxxx-xxxx"
              leftIcon={
                <Icon
                  name="phone"
                  size={24}
                  color="black"
                  style={styles.Icon}
                />
              }
              keyboardType="phone-pad"
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoCapitalize="none"
              onChangeText={text => this.setState({ phone: text })}
            />
            <Input
              placeholder="Nombre y apellido"
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
              onChangeText={text => this.setState({ name: text })}
            />
          </KeyboardAvoidingView>
          <View style={styles.imageSelectRow}>
            <TouchableOpacity
              onPress={() => {
                this._pickImage(0);
              }}
              style={styles.imageTouchable}
            >
              <Image
                source={{ uri: this.state.perfilcarro }}
                style={styles.image}
                PlaceholderContent={
                  <View style={styles.imageSelectView}>
                    <Icon
                      name="camera"
                      size={50}
                      style={styles.imageSelectIcon}
                    />
                    <Text style={styles.imageSelectText}>
                      Imagen de perfil del carro
                    </Text>
                  </View>
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this._pickImage(1);
              }}
              style={styles.imageTouchable}
            >
              <Image
                source={{ uri: this.state.carro }}
                style={styles.image}
                PlaceholderContent={
                  <View style={styles.imageSelectView}>
                    <Icon
                      name="camera"
                      size={50}
                      style={styles.imageSelectIcon}
                    />
                    <Text style={styles.imageSelectText}>
                      Imagen lateral del carro
                    </Text>
                  </View>
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this._pickImage(2);
              }}
              style={styles.imageTouchable}
            >
              <Image
                source={{ uri: this.state.perfil }}
                style={styles.image}
                PlaceholderContent={
                  <View style={styles.imageSelectView}>
                    <Icon
                      name="camera"
                      size={50}
                      style={styles.imageSelectIcon}
                    />
                    <Text style={styles.imageSelectText}>Imagen de perfil</Text>
                  </View>
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button title="Registrate" onPress={this.handleSignIn} />
        </View>
      </ScrollView>
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
  },

  imageSelectRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },

  imageTouchable: {
    margin: 5,
    borderRadius: 5
  },

  imageSelectView: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    width: 100,
    height: 100,
    textAlign: "center",
    borderRadius: 5,
    overflow: "hidden",
    elevation: 2
  },

  imageSelectText: {
    textAlign: "center",
    color: "gray"
  },

  imageSelectIcon: {
    color: "gray"
  },

  image: {
    width: 100,
    height: 100
  }
});

export default SignIn;
