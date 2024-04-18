import { MMKV } from "react-native-mmkv";
import uuid from 'react-native-uuid';

const DEVICE_ID_KEY = "DEMO_APP:deviceId";

const mmkv = new MMKV();

export const generateDeviceId = () => uuid.v4() as string;

export const loadDeviceId = (userId: string) => {
  return mmkv.getString(`${DEVICE_ID_KEY}-${userId}`);
  // return localStorage.getItem(`${DEVICE_ID_KEY}-${userId}`);
};

export const getOrCreateDeviceId = (userId: string) => {
  const deviceId = loadDeviceId(userId);
  if (deviceId) {
    return deviceId;
  }

  const uuid = generateDeviceId();
  storeDeviceId(uuid, userId);
  return uuid;
};

export const storeDeviceId = (deviceId: string, userId: string) => {
  mmkv.set(`${DEVICE_ID_KEY}-${userId}`, deviceId);
  // localStorage.setItem(`${DEVICE_ID_KEY}-${userId}`, deviceId);
};
