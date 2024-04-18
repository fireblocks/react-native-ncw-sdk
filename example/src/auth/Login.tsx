import { Text, View } from "react-native";
import { useAppStore } from "../AppStore";
import { Card, ICardAction } from "../components/ui/Card";
import { ReactFCC } from "../types";

export const Login: ReactFCC = ({ children }) => {
  const { login } = useAppStore();

  const googleCardAction: ICardAction = {
    action: () => login("GOOGLE"),
    label: "Sign In With Google",
  };

  const appleCardAction: ICardAction = {
    action: () => login("APPLE"),
    label: "Sign In With Apple",
  };

  return (
    <Card title="Authentication" actions={[googleCardAction, appleCardAction]}>
      <Text>You must first login to be able to access the demo application</Text>
    </Card>
  );
};
