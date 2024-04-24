package com.fireblocks.reactnativencwsdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.fireblocks.sdk.Environment
import com.fireblocks.sdk.Fireblocks
import com.fireblocks.sdk.FireblocksOptions
import com.fireblocks.sdk.adddevice.FireblocksJoinWalletHandler
import com.fireblocks.sdk.adddevice.JoinWalletDescriptor
import com.fireblocks.sdk.events.Event
import com.fireblocks.sdk.events.FireblocksEventHandler
import com.fireblocks.sdk.keys.Algorithm
import com.fireblocks.sdk.keys.DerivationParams
import com.fireblocks.sdk.keys.FireblocksKeyStorage
import com.fireblocks.sdk.keys.FullKey
import com.fireblocks.sdk.keys.KeyBackup
import com.fireblocks.sdk.keys.KeyData
import com.fireblocks.sdk.keys.KeyDescriptor
import com.fireblocks.sdk.keys.KeyRecovery
import com.fireblocks.sdk.logger.Level
import com.fireblocks.sdk.messages.FireblocksMessageHandler
import com.fireblocks.sdk.recover.FireblocksPassphraseResolver
import com.fireblocks.sdk.transactions.TransactionSignature
import java.util.Base64
import java.util.concurrent.CompletableFuture


internal class PassphraseResolver(private val resolver: (String) -> String?) :
  FireblocksPassphraseResolver {

  override fun resolve(passphraseId: String, callback: (passphrase: String) -> Unit) {
    // TODO: support error cases
    val passphrase = resolver.invoke(passphraseId)
    callback.invoke(passphrase ?: "")  }
}

internal class JoinWalletHandler(
    requestIdCallback: (String?) -> Unit,
    provisionerFoundCallback: () -> Unit,
) : FireblocksJoinWalletHandler {
    private val requestIdCallback: (String) -> Unit
    private val provisionerFoundCallback: () -> Unit

    init {
        this.requestIdCallback = requestIdCallback
        this.provisionerFoundCallback = provisionerFoundCallback
    }

    override fun onRequestId(requestId: String) {
        requestIdCallback.invoke(requestId)
    }

    override fun onProvisionerFound() {
        provisionerFoundCallback.invoke()
    }
}

class ReactNativeNcwSdkModule internal constructor(context: ReactApplicationContext) :
  ReactNativeNcwSdkSpec(context) {

  override fun getName(): String {
    return NAME
  }

  // // Example method
  // // See https://reactnative.dev/docs/native-modules-android
  // @ReactMethod
  // override fun multiply(a: Double, b: Double, promise: Promise) {
  //   promise.resolve(a * b)
  // }

    private var listenerCount = 0
    private var operationCount = 0
    private val operations: MutableMap<Int, (ReadableMap) -> Unit> = HashMap()

    private fun sendEvent(
      reactContext: ReactContext,
      eventName: String,
      params: Any?
    ) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun sendOperation(
      deviceId: String,
      eventName: String,
      params: WritableMap,
      responseHandler: (ReadableMap) -> Unit
    ) {
      val opId = operationCount++
      params.putInt("opId", opId)
      params.putString("deviceId", deviceId)

      operations[opId] = responseHandler
      sendEvent(reactApplicationContext, eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        Log.d(TAG, "addListener $eventName")
        listenerCount += 1
    }

    @ReactMethod
    fun removeListeners(count: Int) {
      Log.d(TAG, "removeListeners $count")
      listenerCount -= count
    }

    @ReactMethod
    override fun handleResponse(response: ReadableMap, promise: Promise) {
        val opId = response.getInt("opId")
        val cb = operations.remove(opId)
        if (cb != null) {
            cb.invoke(response)
            promise.resolve(null)
        } else {
            promise.reject("Error", "No callback found for operation $opId")
        }
    }

    @ReactMethod
    override fun getPhysicalDeviceId(): String {
      return Fireblocks.getPhysicalDeviceId()
    }

    @ReactMethod
    override fun initialize(deviceId: String, promise: Promise) {
        if (ReactNativeNcwSdkModule.initializedDevices.contains(deviceId)) {
            Log.d(TAG, "Device already initialized: $deviceId")
            promise.resolve(null)
            return
        }
        val options = FireblocksOptions.Builder()
        // TODO: get options from the JS side
        options
            .setEnv(Environment.SANDBOX)
            .setLogLevel(Level.DEBUG)
            .setLogToConsole(true)
        val eventHandler: FireblocksEventHandler = object : FireblocksEventHandler {
            override fun onEvent(event: Event) {
                Log.d(TAG, "Event: $event")
                when (event) {
                   is Event.KeyCreationEvent -> {

                    val keyCreationEvent: Event.KeyCreationEvent = event
                    val keyDescriptor: WritableMap = Arguments.createMap()
                    keyDescriptor.putString("keyId", keyCreationEvent.keyDescriptor!!.keyId)
                    keyDescriptor.putString(
                        "algorithm",
                        keyCreationEvent.keyDescriptor!!.algorithm.toString()
                    )
                    keyDescriptor.putString(
                        "keyStatus",
                        keyCreationEvent.keyDescriptor!!.keyStatus.toString()
                    )
                    val params: WritableMap = Arguments.createMap()
                    params.putString("type", "key_descriptor_changed")
                    params.putMap("keyDescriptor", keyDescriptor)
                    sendEvent(reactApplicationContext, "sdk_event", params)
                }

                  is Event.JoinWalletEvent -> {
                    val joinWalletEvent: Event.JoinWalletEvent = event
                    val joinWalletDescriptor: WritableMap = Arguments.createMap()

                    joinWalletDescriptor.putString("provisionKeyId", joinWalletEvent.joinWalletDescriptor!!.provisionKeyId)
                    joinWalletDescriptor.putString("requestId", joinWalletEvent.joinWalletDescriptor!!.requestId)
                    joinWalletDescriptor.putString(
                      "algorithm",
                      joinWalletEvent.joinWalletDescriptor!!.algorithm.toString()
                    )
                    joinWalletDescriptor.putString(
                      "status",
                      joinWalletEvent.joinWalletDescriptor!!.status.toString()
                    )
                    val params: WritableMap = Arguments.createMap()
                    params.putString("type", "join_wallet_descriptor")
                    params.putMap("joinWalletDescriptor", joinWalletDescriptor)
                    sendEvent(reactApplicationContext, "sdk_event", params)
                  }

                  is Event.KeyBackupEvent -> {
                    val keyBackupEvent: Event.KeyBackupEvent = event
                    val keyBackup: WritableMap = Arguments.createMap()
                    keyBackup.putString("keyId", keyBackupEvent.keyBackup!!.keyId)
                    keyBackup.putString(
                      "keyBackupStatus",
                      keyBackupEvent.keyBackup!!.keyBackupStatus.toString()
                    )
                    val keysBackup = Arguments.createArray()
                    keysBackup.pushMap(keyBackup)

                    val params: WritableMap = Arguments.createMap()
                    params.putString("type", "keys_backup")
                    params.putArray("keysBackup", keysBackup)
                    sendEvent(reactApplicationContext, "sdk_event", params)
                  }

                  is Event.KeyRecoveryEvent -> {
                    val keyRecoveryEvent: Event.KeyRecoveryEvent = event
                    val keyDescriptor: WritableMap = Arguments.createMap()

                    keyDescriptor.putString("keyId", keyRecoveryEvent.keyRecovery!!.keyId)
                    keyDescriptor.putString(
                      "algorithm",
                      keyRecoveryEvent.keyRecovery!!.algorithm.toString()
                    )
                    keyDescriptor.putString(
                      "keyStatus",
                      keyRecoveryEvent.keyRecovery!!.keyRecoveryStatus.toString()
                    )

                    val params: WritableMap = Arguments.createMap()
                    params.putString("type", "keys_recovery")
                    params.putMap("keyDescriptor", keyDescriptor)
                    sendEvent(reactApplicationContext, "sdk_event", params)
                  }

                  is Event.KeyTakeoverEvent -> {
                    val keyTakeoverEvent: Event.KeyTakeoverEvent = event
                    val keyTakeover: WritableMap = Arguments.createMap()

                    keyTakeover.putString("keyId", keyTakeoverEvent.keyTakeover!!.keyId)
                    keyTakeover.putString(
                      "algorithm",
                      keyTakeoverEvent.keyTakeover!!.algorithm.toString()
                    )
                    keyTakeover.putString(
                      "keyTakeoverStatus",
                      keyTakeoverEvent.keyTakeover!!.keyTakeoverStatus.toString()
                    )

                    val params: WritableMap = Arguments.createMap()
                    params.putString("type", "key_takeover_changed")
                    params.putMap("keyTakeover", keyTakeover)
                    sendEvent(reactApplicationContext, "sdk_event", params)
                  }

                  is Event.TransactionSignatureEvent -> {
                    val keyTakeoverEvent: Event.TransactionSignatureEvent = event
                    val transactionSignatureStatus: WritableMap = Arguments.createMap()

                    transactionSignatureStatus.putString("txId", keyTakeoverEvent.transactionSignature!!.txId)
                    transactionSignatureStatus.putString(
                      "transactionSignatureStatus",
                      keyTakeoverEvent.transactionSignature!!.transactionSignatureStatus.toString()
                    )

                    val params: WritableMap = Arguments.createMap()
                    params.putString("type", "transaction_signature_changed")
                    params.putMap("transactionSignature", transactionSignatureStatus)
                    sendEvent(reactApplicationContext, "sdk_event", params)
                  }
                }
            }
        }
        options.setEventHandler(eventHandler)
        val messageHandler: FireblocksMessageHandler = object : FireblocksMessageHandler {
            override fun handleOutgoingMessage(
              payload: String,
              responseCallback: (String?) -> Unit,
              errorCallback: (String?) -> Unit
            ) {
                Log.d(TAG, "Handle Outgoing Message: $payload")
                val params: WritableMap = Arguments.createMap()
                params.putString("message", payload)

                sendOperation(deviceId, "outgoingMessage", params) { response: ReadableMap ->
                  Log.d(TAG, "Handle Outgoing Message Response: $response")

                  if (response.hasKey("error")) {
                    errorCallback.invoke(response.getString("error"))
                  } else if (response.hasKey("data")) {
                    Log.d(
                      TAG,
                      "Handle Outgoing Message has data: " + response.getString("data")!!.length
                    )
                    responseCallback.invoke(response.getString("data"))
                  } else {
                    // errorCallback.invoke("Unknown response");
                  }
              }
            }
        }
        val keyStorage: FireblocksKeyStorage = object : FireblocksKeyStorage {
            override fun store(
              keys: Map<String, ByteArray>,
              callback: (Map<String, Boolean>) -> Unit
            ) {
                val m: WritableMap = Arguments.createMap()
                for ((key, value) in keys) {
                    val encoded = Base64.getEncoder().encodeToString(value)
                    m.putString(key, encoded)
                }
                val params: WritableMap = Arguments.createMap()
                params.putMap("map", m)

            sendOperation(deviceId, "store", params) { response: ReadableMap ->
                    Log.d(TAG, "Store Response: $response")
                    val s: MutableMap<String, Boolean> = HashMap()
                    val data: ReadableMap = response.getMap("data")!!
                    for ((key) in keys) {
                        s[key] = data.getBoolean(key)
                    }
                    callback.invoke(s)
                }
            }

            override fun load(
              keyIds: Set<String>,
              callback: (Map<String, ByteArray>) -> Unit
            ) {
                val params: WritableMap = Arguments.createMap()
                params.putArray(
                    "keys",
                    Arguments.fromArray(keyIds.toTypedArray())
                )

              sendOperation(deviceId, "load", params) { response: ReadableMap ->
                    Log.d(TAG, "Load Response: $response")
                    val data: ReadableMap = response.getMap("data")!!
                    val s: MutableMap<String, ByteArray> = HashMap()
                    for (key in keyIds) {
                        if (!data.hasKey(key) || data.isNull(key)) {
                            continue
                        }
                        val decoded: ByteArray = Base64.getDecoder().decode(data.getString(key))
                        s[key] = decoded
                    }
                    callback.invoke(s)
                }
            }

            override fun remove(
              keyIds: Set<String>,
              callback: (Map<String, Boolean>) -> Unit
            ) {

                val params: WritableMap = Arguments.createMap()
                params.putArray(
                    "keys",
                    Arguments.fromArray(keyIds.toTypedArray())
                )

              sendOperation(deviceId, "remove", params) {  response: ReadableMap ->
                    Log.d(TAG, "Remove Response: $response")
                    val data: ReadableMap = response.getMap("data")!!
                    val s: MutableMap<String, Boolean> = HashMap()
                    for (key in keyIds) {
                        s[key] = data.getBoolean(key)
                    }
                    callback.invoke(s)
                }
            }

            override fun contains(
              keyIds: Set<String>,
              callback: (Map<String, Boolean>) -> Unit
            ) {
                val params: WritableMap = Arguments.createMap()
                params.putArray(
                    "keys",
                    Arguments.fromArray(keyIds.toTypedArray())
                )

              sendOperation(deviceId, "contains", params) {  response: ReadableMap ->
                    Log.d(TAG, "Contains Response: $response")
                    val data: ReadableMap = response.getMap("data")!!
                    val s: MutableMap<String, Boolean> = HashMap()
                    for (key in keyIds) {
                        s[key] = data.getBoolean(key)
                    }
                    callback.invoke(s)
                }
            }
        }
        try {
            Log.d(TAG, "Initializing Fireblocks SDK deviceId: $deviceId")
            Fireblocks.initialize(
                this.reactApplicationContext,
                deviceId,
                messageHandler,
                keyStorage,
                options.build()
            )
            ReactNativeNcwSdkModule.initializedDevices.add(deviceId)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    @ReactMethod
    override fun getKeysStatus(deviceId: String, promise: Promise) {
        try {
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            val status: Set<KeyDescriptor> = instance.getKeysStatus()
            val ret: WritableMap = Arguments.createMap()
            for ((keyId, algorithm, keyStatus) in status) {
                val keyDescriptor: WritableMap = Arguments.createMap()
                keyDescriptor.putString("keyId", keyId)
                keyDescriptor.putString("algorithm", algorithm.toString())
                keyDescriptor.putString("keyStatus", keyStatus.toString())
                ret.putMap(algorithm.toString(), keyDescriptor)
            }
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    @ReactMethod
    override fun generateMPCKeys(deviceId: String, algorithms: ReadableArray, promise: Promise) {
        try {
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            val algorithmSet: MutableSet<Algorithm> = HashSet()
            for (i in 0 until algorithms.size()) {
                algorithmSet.add(Algorithm.valueOf(algorithms.getString(i)))
            }
            instance.generateMPCKeys(algorithmSet) { keyDescriptors: Set<KeyDescriptor> ->
                val ret: WritableArray = Arguments.createArray()
                for ((keyId, algorithm, keyStatus) in keyDescriptors) {
                    val keyDescriptor: WritableMap = Arguments.createMap()
                    keyDescriptor.putString("keyId", keyId)
                    keyDescriptor.putString("algorithm", algorithm.toString())
                    keyDescriptor.putString("keyStatus", keyStatus.toString())
                    ret.pushMap(keyDescriptor)
                }
                promise.resolve(ret)
            }
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    @ReactMethod
    override fun backupKeys(
        deviceId: String,
        passphrase: String,
        passphraseId: String,
        promise: Promise
    ) {
        try {
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            instance.backupKeys(passphrase, passphraseId) { result: Set<KeyBackup> ->
                val ret: WritableArray = Arguments.createArray()
                for (backup in result) {
                    val keyBackup: WritableMap = Arguments.createMap()
                    keyBackup.putString("keyId", backup.keyId)
                    keyBackup.putString("status", backup.keyBackupStatus.toString())
                    ret.pushMap(keyBackup)
                }
                promise.resolve(ret)
            }
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    @ReactMethod
    override fun recoverKeys(deviceId: String, promise: Promise) {
        try {
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            val resolver = PassphraseResolver label@
            { passphraseId: String ->
              Log.d(TAG, "Resolving passphrase: $passphraseId")
              val future = CompletableFuture<String>()
              val params: WritableMap = Arguments.createMap()
              params.putString("passphraseId", passphraseId)

              sendOperation(deviceId, "resolvePassphrase", params) { response: ReadableMap ->
                Log.d(TAG, "Resolve passphrase Response: $response")
                val passphrase: String = response.getString("data")!!
                future.complete(passphrase)
              }

              try {
                return@label future.get()
              } catch (e: Exception) {
                Log.e(
                  TAG,
                  "Error resolving passphrase: " + e.message
                )
                return@label null
              }
            }
          instance.recoverKeys(
                resolver
            ) { result: Set<KeyRecovery> ->
                val ret: WritableArray = Arguments.createArray()
                for (recovery in result) {
                    val keyRecovery: WritableMap = Arguments.createMap()
                    keyRecovery.putString("keyId", recovery.keyId)
                    keyRecovery.putString("status", recovery.keyRecoveryStatus.toString())
                    ret.pushMap(keyRecovery)
                }
                promise.resolve(ret)
            }
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    @ReactMethod
    override fun takeover(deviceId: String, promise: Promise) {
        try {
            Log.d(TAG, "Takeover deviceId: $deviceId")
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            instance.takeover { result: Set<FullKey> ->
                Log.d(TAG, "Takeover result: $result")
                val ret: WritableArray = Arguments.createArray()
                for (key in result) {
                    val fullKey: WritableMap = Arguments.createMap()
                    fullKey.putString("keyId", key.keyId)
                    fullKey.putString("algorithm", key.algorithm.toString())
                    fullKey.putString("privateKey", key.privateKey)
                    fullKey.putString("publicKey", key.publicKey)
                    ret.pushMap(fullKey)
                }
                promise.resolve(ret)
            }
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    @ReactMethod
    override fun requestJoinExistingWallet(deviceId: String, promise: Promise) {
        try {
            val handler = JoinWalletHandler(
                { requestId: String? ->
                    val params: WritableMap = Arguments.createMap()
                    params.putString("deviceId", deviceId)
                    params.putString("requestId", requestId)
                    sendEvent(reactApplicationContext, "joinWalletRequest", params)
                },
                {
                    val params: WritableMap = Arguments.createMap()
                    params.putString("deviceId", deviceId)
                    sendEvent(reactApplicationContext, "provisionerFound", params)
                }
            )
            Log.d(TAG, "Request Join Wallet deviceId: $deviceId")
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            instance.requestJoinExistingWallet(handler) { keys: Set<KeyDescriptor> ->
                val keyDescriptors: WritableArray = Arguments.createArray()
                for ((keyId, algorithm, keyStatus) in keys) {
                    val keyDescriptor: WritableMap = Arguments.createMap()
                    keyDescriptor.putString("keyId", keyId)
                    keyDescriptor.putString("algorithm", algorithm.toString())
                    keyDescriptor.putString("keyStatus", keyStatus.toString())
                    keyDescriptors.pushMap(keyDescriptor)
                }
                promise.resolve(keyDescriptors)
            }
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    @ReactMethod
    override fun stopJoinWallet(deviceId: String) {
        try {
            Log.d(TAG, "Stop Join Wallet deviceId: $deviceId")
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            instance.stopJoinWallet()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping join wallet: " + e.message)
        }
    }

    @ReactMethod
    override fun approveJoinWalletRequest(deviceId: String, requestId: String, promise: Promise) {
        try {
            Log.d(TAG, "Approve Join Wallet Request deviceId: $deviceId")
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            instance.approveJoinWalletRequest(requestId) { keys: Set<JoinWalletDescriptor> ->
                val keyDescriptors: WritableArray = Arguments.createArray()
                for (key in keys) {
                    val keyDescriptor: WritableMap = Arguments.createMap()
                    keyDescriptor.putString("requestId", key.requestId)
                    keyDescriptor.putString("provisionKeyId", key.provisionKeyId)
                    keyDescriptor.putString("algorithm", key.algorithm.toString())
                    keyDescriptor.putString("status", key.status.toString())
                    keyDescriptors.pushMap(keyDescriptor)
                }
                promise.resolve(keyDescriptors)
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("Error", e.message)
            return
        }
    }

    // @Override
    // public void exportFullKeys(String deviceId, String chainCode, ReadableMap cloudKeyShares, Promise promise) {
    //     // TODO: test this
    //     // fun exportFullKeys(chainCode: String, cloudKeyShares: Map<String, Set<String>>, callback: (result: Set<FullKey>)  -> Unit) {
    //         try {
    //             Fireblocks instance = Fireblocks.getInstance(deviceId);
    //             Map<String, Set<String>> cloudKeySharesMap = new HashMap<String, Set<String>>();
    //             ReadableMapKeySetIterator iterator = cloudKeyShares.keySetIterator();
    //             while (iterator.hasNextKey()) {
    //                 String key = iterator.nextKey();
    //                 ReadableArray value = cloudKeyShares.getArray(key);
    //                 Set<String> valueSet = new HashSet<String>();
    //                 for (int i = 0; i < value.size(); i++) {
    //                     valueSet.add(value.getString(i));
    //                 }
    //                 cloudKeySharesMap.put(key, valueSet);
    //             }
    //             instance.exportFullKeys(chainCode, cloudKeySharesMap, (Set<FullKey> result) -> {
    //                 WritableArray ret = Arguments.createArray();
    //                 for (FullKey key : result) {
    //                     WritableMap fullKey = Arguments.createMap();
    //                     fullKey.putString("keyId", key.getKeyId());
    //                     fullKey.putString("algorithm", key.getAlgorithm().toString());
    //                     fullKey.putString("privateKey", key.getPrivateKey());
    //                     fullKey.putString("publicKey", key.getPublicKey());
    //                     ret.pushMap(fullKey);
    //                 }
    //                 promise.resolve(ret);
    //                 return null;
    //             });
    //         } catch (Exception e) {
    //             promise.reject("Error", e.getMessage());
    //             return;
    //         }
    // }

    @ReactMethod
    override fun deriveAssetKey(
        deviceId: String,
        extendedPrivateKey: String,
        bip44DerivationParams: ReadableMap
    ): String? {
        return try {
            Log.d(TAG, "Derive Asset Key deviceId: $deviceId")
            val instance: Fireblocks = Fireblocks.getInstance(deviceId)
            val coinType: Int = bip44DerivationParams.getInt("coinType")
            val account: Int = bip44DerivationParams.getInt("account")
            val change: Int = bip44DerivationParams.getInt("change")
            val index: Int = bip44DerivationParams.getInt("index")
            val params = DerivationParams(coinType, account, change, index)
            val future = CompletableFuture<String?>()
            instance.deriveAssetKey(extendedPrivateKey, params) { (data): KeyData ->
                future.complete(data)
            }
            future.get()
        } catch (e: Exception) {
            null
        }
    }

  @ReactMethod
  override fun signTransaction(deviceId: String, txId: String, promise: Promise) {
      try {
          val instance: Fireblocks = Fireblocks.getInstance(deviceId)
          instance.signTransaction(txId) { signedTx: TransactionSignature ->
              promise.resolve(signedTx.transactionSignatureStatus.toString())
          }
      } catch (e: Exception) {
          promise.reject("Error", e.message)
          return
      }
  }

  @ReactMethod
  override fun getTransactionSignatureStatus(deviceId: String, txId: String, promise: Promise) {
      try {
          val instance: Fireblocks = Fireblocks.getInstance(deviceId)
          val signedTx: TransactionSignature? = instance.getTransactionSignatureStatus(txId)
          promise.resolve(signedTx?.transactionSignatureStatus.toString())
      } catch (e: Exception) {
          promise.reject("Error", e.message)
          return
      }
  }

  companion object {
      private const val TAG = "Fireblocks:NCW"

      const val NAME = "ReactNativeNcwSdk"

      private val initializedDevices: MutableSet<String> = HashSet()
  }
}
