import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import firebase from "../../firebase";
import { Input, Button, Icon, Image } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import Waiting from "../Components/Waiting";
import { TextInputMask } from "react-native-masked-text";

const FLOW_USER_STATE = 0;
const FLOW_CAR_STATE = 1;
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
      lastname: "",
      phone: "",
      id: "",
      descripcion: "",
      Registrando: false,
      context: 0,
    };
  }
  _pickImage = async id => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

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
  getContext = () => {
    const userIcon = <Icon name="directions-car" size={24} color="black" style={styles.Icon} />;
    const phoneIcon = <Icon name="phone" size={24} color="black" style={styles.Icon} />;
    const idIcon = <Icon name="credit-card" size={24} color="black" style={styles.Icon} />;
    const plateIcon = (
      <Icon type="material-community" name="steering" size={24} color="black" style={styles.Icon} />
    );
    switch (this.state.context) {
      case FLOW_USER_STATE: {
        return (
          <KeyboardAvoidingView behavior="padding">
            <Icon name="person" color="white" size={Dimensions.get("window").width * 0.5} />
            <Input
              placeholder="Correo"
              leftIcon={<Icon name="mail" size={24} color="black" style={styles.Icon} />}
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={text => this.setState({ mail: text })}
            />

            <Input
              placeholder="Contraseña"
              leftIcon={<Icon name="vpn-key" size={24} color="black" style={styles.Icon} />}
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoComplete="password"
              secureTextEntry
              onChangeText={text => this.setState({ password: text })}
            />

            <TextInputMask
              type={"custom"}
              customTextInput={Input}
              customTextInputProps={{
                inputContainerStyle: styles.Input,
                placeholder: "Número de Teléfono",
                leftIcon: phoneIcon,
                keyboardType: "phone-pad",
                leftIconContainerStyle: { marginRight: 15 },
              }}
              options={{
                mask: "+504 9999-9999",
              }}
              value={this.state.phone}
              onChangeText={text => {
                this.setState({
                  phone: text,
                });
              }}
            />

            <Input
              placeholder="Nombre"
              leftIcon={<Icon name="person" size={24} color="black" style={styles.Icon} />}
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoCapitalize="words"
              onChangeText={text => this.setState({ name: text })}
            />
            <Input
              placeholder="Apellido"
              leftIcon={<Icon name="person" size={24} color="black" style={styles.Icon} />}
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoCapitalize="words"
              onChangeText={text => this.setState({ lastname: text })}
            />

            <TextInputMask
              type={"custom"}
              customTextInput={Input}
              customTextInputProps={{
                inputContainerStyle: styles.Input,
                placeholder: "Identidad",
                leftIcon: idIcon,
                keyboardType: "number-pad",
                leftIconContainerStyle: { marginRight: 15 },
              }}
              options={{
                mask: "9999-9999-99999",
              }}
              value={this.state.id}
              onChangeText={text => {
                this.setState({
                  id: text,
                });
              }}
            />
          </KeyboardAvoidingView>
        );
      }

      case FLOW_CAR_STATE: {
        return (
          <KeyboardAvoidingView behavior="padding">
            <Icon
              name="steering"
              type="material-community"
              color="white"
              size={Dimensions.get("window").width * 0.5}
            />

            <TextInputMask
              type={"custom"}
              customTextInput={Input}
              customTextInputProps={{
                inputContainerStyle: styles.Input,
                placeholder: "Código de Unidad (A3)",
                leftIcon: userIcon,
                leftIconContainerStyle: { marginRight: 15 },
                autoCapitalize: "characters",
              }}
              options={{
                mask: "A999",
              }}
              value={this.state.username}
              onChangeText={text => {
                this.setState({
                  username: text,
                });
              }}
            />
            <TextInputMask
              type={"custom"}
              customTextInput={Input}
              customTextInputProps={{
                inputContainerStyle: styles.Input,
                placeholder: "Placa del Vehículo",
                leftIcon: plateIcon,
                leftIconContainerStyle: { marginRight: 15 },
                autoCapitalize: "characters",
              }}
              options={{
                mask: "AAA 9999",
              }}
              value={this.state.placa}
              onChangeText={text => {
                this.setState({
                  placa: text,
                });
              }}
            />

            <Input
              placeholder="Descripción del Vehículo (Honda Civic 2007 Rojo)"
              multiline
              leftIcon={
                <Icon name="chat-bubble-outline" size={24} color="black" style={styles.Icon} />
              }
              keyboardType="default"
              inputContainerStyle={styles.Input}
              leftIconContainerStyle={{ marginRight: 15 }}
              autoCapitalize="words"
              onChangeText={text => this.setState({ descripcion: text })}
            />
            <View style={styles.imageSelectRow}>
              <TouchableOpacity
                onPress={() => {
                  this._pickImage(0);
                }}
                style={styles.imageTouchable}>
                <Image
                  source={{ uri: this.state.perfilcarro }}
                  style={styles.image}
                  PlaceholderContent={
                    <View style={styles.imageSelectView}>
                      <Icon name="camera" size={50} style={styles.imageSelectIcon} />
                      <Text style={styles.imageSelectText}>Imagen de perfil del carro</Text>
                    </View>
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this._pickImage(1);
                }}
                style={styles.imageTouchable}>
                <Image
                  source={{ uri: this.state.carro }}
                  style={styles.image}
                  PlaceholderContent={
                    <View style={styles.imageSelectView}>
                      <Icon name="camera" size={50} style={styles.imageSelectIcon} />
                      <Text style={styles.imageSelectText}>Imagen lateral del carro</Text>
                    </View>
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this._pickImage(2);
                }}
                style={styles.imageTouchable}>
                <Image
                  source={{ uri: this.state.perfil }}
                  style={styles.image}
                  PlaceholderContent={
                    <View style={styles.imageSelectView}>
                      <Icon name="camera" size={50} style={styles.imageSelectIcon} />
                      <Text style={styles.imageSelectText}>Imagen de perfil</Text>
                    </View>
                  }
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <Button title="Registrate" onPress={this.handleSignIn} />
            </View>
          </KeyboardAvoidingView>
        );
      }

      default:
        break;
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

  handleSignIn = async () => {
    await this.setState({ Registrando: true });

    let CanContinue = true;
    for (key in this.state) {
      if (this.state[key].length === 0) {
        CanContinue = false;
        break;
      }
    }
    if (!CanContinue) {
      Alert.alert("Error", "Por favor Ingrese sus datos");
      this.setState({ Registrando: false });
      return;
    } else {
      if (!/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(this.state.mail)) {
        Alert.alert("Correo", "Por favor use un formato de correo valido.");
        this.setState({ Registrando: false });
        return;
      }
      if (!/^[A-Z]{1}\d{1,}$/.test(this.state.username)) {
        Alert.alert("Codigo de empleado", "Por favor use el formato indicado.");
        this.setState({ Registrando: false });
        return;
      }
      if (!/^[A-Za-z0-9]{6,}$/.test(this.state.password)) {
        Alert.alert("Contraseña", "Por favor que la contraseña sea mayor a 6 caracteres.");
        this.setState({ Registrando: false });
        return;
      }
      if (!/^([A-Z]{3})\ ([0-9]{4})$/.test(this.state.placa)) {
        Alert.alert("Placa", "Por favor siga el formato indicado.");
        this.setState({ Registrando: false });
        return;
      }
      if (!/^\+504\ \d{4}-\d{4}$/.test(this.state.phone)) {
        Alert.alert("Numero de telefono", "Por favor use el formato indicado.");
        this.setState({ Registrando: false });
        return;
      }
      if (!/^(\d{4}-\d{4}-\d{5})$/.test(this.state.id)) {
        Alert.alert("Numero de identidad", "Por favor use el formato indicado.");
        this.setState({ Registrando: false });
        return;
      }
      if (this.state.perfil.length == 0) {
        Alert.alert("Imagen de perfil", "Por favor seleccione una imagen.");
        this.setState({ Registrando: false });
        return;
      }
      if (this.state.perfilcarro.length == 0) {
        Alert.alert("Imagen de perfil del carro", "Por favor seleccione una imagen.");
        this.setState({ Registrando: false });
        return;
      }
      if (this.state.carro.length == 0) {
        Alert.alert("Imagen Lateral  del carro", "Por favor seleccione una imagen.");
        this.setState({ Registrando: false });
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
              mail: userdata.user.email,
              username: this.state.username,
              plate: this.state.placa,
              firstName: this.state.name,
              lastName: this.state.lastname,
              phone: this.state.phone,
              id: this.state.id,
              description: this.state.descripcion,
            });

          await firebase
            .database()
            .ref()
            .child("locations/" + userdata.user.uid + "/status")
            .set(0);

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
          await userdata.user.updateProfile({ displayName: this.state.name + this.state.lastname });

          await userdata.user.sendEmailVerification();
        })
        .catch(error => {
          switch (error.code) {
            case "auth/email-already-in-use": {
              Alert.alert("Error", "Ya existe una cuenta con el correo proporcionado.");
              break;
            }
          }
          this.setState({ Registrando: false });
        });
    }
  };

  render() {
    if (this.state.Registrando) {
      return <Waiting />;
    }

    return (
      <View style={styles.SignUpView}>
        <View style={styles.credentialsView}>{this.getContext()}</View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-evenly",
            width: Dimensions.get("window").width * 0.8,
          }}>
          <TouchableOpacity
            onPress={() => {
              this.setState({ context: 0 });
            }}
            disabled={this.state.context === 0 ? true : false}>
            <Icon reverse name="arrow-back" size={24} color="white" reverseColor="#FF9800" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.setState({ context: 1 });
            }}
            disabled={this.state.context === 1 ? true : false}>
            <Icon reverse name="arrow-forward" size={24} color="white" reverseColor="#FF9800" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  SignUpView: {
    paddingTop: 50,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height,
  },

  credentialsView: {
    width: Dimensions.get("window").width * 0.8,
  },

  Input: {
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 15,
    padding: 5,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },

  imageSelectRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  imageTouchable: {
    margin: 5,
    borderRadius: 5,
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
    elevation: 2,
  },

  imageSelectText: {
    textAlign: "center",
    color: "gray",
  },

  imageSelectIcon: {
    color: "gray",
  },

  image: {
    width: 100,
    height: 100,
  },
});

export default SignIn;
