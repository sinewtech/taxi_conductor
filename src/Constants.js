export const INITIAL_REGION = {
  latitude: 14.0723,
  longitude: -87.1921,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const DEBUG_MODE = false;
export const STATE_HEIGHT = {
  0: "25%",
  1: "50%",
};

export const LOCATION_TASK_NAME = "TAXI_DRIVER_LOCATION";

export const API_KEY = "AIzaSyApNgtxFBp0SXSHljP_xku6peNCzjTFWM4";
//estados para el card
export const DRIVER_STATE_NONE = 0;
export const DRIVER_STATE_ASKING = 1;
export const DRIVER_STATE_GOING_TO_CLIENT = 2;
export const DRIVER_STATE_CLIENT_IS_WITH_HIM = 3;
export const DRIVER_STATE_GOING_TO_DESTINATION = 4;

// tipos de notificaciones
export const DRIVER_NOTIFICATION_ADS = 0;
export const DRIVER_NOTIFICATION_CONFIRMING = 2;
export const DRIVER_NOTIFICATION_CONFIRMED = 3;

//estados en el que puede estar un conductor
export const DRIVER_STATUS_NOT_WORKING = 0;
export const DRIVER_STATUS_LOOKING_FOR_DRIVE = 1;
export const DRIVER_STATUS_ON_A_DRIVE = 2;
export const DRIVER_STATUS_CONFIRMING_DRIVE = 3;

//estados de una orden
export const QUOTE_STATUS_NO_ANSWER = 0;
export const QUOTE_STATUS_SETTING_PRICE = 1;
export const QUOTE_STATUS_PRICE_ACCEPTED = 2;
export const QUOTE_STATUS_DRIVER_GOING_TO_CLIENT = 3;
export const QUOTE_STATUS_DRIVER_DENNIED = 4;
export const QUOTE_STATUS_WAITING_CLIENT = 5;
export const QUOTE_STATUS_CLIENT_ABORDED = 6;
export const QUOTE_STATUS_FINISHED = 7;
