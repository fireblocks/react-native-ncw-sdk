import React from "react";

import { useAppStore } from "../AppStore";
import type { IActionButtonProps } from "./ui/ActionButton";
import { Card } from "./ui/Card";
import { Copyable } from "./ui/Copyable";
import { ENV_CONFIG } from "../env_config";
import { QRDialog } from "./ui/QRDialog";
import { encode } from "js-base64";
import { Button, Text, View } from "react-native";
import { Row, Table } from "react-native-reanimated-table";
import { Bar } from "react-native-progress";
import Svg, { Path } from "react-native-svg";
import type { TKeyStatus } from "@fireblocks/react-native-ncw-sdk";

export const JoinExistingWallet: React.FC = () => {
  const [err, setErr] = React.useState<string | null>(null);
  const [isJoinInProgress, setIsJoinInProgress] = React.useState(false);
  const [joinExistingWalletResult, setJoinExistingWalletResult] = React.useState<string | null>(null);
  const { keysStatus, joinExistingWallet, addDeviceRequestId, stopJoinExistingWallet, loggedUser } = useAppStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const onOpenModal = () => setIsModalOpen(true);
  const onCloseModal = () => setIsModalOpen(false);

  const doJoinExistingWallet = async () => {
    setJoinExistingWalletResult(null);
    setErr(null);
    setIsJoinInProgress(true);
    try {
      await joinExistingWallet();
      setJoinExistingWalletResult("Success");
      setIsJoinInProgress(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErr(err.message);
      } else {
        if (typeof err === "string") {
          setErr(err);
        } else {
          setErr("Unknown Error");
        }
      }
    } finally {
      setIsJoinInProgress(false);
    }
  };

  const secP256K1Status = keysStatus?.MPC_ECDSA_SECP256K1?.keyStatus ?? null;
  const statusToProgress = (status: TKeyStatus | null) => {
    switch (status) {
      case "INITIATED":
        return 7;
      case "REQUESTED_SETUP":
        return 32;
      case "SETUP":
        return 53;
      case "SETUP_COMPLETE":
        return 72;
      case "READY":
        return 100;
      default:
        return 0;
    }
  };
  const secP256K1Ready = secP256K1Status === "READY";

  const generateAction: IActionButtonProps = {
    label: "Join",
    action: doJoinExistingWallet,
    isDisabled: false,
    isInProgress: isJoinInProgress,
  };

  const stopAction: IActionButtonProps = {
    label: "Stop the process",
    action: stopJoinExistingWallet,
  };

  const actions = [generateAction];

  if (ENV_CONFIG.DEV_MODE && isJoinInProgress) {
    actions.push(stopAction);
  }

  const qrCodeValue = encode(
    `{"email":"${loggedUser?.email ?? "not available"}","platform":"Web","requestId":"${addDeviceRequestId}"}`,
  );

  return (
    <Card title="Join Existing Wallet" actions={actions}>
       <View>
        <Table>
          <Row
            data={[
              "Algorithm",
              "Status",
              "Progress",
            ]}>
          </Row>
          <Row data={[
            "ECDSA SECP256K1",
            secP256K1Status,
            statusToProgress(secP256K1Status),
          ]}>
          </Row>
        </Table>
        <Bar progress={statusToProgress(secP256K1Status)/100} width={null} />
      </View>
      {joinExistingWalletResult && (
        <Text>Result: {joinExistingWalletResult}</Text>
      )}
      {err && (
        <View>
          <Svg
            fill="none"
            viewBox="0 0 24 24"
          >
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </Svg>
          <Text>{err}</Text>
        </View>
      )}
      {addDeviceRequestId && isJoinInProgress && (
        <View>
          <View>
            <Text>Request data to approve:</Text>
            <Copyable value={qrCodeValue} />
          </View>
          <View>
            <Button title="Show QR" onPress={onOpenModal} />
            <QRDialog qrCodeValue={qrCodeValue} isOpen={isModalOpen} onClose={onCloseModal} />
          </View>
        </View>
      )}
    </Card>
  );
};
