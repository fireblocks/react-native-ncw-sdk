import React from "react";
import { Button, Modal, Text, View } from "react-native";
import QRCode from "react-qr-code";

interface IProps {
  qrCodeValue: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRDialog: React.FC<IProps> = ({ isOpen, onClose, qrCodeValue }) => {
  return (
    <Modal visible={isOpen} onDismiss={onClose}>      
      <View>
        <Text>Scan with mobile device</Text>
        <QRCode value={qrCodeValue} style={{ width: "350px", height: "350px" }} />
        <Button title="Close" onPress={onClose}/>
      </View>
    </Modal>
  );
};
