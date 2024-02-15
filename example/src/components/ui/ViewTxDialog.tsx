import React from "react";
import { useAppStore } from "../../AppStore";
import { Modal, View, Text, Button } from "react-native";
import { isFinal } from "../TransactionRow";
import { Copyable } from "./Copyable";

interface IProps {
  txId: string|null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewTxDialog: React.FC<IProps> = ({ isOpen, onClose, txId }) => {
  const { signTransaction, cancelTransaction, deviceId, txs } = useAppStore();
  const [inProgress, setInProgress] = React.useState<boolean>(false);

  const onSignTransaction = async () => {
    if (!txId) {
      return;
    }

    setInProgress(true);
    try {
      // setErrorStr(null);
      await signTransaction(txId);
      setInProgress(false);
      onClose();
    } catch (err: unknown) {
      setInProgress(false);
      if (err instanceof Error) {
        // setErrorStr(err.message);
      } else {
        // setErrorStr("Unknown error");
      }
    }
  };

  const onCancelTransaction = async () => {
    if (txId) {
      await cancelTransaction(txId);
      onClose();
    }
  };

  const tx = txs.find(tx => tx.id === txId);

  return (
    <Modal visible={isOpen} onDismiss={onClose}>
      <View>
        <Text>Tx</Text>
        <View>
          <View>
            <Text>Current device id</Text>
            <Text>{deviceId}</Text>
          </View>
          <View>
            <Text>Tx ID:</Text>
            <Copyable value={txId ?? ""}/>
          </View>
          <View>
            <Text>Created at:</Text>
            <Text>{tx?.createdAt ? new Date(tx?.createdAt).toString() : ""}</Text>
          </View>
          <View>
            <Text>Last updated at:</Text>
            <Text>{tx?.lastUpdated ? new Date(tx.lastUpdated).toString() : ""}</Text>
          </View>
          <View>
            <Text>Asset: {tx?.details?.assetId}</Text>
          </View>
          <View>
            <Text>Transaction status: {tx?.status}</Text>
            <View>
              <Button title="Sign" onPress={onSignTransaction} disabled={inProgress || tx?.status !== "PENDING_SIGNATURE"} />
              <Button title="Cancel" onPress={onCancelTransaction} disabled={inProgress || (tx?.status && isFinal(tx?.status)) || tx?.status === "CANCELLING"} />
            </View>
            <View>
              <Button title="Close" onPress={onClose} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
