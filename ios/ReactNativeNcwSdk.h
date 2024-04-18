
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeNcwSdkSpec.h"

@interface ReactNativeNcwSdk : NSObject <NativeReactNativeNcwSdkSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ReactNativeNcwSdk : NSObject <RCTBridgeModule>
#endif

@end
