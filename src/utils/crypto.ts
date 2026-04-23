const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type ProjectKeyInput = CryptoKey | ArrayBuffer | Uint8Array | string;

const RSA_ALGORITHM: RsaHashedKeyGenParams = {
  name: "RSA-OAEP",
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const AES_ALGORITHM = "AES-GCM";
const AES_KEY_LENGTH = 256;
const AES_IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100_000;

export const bufferToBase64 = (value: ArrayBuffer | Uint8Array): string => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

export const base64ToUint8Array = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

export const bytesToHex = (value: ArrayBuffer | Uint8Array): string => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const hexToUint8Array = (value: string): Uint8Array => {
  if (value.length % 2 !== 0) {
    throw new Error("Invalid hex input.");
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
};

const normalizePem = (value: string): string =>
  value.replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");

const chunkPem = (value: string): string => value.match(/.{1,64}/g)?.join("\n") ?? value;

const toArrayBuffer = (value: Uint8Array): ArrayBuffer =>
  value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;

const ensureProjectKeyBytes = async (value: ProjectKeyInput): Promise<Uint8Array> => {
  if (value instanceof CryptoKey) {
    return new Uint8Array(await crypto.subtle.exportKey("raw", value));
  }
  if (typeof value === "string") {
    return base64ToUint8Array(value);
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  return new Uint8Array(value);
};

export const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    toArrayBuffer(textEncoder.encode(value)),
  );
  return bytesToHex(digest);
};

export const derivePasswordKey = async (
  email: string,
  password: string,
): Promise<CryptoKey> => {
  const passwordMaterial = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(textEncoder.encode(password)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      salt: toArrayBuffer(textEncoder.encode(email.trim().toLowerCase())),
    },
    passwordMaterial,
    {
      name: AES_ALGORITHM,
      length: AES_KEY_LENGTH,
    },
    false,
    ["encrypt", "decrypt"],
  );
};

export const generateRsaKeyPair = async (): Promise<CryptoKeyPair> =>
  crypto.subtle.generateKey(RSA_ALGORITHM, true, ["encrypt", "decrypt"]);

export const exportPublicKeyToPem = async (publicKey: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey("spki", publicKey);
  const body = chunkPem(bufferToBase64(exported));
  return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
};

export const importPublicKeyFromPem = async (value: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "spki",
    toArrayBuffer(base64ToUint8Array(normalizePem(value))),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );

export const exportPrivateKeyToBase64 = async (privateKey: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
  return bufferToBase64(exported);
};

export const importPrivateKeyFromBase64 = async (value: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "pkcs8",
    toArrayBuffer(base64ToUint8Array(value)),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  );

export const encryptPrivateKey = async (
  privateKeyBase64: string,
  passwordKey: CryptoKey,
): Promise<{ encryptedPrivateKey: string; privateKeyIV: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: toArrayBuffer(iv) },
    passwordKey,
    toArrayBuffer(base64ToUint8Array(privateKeyBase64)),
  );

  return {
    encryptedPrivateKey: bufferToBase64(ciphertext),
    privateKeyIV: bytesToHex(iv),
  };
};

export const decryptPrivateKey = async (
  encryptedPrivateKey: string,
  privateKeyIV: string,
  passwordKey: CryptoKey,
): Promise<string> => {
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: AES_ALGORITHM, iv: toArrayBuffer(hexToUint8Array(privateKeyIV)) },
      passwordKey,
      toArrayBuffer(base64ToUint8Array(encryptedPrivateKey)),
    );
    return bufferToBase64(plaintext);
  } catch {
    throw new Error("Invalid password");
  }
};

export const generateProjectKey = async (): Promise<CryptoKey> =>
  crypto.subtle.generateKey(
    {
      name: AES_ALGORITHM,
      length: AES_KEY_LENGTH,
    },
    true,
    ["encrypt", "decrypt"],
  );

export const exportProjectKeyToBase64 = async (projectKey: CryptoKey): Promise<string> =>
  bufferToBase64(await crypto.subtle.exportKey("raw", projectKey));

export const importProjectKeyFromBase64 = async (projectKeyBase64: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "raw",
    toArrayBuffer(base64ToUint8Array(projectKeyBase64)),
    {
      name: AES_ALGORITHM,
      length: AES_KEY_LENGTH,
    },
    true,
    ["encrypt", "decrypt"],
  );

export const encryptProjectKeyForPublicKey = async (
  projectKey: ProjectKeyInput,
  publicKey: CryptoKey,
): Promise<string> => {
  const plaintext = await ensureProjectKeyBytes(projectKey);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    toArrayBuffer(plaintext),
  );
  return bufferToBase64(ciphertext);
};

export const decryptProjectKeyWithPrivateKey = async (
  encryptedProjectKey: string,
  privateKey: CryptoKey,
): Promise<string> => {
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      toArrayBuffer(base64ToUint8Array(encryptedProjectKey)),
    );
    return bufferToBase64(plaintext);
  } catch {
    throw new Error("Unable to decrypt the project key");
  }
};

export const encryptSecretValue = async (
  value: string,
  projectKey: ProjectKeyInput,
): Promise<{ encryptedValue: string; iv: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));
  const key = await (
    projectKey instanceof CryptoKey
      ? Promise.resolve(projectKey)
      : importProjectKeyFromBase64(
          typeof projectKey === "string"
            ? projectKey
            : bufferToBase64(await ensureProjectKeyBytes(projectKey)),
        )
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(textEncoder.encode(value)),
  );

  return {
    encryptedValue: bufferToBase64(ciphertext),
    iv: bytesToHex(iv),
  };
};

export const decryptSecretValue = async (
  encryptedValue: string,
  ivHex: string,
  projectKey: ProjectKeyInput,
): Promise<string> => {
  const key = await (
    projectKey instanceof CryptoKey
      ? Promise.resolve(projectKey)
      : importProjectKeyFromBase64(
          typeof projectKey === "string"
            ? projectKey
            : bufferToBase64(await ensureProjectKeyBytes(projectKey)),
        )
  );

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: AES_ALGORITHM, iv: toArrayBuffer(hexToUint8Array(ivHex)) },
      key,
      toArrayBuffer(base64ToUint8Array(encryptedValue)),
    );
    return textDecoder.decode(plaintext);
  } catch {
    throw new Error("Corrupted ciphertext");
  }
};
