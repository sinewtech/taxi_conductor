import React, { Component } from "react";
import { View, Text, BackHandler, FlatList, StyleSheet } from "react-native";
import { Avatar, ListItem } from "react-native-elements";
import firebase from "../../firebase";
import * as Constants from "../Constants";
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { user: {} };
    this.list = [];
  }

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
                console.log("formas");
              },
            },
            {
              name: "Nombre",
              subtitle: user.firstName,
              leftIcon: "person",
              rightIcon: "pencil",
              rightIconType: "material-community",
            },
            {
              name: "Apellido",
              subtitle: user.lastName,
              leftIcon: "person",
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
          await this.setState({ user });
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
          <Text style={styles.topViewName}>
            {this.state.user.firstName + " " + this.state.user.lastName + "\n"}
            {"Unidad " + this.state.user.username}
          </Text>
        </View>
        <FlatList keyExtractor={this.keyExtractor} data={this.list} renderItem={this.renderItem} />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  topView: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Constants.COLOR_ORANGE,
  },
  topViewName: {
    color: "white",
    fontSize: 25,
  },
});

export default Profile;
