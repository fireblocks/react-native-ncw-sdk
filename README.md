# @fireblocks/react-native-ncw-sdk

Fireblocks NCW SDK bridge for React Native

## Installation

```sh
npm install @fireblocks/react-native-ncw-sdk
```

### Android additional setup

Add the Maven repository and SDK dependency to your app as described [here](https://ncw-developers.fireblocks.com/docs/setup-4#android-sdk-installation)

### iOS additional setup
1. Edit the following line to your app's `Podfile`

```rb
  post_install do |installer|
    $RNNCWSDK.post_install(installer) # <--- add this line
```

2. Install pod dependencies:

```sh
cd ios && bundle exec pod install
```
3. Open your project's workspace in Xcode

4. Add Fireblocks SDK Swift Package as described [here](https://ncw-developers.fireblocks.com/docs/setup-4#ios-sdk-installation), or:

File > Add Package Dependecies... > https://github.com/fireblocks/ncw-ios-sdk > Add Package > Add to Target: "Your Project" > Add Package

## Usage


```js
import { FireblocksNCWFactory } from '@fireblocks/react-native-ncw-sdk';

// ...

const fireblocksNCW = await FireblocksNCWFactory({
    env: "sandbox", // or "production" etc
    logLevel: "INFO",
    deviceId,
    messagesHandler,
    eventsHandler,
    secureStorageProvider,
});
```

## Example
[Example Project](example)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
