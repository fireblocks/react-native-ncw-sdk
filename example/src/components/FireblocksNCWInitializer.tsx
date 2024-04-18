import React from "react";

import { useAppStore } from "../AppStore";
import { IActionButtonProps } from "./ui/ActionButton";
import { AreYouSureDialog } from "./ui/AreYouSureDialog";
import { Card } from "./ui/Card";
import { ENV_CONFIG } from "../env_config";
import { Text, View } from "react-native";
import Svg from "react-native-svg";

export const FireblocksNCWInitializer: React.FC = () => {
  const {
    automateInitialization,
    fireblocksNCWStatus,
    initFireblocksNCW,
    fireblocksNCWSdkVersion,
    disposeFireblocksNCW,
    clearSDKStorage,
  } = useAppStore();
  const [isAreYouSureDialogOpen, setIsAreYouSureDialogOpen] = React.useState(false);

  const onClearSDKStorageClicked = () => {
    setIsAreYouSureDialogOpen(true);
  };

  const closeAreYouSureDialog = () => {
    setIsAreYouSureDialogOpen(false);
  };

  const onClearSDKStorageApproved = async () => {
    setIsAreYouSureDialogOpen(false);
    localStorage.clear();
    await clearSDKStorage();
    await initFireblocksNCW();
    location.reload();
  };

  // An easy way to auto-initialize
  React.useEffect(() => {
    if (automateInitialization) {
      initFireblocksNCW();
    }
  }, [automateInitialization]);

  // Force dispose on unmount
  React.useEffect(
    () => () => {
      disposeFireblocksNCW();
    },
    [],
  );

  let sdkActions: IActionButtonProps[];

  switch (fireblocksNCWStatus) {
    case "sdk_not_ready":
    case "sdk_initialization_failed":
      sdkActions = [
        {
          action: () => initFireblocksNCW(),
          isDisabled: false,
          label: "Initialize",
        },
      ];
      break;

    case "initializing_sdk":
      sdkActions = [
        {
          isDisabled: true,
          isInProgress: true,
          label: "Creating Fireblocks SDK Instance",
        },
      ];
      break;

    case "sdk_available":
      sdkActions = [
        {
          isDisabled: false,
          label: "Dispose",
          action: disposeFireblocksNCW,
          buttonVariant: "accent",
        },
        {
          isDisabled: false,
          label: "Clear Storage",
          action: onClearSDKStorageClicked,
          buttonVariant: "accent",
        },
      ];
      break;
  }

  return (
    <View>
      <Card
        title={`Fireblocks SDK (${ENV_CONFIG.NCW_SDK_ENV}) - Version ${fireblocksNCWSdkVersion}`}
        actions={sdkActions}
      >
        <View><Text>{fireblocksNCWStatus === "sdk_initialization_failed" && "Initialization Failed"}</Text></View>
      </Card>
      {/* <AreYouSureDialog
        title="Are you sure?"
        isOpen={isAreYouSureDialogOpen}
        onYes={onClearSDKStorageApproved}
        onNo={closeAreYouSureDialog}
      >
        <View> 
          <Svg
            // className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </Svg>
          <Text>Warning: All data will be lost!!</Text>
        </View>
      </AreYouSureDialog> */}
    </View>
  );
};
