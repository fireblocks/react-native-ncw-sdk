
import React from 'react';

import {
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';

import { useCodeScanner, Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

interface IProps {
    onClose: () => void
    onScanned: (data: string) => void
}

export const QRScanner: React.FC<IProps> = ({ onClose, onScanned }: IProps) => {

    const { hasPermission, requestPermission } = useCameraPermission()
    const device = useCameraDevice('back')

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],

        onCodeScanned: (codes) => {
            console.log(`Scanned ${codes.length} codes!`)
            
            // arbitrary logic, choose first result
            if (codes.length > 0 && codes[0]) {
                const { value } = codes[0];
                if (value) {
                    onScanned(value);
                }
            }
        }
    })

    const bottom = (
        <View>
            <Button title="Cancel" onPress={onClose} />
        </View>
    )

    if (hasPermission) {
        if (device) {
            return (
                <View>
                    <Text>Scan the other wallet's QR request</Text>
                    <View style={{ height: 200 }}>
                        <Camera style={StyleSheet.absoluteFill}
                            codeScanner={codeScanner} device={device} isActive={true} />
                    </View>
                    {bottom}
                </View>
            );
        } else {
            return (
                <View>
                    <Text>Camera not available</Text>
                    {bottom}
                </View>
            );
        }
    } else {
        requestPermission();
        return (
            <View>
                <Text>Requesting permission</Text>
                {bottom}
            </View>
        );
    }
}

