import type { ISecureStorageProvider, TReleaseSecureStorageCallback } from "@fireblocks/react-native-ncw-sdk";
import { MMKV } from 'react-native-mmkv'

export type GetUserPasswordCallback = () => Promise<string>;
/// This secure storage implementations creates an encryption key on-demand based on a user password

export class PasswordEncryptedLocalStorage implements ISecureStorageProvider {
  private mmkv: MMKV|null = null;

  constructor(
    private _getPassword: GetUserPasswordCallback,
  ) {
  }

  public async getAccess(): Promise<TReleaseSecureStorageCallback> {
    const encryptionKey = await this._generateEncryptionKey();
    this.mmkv = new MMKV({ id: "default", encryptionKey });

    return async () => {
      await this._release();
    };
  }

  private async _release(): Promise<void> {
    this.mmkv = null;
  }

  public async get(key: string): Promise<string | null> {
    if (!this.mmkv) {
      throw new Error("Storage locked");
    }

    return this.mmkv.getString(key) ?? null;
  }

  public async set(key: string, data: string): Promise<void> {
    if (!this.mmkv) {
      throw new Error("Storage locked");
    }

    this.mmkv.set(key, data);
  }

  public async getAllKeys(): Promise<string[]> {
    if (!this.mmkv) {
      throw new Error("Storage locked");
    }

    return this.mmkv.getAllKeys();
  }

  public async clear(key: string) {
    if (!this.mmkv) {
      throw new Error("Storage locked");
    } 

    this.mmkv.delete(key);
  }

  private async _generateEncryptionKey(): Promise<string> {
    // TODO: consider hashing?
    let key = await this._getPassword();
    return key;
  }
}
