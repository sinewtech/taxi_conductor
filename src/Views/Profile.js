import React, { Component } from "react";
import { View, Text, BackHandler, FlatList, StyleSheet, Dimensions, Alert } from "react-native";
import { Avatar, ListItem, Overlay, Input, Button, CheckBox, Icon } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import { TextInputMask } from "react-native-masked-text";
import firebase from "../../firebase";
import * as Constants from "../Constants";
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      overlayState: 0,
      overlayVisible: false,
      nombre: "",
      apellido: "",
      codigo: "",
      descripcion: "",
      placa: "",
      telefono: "",
      POS: false,
      efectivo: false,
      // gateway: false,
      perfil: "",
      perfilcarro: "",
      lateralcarro: "",
    };
    this.list = [];
  }
  getContext = () => {
    switch (this.state.overlayState) {
      case 0: {
        return (
          <View>
            <View style={styles.overlayInnerContainer}>
              <Text style={{ fontSize: 16 }}>Formas de pago</Text>
            </View>
            <View style={{ paddingVertical: 5 }}>
              <CheckBox
                title="POS"
                onPress={() => {
                  this.setState({
                    POS: !this.state.POS,
                  });
                }}
                checked={this.state.POS}
              />
              <CheckBox
                title="Efectivo"
                onPress={() => {
                  this.setState({
                    efectivo: !this.state.efectivo,
                  });
                }}
                checked={this.state.efectivo}
              />
              {/* <CheckBox
                title="Sine"
                onPress={() => {
                  this.setState({
                    gateway: !this.state.gateway,
                  });
                }}
                checked={this.state.gateway}
              /> */}
            </View>
            <View style={styles.overlayInnerContainer}>
              <View style={{ flexDirection: "row" }}>
                <Button
                  onPress={() => {
                    let final = [];
                    if (this.state.POS) {
                      final.push("POS");
                    }
                    if (this.state.efectivo) {
                      final.push("CASH");
                    }
                    if (this.state.gateway) {
                      final.push("Gateway");
                    }
                    firebase
                      .firestore()
                      .collection("drivers")
                      .doc(firebase.auth().currentUser.uid)
                      .update({ payments: final })
                      .then(() => {
                        Alert.alert(
                          "Cambios",
                          "Los cambios se mostraran hasta que vuelvas a entrar a la aplicacion",
                          [
                            {
                              text: "OK",
                              onPress: () => {
                                this.setState({ overlayVisible: false });
                              },
                            },
                          ],
                          { cancelable: false }
                        );
                      });
                  }}
                  buttonStyle={{ paddingVertical: 2, backgroundColor: Constants.COLOR_GREEN }}
                  title="Actualizar"
                />
              </View>
            </View>
          </View>
        );
      }
      case 1: {
        return (
          <View style={styles.overlayInnerContainer}>
            <Text style={{ fontSize: 16 }}>Cambiar Nombre</Text>
            <Input
              leftIcon={{ name: "person" }}
              value={this.state.nombre}
              autoCapitalize="words"
              onChangeText={text => {
                this.setState({ nombre: text });
              }}
              placeholder={this.state.user.firstName}
            />
            <View style={{ flexDirection: "row" }}>
              <Button
                onPress={() => {
                  firebase
                    .firestore()
                    .collection("drivers")
                    .doc(firebase.auth().currentUser.uid)
                    .update({ firstName: this.state.nombre })
                    .then(() => {
                      Alert.alert(
                        "Cambios",
                        "Los cambios se mostraran hasta que vuelvas a entrar a la aplicacion",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              this.setState({ overlayVisible: false });
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    });
                }}
                buttonStyle={{ paddingVertical: 2, backgroundColor: Constants.COLOR_GREEN }}
                title="Actualizar"
              />
            </View>
          </View>
        );
      }
      case 2: {
        return (
          <View style={styles.overlayInnerContainer}>
            <Text style={{ fontSize: 16 }}>Cambiar Apellido</Text>
            <Input
              leftIcon={{ name: "person" }}
              value={this.state.apellido}
              autoCapitalize="words"
              onChangeText={text => {
                this.setState({ apellido: text });
              }}
              placeholder={this.state.user.firstName}
            />
            <View style={{ flexDirection: "row" }}>
              <Button
                onPress={() => {
                  firebase
                    .firestore()
                    .collection("drivers")
                    .doc(firebase.auth().currentUser.uid)
                    .update({ lastName: this.state.apellido })
                    .then(() => {
                      Alert.alert(
                        "Cambios",
                        "Los cambios se mostraran hasta que vuelvas a entrar a la aplicacion",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              this.setState({ overlayVisible: false });
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    });
                }}
                buttonStyle={{ paddingVertical: 2, backgroundColor: Constants.COLOR_GREEN }}
                title="Actualizar"
              />
            </View>
          </View>
        );
      }
      case 3: {
        return (
          <View style={styles.overlayInnerContainer}>
            <Text style={{ fontSize: 16 }}>Cambiar Codigo</Text>

            <TextInputMask
              type={"custom"}
              customTextInput={Input}
              customTextInputProps={{
                inputContainerStyle: styles.Input,
                placeholder: "Código de Unidad (A3)",
                leftIcon: <Icon name="directions-car" />,
                leftIconContainerStyle: { marginRight: 15 },
                autoCapitalize: "characters",
              }}
              options={{
                mask: "A999",
              }}
              autoCapitalize="characters"
              value={this.state.codigo}
              onChangeText={text => {
                this.setState({
                  codigo: text,
                });
              }}
            />
            <View style={{ flexDirection: "row" }}>
              <Button
                onPress={() => {
                  firebase
                    .firestore()
                    .collection("drivers")
                    .doc(firebase.auth().currentUser.uid)
                    .update({ username: this.state.codigo })
                    .then(() => {
                      Alert.alert(
                        "Cambios",
                        "Los cambios se mostraran hasta que vuelvas a entrar a la aplicacion",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              this.setState({ overlayVisible: false });
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    });
                }}
                buttonStyle={{ paddingVertical: 2, backgroundColor: Constants.COLOR_GREEN }}
                title="Actualizar"
              />
            </View>
          </View>
        );
      }
      case 4: {
        return (
          <View style={styles.overlayInnerContainer}>
            <Text style={{ fontSize: 16 }}>Cambiar Descripcion</Text>
            <Input
              leftIcon={{ name: "chat-bubble-outline" }}
              value={this.state.descripcion}
              onChangeText={text => {
                this.setState({ descripcion: text });
              }}
              placeholder={this.state.user.descripcion}
            />
            <View style={{ flexDirection: "row" }}>
              <Button
                onPress={() => {
                  firebase
                    .firestore()
                    .collection("drivers")
                    .doc(firebase.auth().currentUser.uid)
                    .update({ description: this.state.descripcion })
                    .then(() => {
                      Alert.alert(
                        "Cambios",
                        "Los cambios se mostraran hasta que vuelvas a entrar a la aplicacion",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              this.setState({ overlayVisible: false });
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    });
                }}
                buttonStyle={{ paddingVertical: 2, backgroundColor: Constants.COLOR_GREEN }}
                title="Actualizar"
              />
            </View>
          </View>
        );
      }
      case 5: {
        return (
          <View style={styles.overlayInnerContainer}>
            <Text style={{ fontSize: 16 }}>Cambiar Placa</Text>
            <TextInputMask
              type={"custom"}
              customTextInput={Input}
              customTextInputProps={{
                inputContainerStyle: styles.Input,
                placeholder: "Placa del Vehículo",
                leftIcon: <Icon name="directions-car" />,
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
            <View style={{ flexDirection: "row" }}>
              <Button
                onPress={() => {
                  firebase
                    .firestore()
                    .collection("drivers")
                    .doc(firebase.auth().currentUser.uid)
                    .update({ plate: this.state.placa })
                    .then(() => {
                      Alert.alert(
                        "Cambios",
                        "Los cambios se mostraran hasta que vuelvas a entrar a la aplicacion",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              this.setState({ overlayVisible: false });
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    });
                }}
                buttonStyle={{ paddingVertical: 2, backgroundColor: Constants.COLOR_GREEN }}
                title="Actualizar"
              />
            </View>
          </View>
        );
      }
      case 6: {
        return (
          <View style={styles.overlayInnerContainer}>
            <Text style={{ fontSize: 16 }}>Cambiar Telefono</Text>
            <TextInputMask
              type={"custom"}
              customTextInput={Input}
              customTextInputProps={{
                inputContainerStyle: styles.Input,
                leftIcon: <Icon name="phone" />,
                keyboardType: "phone-pad",
                leftIconContainerStyle: { marginRight: 15 },
              }}
              options={{
                mask: "+504 9999-9999",
              }}
              value={this.state.telefono}
              placeholder={this.state.user.telefono}
              onChangeText={text => {
                this.setState({
                  telefono: text,
                });
              }}
            />
            <View style={{ flexDirection: "row" }}>
              <Button
                onPress={() => {
                  firebase
                    .firestore()
                    .collection("drivers")
                    .doc(firebase.auth().currentUser.uid)
                    .update({ phone: this.state.telefono })
                    .then(() => {
                      Alert.alert(
                        "Cambios",
                        "Los cambios se mostraran hasta que vuelvas a entrar a la aplicacion",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              this.setState({ overlayVisible: false });
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    });
                }}
                buttonStyle={{ paddingVertical: 2, backgroundColor: Constants.COLOR_GREEN }}
                title="Actualizar"
              />
            </View>
          </View>
        );
      }
      default:
        break;
    }
  };
  _pickImage = async id => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      if (id === 0) {
        await this.setState({ perfilcarro: result.uri });
        await this.urlToBlob(this.state.perfilcarro).then(value => {
          firebase
            .storage()
            .ref()
            .child("images/" + firebase.auth().currentUser.uid + "/profilecar")
            .put(value)
            .then(() => {
              Alert.alert("Imagen", "Foto de perfil del carro Actualizada con exito");
            });
        });
      } else if (id === 1) {
        await this.setState({ lateralcarro: result.uri });
        await this.urlToBlob(this.state.lateralcarro).then(value => {
          firebase
            .storage()
            .ref()
            .child("images/" + firebase.auth().currentUser.uid + "/lateralcar")
            .put(value)
            .then(() => {
              Alert.alert("Imagen", "Foto de lateral del carro Actualizada con exito");
            });
        });
      } else {
        await this.setState({ perfil: result.uri });
        await this.urlToBlob(this.state.perfil).then(value => {
          firebase
            .storage()
            .ref()
            .child("images/" + firebase.auth().currentUser.uid + "/profile")
            .put(value)
            .then(() => {
              Alert.alert("Imagen", "Foto de perfil Actualizada con exito");
            });
        });
      }
    }
  };
  componentDidMount = () => {
    if (firebase.auth().currentUser) {
      firebase
        .firestore()
        .collection("drivers")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then(async userdata => {
          let user = userdata.data();
          this.list = [
            {
              name: "Formas de pago",
              subtitle: user.payments.join(", ").replace("CASH", "Efectivo"),
              leftIcon: "attach-money",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                this.setState({ overlayVisible: true, overlayState: 0 });
              },
            },
            {
              name: "Nombre",
              subtitle: user.firstName,
              leftIcon: "person",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                this.setState({ overlayVisible: true, overlayState: 1 });
              },
            },
            {
              name: "Apellido",
              subtitle: user.lastName,
              leftIcon: "person",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                this.setState({ overlayVisible: true, overlayState: 2 });
              },
            },
            {
              name: "Codigo",
              subtitle: user.username,
              leftIcon: "directions-car",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                this.setState({ overlayVisible: true, overlayState: 3 });
              },
            },
            {
              name: "Foto lateral del carro",
              leftIcon: "directions-car",
              rightIcon: "pencil",
              rightIconType: "material-community",
              isPhoto: true,
              avatar: user.lateralcar,
              rightIconOnPress: () => {
                this._pickImage(1);
              },
            },
            {
              name: "Foto perfil del carro",
              leftIcon: "directions-car",
              rightIcon: "pencil",
              rightIconType: "material-community",
              isPhoto: true,
              avatar: user.profilecar,
              rightIconOnPress: () => {
                this._pickImage(0);
              },
            },
            {
              name: "Descripcion del carro",
              subtitle: user.description,
              leftIcon: "chat-bubble-outline",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                this.setState({ overlayVisible: true, overlayState: 4 });
              },
            },
            {
              name: "Placa del carro",
              subtitle: user.plate,
              leftIcon: "directions-car",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                this.setState({ overlayVisible: true, overlayState: 5 });
              },
            },
            {
              name: "Telefono",
              subtitle: user.phone,
              leftIcon: "phone",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                this.setState({ overlayVisible: true, overlayState: 6 });
              },
            },
            {
              name: "Contraseña",
              leftIcon: "vpn-key",
              rightIcon: "pencil",
              rightIconType: "material-community",
              rightIconOnPress: () => {
                Alert.alert(
                  "Contraseña",
                  "Quieres que te enviemos un correo para cambiar tu contraseña",
                  [
                    {
                      text: "ENVIAR",
                      onPress: () => {
                        firebase
                          .auth()
                          .sendPasswordResetEmail(firebase.auth().currentUser.email)
                          .then(() => {
                            Alert.alert("Confirmado", "Listo se ha enviado");
                          });
                      },
                    },
                    {
                      text: "CANCELAR",
                    },
                  ],
                  { cancelable: false }
                );
              },
            },
          ];
          await this.setState({
            user,
            nombre: user.firstName,
            apellido: user.lastName,
            codigo: user.username,
            descripcion: user.description,
            placa: user.plate,
            telefono: user.phone,
            // gateway: user.payments.includes("Gateway"),
          });
          
          if(user.payments){
            await this.setState({
              POS: user.payments.includes("POS"),
              efectivo: user.payments.includes("CASH"),
            });
          }
        });
    }
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.props.navigation.goBack();
      return true;
    });
  };
  keyExtractor = (item, index) => index.toString();
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

  renderItem = ({ item }) => (
    <ListItem
      title={item.name}
      subtitle={item.subtitle}
      leftAvatar={
        !item.isPhoto ? { icon: { name: item.leftIcon } } : { source: { uri: item.avatar } }
      }
      rightIcon={{ name: item.rightIcon, type: item.rightIconType, onPress: item.rightIconOnPress }}
    />
  );
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topView}>
          <Avatar
            rounded
            showEditButton
            size="xlarge"
            onEditPress={() => this._pickImage(2)}
            activeOpacity={0.7}
            source={{ uri: this.state.user.profile }}
            containerStyle={{ padding: 5 }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.topViewName}>
              {this.state.user.firstName + " " + this.state.user.lastName}
            </Text>
            <Text style={styles.topViewCode}> {"Codigo " + this.state.user.username}</Text>
          </View>
        </View>
        <View style={styles.listContainer}>
          <FlatList
            keyExtractor={this.keyExtractor}
            data={this.list}
            renderItem={this.renderItem}
          />
        </View>
        <Overlay
          containerStyle={{ flex: 1, alignItems: "center" }}
          animated
          animationType="fade"
          width={Dimensions.get("window").width * 0.75}
          height="auto"
          onBackdropPress={() => this.setState({ overlayVisible: false })}
          isVisible={this.state.overlayVisible}>
          {this.getContext()}
        </Overlay>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  topView: {
    paddingVertical: 5,
    flexDirection: "row",
    backgroundColor: Constants.COLOR_ORANGE,
  },
  topViewName: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  topViewCode: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
  },
  listContainer: { flex: 5 },
  overlayInnerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Profile;
