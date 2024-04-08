# react-native-ncw-sdk

Fireblocks NCW SDK bridge for React Native

## Installation

```sh
npm install @fireblocks/react-native-ncw-sdk
```

### iOS additional setup
1. Edit the following line to your app's `Podfile`

```rb
  post_install do |installer|
    $RNNCWSDK.post_install(installer) # <--- add this line
```

2. Install pod dependencies:

```sh
cd example/ios && bundle exec pod install
```


## Usage


```js
import { FireblocksNCWFactory } from "react-native-ncw-sdk";

// ...

const fireblocksNCW = await FireblocksNCWFactory({
    env: "sandbox", // or "prod" etc
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
