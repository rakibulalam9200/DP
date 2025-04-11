// utils.js
import CryptoJS from 'crypto-js';

export const generateCodeVerifier = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(byte => chars[byte % chars.length])
    .join('');
};

export const generateCodeChallenge = codeVerifier => {
  const digest = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
