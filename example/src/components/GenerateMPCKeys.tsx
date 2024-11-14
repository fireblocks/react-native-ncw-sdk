import React from "react";

import { useAppStore } from "../AppStore";
import type { IActionButtonProps } from "./ui/ActionButton";
import { Card } from "./ui/Card";
import { ENV_CONFIG } from "../env_config";
import { Table, Row } from 'react-native-reanimated-table';
import { Text, View } from "react-native";
import { Bar } from 'react-native-progress';
import { QRScanner } from "./QRScanner";

import type { TKeyStatus } from "@fireblocks/react-native-ncw-sdk";

export const GenerateMPCKeys: React.FC = () => {
  const [err, setErr] = React.useState<string | null>(null);
  const [isGenerateInProgress, setIsGenerateInProgress] = React.useState(false);
  const [isStopInProgress, setIsStopInProgress] = React.useState(false);
  const [generateMPCKeysResult, setGenerateMPCKeysResult] = React.useState<string | null>(null);
  const { keysStatus, generateMPCKeys, stopMpcDeviceSetup, approveJoinWallet, stopJoinExistingWallet } = useAppStore();
  const [showScanQr, setShowScanQr] = React.useState(false);

  const doGenerateMPCKeys = async () => {
    setGenerateMPCKeysResult(null);
    setErr(null);
    setIsGenerateInProgress(true);
    try {
      await generateMPCKeys();
      setGenerateMPCKeysResult("Success");
      setIsGenerateInProgress(false);
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
      setIsGenerateInProgress(false);
    }
  };

  const doStopMPCDeviceSetup = async () => {
    setErr(null);
    setIsStopInProgress(true);
    try {
      await stopMpcDeviceSetup();
      setIsStopInProgress(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErr(err.message);
      } else {
        setErr("Unknown Error");
      }
    } finally {
      setIsStopInProgress(false);
    }
  };

  const secP256K1Status = keysStatus?.MPC_ECDSA_SECP256K1?.keyStatus ?? null;
  const ed25519Status = keysStatus?.MPC_EDDSA_ED25519?.keyStatus ?? null;

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
  const ed25519Ready = ed25519Status === "READY";
  const generateAction: IActionButtonProps = {
    label: "Generate MPC Keys",
    action: doGenerateMPCKeys,
    isDisabled: isGenerateInProgress || (secP256K1Ready && ed25519Ready),
    isInProgress: isGenerateInProgress,
  };

  const stopAction: IActionButtonProps = {
    label: "Stop MPC Device Setup",
    action: doStopMPCDeviceSetup,
    isDisabled: isStopInProgress || !isGenerateInProgress,
    isInProgress: isStopInProgress,
  };

  const approveJoinWalletAction: IActionButtonProps = {
    label: "Approve Join Wallet",
    action: () => setShowScanQr(true),
    isDisabled: (isStopInProgress || isGenerateInProgress) && (secP256K1Ready || ed25519Ready),
  };
  const stopApproveWalletAction: IActionButtonProps = {
    label: "Stop Approve Join Wallet",
    action: stopJoinExistingWallet,
  };

  const actions = [generateAction, stopAction, approveJoinWalletAction];
  if (ENV_CONFIG.DEV_MODE) {
    actions.push(stopApproveWalletAction);
  }

  return (
    <Card title="Generate MPC Keys" actions={actions}>
      <View>
        <Table>
          <Row data={[
              "Algorithm",
              "Status",
           ]}/>
          <Row data={[
            "ECDSA SECP256K1",
            secP256K1Status ?? "N/A",
           ]}/>
          <Row data={[
            "EDDSA_ED25519",
            ed25519Status ?? "N/A",
           ]}/>
        </Table>
      </View>
      { secP256K1Status && (
        <View>
          <Bar progress={statusToProgress(secP256K1Status)/100} width={null} />
        </View>
      )}
      <View style={{ height: 10 }} />
      { ed25519Status && (
        <View>
          <Bar progress={statusToProgress(ed25519Status)/100} width={null} />
        </View>
      )}
      { generateMPCKeysResult && (
        <View>
          <Text>Result: {generateMPCKeysResult}</Text>
        </View>
      )}
      { showScanQr && <QRScanner onClose={() => setShowScanQr(false)} onScanned={async (code) => {
         try {
           await approveJoinWallet(code)
           setShowScanQr(false)
         } catch (err: unknown) {
           if (err instanceof Error) {
             setErr(err.message)
           } else {
             setErr("Unknown Error")
           }
         }
      }}/>}
      {err && (
        <View /*className="alert alert-error shadow-lg"*/>
          <View>
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg> */}
            <Text>{err}</Text>
          </View>
        </View>
      )}
    </Card>
  );
};
