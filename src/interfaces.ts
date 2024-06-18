import type {
  IJoinWalletHandler,
  IPassphraseResolver,
  TEnv,
  TEvent,
  TJoinWalletStatus,
  TKeyStatus,
  TKeyTakeoverStatus,
  TLogLevel,
  TMPCAlgorithm,
  TReleaseSecureStorageCallback,
  TTransactionSignatureStatus,
} from './types';

export interface IFireblocksNCW {
  dispose(): Promise<void>;
  clearAllStorage(): Promise<void>;
  generateMPCKeys(algorithms: Set<TMPCAlgorithm>): Promise<Set<IKeyDescriptor>>;
  stopMpcDeviceSetup(): Promise<boolean>;
  signTransaction(txId: string): Promise<ITransactionSignature>;
  stopInProgressSignTransaction(): Promise<void>;
  getInProgressSigningTxId(): Promise<string | null>;
  backupKeys(
    passphrase: string,
    passphraseId: string
  ): Promise<IKeyBackupResult[]>;
  recoverKeys(passphraseResolver: IPassphraseResolver): Promise<void>;
  requestJoinExistingWallet(
    joinWalletResolver: IJoinWalletHandler
  ): Promise<Set<IKeyDescriptor>>;
  approveJoinWalletRequest(
    requestId: string
  ): Promise<Set<IJoinWalletDescriptor>>;
  stopJoinWallet(): void;
  takeover(): Promise<IFullKey[]>;
  exportFullKeys(
    chaincode: string,
    cloudKeyShares: Map<string, string[]>
  ): Promise<IFullKey[]>;
  deriveAssetKey(
    extendedPrivateKey: string,
    coinType: number,
    account: number,
    change: number,
    index: number
  ): string;
  getKeysStatus(): Promise<Record<TMPCAlgorithm, IKeyDescriptor>>;
  getPhysicalDeviceId(): string;
}
export interface ILogger {
  log(level: TLogLevel, message: string, data?: any): void;
}
export interface IFullKey {
  keyId: string;
  algorithm: TMPCAlgorithm;
  privateKey: string;
  publicKey: string;
}

export interface IStorageProvider {
  get(key: string): Promise<string | null>;
  set(key: string, data: string): Promise<void>;
  clear(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

export interface ISecureStorageProvider extends IStorageProvider {
  getAccess(): Promise<TReleaseSecureStorageCallback>;
}

export interface IFireblocksNCWOptions {
  env?: TEnv;
  deviceId: string;
  messagesHandler: IMessagesHandler;
  eventsHandler: IEventsHandler;
  secureStorageProvider: ISecureStorageProvider;
  storageProvider?: IStorageProvider;
  logger?: ILogger;
  logLevel?: TLogLevel;
}

export interface IEventsHandler {
  handleEvent(event: TEvent): void;
}

export interface IMessagesHandler {
  handleOutgoingMessage<T>(message: string): Promise<T>;
}

export interface IKeyDescriptor {
  algorithm: TMPCAlgorithm;
  keyId: string | null;
  keyStatus: TKeyStatus | null;
}
export interface IKeyTakeover {
  algorithm: TMPCAlgorithm | null;
  keyId: string | null;
  keyTakeoverStatus: TKeyTakeoverStatus;
}

export interface IKeyDescriptorChangedEvent {
  type: 'key_descriptor_changed';
  keyDescriptor: IKeyDescriptor;
}

export interface IKeyTakeoverChangedEvent {
  type: 'key_takeover_changed';
  keyTakeover: IKeyTakeover;
}

export interface IJoinWalletDescriptor {
  status: TJoinWalletStatus;
  requestId: string | null;
  algorithm: TMPCAlgorithm | null;
  provisionKeyId: string | null;
}

export interface IJoinWalletEvent {
  type: 'join_wallet_descriptor';
  joinWalletDescriptor: IJoinWalletDescriptor;
}

export interface ITransactionSignature {
  txId: string;
  transactionSignatureStatus: TTransactionSignatureStatus;
}

export interface ITransactionSignatureChangedEvent {
  type: 'transaction_signature_changed';
  transactionSignature: ITransactionSignature;
}

export interface IKeyBackupEvent {
  type: 'keys_backup';
  keysBackup: IKeyBackupResult[];
}

export interface IKeyRecoveryEvent {
  type: 'keys_recovery';
  keyDescriptor: IKeyDescriptor;
}

export interface IKeyBackupResult {
  keyId: string;
  keyBackupStatus: 'SUCCESS' | 'ERROR';
}
