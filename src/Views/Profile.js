import React, { Component } from "react";
import { View, Text, BackHandler, FlatList, StyleSheet, Dimensions, Alert } from "react-native";
import { Avatar, ListItem, Overlay, Input, Button, CheckBox } from "react-native-elements";
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
      gateway: false,
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
              <CheckBox
                title="Sine"
                onPress={() => {
                  this.setState({
                    gateway: !this.state.gateway,
                  });
                }}
                checked={this.state.gateway}
              />
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
                      final.push("Efectivo");
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
            <Input
              leftIcon={{ name: "directions-car" }}
              value={this.state.codigo}
              onChangeText={text => {
                this.setState({ codigo: text });
              }}
              placeholder={this.state.user.codigo}
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
              leftIcon={{ name: "directions-car" }}
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
            <Input
              leftIcon={{ name: "directions-car" }}
              value={this.state.placa}
              onChangeText={text => {
                this.setState({ placa: text });
              }}
              placeholder={this.state.user.placa}
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
            <Input
              leftIcon={{ name: "phone" }}
              value={this.state.telefono}
              onChangeText={text => {
                this.setState({ telefono: text });
              }}
              placeholder={this.state.user.telefono}
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
              name: "Descripcion del carro",
              subtitle: user.description,
              leftIcon: "directions-car",
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
            POS: user.payments.includes("POS"),
            efectivo: user.payments.includes("Efectivo"),
            gateway: user.payments.includes("Gateway"),
          });
        });
    }
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.props.navigation.goBack();
      return true;
    });
  };
  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item }) => (
    <ListItem
      title={item.name}
      subtitle={item.subtitle}
      leftAvatar={{ icon: { name: item.leftIcon } }}
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
            onEditPress={() => console.log("Works!")}
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
