// TwitterAuth.js
import InAppBrowser from 'react-native-inappbrowser-reborn';
// import { Linking } from 'react-native';
import {generateCodeVerifier, generateCodeChallenge} from './utils';

const clientId = 'VDItVWUtZHJ6WEo1RWFBV1p6THM6MTpjaQ';
const redirectUri = 'diplomatresponse://oauth';

export const loginWithTwitter = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=tweet.read%20users.read&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.openAuth(authUrl, redirectUri, {
        dismissButtonStyle: 'cancel',
        showTitle: false,
        enableUrlBarHiding: true,
      });

      if (result.type === 'success') {
        const url = result.url;
        const params = new URLSearchParams(url.split('?')[1]);
        const code = params.get('code');
        const token = await exchangeCodeForToken(code, codeVerifier);
        return token;
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
  }
};

const exchangeCodeForToken = async (code, codeVerifier) => {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }).toString(),
  });
  return response.json();
};
