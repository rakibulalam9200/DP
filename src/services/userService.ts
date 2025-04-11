export const fetchUserProfile = async accessToken => {
  const response = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
};
