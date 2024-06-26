import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@fireblocks/react-native-ncw-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const ReactNativeNcwSdkModule = isTurboModuleEnabled
  ? require('./NativeReactNativeNcwSdk').default
  : NativeModules.ReactNativeNcwSdk;

export const ReactNativeNcwSdk = ReactNativeNcwSdkModule
  ? ReactNativeNcwSdkModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export * from "./interfaces";
export * from "./types";

export { FireblocksNCWFactory } from "./FireblocksNCWFactory";