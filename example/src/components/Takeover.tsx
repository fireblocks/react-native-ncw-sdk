import React from "react";
import { useAppStore } from "../AppStore";
import type { IActionButtonProps } from "./ui/ActionButton";
import { Card } from "./ui/Card";
import { ErrorToast } from "./ui/ErrorToast";
import { DeriveAssetsList } from "./DeriveAssetsList";
import { View } from "react-native";
import type { IFullKey } from "@fireblocks/react-native-ncw-sdk";

export const Takeover: React.FC = () => {
  const { takeover } = useAppStore();
  const [isTakeoverInProgress, setIsTakeoverInProgress] = React.useState(false);
  const [exportedFullKeys, setExportedFullKeys] = React.useState<IFullKey[] | null>(null);
  const [errorStr, setErrorStr] = React.useState<string | null>(null);

  const onTakeoverClicked = async () => {
    try {
      setErrorStr(null);
      setIsTakeoverInProgress(true);
      const result = await takeover();
      setExportedFullKeys(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorStr(err.message);
      } else {
        setErrorStr("Unknown error");
      }
    } finally {
      setIsTakeoverInProgress(false);
    }
  };

  const onClearDataClicked = () => {
    setExportedFullKeys(null);
  };

  const takeoverAction: IActionButtonProps = {
    action: onTakeoverClicked,
    label: "Takeover",
    isDisabled: isTakeoverInProgress,
    isInProgress: isTakeoverInProgress,
  };

  const clearDataAction: IActionButtonProps = {
    action: onClearDataClicked,
    label: "Clear",
    isDisabled: isTakeoverInProgress || !exportedFullKeys,
  };

  return (
    <Card title="Takeover" actions={[takeoverAction, clearDataAction]}>
      {exportedFullKeys && (
        <View>
          {exportedFullKeys.map((key) => {
            return <DeriveAssetsList key={`derived_${key.keyId}`} privateKey={key.privateKey} />;
          })}
        </View>
      )}
      <ErrorToast errorStr={errorStr} />
    </Card>
  );
};
