/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-catch-shadow */
import React, { useEffect } from 'react';

import { useAppStore } from '../AppStore';
// import type { IActionButtonProps } from './ui/ActionButton';
import { Card, type ICardAction } from './ui/Card';
import { randomPassPhrase } from '../services/randomPassPhrase';
import type { TPassphraseLocation } from '../services/ApiService';
import { gdriveBackup, gdriveRecover } from '../services/GoogleDrive';
// import { cloudkitBackup, cloudkitRecover } from "../services/Cloudkit";
// import { useCloudkit } from "./Cloudkit";
import uuid from 'react-native-uuid';
import { Text, View } from 'react-native';
// import Svg, { Path } from 'react-native-svg';

export const BackupAndRecover: React.FC = () => {
  const [err, setErr] = React.useState<string | null>(null);
  const [backupCompleted, setBackupCompleted] = React.useState(false);
  const [recoverCompleted, setRecoverCompleted] = React.useState(false);
  const [isBackupInProgress, setIsBackupInProgress] = React.useState(false);
  const [isRecoverInProgress, setIsRecoverInProgress] = React.useState(false);
  const {
    keysStatus,
    getGoogleDriveCredentials,
    backupKeys,
    recoverKeys,
    getPassphraseInfos,
    getLatestBackup,
    createPassphraseInfo,
    latestBackup,
    passphrases,
    walletId,
  } = useAppStore();

  // const { cloudkit, appleSignedIn } = useCloudkit();
  const appleSignedIn = false;

  useEffect(() => {
    if (!passphrases) {
      getPassphraseInfos();
    }
  }, [getPassphraseInfos, passphrases]);

  useEffect(() => {
    if (!latestBackup) {
      getLatestBackup();
    }
  }, [getLatestBackup, latestBackup, walletId]);

  const recoverGoogleDrive = async (passphraseId: string) => {
    const token = await getGoogleDriveCredentials();
    return gdriveRecover(token, passphraseId);
  };

  const backupGoogleDrive = async (
    passphrase: string,
    passphraseId: string
  ) => {
    const token = await getGoogleDriveCredentials();
    return gdriveBackup(token, passphrase, passphraseId);
  };

  const recoverPassphraseId: (passphraseId: string) => Promise<string> = async (
    passphraseId
  ) => {
    await getPassphraseInfos();

    if (passphrases === null) {
      throw new Error();
    }

    // try to reuse previous
    for (const info of Object.values(passphrases)) {
      if (info.passphraseId === passphraseId) {
        switch (info.location) {
          case 'GoogleDrive': {
            return await recoverGoogleDrive(info.passphraseId);
          }
          case 'iCloud': {
            // if (!cloudkit || !appleSignedIn) {
            //   throw new Error("Sign in with Apple ID required");
            // }

            // return await cloudkitRecover(cloudkit, info.passphraseId);
            throw new Error('Cloudkit not supported');
          }
          default:
            throw new Error(`Unsupported backup location ${info.location}`);
        }
      }
    }

    throw new Error(`Not found backup location, passphraseId ${passphraseId}`);
  };

  const passphraseRecover: (
    location: TPassphraseLocation
  ) => Promise<{ passphrase: string; passphraseId: string }> = async (
    location
  ) => {
    if (passphrases === null) {
      throw new Error();
    }

    // try to reuse previous
    for (const info of Object.values(passphrases)) {
      if (info.location === location) {
        switch (location) {
          case 'GoogleDrive': {
            const passphrase = await recoverGoogleDrive(info.passphraseId);
            return { passphraseId: info.passphraseId, passphrase };
          }
          case 'iCloud': {
            // if (!cloudkit || !appleSignedIn) {
            //   throw new Error("Sign in with Apple ID required");
            // }

            // const passphrase = await cloudkitRecover(cloudkit, info.passphraseId);
            // return { passphraseId: info.passphraseId, passphrase };
            throw new Error('Cloudkit not supported');
          }
          default:
            throw new Error(`Unsupported backup location ${location}`);
        }
      }
    }

    throw new Error(`Not found backup location ${location}`);
  };

  const passphrasePersist: (
    location: TPassphraseLocation
  ) => Promise<{ passphrase: string; passphraseId: string }> = async (
    location
  ) => {
    if (passphrases === null) {
      throw new Error();
    }

    try {
      const recover = await passphraseRecover(location);
      if (recover && recover.passphrase && recover.passphraseId) {
        console.debug('recovered passphrase', location, recover.passphraseId);
        return recover;
      }
    } catch (e) {
      console.warn(
        `failed to load previous passphrase, creating new`,
        e,
        location
      );
    }

    // creating new
    const passphrase = await randomPassPhrase();
    const passphraseId = uuid.v4() as string;

    switch (location) {
      case 'GoogleDrive': {
        await backupGoogleDrive(passphrase, passphraseId);
        await createPassphraseInfo(passphraseId, location);
        return { passphraseId, passphrase };
      }
      case 'iCloud': {
        // if (!cloudkit || !appleSignedIn) {
        //   throw new Error("Apple Sign in required");
        // }
        // await cloudkitBackup(cloudkit, passphrase, passphraseId);
        // await createPassphraseInfo(passphraseId, location);
        // return { passphraseId, passphrase };
        throw new Error('Cloudkit not supported');
      }
      default:
        throw new Error(`Unsupported backup location ${location}`);
    }
  };

  const doBackupKeys = async (
    passphrasePersist: () => Promise<{
      passphrase: string;
      passphraseId: string;
    }>
  ) => {
    setErr(null);
    setIsBackupInProgress(true);
    setBackupCompleted(false);
    setRecoverCompleted(false);
    try {
      const { passphrase, passphraseId } = await passphrasePersist();
      await backupKeys(passphrase, passphraseId);
      setBackupCompleted(true);
      setIsBackupInProgress(false);
    } catch (catchErr: unknown) {
      if (catchErr instanceof Error) {
        console.error(catchErr, catchErr.stack);
        setErr(catchErr.message);
      } else {
        setErr('Unknown Error');
      }
    } finally {
      setIsBackupInProgress(false);
    }
    await getLatestBackup();
  };

  const doRecoverKeys = async (
    passphraseResolver: (passphraseId: string) => Promise<string>
  ) => {
    setErr(null);
    setIsRecoverInProgress(true);
    setRecoverCompleted(false);
    setBackupCompleted(false);
    try {
      await recoverKeys(passphraseResolver);
      setRecoverCompleted(true);
      setIsRecoverInProgress(false);
    } catch (catchErr: unknown) {
      if (catchErr instanceof Error) {
        setErr(catchErr.message);
      } else {
        setErr('Unknown Error');
      }
    } finally {
      setIsRecoverInProgress(false);
    }
  };

  const secP256K1Status = keysStatus?.MPC_ECDSA_SECP256K1?.keyStatus ?? null;
  const ed25519Status = keysStatus?.MPC_EDDSA_ED25519?.keyStatus ?? null;
  const hasReadyAlgo = secP256K1Status === 'READY' || ed25519Status === 'READY';

  const googleBackupAction: ICardAction = {
    label: 'Google Drive Backup',
    action: () => doBackupKeys(() => passphrasePersist('GoogleDrive')),
    isDisabled:
      isRecoverInProgress || isBackupInProgress || hasReadyAlgo === false,
    isInProgress: isBackupInProgress,
  };

  const appleBackupAction: ICardAction = {
    label: 'iCloud Backup',
    action: () => doBackupKeys(() => passphrasePersist('iCloud')),
    isDisabled:
      !appleSignedIn ||
      isRecoverInProgress ||
      isBackupInProgress ||
      hasReadyAlgo === false,
    isInProgress: isBackupInProgress,
  };

  const recoverAction: ICardAction = {
    label: 'Recover',
    action: () => doRecoverKeys(recoverPassphraseId),
    isDisabled: !latestBackup || isRecoverInProgress || isBackupInProgress,
    isInProgress: isRecoverInProgress,
  };

  if (passphrases === null) {
    return;
  }
  return (
    <Card
      title="Backup/Recover"
      actions={[googleBackupAction, appleBackupAction, recoverAction]}
    >
      {/* <div id="sign-in-button"></div>
      <div id="sign-out-button"></div> */}
      {latestBackup && (
        <View>
          <Text>Last known backup</Text>
          <Text>Location: {latestBackup.location}</Text>
          <Text>Created: {new Date(latestBackup.createdAt).toString()}</Text>
        </View>
      )}
      {backupCompleted && (
        <View /*className="mockup-code"*/>
          <Text>Backup completed successfuly!</Text>
        </View>
      )}
      {recoverCompleted && (
        <View /*className="mockup-code"*/>
          <Text>Recover completed successfuly!</Text>
        </View>
      )}
      {err && (
        <View /*className="alert alert-error shadow-lg"*/>
          <View>
            {/* <Svg
              // className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </Svg> */}
            <Text>{err}</Text>
          </View>
        </View>
      )}
    </Card>
  );
};
