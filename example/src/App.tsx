import React from "react";
// import { useAppStore } from "./AppStore";
// import { Login } from "./auth/Login";
// import { AppContent } from "./components/AppContent";
// import { NavBar } from "./components/ui/NavBar";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, useColorScheme } from "react-native";
import { useAppStore } from "./AppStore";
import { AppContent } from "./components/AppContent";
import { Login } from "./auth/Login";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { NavBar } from "./components/ui/NavBar";

export function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { loggedUser } = useAppStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <AutocompleteDropdownContextProvider>
            <NavBar/>
              {loggedUser ? 
                <ScrollView style={styles.scrollView}>
                  <AppContent />
                </ScrollView> : 
                <Login />
              }
      </AutocompleteDropdownContextProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    marginHorizontal: 10,
  },
  text: {
    fontSize: 42,
  },
});

export default App;
