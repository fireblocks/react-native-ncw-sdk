#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeNcwSdkSpec.h"
@interface RCT_EXTERN_MODULE(ReactNativeNcwSdk, NSObject<NativeReactNativeNcwSdkSpec>)
#else
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReactNativeNcwSdk, NSObject<RCTBridgeModule>)
#endif

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getPhysicalDeviceId)
RCT_EXTERN_METHOD(initialize: (NSString)deviceId withEnv:(NSString)env withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getKeysStatus: (NSString)deviceId withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateMPCKeys: (NSString)deviceId withAlgorithms:(NSArray)algorithms withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(backupKeys: (NSString)deviceId withPassphrase:(NSString)passphrase withPassphraseId:(NSString)passphraseId withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(recoverKeys: (NSString)deviceId withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(takeover: (NSString)deviceId withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(deriveAssetKey: (NSString)deviceId withExtendedPrivateKey:(NSString)extendedPrivateKey withBip44DerivationParams:(NSDictionary)bip44DerivationParams)
RCT_EXTERN_METHOD(signTransaction: (NSString)deviceId withTxId:(NSString)txId withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getURLForLogFiles: (NSString)deviceId withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendLogs: (NSString)deviceId withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(handleResponse: (NSDictionary)response
              withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(requestJoinExistingWallet: (NSString)deviceId
              withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopJoinWallet: (NSString)deviceId)
RCT_EXTERN_METHOD(approveJoinWalletRequest: (NSString)deviceId withRequestId:(NSString)requestId
              withResolve:(RCTPromiseResolveBlock)resolve withReject:(RCTPromiseRejectBlock)reject)

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeReactNativeNcwSdkSpecJSI>(params);
}
#endif

@end
