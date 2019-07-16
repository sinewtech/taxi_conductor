import React, { Component } from "react";
import { Button, Icon, Overlay } from "react-native-elements";
import AlertAsync from "react-native-alert-async";
import {
  Text,
  View,
  BackHandler,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  ToastAndroid,
  AppState,
  Linking,
} from "react-native";
import { Notifications } from "expo";
import KeepAwake from "expo-keep-awake";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import * as TaskManager from "expo-task-manager";
import * as Permissions from "expo-permissions";
import { Audio } from "expo-av";

import Driver from "../Components/Driver";
import Briefing from "../Components/Briefing";
import Asking from "../Components/Asking";
import firebase from "../../firebase";
import * as Constants from "../Constants";

import {
  NavigatingToClient,
  WaitingClient,
  NavigatingToDestination,
} from "../Components/Navigating";
import ThreeAxisSensor from "expo-sensors/build/ThreeAxisSensor";

const decodePolyline = require("decode-google-map-polyline");

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    Notifications.createChannelAndroidAsync("carreras", {
      name: "Carreras",
      priority: "max",
      vibrate: [0, 250, 250, 250],
      sound: true,
    });
    Notifications.createChannelAndroidAsync("ads", {
      name: "Ads",
      priority: "max",
      vibrate: [0, 250, 250, 250],
      sound: true,
    });
  }
  let token = "_";

  try {
    token = await Notifications.getExpoPushTokenAsync();
  } catch (e) {
    console.error(e);
  }

  return token;
}

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      driverState: Constants.DRIVER_STATE_NONE,
      showModal: false,
      // driverState: Constants.DRIVER_STATE_GOING_TO_CLIENT,
      selectedIndex: 0,
      user: {},
      order: { origin: {}, destination: {}, price: -1, manual: true },
      polyline: [],
      navigating: false,
      navigationCentered: false,
    };

    if (Constants.DEBUG_MODE) {
      this.state.driverState = Constants.DRIVER_STATE_ASKING;
      this.state.order = {
        origin: {
          name: "Universidad Tecnológica Centroamericana",
          //address: "frente a Residencial, V-782 Boulevard Kennedy, Tegucigalpa",
          address: null,
        },
        destination: {
          name: "Universidad Nacional Autónoma de Honduras",
          //address: "Bulevar Suyapa, Tegucigalpa, M.D.C, Honduras, Centroamérica ",
          address: null,
        },
        manual: true,
        price: 420.69,
      };
    }

    this.notificationSound = null;
  }

  goToUserLocation = async () => {
    if (this.map) {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);

      if (status !== "granted") {
        Alert.alert("Error", "Por favor permita que la app use el GPS para continuar");
      }

      let location = await Location.getCurrentPositionAsync({});

      this.setState({
        driverPosition: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      });

      this.map.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  updateUser = userdata => {
    userdata === null ? this.setState({ userUID: null }) : this.setState(userdata);
  };

  //Cambia el valor de devMode en el state this.state.user.dev te dice si el usuario tiene permiso de dev, this.state.dev te dice si esta activo
  devToggle = () => {
    if (this.state.userUID !== null && this.state.user.dev) {
      userdata = this.state;
      userdata.dev = !userdata.dev;
      this.setState({ userdata });
      this.state.dev === true
        ? console.log("DEV MODE: ON")
        : (Platform.OS === "android" ? ToastAndroid.show("User Mode", ToastAndroid.LONG) : null,
          console.log("DEV MODE: OFF"));
    }
  };

  componentWillUnmount = async () => {
    Location.stopLocationUpdatesAsync(Constants.LOCATION_TASK_NAME).then(value => {
      console.log(value);
    });
  };

  componentDidMount = async () => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    this.loadAudio();

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .firestore()
          .collection("drivers")
          .doc(user.uid)
          .get()
          .then(value => {
            let data = value.data();
            console.log("\nDEV: " + data.dev);
            //mira si tiene el campo de "dev", y si lo tiene hace el dev mode true
            if (data.dev) {
              this.updateUser({ user: data, userUID: user.uid, dev: true });
            } else {
              this.updateUser({ user: data, userUID: user.uid, dev: false });
            }
            this.registerPush();
          });

        firebase
          .database()
          .ref()
          .child("locations/" + firebase.auth().currentUser.uid + "/status")
          .on("value", snap => {
            this.setState({ driverStatus: snap.exportVal(), selectedIndex: snap.exportVal() });
          });
        firebase
          .database()
          .ref()
          .child("quotes/")
          .once("value", snap => {
            snap.forEach(datasnap => {
              let order = datasnap.exportVal();
              if (order.driver === user.uid) {
                switch (order.status) {
                  case Constants.QUOTE_STATUS_PRICE_ACCEPTED: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_ASKING,
                      destination: order.destination,
                      origin: order.origin,
                      isManual: !order.usingGps,
                    });
                    if (order.usingGps) {
                      this.getPoly(order.origin, order.destination);
                    }
                    break;
                  }
                  case Constants.QUOTE_STATUS_DRIVER_GOING_TO_CLIENT: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_GOING_TO_CLIENT,
                      destination: order.destination,
                      origin: order.origin,
                      isManual: !order.usingGps,
                    });
                    if (order.usingGps) {
                      this.getPoly(this.state.driverpostion, order.origin);
                    }
                    break;
                  }
                  case Constants.QUOTE_STATUS_WAITING_CLIENT: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_CLIENT_IS_WITH_HIM,
                      destination: order.destination,
                      isManual: !order.usingGps,
                      origin: order.origin,
                    });
                    break;
                  }
                  case Constants.QUOTE_STATUS_CLIENT_ABORDED: {
                    this.setState({
                      order: order,
                      orderuid: datasnap.key,
                      driverState: Constants.DRIVER_STATE_GOING_TO_DESTINATION,
                      destination: order.destination,
                      origin: order.origin,
                      isManual: !order.usingGps,
                    });
                    if (order.usingGps) {
                      this.getPoly(this.state.driverPosition, order.destination);
                    }

                    break;
                  }
                  default:
                    break;
                }
              }
            });
          });
      } else {
        this.updateUser(null);
      }
    });

    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== "granted") {
      Alert.alert("Servicios GPS", "Por favor activa los servicios de GPS para continuar.");
    }

    let loc = await Location.getProviderStatusAsync();

    if (loc.gpsAvailable) {
      await Location.startLocationUpdatesAsync(Constants.LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: "Servicios de Ubicación",
          notificationBody: "Tu ubicación está siendo monitoreada por la central.",
          notificationColor: "#FF9800",
        },
      });
    } else {
      Alert.alert("Servicios GPS", "Por favor activa los servicios de GPS para continuar.");
    }
  };

  async loadAudio() {
    if (this.notificationSound != null) {
      await this.notificationSound.unloadAsync();
      this.notificationSound.setOnPlaybackStatusUpdate(null);
      this.notificationSound = null;
    }
    const source = require("../../assets/sounds/alert_carrera_recibida.mp3");
    const initialStatus = {
      //        Play by default
      shouldPlay: false,
      //        Control the speed
      rate: 1.0,
      //        Correct the pitch
      shouldCorrectPitch: true,
      //        Control the Volume
      volume: 1.0,
      //        mute the Audio
      isMuted: false,
    };
    const { sound, status } = await Audio.Sound.createAsync(source, initialStatus);
    //  Save the response of sound in notificationSound
    this.notificationSound = sound;
    //  Make the loop of Audio

    this.notificationSound.setIsLoopingAsync(true);
    //  Play the Music
    //this.notificationSound.playAsync();
  }

  startNavigationMode = () => {
    console.log("Enabling nav mode...");

    if (this.state.navigationSubscription) {
      console.log("Removing last location subscription...");
      this.state.navigationSubscription.remove();
    }

    let navigationSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 500,
        //distanceInterval: 5,
      },

      async location => {
        this.setState({
          driverPosition: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          },
        });

        if (this.state.navigating && this.state.navigationCentered) {
          this.map.setCamera({
            center: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            heading: location.coords.heading,
            pitch: 70,
            zoom: 50,
          });
        }
      }
    );

    this.setState({ navigating: true, navigationCentered: true, navigationSubscription });
  };

  stopNavigationMode = () => {
    console.log("Disabling nav mode...");

    if (this.state.navigationSubscription) {
      console.log("Removing location subscription...");
      if (this.state.navigationSubscription.remove) this.state.navigationSubscription.remove();
    }

    this.map.animateCamera({
      center: {
        latitude: Constants.INITIAL_REGION.latitude,
        longitude: Constants.INITIAL_REGION.longitude,
      },
      heading: 0,
      pitch: 0,
      zoom: 12,
    });

    this.setState({ navigating: false, navigationCentered: false });
  };

  pauseNavigation = () => {
    this.setState({ navigationCentered: false });
    this.goToUserLocation();

    this.map.animateCamera({
      zoom: 16,
      heading: 0,
      pitch: 0,
    });
  };

  resumeNavigation = () => {
    if (!this.state.navigationSubscription) {
      this.startNavigationMode();
    } else {
      this.setState({ navigationCentered: true });
    }
  };

  getPoly = async (origin, destination) => {
    await fetch(
      "https://maps.googleapis.com/maps/api/directions/json?key=" +
        Constants.API_KEY +
        "&origin=" +
        origin.lat +
        "," +
        origin.lng +
        "&destination=" +
        destination.lat +
        "," +
        destination.lng
    )
      .then(response => response.json())
      .then(responseJson => {
        //console.log(JSON.stringify(responseJson));
        if (responseJson.status == "OK") {
          // console.log(responseJson.routes[0].overview_polyline);
          let polyline = decodePolyline(responseJson.routes[0].overview_polyline.points);

          this.setState({ polyline });
        } else {
          console.log("Status failed");
        }
      });
  };

  clear = () => {
    this.setState({
      driverState: Constants.DRIVER_STATE_NONE,
      order: { origin: {}, destination: {}, price: -1 },
      polyline: [],
    });
  };

  updateOrderStatus = status => {
    firebase
      .database()
      .ref()
      .child("/quotes/" + this.state.orderuid + "/status")
      .set(status);
  };

  updateOrderRiskCliente = distance => {
    let warning = { distance: distance, risk: "NO" };
    switch (true) {
      case Constants.DRIVER_MAX_DISTANCE_NO_WARNING_METERS < distance &&
        distance <= Constants.DRIVER_MAX_DISTANCE_LOW_WARNING_METERS:
        warning = { distance: distance, risk: "NO" };
        break;
      case distance <= Constants.DRIVER_MAX_DISTANCE_MID_WARNING_METERS:
        warning = { distance: distance, risk: "LOW" };
        break;
      case distance <= Constants.DRIVER_MAX_DISTANCE_HIGH_WARNING_METERS:
        warning = { distance: distance, risk: "MID" };
        break;
      case Constants.DRIVER_MAX_DISTANCE_HIGH_WARNING_METERS < distance:
        warning = { distance: distance, risk: "HIGH" };
        break;
    }
    firebase
      .database()
      .ref()
      .child("/quotes/" + this.state.orderuid + "/warning/cliente/")
      .set(warning);
  };

  updateOrderRiskDestination = distance => {
    let warning = { distance: distance, risk: "NO" };
    switch (true) {
      case Constants.DRIVER_MAX_DISTANCE_NO_WARNING_METERS < distance &&
        distance <= Constants.DRIVER_MAX_DISTANCE_LOW_WARNING_METERS:
        warning = { distance: distance, risk: "NO" };
        break;
      case distance <= Constants.DRIVER_MAX_DISTANCE_MID_WARNING_METERS:
        warning = { distance: distance, risk: "LOW" };
        break;
      case distance <= Constants.DRIVER_MAX_DISTANCE_HIGH_WARNING_METERS:
        warning = { distance: distance, risk: "MID" };
        break;
      case Constants.DRIVER_MAX_DISTANCE_HIGH_WARNING_METERS < distance:
        warning = { distance: distance, risk: "HIGH" };
        break;
    }
    firebase
      .database()
      .ref()
      .child("/quotes/" + this.state.orderuid + "/warning/destination/")
      .set(warning);
  };

  updateTimeStamps = dateTime => {
    firebase
      .database()
      .ref()
      .child("quotes/" + this.state.orderuid + "/timeStamps/" + dateTime)
      .set(new Date().toString());
  };

  getState = () => {
    switch (this.state.driverState) {
      case Constants.DRIVER_STATE_NONE: {
        return <Briefing />;
      }
      case Constants.DRIVER_STATE_ASKING: {
        if (!this.state.order.userName && !this.state.clientInfoCaptured) {
          console.log("Info del cliente no recuperada.");

          var clientRef = firebase
            .firestore()
            .collection("clients")
            .doc(this.state.order.userUID);

          clientRef
            .get()
            .then(doc => {
              if (doc.exists) {
                client = doc.data();
                let order = this.state.order;

                order.userName = client.firstName + " " + client.lastName;
                order.userPhone = client.phone;

                this.setState({
                  order,
                  clientInfoCaptured: true,
                });
              } else {
                // doc.data() will be undefined in this case
                console.log("No se encontró al cliente.");
                this.setState({ clientInfoCaptured: true });
              }
            })
            .catch(function(error) {
              console.log("Error getting document:", error);
              this.setState({ clientInfoCaptured: true });
            });
        }

        this.notificationSound.playAsync();

        return (
          <Asking
            isManual={this.state.isManual}
            order={this.state.order}
            onAccept={() => {
              this.map.fitToElements(true);

              Alert.alert("Navegación", "Vamos hacia el cliente", [
                {
                  text: "OK",
                  onPress: () => {
                    this.notificationSound.stopAsync();
                    this.updateDriverStatus(Constants.DRIVER_STATUS_ON_A_DRIVE);
                    this.updateOrderStatus(Constants.QUOTE_STATUS_DRIVER_GOING_TO_CLIENT);
                    this.updateTimeStamps("acceptedOrder");

                    if (!this.state.isManual) {
                      this.getPoly(this.state.driverPosition, this.state.order.origin);
                    }

                    this.setState({
                      driverState: Constants.DRIVER_STATE_GOING_TO_CLIENT,
                    });

                    this.startNavigationMode();
                  },
                },
              ]);
            }}
            onReject={() => {
              Alert.alert(
                "Rechazando",
                "Estas a punto de rechazar una carrera.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      this.setState({
                        order: { origin: {}, destination: {}, price: -1 },
                        polyline: [],
                        driverState: Constants.DRIVER_STATE_NONE,
                      });

                      this.notificationSound.stopAsync();
                      this.updateOrderStatus(Constants.QUOTE_STATUS_DRIVER_DENNIED);
                      this.updateDriverStatus(Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE);
                      this.stopNavigationMode();
                    },
                  },
                  {
                    text: "REGRESAR",
                  },
                ],
                { cancelable: false }
              );
            }}
          />
        );
      }

      case Constants.DRIVER_STATE_GOING_TO_CLIENT: {
        this.updateDriverStatus(Constants.DRIVER_STATUS_ON_A_DRIVE);
        this.notificationSound.stopAsync();

        return (
          <NavigatingToClient
            order={this.state.order}
            next={() =>
              Alert.alert("Confirma tu llegada", "¿Ya estás esperando al cliente?", [
                { text: "No" },
                {
                  text: "Sí",
                  onPress: async () => {
                    const continua = await new Promise(async (resolve, reject) => {
                      // console.log(
                      //   "distancia: " +
                      //     Constants.getDistanceBetweenCoordinates(
                      //       this.state.order.origin,
                      //       this.state.driverPosition
                      //     )
                      // );
                      if (
                        !this.state.order.manual &&
                        Constants.getDistanceBetweenCoordinates(
                          this.state.order.origin,
                          this.state.driverPosition
                        ) > Constants.DRIVER_MAX_DISTANCE_NO_WARNING_METERS
                      ) {
                        const confirma = await AlertAsync(
                          "¡No está lo suficientemente cerca del cliente!",
                          "¿Está seguro que desea confirmar llegada?",
                          [
                            {
                              text: "No",
                              onPress: () => resolve("No"),
                            },
                            {
                              text: "Sí",
                              onPress: () => resolve("Si"),
                            },
                          ]
                        );
                        console.log("resolve: " + confirma);
                        resolve(confirma);
                      } else {
                        resolve("Si");
                      }
                    });

                    console.log("continua: " + continua);

                    if (continua === "Si") {
                      if (!this.state.order.manual)
                        this.updateOrderRiskCliente(
                          Constants.getDistanceBetweenCoordinates(
                            this.state.order.origin,
                            this.state.driverPosition
                          )
                        );
                      this.pauseNavigation();

                      console.log("Confirmando status para orden", this.state.orderuid);

                      Alert.alert(
                        "Notificando al cliente",
                        this.state.order.manual
                          ? "Por favor llama al cliente y notificale tu llegada."
                          : "Le notificaremos tu llegada al cliente.",
                        [
                          {
                            text: "ok",
                            onPress: () => {
                              this.updateOrderStatus(Constants.QUOTE_STATUS_WAITING_CLIENT);
                              this.updateTimeStamps("driverArrived");
                              this.setState({
                                driverState: Constants.DRIVER_STATE_CLIENT_IS_WITH_HIM,
                              });
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                      console.log("destination", this.state.destination);
                    }
                  },
                },
              ])
            }
          />
        );
      }

      case Constants.DRIVER_STATE_CLIENT_IS_WITH_HIM: {
        return (
          <WaitingClient
            order={this.state.order}
            next={() =>
              Alert.alert("Confirma el abordaje", "¿El cliente ya abordó la unidad?", [
                { text: "No" },
                {
                  text: "Sí",
                  onPress: () => {
                    this.resumeNavigation();

                    console.log("Confirmando status para orden", this.state.orderuid);

                    Alert.alert(
                      "Navegación",
                      "Vamos hacia el destino del cliente.",
                      [
                        {
                          text: "ok",
                          onPress: () => {
                            this.updateOrderStatus(Constants.QUOTE_STATUS_CLIENT_ABORDED);
                            this.updateTimeStamps("clientAborded");
                            this.setState({
                              driverState: Constants.DRIVER_STATE_GOING_TO_DESTINATION,
                            });
                            if (!this.state.isManual) {
                              this.getPoly(this.state.driverPosition, this.state.order.destination);
                            }
                          },
                        },
                      ],
                      { cancelable: false }
                    );
                    console.log("destination", this.state.destination);
                  },
                },
              ])
            }
          />
        );
      }

      case Constants.DRIVER_STATE_GOING_TO_DESTINATION: {
        return (
          <NavigatingToDestination
            order={this.state.order}
            next={() => {
              Alert.alert(
                "Terminando Desplazamiento",
                "¿Has terminado la carrera?",
                [
                  {
                    text: "No",
                  },
                  {
                    text: "Sí",
                    onPress: async () => {
                      const continua = await new Promise(async (resolve, reject) => {
                        if (
                          !this.state.order.manual &&
                          Constants.getDistanceBetweenCoordinates(
                            this.state.order.destination,
                            this.state.driverPosition
                          ) > Constants.DRIVER_MAX_DISTANCE_NO_WARNING_METERS
                        ) {
                          const confirma = await AlertAsync(
                            "¡No está lo suficientemente cerca del destino!",
                            "¿Está seguro que desea finalizar la carrera?",
                            [
                              {
                                text: "No",
                                onPress: () => resolve("No"),
                              },
                              {
                                text: "Sí",
                                onPress: () => resolve("Si"),
                              },
                            ]
                          );
                          console.log("resolve: " + confirma);
                          resolve(confirma);
                        } else {
                          resolve("Si");
                        }
                      });

                      console.log("continua: " + continua);

                      if (continua === "Si") {
                        if (!this.state.order.manual)
                          this.updateOrderRiskDestination(
                            Constants.getDistanceBetweenCoordinates(
                              this.state.order.destination,
                              this.state.driverPosition
                            )
                          );
                        this.stopNavigationMode();

                        this.setState({
                          order: null,
                        });

                        this.updateDriverStatus(Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE);
                        this.updateOrderStatus(Constants.QUOTE_STATUS_FINISHED);
                        this.updateTimeStamps("clientArrived");

                        this.clear();

                        Alert.alert("Carrera terminada", "Gracias por cuidar a nuestro cliente.", [
                          { text: "Cerrar" },
                        ]);
                      }
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        );
      }
    }
  };

  registerPush = () => {
    registerForPushNotificationsAsync()
      .then(pushToken => {
        console.log(pushToken);
        if (pushToken) {
          firebase
            .firestore()
            .collection("drivers")
            .doc(this.state.userUID)
            .get()
            .then(DocumentSnapshot => {
              let pushTokens = [];
              if (DocumentSnapshot.data()["pushDevices"]) {
                let deviceJson = DocumentSnapshot.data()["pushDevices"];
                for (var token in deviceJson) {
                  if (deviceJson[token] === pushToken) {
                    console.log("Pushtoken ya existe para usuario.");
                    return;
                  } else {
                    console.log("Agregando nuevo PushToken", pushToken);
                    pushTokens.push(pushToken);
                  }
                }
              } else {
                pushTokens.push(pushToken);
              }
              firebase
                .firestore()
                .collection("drivers")
                .doc(this.state.userUID)
                .update({
                  pushDevices: pushTokens,
                });
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          console.error("Pushtoken nulo");
        }
      })
      .catch(e => console.error(e));

    this._notificationSubscription = Notifications.addListener(this._handleNotification);

    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.deactivate(); // works best when the goBack is async
      return true;
    });
  };

  deactivate = () => {
    this.setState({ order: { origin: {}, destination: {}, price: -1 } });
  };

  _handleNotification = async notification => {
    console.log("Notificación recibida", notification);
    console.log(notification.data.id === Constants.DRIVER_NOTIFICATION_CALL);
    if (notification.data.order) {
      if (notification.data.order.manual) await this.setState({ order: notification.data.order });
      //await this.setState({ order: notification.data.order });

      console.log("notification id", notification.data.id);
      if (notification.data.id === Constants.DRIVER_NOTIFICATION_CONFIRMING) {
        firebase
          .database()
          .ref()
          .child("quotes/" + notification.data.order.uid + "/")
          .once("value", async snap => {
            let data = snap.exportVal();
            await this.setState({
              order: data,
              orderuid: notification.data.order.uid,
              isManual: notification.data.order.manual,
            });

            this.updateDriverStatus(Constants.DRIVER_STATUS_CONFIRMING_DRIVE);
            this.map.fitToElements(true);

            if (
              !this.state.isManual &&
              this.state.order.origin !== undefined &&
              this.state.order.destination !== undefined
            ) {
              console.log("Dibujando ruta...");
              this.getPoly(data.origin, data.destination);
            }
          });
      } else if (
        notification.data.id === Constants.DRIVER_NOTIFICATION_CONFIRMING &&
        notification.order.manual
      ) {
        firebase
          .database()
          .ref()
          .child("quotes/" + notification.data.order.uid + "/")
          .once("value", async snap => {
            let data = snap.exportVal();
            await this.setState({
              order: data,
              orderuid: notification.data.order.uid,
              isManual: notification.data.order.manual,
            });
            this.updateDriverStatus(Constants.DRIVER_STATUS_CONFIRMING_DRIVE);
          });
      } else if (notification.data.id === Constants.DRIVER_NOTIFICATION_CONFIRMED) {
        console.log("Verificando si orden es manual:", this.state.order);

        if (this.state.order.manual) {
          firebase
            .database()
            .ref()
            .child("quotes/" + notification.data.order.uid + "/")
            .once("value", async snap => {
              let data = snap.exportVal();
              console.log("Orden manual recibida:", data);

              await this.setState({
                //order: data,
                orderuid: notification.data.order.uid,
                isManual: notification.data.order.manual,
                driverState: Constants.DRIVER_STATE_ASKING,
              });

              this.updateDriverStatus(Constants.DRIVER_STATUS_CONFIRMING_DRIVE);
            });
        } else this.setState({ driverState: Constants.DRIVER_STATE_ASKING });
      } else if (notification.data.id === Constants.QUOTE_STATUS_CLIENT_CANCELED) {
        this.updateDriverStatus(Constants.DRIVER_STATUS_LOOKING_FOR_DRIVE);
      }
    } else if (notification.data.id === Constants.DRIVER_NOTIFICATION_CALL) {
      console.log("sexo anal");
      await this.setState({ showModal: true });
    }
    console.log("se mandaron", AppState.currentState);
    if (Platform.OS === "android" && AppState.currentState === "active") {
      await Notifications.dismissAllNotificationsAsync();
    }
  };
  static getcurrentuser = () => {
    return firebase.auth().currentUser.uid;
  };

  updateDriverStatus = selectedIndex => {
    if (this.state.selectedIndex !== selectedIndex) {
      this.setState({ selectedIndex });
      firebase
        .database()
        .ref()
        .child("locations/" + firebase.auth().currentUser.uid + "/status")
        .set(selectedIndex);
    }
  };

  drawPolyline = () => {
    var coords = [];

    this.state.polyline.map(point => {
      coords.push({
        latitude: point.lat,
        longitude: point.lng,
      });
    });

    return coords;
  };

  render() {
    let originMarker = null;
    let destinationMarker = null;
    let polyline = null;

    if (this.state.order) {
      if (this.state.order.origin && this.state.order.destination) {
        //console.log("Preparando componentes para marcadores...", this.state.order);

        if (this.state.order.origin.lat && this.state.order.origin.lng) {
          originMarker = (
            <MapView.Marker
              title="Origen"
              description="Donde ese encuentra el cliente."
              pinColor={Constants.COLOR_BLUE}
              coordinate={{
                latitude: this.state.order.origin.lat,
                longitude: this.state.order.origin.lng,
              }}
            />
          );
        }

        if (this.state.order.destination.lat && this.state.order.destination.lng) {
          destinationMarker = (
            <MapView.Marker
              title="Destino"
              description="Lleva al cliente acá."
              pinColor={Constants.COLOR_RED}
              coordinate={{
                latitude: this.state.order.destination.lat,
                longitude: this.state.order.destination.lng,
              }}
            />
          );
        }

        if (originMarker && destinationMarker)
          polyline = (
            <MapView.Polyline
              strokeWidth={this.state.navigating ? 12 : 5}
              strokeColor="#03A9F4"
              coordinates={this.drawPolyline()}
            />
          );
      }
    }

    let navIcon = null;

    if (this.state.driverPosition && this.state.navigating) {
      //console.log("Updating navicon", this.state.driverPosition);

      navIcon = (
        <MapView.Marker
          coordinate={{
            latitude: this.state.driverPosition.lat,
            longitude: this.state.driverPosition.lng,
          }}>
          <Icon
            name="navigation"
            color={Constants.COLOR_BLUE}
            reverse
            raised
            size={50}
            containerStyle={{
              transform: [
                { rotateX: "60deg" },
                { translateY: Dimensions.get("window").height * 0.1 },
              ],
            }}
          />
        </MapView.Marker>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <KeepAwake />
        <Overlay
          animated
          animationType="fade"
          isVisible={this.state.showModal}
          onBackdropPress={() => this.setState({ showModal: false })}
          height="auto"
          width="auto">
          <View style={{ flexDirection: "row" }}>
            <Text>El cliente ocupa que lo llames ahorita</Text>
            <Icon
              name="phone"
              reverse
              reverseColor="white"
              onPress={() => {
                Linking.openURL(`tel:${this.state.order.userPhone}`);
              }}
              color={Constants.COLOR_GREEN}
            />
          </View>
        </Overlay>
        <MapView
          style={{ flex: 1 }}
          onMapReady={() => this.goToUserLocation()}
          onPanDrag={() => this.setState({ navigationCentered: false })}
          showsTraffic
          showsCompass={false}
          showsUserLocation={!this.state.navigating}
          loadingBackgroundColor="#FF9800"
          initialRegion={Constants.INITIAL_REGION}
          ref={ref => (this.map = ref)}
          mapPadding={{
            top: Dimensions.get("window").height * 0.1,
            bottom: this.state.navigating ? 0 : Dimensions.get("window").height * 0.35,
            left: Dimensions.get("window").width * 0.04,
            right: Dimensions.get("window").width * 0.04,
          }}>
          {originMarker}
          {destinationMarker}
          {this.state.polyline.length > 0 ? polyline : null}
          {navIcon}
        </MapView>

        <View
          style={styles.stateContainer}
          maxHeight={
            Constants.STATE_HEIGHT[this.state.driverState]
              ? Dimensions.get("window").height *
                (Number.parseFloat(Constants.STATE_HEIGHT[this.state.driverState]) / 100)
              : null
          }
          elevation={3}>
          {this.getState()}
        </View>
        <Driver
          elevation={3}
          avatar={this.state.user.profile}
          name={this.state.user.firstName + " " + this.state.user.lastName}
          username={this.state.user.username}
          signOut={firebase.auth().signOut}
          status={this.state.driverStatus}
          updateDriverStatus={this.updateDriverStatus}
          devToggle={this.devToggle}
          openDrawer={() => {
            this.props.navigation.openDrawer();
            console.log("drawer");
          }}
        />

        <View style={styles.locationButtonView}>
          <Icon
            name="gps-fixed"
            reverse
            raised
            containerStyle={styles.locationButton}
            color={Constants.COLOR_ORANGE}
            onPress={() => {
              if (this.state.navigating) this.setState({ navigationCentered: true });
              else this.goToUserLocation();
            }}
          />
        </View>

        {/* {Platform.OS === "android" && this.state.user.dev
          ? ToastAndroid.show("Dev mode", ToastAndroid.LONG)
          : null} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  locationButton: {
    elevation: 3,
  },

  locationButtonView: {
    position: "absolute",
    top: "10%",
    right: "2%",
  },

  avatar: {
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
  },

  profiledata: { flexDirection: "row" },

  stateContainer: {
    width: "92%",
    marginLeft: "4%",
    marginRight: "4%",
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
    overflow: "hidden",
    bottom: "2%",
  },

  mapcontainer: { flex: 1 },

  centerNavigationView: {
    position: "absolute",
    top: "50%",
    left: "5%",
    zIndex: 10,
    backgroundColor: "red",
    borderRadius: 100,
    height: 25,
    width: 25,
  },
});

export default Home;
TaskManager.defineTask(Constants.LOCATION_TASK_NAME, async ({ data: { locations }, error }) => {
  if (error) {
    return;
  } else {
    locations[0].user = Home.getcurrentuser();

    fetch("https://us-central1-taxiapp-sinewave.cloudfunctions.net/location/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(locations[0]),
    })
      .then(res => res.text())
      .then(Response => {
        console.log("Location task response:", Response);
      })
      .catch(error => console.log(error));
  }
});
