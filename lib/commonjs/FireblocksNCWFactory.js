"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FireblocksNCWFactory = FireblocksNCWFactory;
var _reactNative = require("react-native");
var _reactNativeNcwSdk = require("react-native-ncw-sdk");
function registerEvents({
  messagesHandler,
  secureStorageProvider,
  eventsHandler,
  ...opts
}) {
  const eventEmitter = new _reactNative.NativeEventEmitter(_reactNative.NativeModules.NcwSdk);
  const subscriptions = [];
  subscriptions.push(eventEmitter.addListener('store', async event => {
    const {
      opId,
      deviceId,
      map
    } = event;
    if (deviceId !== opts.deviceId) {
      return;
    }
    console.log("store called!", event);
    const response = Object.fromEntries(Object.keys(map).map(k => [k, false]));
    try {
      const release = await secureStorageProvider.getAccess();
      try {
        for (const [key, value] of Object.entries(map)) {
          await secureStorageProvider.set(key, value);
          response[key] = true;
        }
      } finally {
        await release();
      }
    } catch (e) {
      console.error("store error", e);
    }
    await _reactNativeNcwSdk.NcwSdk.handleResponse({
      opId,
      deviceId,
      data: response
    });
  }));
  subscriptions.push(eventEmitter.addListener('load', async event => {
    const {
      opId,
      deviceId,
      keys
    } = event;
    if (deviceId !== opts.deviceId) {
      return;
    }
    console.log("load called!", event);
    const response = Object.fromEntries(keys.map(k => [k, null]));
    try {
      const release = await secureStorageProvider.getAccess();
      try {
        for (const key of keys) {
          const value = await secureStorageProvider.get(key);
          response[key] = value;
        }
      } finally {
        await release();
      }
    } catch (e) {
      console.error("store error", e);
    }
    await _reactNativeNcwSdk.NcwSdk.handleResponse({
      opId,
      deviceId,
      data: response
    });
  }));
  subscriptions.push(eventEmitter.addListener('contains', async event => {
    const {
      opId,
      deviceId,
      keys
    } = event;
    if (deviceId !== opts.deviceId) {
      return;
    }
    console.log("contains called!", event);
    try {
      const release = await secureStorageProvider.getAccess();
      try {
        // TODO: consider cotains() method in storage provider interface
        const allKeys = new Set((await secureStorageProvider.getAllKeys()) ?? []);
        await _reactNativeNcwSdk.NcwSdk.handleResponse({
          opId,
          deviceId,
          data: Object.fromEntries(keys.map(k => [k, allKeys.has(k)]))
        });
      } finally {
        await release();
      }
    } catch (e) {
      console.error("contains error", e);
      // TODO: handle on JAVA side
      await _reactNativeNcwSdk.NcwSdk.handleResponse({
        opId,
        deviceId,
        data: {}
      });
    }
  }));
  subscriptions.push(eventEmitter.addListener('remove', async event => {
    const {
      opId,
      deviceId,
      keys
    } = event;
    if (deviceId !== opts.deviceId) {
      return;
    }
    console.log("remove called!", event);
    const response = Object.fromEntries(keys.map(k => [k, false]));
    try {
      const release = await secureStorageProvider.getAccess();
      try {
        for (const key of keys) {
          await secureStorageProvider.clear(key);
          response[key] = true;
        }
      } finally {
        await release();
      }
    } catch (e) {
      console.error("remove error", e);
    }
    await _reactNativeNcwSdk.NcwSdk.handleResponse({
      opId,
      deviceId,
      data: response
    });
  }));
  subscriptions.push(eventEmitter.addListener('outgoingMessage', async event => {
    const {
      message,
      opId,
      deviceId
    } = event;
    console.debug("outgoingMessage called!", {
      opId,
      deviceId
    });
    if (deviceId !== opts.deviceId) {
      return;
    }

    // TODO: consider not converting to JSON and back to string for performance
    try {
      const response = await messagesHandler.handleOutgoingMessage(message);
      // console.debug(`received response: ${JSON.stringify(response)}`);

      await _reactNativeNcwSdk.NcwSdk.handleResponse({
        opId,
        deviceId,
        data: JSON.stringify(response)
      });
    } catch (e) {
      console.error("outgoingMessage error", e);
      if (e instanceof Error) {
        await _reactNativeNcwSdk.NcwSdk.handleResponse({
          opId,
          deviceId,
          data: {
            error: e.message
          }
        });
      } else if (e instanceof String || typeof e === 'string') {
        await _reactNativeNcwSdk.NcwSdk.handleResponse({
          opId,
          deviceId,
          data: {
            error: e
          }
        });
      } else {
        await _reactNativeNcwSdk.NcwSdk.handleResponse({
          opId,
          deviceId,
          data: {
            error: "unkown error"
          }
        });
      }
    }
  }));
  subscriptions.push(eventEmitter.addListener('sdk_event', event => {
    console.debug("sdk_event called!", event);
    eventsHandler === null || eventsHandler === void 0 || eventsHandler.handleEvent(event);
  }));
  return async () => {
    subscriptions.forEach(sub => sub.remove());
  };
}
async function FireblocksNCWFactory(options) {
  const {
    deviceId
  } = options;
  const dispose = registerEvents(options);
  try {
    await _reactNativeNcwSdk.NcwSdk.initialize(deviceId);
  } catch (e) {
    dispose();
    throw e;
  }
  const bridge = {
    dispose,
    // ?
    clearAllStorage: function () {
      throw new Error('Function not implemented.');
    },
    generateMPCKeys: async function (algorithms) {
      return new Set(await _reactNativeNcwSdk.NcwSdk.generateMPCKeys(deviceId, Array.from(algorithms)));
    },
    stopMpcDeviceSetup: function () {
      throw new Error('Function not implemented.');
    },
    signTransaction: async function (txId) {
      const status = await _reactNativeNcwSdk.NcwSdk.signTransaction(deviceId, txId);
      return {
        txId,
        transactionSignatureStatus: status
      };
    },
    stopInProgressSignTransaction: function () {
      throw new Error('Function not implemented.');
    },
    getInProgressSigningTxId: function () {
      throw new Error('Function not implemented.');
    },
    backupKeys: async function (passphrase, passphraseId) {
      return await _reactNativeNcwSdk.NcwSdk.backupKeys(deviceId, passphrase, passphraseId);
    },
    recoverKeys: async function (passphraseResolver) {
      const eventEmitter = new _reactNative.NativeEventEmitter(_reactNative.NativeModules.NcwSdk);
      const subscription = eventEmitter.addListener('resolvePassphrase', async event => {
        console.debug("resolvePassphrase called!", event);
        const {
          passphraseId,
          opId,
          deviceId
        } = event;
        if (deviceId !== options.deviceId) {
          return;
        }
        try {
          const response = await passphraseResolver(passphraseId);
          console.debug(`received response: ${JSON.stringify(response)}`);
          await _reactNativeNcwSdk.NcwSdk.handleResponse({
            opId,
            deviceId,
            data: response
          });
        } catch (e) {
          console.error("resolvePassphrase error", e);
          await _reactNativeNcwSdk.NcwSdk.handleResponse({
            opId,
            deviceId,
            data: {}
          });
        } finally {
          subscription.remove();
        }
      });
      await _reactNativeNcwSdk.NcwSdk.recoverKeys(deviceId);
    },
    requestJoinExistingWallet: async function (joinWalletResolver) {
      const eventEmitter = new _reactNative.NativeEventEmitter(_reactNative.NativeModules.NcwSdk);
      const subscriptions = [];
      subscriptions.push(eventEmitter.addListener('joinWalletRequest', async event => {
        console.debug("joinWalletRequest called!", event);
        const {
          requestId,
          deviceId
        } = event;
        if (deviceId !== options.deviceId) {
          return;
        }
        try {
          joinWalletResolver.onRequestId(requestId);
        } catch (e) {
          console.error("joinWalletRequest error", e);
        }
      }));
      subscriptions.push(eventEmitter.addListener('provisionerFound', async event => {
        console.debug("provisionerFound called!", event);
        const {
          deviceId
        } = event;
        if (deviceId !== options.deviceId) {
          return;
        }
        try {
          var _joinWalletResolver$o;
          (_joinWalletResolver$o = joinWalletResolver.onProvisionerFound) === null || _joinWalletResolver$o === void 0 || _joinWalletResolver$o.call(joinWalletResolver);
        } catch (e) {
          console.error("provisionerFound error", e);
        }
      }));
      try {
        console.log("requestJoinExistingWallet called!");
        return new Set(await _reactNativeNcwSdk.NcwSdk.requestJoinExistingWallet(deviceId));
      } catch (e) {
        console.error("requestJoinExistingWallet error", e);
        throw e;
      } finally {
        subscriptions.forEach(sub => sub.remove());
      }
    },
    approveJoinWalletRequest: async function (requestId) {
      return new Set(await _reactNativeNcwSdk.NcwSdk.approveJoinWalletRequest(deviceId, requestId));
    },
    stopJoinWallet: function () {
      return _reactNativeNcwSdk.NcwSdk.stopJoinWallet(deviceId);
    },
    takeover: async function () {
      const keys = await _reactNativeNcwSdk.NcwSdk.takeover(deviceId);
      return keys;
    },
    exportFullKeys: function (chaincode, cloudKeyShares) {
      console.error(JSON.stringify({
        chaincode,
        cloudKeyShares
      }));
      throw new Error('Function not implemented.');
    },
    deriveAssetKey: function (extendedPrivateKey, coinType, account, change, index) {
      const key = _reactNativeNcwSdk.NcwSdk.deriveAssetKey(deviceId, extendedPrivateKey, {
        coinType,
        account,
        change,
        index
      });
      return key;
    },
    getKeysStatus: async function () {
      const status = await _reactNativeNcwSdk.NcwSdk.getKeysStatus(deviceId);
      return status;
    },
    getPhysicalDeviceId: function () {
      return _reactNativeNcwSdk.NcwSdk.getPhysicalDeviceId();
    }
  };
  return bridge;
}
//# sourceMappingURL=FireblocksNCWFactory.js.map