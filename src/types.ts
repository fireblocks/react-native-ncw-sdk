import type {
  IJoinWalletEvent,
  IKeyBackupEvent,
  IKeyDescriptorChangedEvent,
  IKeyRecoveryEvent,
  IKeyTakeoverChangedEvent,
  ITransactionSignatureChangedEvent,
} from "./interfaces";

type TBaseStatus = "TIMEOUT" | "ERROR";
type TJoinWalletStatusJoiner = TBaseStatus | "JOIN_INITIATED" | "ADD_DEVICE_SETUP_REQUESTED" | "PROVISIONER_FOUND";
type TJoinWalletStatusApprover =
  | TBaseStatus
  | "PROVISION_INITIATED"
  | "PROVISION_ADD_DEVICE_SETUP_REQUESTED"
  | "PROVISION_KEYS_SETUP_STARTED" // joiner started setup
  | "PROVISION_SETUP_STARTED"
  | "PROVISION_SETUP_COMPLETED";

export type TReleaseSecureStorageCallback = () => Promise<void>;

export type TMPCAlgorithm = "MPC_ECDSA_SECP256K1" | "MPC_EDDSA_ED25519";

export type TKeyStatus = TBaseStatus | "INITIATED" | "REQUESTED_SETUP" | "SETUP" | "SETUP_COMPLETE" | "READY";

export type TJoinWalletStatus = TJoinWalletStatusJoiner | TJoinWalletStatusApprover | "STOPPED";

export type TKeyTakeoverStatus = TBaseStatus | "INITIATED" | "CLOUD_SHARES_REQUESTED" | "CLOUD_SHARES_VERIFIED" | "SUCCESS";

export type TTransactionSignatureStatus = TBaseStatus | "PENDING" | "STARTED" | "COMPLETED";

export type TLogLevel = "VERBOSE" | "DEBUG" | "INFO" | "WARN" | "ERROR";

export type TEnv = "sandbox" | "production";

export type TEvent =
  | IKeyDescriptorChangedEvent
  | IKeyTakeoverChangedEvent
  | ITransactionSignatureChangedEvent
  | IKeyBackupEvent
  | IKeyRecoveryEvent
  | IJoinWalletEvent;

export type IPassphraseResolver = (passphraseId: string) => Promise<string>;

export type IJoinWalletHandler = {
  onRequestId: (requestId: string) => void;
  onProvisionerFound?: () => void;
};
