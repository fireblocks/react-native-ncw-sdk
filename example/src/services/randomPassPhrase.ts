import { generateSecureRandom } from 'react-native-securerandom';
import b64 from "js-base64";

export async function randomPassPhrase(): Promise<string> {
  const length = 16;

  // TODO: use random from native ncw sdk?
  const bytes = await generateSecureRandom(length);
  const passPhrase = b64.fromUint8Array(bytes)
  return passPhrase;
}
