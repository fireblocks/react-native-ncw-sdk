import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import Svg, { Path } from "react-native-svg";
import { Alert } from "react-native";
import { Platform } from "react-native";

function writeToClipboard(value: string) {
  Clipboard.setString(value);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    margin: 5,
    padding: 5,
    color: "black",
    width: 20,
    height: 20,
  },
  text: {
    fontWeight: "500",
    fontSize: 14,
    textAlign: "center",
  },
});

export const Copyable: React.FC<{ value: string }> = ({ value }) => {
  const doCopy = () => {
    writeToClipboard(value);
    if (Platform.OS === 'ios') {
      Alert.alert("Copied to Clipboard", "The text has been copied to your clipboard.");
    }
  };

  const clipboardIcon = (
    <Svg  
      onPress={doCopy}
      style={styles.icon}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
      />
    </Svg>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{value}</Text>
      {clipboardIcon}
    </View>
  );
};
