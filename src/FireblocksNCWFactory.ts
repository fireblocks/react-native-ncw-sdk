import {
  type EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import {
  ReactNativeNcwSdk,
  type IFireblocksNCWOptions,
  type IFireblocksNCW,
  type IFullKey,
  type IJoinWalletDescriptor,
  type IJoinWalletHandler,
  type IKeyBackupResult,
  type IKeyDescriptor,
  type IPassphraseResolver,
  type ITransactionSignature,
  type TEvent,
  type TMPCAlgorithm,
} from '.';

interface BaseOperationEvent {
  opId: number;
  deviceId: string;
}

interface MapEvent extends BaseOperationEvent {
  map: Record<string, string>;
}

interface KeysEvent extends BaseOperationEvent {
  keys: Array<string>;
}

function registerEvents({
  messagesHandler,
  secureStorageProvider,
  eventsHandler,
  ...opts
}: IFireblocksNCWOptions) {
  const eventEmitter = new NativeEventEmitter(NativeModules.ReactNativeNcwSdk);
  const subscriptions: Array<EmitterSubscription> = [];

  subscriptions.push(
    eventEmitter.addListener('store', async (event: MapEvent) => {
      const { opId, deviceId, map } = event;
      if (deviceId !== opts.deviceId) {
        return;
      }

      console.log('store called!', event);

      const response = Object.fromEntries(
        Object.keys(map).map((k) => [k, false])
      );
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
        console.error('store error', e);
      }

      await ReactNativeNcwSdk.handleResponse({
        opId,
        deviceId,
        data: response,
      });
    })
  );

  subscriptions.push(
    eventEmitter.addListener('load', async (event: KeysEvent) => {
      const { opId, deviceId, keys } = event;
      if (deviceId !== opts.deviceId) {
        return;
      }

      console.log('load called!', event);

      const response = Object.fromEntries<string | null>(
        keys.map((k: string) => [k, null])
      );
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
        console.error('store error', e);
      }
      await ReactNativeNcwSdk.handleResponse({
        opId,
        deviceId,
        data: response,
      });
    })
  );

  subscriptions.push(
    eventEmitter.addListener('contains', async (event: KeysEvent) => {
      const { opId, deviceId, keys } = event;
      if (deviceId !== opts.deviceId) {
        return;
      }

      console.log('contains called!', event);
      try {
        const release = await secureStorageProvider.getAccess();
        try {
          // TODO: consider cotains() method in storage provider interface
          const allKeys = new Set(
            (await secureStorageProvider.getAllKeys()) ?? []
          );
          await ReactNativeNcwSdk.handleResponse({
            opId,
            deviceId,
            data: Object.fromEntries(keys.map((k) => [k, allKeys.has(k)])),
          });
        } finally {
          await release();
        }
      } catch (e) {
        console.error('contains error', e);
        // TODO: handle on JAVA side
        await ReactNativeNcwSdk.handleResponse({ opId, deviceId, data: {} });
      }
    })
  );

  subscriptions.push(
    eventEmitter.addListener('remove', async (event: KeysEvent) => {
      const { opId, deviceId, keys } = event;
      if (deviceId !== opts.deviceId) {
        return;
      }

      console.log('remove called!', event);
      const response = Object.fromEntries(keys.map((k: string) => [k, false]));
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
        console.error('remove error', e);
      }
      await ReactNativeNcwSdk.handleResponse({
        opId,
        deviceId,
        data: response,
      });
    })
  );

  subscriptions.push(
    eventEmitter.addListener('outgoingMessage', async (event) => {
      const { message, opId, deviceId } = event;
      console.debug('outgoingMessage called!', { opId, deviceId });

      if (deviceId !== opts.deviceId) {
        return;
      }

      // TODO: consider not converting to JSON and back to string for performance
      try {
        const response = await messagesHandler.handleOutgoingMessage(message);
        // console.debug(`received response: ${JSON.stringify(response)}`);

        await ReactNativeNcwSdk.handleResponse({
          opId,
          deviceId,
          data: JSON.stringify(response),
        });
      } catch (e) {
        console.error('outgoingMessage error', e);

        if (e instanceof Error) {
          await ReactNativeNcwSdk.handleResponse({
            opId,
            deviceId,
            error: e.message,
          });
        } else if (e instanceof String || typeof e === 'string') {
          await ReactNativeNcwSdk.handleResponse({ opId, deviceId, error: e });
        } else {
          await ReactNativeNcwSdk.handleResponse({
            opId,
            deviceId,
            error: 'unkown error',
          });
        }
      }
    })
  );

  subscriptions.push(
    eventEmitter.addListener('sdk_event', (event: TEvent) => {
      console.debug('sdk_event called!', event);
      eventsHandler?.handleEvent(event);
    })
  );

  return async () => {
    subscriptions.forEach((sub) => sub.remove());
  };
}

export async function FireblocksNCWFactory(
  options: IFireblocksNCWOptions
): Promise<IFireblocksNCW> {
  const { deviceId } = options;

  const dispose = registerEvents(options);
  try {
    await ReactNativeNcwSdk.initialize(deviceId, options.env ?? 'sandbox');
  } catch (e) {
    dispose();
    throw e;
  }

  const bridge: IFireblocksNCW = {
    dispose,

    // ?
    clearAllStorage: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },

    generateMPCKeys: async function (
      algorithms: Set<TMPCAlgorithm>
    ): Promise<Set<IKeyDescriptor>> {
      return new Set(
        await ReactNativeNcwSdk.generateMPCKeys(
          deviceId,
          Array.from(algorithms)
        )
      );
    },

    stopMpcDeviceSetup: function (): Promise<boolean> {
      throw new Error('Function not implemented.');
    },

    signTransaction: async function (
      txId: string
    ): Promise<ITransactionSignature> {
      const status = await ReactNativeNcwSdk.signTransaction(deviceId, txId);

      return {
        txId,
        transactionSignatureStatus: status!,
      };
    },

    stopInProgressSignTransaction: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },

    getInProgressSigningTxId: function (): Promise<string | null> {
      throw new Error('Function not implemented.');
    },

    backupKeys: async function (
      passphrase: string,
      passphraseId: string
    ): Promise<IKeyBackupResult[]> {
      return await ReactNativeNcwSdk.backupKeys(
        deviceId,
        passphrase,
        passphraseId
      );
    },

    recoverKeys: async function (
      passphraseResolver: IPassphraseResolver
    ): Promise<void> {
      const eventEmitter = new NativeEventEmitter(
        NativeModules.ReactNativeNcwSdk
      );
      const subscription = eventEmitter.addListener(
        'resolvePassphrase',
        async (event) => {
          console.debug('resolvePassphrase called!', event);

          const { passphraseId, opId, deviceId } = event;
          if (deviceId !== options.deviceId) {
            return;
          }

          try {
            const response = await passphraseResolver(passphraseId);
            console.debug(`received response: ${JSON.stringify(response)}`);

            await ReactNativeNcwSdk.handleResponse({
              opId,
              deviceId,
              data: response,
            });
          } catch (e) {
            console.error('resolvePassphrase error', e);
            await ReactNativeNcwSdk.handleResponse({
              opId,
              deviceId,
              data: {},
            });
          } finally {
            subscription.remove();
          }
        }
      );

      await ReactNativeNcwSdk.recoverKeys(deviceId);
    },

    requestJoinExistingWallet: async function (
      joinWalletResolver: IJoinWalletHandler
    ): Promise<Set<IKeyDescriptor>> {
      const eventEmitter = new NativeEventEmitter(
        NativeModules.ReactNativeNcwSdk
      );
      const subscriptions = [];

      subscriptions.push(
        eventEmitter.addListener('joinWalletRequest', async (event) => {
          console.debug('joinWalletRequest called!', event);

          const { requestId, deviceId } = event;
          if (deviceId !== options.deviceId) {
            return;
          }

          try {
            joinWalletResolver.onRequestId(requestId);
          } catch (e) {
            console.error('joinWalletRequest error', e);
          }
        })
      );

      subscriptions.push(
        eventEmitter.addListener('provisionerFound', async (event) => {
          console.debug('provisionerFound called!', event);

          const { deviceId } = event;
          if (deviceId !== options.deviceId) {
            return;
          }

          try {
            joinWalletResolver.onProvisionerFound?.();
          } catch (e) {
            console.error('provisionerFound error', e);
          }
        })
      );

      try {
        console.log('requestJoinExistingWallet called!');
        return new Set(
          await ReactNativeNcwSdk.requestJoinExistingWallet(deviceId)
        );
      } catch (e) {
        console.error('requestJoinExistingWallet error', e);
        throw e;
      } finally {
        subscriptions.forEach((sub) => sub.remove());
      }
    },
    approveJoinWalletRequest: async function (
      requestId: string
    ): Promise<Set<IJoinWalletDescriptor>> {
      return new Set(
        await ReactNativeNcwSdk.approveJoinWalletRequest(deviceId, requestId)
      );
    },
    stopJoinWallet: function (): void {
      return ReactNativeNcwSdk.stopJoinWallet(deviceId);
    },
    takeover: async function (): Promise<IFullKey[]> {
      const keys = await ReactNativeNcwSdk.takeover(deviceId);
      return keys;
    },
    exportFullKeys: function (
      chaincode: string,
      cloudKeyShares: Map<string, string[]>
    ): Promise<IFullKey[]> {
      console.error(JSON.stringify({ chaincode, cloudKeyShares }));
      throw new Error('Function not implemented.');
    },
    deriveAssetKey: function (
      extendedPrivateKey: string,
      coinType: number,
      account: number,
      change: number,
      index: number
    ): string {
      const key = ReactNativeNcwSdk.deriveAssetKey(
        deviceId,
        extendedPrivateKey,
        { coinType, account, change, index }
      );
      return key;
    },
    getKeysStatus: async function (): Promise<
      Record<TMPCAlgorithm, IKeyDescriptor>
    > {
      const status = await ReactNativeNcwSdk.getKeysStatus(deviceId);
      return status;
    },
    getPhysicalDeviceId: function (): string {
      return ReactNativeNcwSdk.getPhysicalDeviceId();
    },
  };

  return bridge;
}
