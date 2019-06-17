import React from "react";
import {
  Alert,
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { Button, Input, Icon } from "react-native-elements";
import firebase from "../../firebase";
import Waiting from "../Components/Waiting";

export class LogIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mail: "",
      password: "",
      registrando: false,
    };
  }

  handleSignIn = async () => {
    await this.setState({ registrando: true });
    //let CanContinue = true;

    /*for (key in this.state) {
      if (this.state[key].length === 0) {
        CanContinue = false;
        break;
      }
    }*/

    if (this.state.mail === "" || this.state.password === "") {
      Alert.alert("Error", "Por favor llene todos los campos.");
      this.setState({ registrando: false });
      return;
    } else {
      if (!/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(this.state.mail)) {
        Alert.alert("Correo", "Por favor use un formato de correo valido");
        this.setState({ registrando: false });
        return;
      }
      if (!/^[A-Za-z0-9]{6,}$/.test(this.state.password)) {
        Alert.alert("Contraseña", "Recuerde que la contraseña debe ser mayor a 6 caracteres.");
        this.setState({ registrando: false });
        return;
      }
      
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.mail, this.state.password)
        .then(userdata => {
          if (user) {
            firebase
              .firestore()
              .collection("drivers")
              .doc(userdata.user.uid)
              .get()
              .then(snap => {
                if (!snap.exists) {
                  Alert.alert("Error", "No tiene cuenta en esta applicacion");
                  firebase.auth().signOut();
                }
              });
          }
        })
        .catch(error => {
          switch (error.code) {
            case "auth/wrong-password": {
              Alert.alert("Error", "Su Contraseña es incorrecta");
              break;
            }
            case "auth/user-disabled": {
              Alert.alert("Error", "Esta cuenta ha sido deshabilitada");
              break;
            }
            case "auth/user-not-found": {
              Alert.alert("Error", "No hemos encontrado una cuenta con este correo");
              break;
            }
          }
          this.setState({ registrando: false });
        });
    }
  };

  render() {
    if (this.state.registrando) {
      return <Waiting />;
    }
    return (
      <KeyboardAvoidingView behavior={"padding"} style={styles.SignUpView}>
        <View style={styles.credentialsView}>
          <Input
            placeholder="Usuario"
            leftIcon={<Icon name="person" size={24} color="black" style={styles.Icon} />}
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
          style={{ marginTop: 5 }}>
          <Text style={{ color: "white", textDecorationLine: "underline" }}>Registrarse</Text>
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
});
