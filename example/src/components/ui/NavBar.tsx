import React from "react";
import { useAppStore } from "../../AppStore";
import { View, Text, Button  } from "react-native";

export const NavBar: React.FC = () => {
  const { loggedUser, logout } = useAppStore();

  let userElement: JSX.Element | null = null;
  if (loggedUser) {
    const initials =
      loggedUser.displayName
        ?.split(" ")
        .map((n) => n[0])
        .join("") ?? "";
    userElement = (
      <View style={{ flexDirection: "row", marginHorizontal: 10 }}>
        <Text style={{ flex: 1 }} >{loggedUser.displayName}</Text>
        <Text style={{ flex: 1 }}>{loggedUser.email}</Text>
        {/* <Text style={{ flex: 1 }}>{initials}</Text> */}
        <View style={{ flex: 1 }}>
          <Button title="Logout" onPress={logout}></Button>
        </View>
      </View>
    );
    ;
  }
  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: "500" }}>Fireblocks NCW Example</Text>
      {userElement}
    </View>
  );
};
