import { IEncryptedData, IUserData } from '@/types/releases';
import CryptoJS from 'crypto-js';
import nCrypto from 'node:crypto';
import pkg from '../../package.json';

export function encryptData(password: string, data: any): IEncryptedData {
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const derivedKey = createDerivedKey(password, salt);

  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    derivedKey,
  ).toString();

  return {
    salt,
    version: pkg.version,
    encryptedData: ciphertext,
  };
}

export function decryptData(
  password: string,
  data: IEncryptedData,
): IUserData | null {
  try {
    const derivedKey = createDerivedKey(password, data.salt);
    const bytes = CryptoJS.AES.decrypt(data.encryptedData, derivedKey);
    const text = bytes.toString(CryptoJS.enc.Utf8);

    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function createDerivedKey(password: string, salt: string) {
  return nCrypto
    .pbkdf2Sync(password, salt, 10000, 32, 'sha512')
    .toString('hex');
}
