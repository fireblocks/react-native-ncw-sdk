import React from "react";
import { useAppStore } from "../AppStore";
import { Card } from "./ui/Card";
import { validateGuid } from "./validateGuid";
import { IActionButtonProps } from "./ui/ActionButton";
import { Copyable } from "./ui/Copyable";
import { Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export const AssignDevice: React.FC = () => {
  const {
    walletId,
    deviceId,
    setDeviceId,
    setWalletId,
    askToJoinWalletExisting,
    assignDeviceStatus,
    joinWalletStatus,
    automateInitialization,
    assignCurrentDevice,
    generateNewDeviceId,
    appMode,
  } = useAppStore();

  React.useEffect(() => {
    if (automateInitialization && !walletId) {
      assignCurrentDevice();
    }
  }, [automateInitialization, walletId]);

  React.useEffect(() => {
    if (appMode === "JOIN") {
      generateNewDeviceId();
    }
  }, [appMode]);

  const isValidDeviceId = validateGuid(deviceId);
  const isValidWalletId = validateGuid(walletId);

  const blockActions = React.useMemo(() => {
    if (appMode === "SIGN_IN") {
      return assignDeviceStatus === "started" || assignDeviceStatus === "success";
    } else {
      return joinWalletStatus === "started";
    }
  }, [appMode, assignDeviceStatus, joinWalletStatus]);

  const generateNewDeviceIdAction: IActionButtonProps = {
    action: generateNewDeviceId,
    isDisabled: assignDeviceStatus === "started" || joinWalletStatus === "started",
    label: "Generate new Device ID",
  };

  const assignDeviceAction: IActionButtonProps = {
    action: assignCurrentDevice,
    isDisabled: blockActions || !isValidDeviceId,
    isInProgress: assignDeviceStatus === "started",
    label: "Assign Device",
  };

  const joinWalletAction: IActionButtonProps = {
    action: askToJoinWalletExisting,
    isDisabled: blockActions || !isValidWalletId,
    isInProgress: assignDeviceStatus === "started",
    label: "Join Existing Wallet",
  };

  return (
    <Card
      title="Device ID"
      actions={[generateNewDeviceIdAction, appMode === "SIGN_IN" ? assignDeviceAction : joinWalletAction]}
    >
      <View>
        <Text>Device ID:</Text>
        {
          blockActions ? (
            deviceId ? <Copyable value={deviceId} /> : <View />
          ) : (
            <TextInput
              editable={!blockActions}
              value={deviceId ?? ""}
              onChangeText={(e) => setDeviceId(e)}
              placeholder="Device id"
            />
          )
        }
        {(walletId || appMode === "JOIN") && (
          <View>
            <Text>Wallet ID:</Text>
            {
              blockActions ? (
                walletId ? <Copyable value={walletId} /> : <View />
              ) : (
                <TextInput
                  editable={!(blockActions || appMode === "SIGN_IN")}
                  value={walletId ?? ""}
                  onChangeText={(e) => setWalletId(e)}
                  placeholder="Wallet id"
                />
              )
            }
          </View>
        )}
      </View>
      {assignDeviceStatus === "failed" && (
        <View /*className="alert alert-error shadow-lg"*/>
          <View>
            {/* <Svg
              // xmlns="http://www.w3.org/2000/svg"
              // className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </Svg> */}
            <Text>Unable to assign device</Text>
          </View>
        </View>
      )}
    </Card>
  );
};
