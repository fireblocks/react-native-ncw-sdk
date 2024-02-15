import { Button } from "react-native"
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const DRIVE_APPDATA = "https://www.googleapis.com/auth/drive.appdata";

GoogleSignin.configure({
  webClientId: '127498444203-cpgvmmrd4mu697kgtkjvi4ef0tn01gha.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  // scopes: [DRIVE_APPDATA], // what API you want to access on behalf of the user, default is email and profile
  // offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  // hostedDomain: '', // specifies a hosted domain restriction
  // forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  // accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '127498444203-ovplbl75l57llur20n12lai8gij50594.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
  // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  // profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

export function GoogleSignIn() {
    return (
      <Button
        title="Google Sign-In"
        onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
      />
    );
  }

export async function GoogleRefreshTokens() {
  if (await GoogleSignin.isSignedIn()) {
    const { accessToken } = await GoogleSignin.getTokens();
    await GoogleSignin.clearCachedAccessToken(accessToken);
  }
}

export async function onGoogleSignout() {
  if (await GoogleSignin.isSignedIn()) {
    await GoogleSignin.signOut();
  }
}

export async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
}

export async function getGoogleDriveCredentials() {
    const user = await GoogleSignin.getCurrentUser();
    const scopes = user?.scopes ?? [];

    if (!scopes.includes(DRIVE_APPDATA)) {
      const ret = await GoogleSignin.addScopes({ scopes: [DRIVE_APPDATA] });
    }
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  }