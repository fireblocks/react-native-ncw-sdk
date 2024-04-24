package com.fireblocks.reactnativencwsdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Promise

abstract class ReactNativeNcwSdkSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun handleResponse(response: ReadableMap, promise: Promise)
  abstract fun getPhysicalDeviceId(): String
  abstract fun initialize(deviceId: String, promise: Promise) 
  abstract fun getKeysStatus(deviceId: String, promise: Promise)
  abstract fun generateMPCKeys(deviceId: String, algorithms: ReadableArray, promise: Promise)
  abstract fun backupKeys(
        deviceId: String,
        passphrase: String,
        passphraseId: String,
        promise: Promise
  )
  abstract fun recoverKeys(deviceId: String, promise: Promise) 
  abstract fun takeover(deviceId: String, promise: Promise) 
  abstract fun requestJoinExistingWallet(deviceId: String, promise: Promise) 
  abstract fun stopJoinWallet(deviceId: String)
  abstract fun approveJoinWalletRequest(deviceId: String, requestId: String, promise: Promise)
  abstract fun deriveAssetKey(
      deviceId: String,
      extendedPrivateKey: String,
      bip44DerivationParams: ReadableMap
  ): String?
  abstract fun signTransaction(deviceId: String, txId: String, promise: Promise)
  abstract fun getTransactionSignatureStatus(deviceId: String, txId: String, promise: Promise)
}
