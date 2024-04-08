import type { TurboModule } from 'react-native';
import type { IFullKey, IJoinWalletDescriptor, IKeyBackupResult, IKeyDescriptor } from "./interfaces";
import type { TMPCAlgorithm, TTransactionSignatureStatus } from './types';
export interface Response {
    opId: number;
    data: Object;
    deviceId: string;
}
export interface Spec extends TurboModule {
    handleResponse(response: Response): Promise<void>;
    getPhysicalDeviceId(): string;
    initialize(deviceId: string): Promise<void>;
    generateMPCKeys(deviceId: string, algorithms: TMPCAlgorithm[]): Promise<IKeyDescriptor[]>;
    getKeysStatus(deviceId: string): Promise<Record<TMPCAlgorithm, IKeyDescriptor>>;
    backupKeys(deviceId: string, passphrase: string, passphraseId: string): Promise<Array<IKeyBackupResult>>;
    requestJoinExistingWallet(deviceId: string): Promise<Array<IKeyDescriptor>>;
    approveJoinWalletRequest(deviceId: string, requestId: string): Promise<Array<IJoinWalletDescriptor>>;
    stopJoinWallet(deviceId: string): void;
    recoverKeys(deviceId: string): Promise<void>;
    takeover(deviceId: string): Promise<Array<IFullKey>>;
    deriveAssetKey(deviceId: string, extendedPrivateKey: string, bip44DerivationParams: {
        coinType: number;
        account: number;
        change: number;
        index: number;
    }): string;
    signTransaction(deviceId: string, txId: string): Promise<TTransactionSignatureStatus>;
    getTransactionSignatureStatus(deviceId: string, txId: string): Promise<TTransactionSignatureStatus>;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeNcwSdk.d.ts.map