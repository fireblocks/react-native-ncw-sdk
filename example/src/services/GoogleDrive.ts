import { DISCOVERY_DOC } from "../auth/providers";

import {
  GDrive,
  ListQueryBuilder,
  MimeTypes
} from "@robinbobin/react-native-google-drive-api-wrapper";

export const gdriveRecover = async (token: string, passphraseId: string) => {
  const gdrive = new GDrive();
  gdrive.fetchTimeout = 15_000;
  gdrive.accessToken = token;

  try {
    const filename = `passphrase_${passphraseId}.txt`;

    console.debug("gdrive listing...", filename);
    
    const list = await gdrive.files.list({
      spaces: "appDataFolder",
      q: new ListQueryBuilder().e("name", filename),
    });

    console.debug("gdrive list files", list);

    const file = list.files?.find((f: any) => f.name === filename);

    if (file?.id) {
      console.debug("gdrive getting file...", file.id);
      const contents = await gdrive.files.getText(file.id);
      return contents;
    }
  } catch (e) {
    throw e;
  }
};

export const gdriveBackup = async (token: string, passphrase: string, passphraseId: string) => {
  try {
    const gdrive = new GDrive();
    gdrive.fetchTimeout = 15_000;
    gdrive.accessToken = token;

    const filename = `passphrase_${passphraseId}.txt`;
    console.log("gdrive uploading file...", filename);

    const file = await gdrive.files.newMultipartUploader()
    .setRequestBody({
      name: filename,
      parents: ['appDataFolder']
    }).setData(
      passphrase, MimeTypes.TEXT
    ).execute();

    console.log("gdrive uploaded! id", file);
  } catch (e) {
    console.log("gdrive error uploading file", e);
    
    throw e;
  }
};
