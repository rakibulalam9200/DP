import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';

const App = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
        'user_posts',
      ]);

      if (result.isCancelled) {
        Alert.alert('Login cancelled');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        Alert.alert('Something went wrong getting access token');
        return;
      }

      console.log('Access Token:', data.accessToken);

      setAccessToken(data.accessToken.toString());
      fetchUserPosts(data.accessToken.toString());
    } catch (error) {
      console.error('FB Login Error:', error);
    }
  };

 // Fetch posts using Graph API
 const fetchUserPosts = (token) => {
  const request = new GraphRequest(
    '/me/posts?fields=message,created_time,full_picture,permalink_url',
    {
      httpMethod: 'GET',
      parameters: {
        access_token: { string: token },
        limit: { string: '10' }, // Get last 10 posts
      },
    },
    (error, result) => {
      if (error) {
        console.log('Error fetching data: ', error);
      } else {
        setPosts(result.data);
      }
    }
  );
  new GraphRequestManager().addRequest(request).start();
};
  return (
    <View style={styles.container}>
      <Button title="Login with Facebook" onPress={handleFacebookLogin} />

      {loading && <ActivityIndicator size="large" style={{marginTop: 20}} />}

      <ScrollView style={{marginTop: 20}}>
        {posts.map((post, index) => (
          <View key={index} style={styles.post}>
            <Text style={styles.message}>
              {post.message ? post.message : '(No message)'}
            </Text>
            <Text style={styles.date}>
              {new Date(post.created_time).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  post: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
});
