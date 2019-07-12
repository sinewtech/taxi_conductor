import React, { Component } from "react";
import { View, Text, BackHandler, FlatList, StyleSheet, Dimensions, Alert } from "react-native";
import { Avatar, ListItem, Overlay, Input, Button } from "react-native-elements";
import firebase from "../../firebase";
import * as Constants from "../Constants";
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { user: {}, overlayState: 0, overlayVisible: false, nombre: "", apellido: "" };
    this.list = [];
  }
  getContext = () => {
    switch (this.state.overlayState) {
      case 0: {
        return (
          <View>
            <Text>Wenas</Text>
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
            },
            {
              name: "Descripcion del carro",
              subtitle: user.description,
              leftIcon: "directions-car",
              rightIcon: "pencil",
              rightIconType: "material-community",
            },
            {
              name: "Placa del carro",
              subtitle: user.plate,
              leftIcon: "directions-car",
              rightIcon: "pencil",
              rightIconType: "material-community",
            },
            {
              name: "Telefono",
              subtitle: user.phone,
              leftIcon: "phone",
              rightIcon: "pencil",
              rightIconType: "material-community",
            },
            {
              name: "Contraseña",
              leftIcon: "vpn-key",
              rightIcon: "pencil",
              rightIconType: "material-community",
            },
          ];
          await this.setState({ user, nombre: user.firstName, apellido: user.lastName });
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
