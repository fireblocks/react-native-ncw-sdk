import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { IAuthManager, IUser } from "./IAuthManager";
import { getGoogleDriveCredentials, onGoogleButtonPress, onGoogleSignout } from "./GoogleSignIn";

export class FirebaseAuthManager implements IAuthManager {
  private _loggedUser: FirebaseAuthTypes.User | null = null;

  constructor() {
    this._loggedUser = auth().currentUser;
    auth().onAuthStateChanged((user) => {
      this._loggedUser = user;
    });
  }

  public async getGoogleDriveCredentials() {
    return getGoogleDriveCredentials();
  }

  public async login(provider: "GOOGLE" | "APPLE"): Promise<void> {
    // let authProvider: AuthProvider;
    switch (provider) {
      case "GOOGLE":
        await onGoogleButtonPress();
        break;
      case "APPLE":
        // TODO: @invertase/react-native-apple-authentication
        // break;
      default:
        throw new Error("Unsupported provider");
    }

    // const unsubscribe = this._auth.onAuthStateChanged((user) => {
    //   this._loggedUser = user;
    //   unsubscribe();
    // });

    // const result = await signInWithPopup(this._auth, authProvider);
    // this._loggedUser = result.user;
  }

  public async logout(): Promise<void> {
    await onGoogleSignout();
    return auth().signOut();
  }

  public getAccessToken(): Promise<string> {
    if (!this._loggedUser) {
      throw new Error("User is not logged in");
    }

    return this._loggedUser.getIdToken();
  }

  public get loggedUser(): IUser | null {
    return this._loggedUser;
  }

  public onUserChanged(callback: (user: IUser | null) => void): () => void {
    return auth().onAuthStateChanged(callback);
  }
}
