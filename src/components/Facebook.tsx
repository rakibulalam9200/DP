import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {LoginManager, AccessToken, Settings} from 'react-native-fbsdk-next';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/Ionicons';

Settings.initializeSDK();

export default function Facebook() {
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageInfo, setPageInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activeReply, setActiveReply] = useState({
    commentId: null,
    parentId: null,
  });
  const [replyText, setReplyText] = useState('');
  const [loadingComments, setLoadingComments] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});

  const fetchPostsWithComments = async (pageToken, pageId) => {
    try {
      const postsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,comments.limit(10){
            id,
            message,
            from{name,id,picture},
            created_time,
            comments.limit(5){
              id,
              message,
              from{name,id,picture},
              created_time
            }
          }&access_token=${pageToken}
        `,
      );
      const postsData = await postsResponse.json();
      return postsData.data || [];
    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'pages_manage_engagement',
        'pages_read_user_content', // Add any other permissions you need
        'pages_messaging',
        'pages_manage_metadata',
      ]);

      if (result.isCancelled) throw new Error('Login cancelled');

      const {accessToken} = await AccessToken.getCurrentAccessToken();
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?fields=name,picture,access_token&access_token=${accessToken}`,
      );
      const pagesData = await pagesResponse.json();

      if (!pagesData?.data?.length) throw new Error('No pages found');
      console.log(pagesData?.data, 'postdata');

      const firstPage = pagesData.data[2];
      const postsData = await fetchPostsWithComments(
        firstPage.access_token,
        firstPage.id,
      );

      setPageInfo({
        ...firstPage,
        picture: firstPage.picture?.data?.url,
      });
      setPosts(postsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async () => {
    if (!newPostText.trim()) return;

    try {
      setPosting(true);
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageInfo.id}/feed`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            message: newPostText,
            access_token: pageInfo.access_token,
          }),
        },
      );
      if (response.ok) {
        const newPosts = await fetchPostsWithComments(
          pageInfo.access_token,
          pageInfo.id,
        );
        setPosts(newPosts);
        setNewPostText('');
      }
    } catch (error) {
      console.error('Post creation failed:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleNewComment = async postId => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      setLoadingComments(prev => ({...prev, [postId]: true}));
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${postId}/comments`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            message: commentText,
            access_token: pageInfo.access_token,
          }),
        },
      );

      if (response.ok) {
        const newPosts = await fetchPostsWithComments(
          pageInfo.access_token,
          pageInfo.id,
        );
        setPosts(newPosts);
        setNewComment(prev => ({...prev, [postId]: ''}));
      }
    } catch (error) {
      console.error('Comment post failed:', error);
    } finally {
      setLoadingComments(prev => ({...prev, [postId]: false}));
    }
  };

  const handleReply = async parentId => {
    const replyMessage = replyText[parentId]?.trim();
    if (!replyMessage) return;

    try {
      setLoadingReplies(prev => ({...prev, [parentId]: true}));
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${parentId}/comments`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            message: replyMessage,
            access_token: pageInfo.access_token,
          }),
        },
      );

      if (response.ok) {
        const newPosts = await fetchPostsWithComments(
          pageInfo.access_token,
          pageInfo.id,
        );
        setPosts(newPosts);
        setReplyText(prev => ({...prev, [parentId]: ''}));
        setActiveReply({commentId: null, parentId: null});
      }
    } catch (error) {
      console.error('Reply failed:', error);
    } finally {
      setLoadingReplies(prev => ({...prev, [parentId]: false}));
    }
  };

  const copyToClipboard = text => {
    Clipboard.setString(text);
  };

  const renderComments = (comments, depth = 0) => {
    console.log('Rendering comments:', comments);
    return comments.map(comment => {
      // Check if from data exists
      const hasUserData = comment.from && comment.from.id && comment.from.name;
      const userName = hasUserData ? comment.from.name : 'Facebook User';
      const userId = hasUserData ? comment.from.id : null;

      // Default avatar if user data is missing
      const avatarUri = comment?.from?.picture?.data?.url;
      return (
        <View
          key={comment.id}
          style={[styles.commentCard, {marginLeft: depth * 20}]}>
          <Image source={{uri: avatarUri}} style={styles.commentAvatar} />
          <View style={styles.commentContent}>
            <Text style={styles.commentAuthor}>{userName}</Text>
            <View style={styles.commentMessageContainer}>
              <Text style={styles.commentText}>{comment.message}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(comment?.message)}>
                <Icon name="copy" size={16} color="#000000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.commentTime}>
              {new Date(comment.created_time).toLocaleTimeString()}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setActiveReply({
                  commentId: comment.id,
                  parentId: comment.id,
                })
              }>
              <Text style={styles.replyTriggerText}>Reply</Text>
            </TouchableOpacity>

            {activeReply.parentId === comment.id && (
              <View style={styles.replyContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Write a reply..."
                  value={replyText[comment.id] || ''}
                  onChangeText={text =>
                    setReplyText(prev => ({...prev, [comment.id]: text}))
                  }
                  multiline
                />
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => handleReply(comment.id)}
                  disabled={loadingReplies[comment.id]}>
                  {loadingReplies[comment.id] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.replyButtonText}>Post Reply</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {comment.comments?.data?.length > 0 && (
              <View style={styles.nestedComments}>
                {renderComments(comment.comments.data, depth + 1)}
              </View>
            )}
          </View>
        </View>
      );
    });
  };

  const handleLogout = async () => {
    try {
      // Clear Facebook sessions
      await LoginManager.logOut();

      // Reset all application states
      setPageInfo(null);
      setPosts([]);
      setNewPostText('');
      setNewComment({});
      setReplyText({});
      setActiveReply({commentId: null, parentId: null});
      setRefreshing(false);
      setLoading(false);
      setPosting(false);

      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            const newPosts = await fetchPostsWithComments(
              pageInfo.access_token,
              pageInfo.id,
            );
            setPosts(newPosts);
            setRefreshing(false);
          }}
        />
      }>
      {pageInfo ? (
        <>
          <View style={styles.header}>
            <Image source={{uri: pageInfo.picture}} style={styles.pageImage} />
            <View>
              <Text style={styles.pageName}>{pageInfo.name}</Text>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutButton}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.newPostContainer}>
            <TextInput
              style={styles.postInput}
              placeholder="Write a new post..."
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.postButton}
              onPress={handleNewPost}
              disabled={posting}>
              {posting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Publish Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {posts.map(post => (
            <View key={post.id} style={styles.postCard}>
              {post.full_picture && (
                <Image
                  source={{uri: post.full_picture}}
                  style={styles.postImage}
                />
              )}
              <Text style={styles.postText}>{post.message}</Text>
              <Text style={styles.postTime}>
                {new Date(post.created_time).toLocaleString()}
              </Text>

              <View style={styles.commentSection}>
                <Text style={styles.sectionTitle}>Comments</Text>

                <View style={styles.commentsContainer}>
                  {post.comments?.data?.length > 0 ? (
                    renderComments(post.comments.data)
                  ) : (
                    <Text style={styles.noComments}>No comments yet</Text>
                  )}
                </View>

                <View style={styles.newCommentContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write a comment..."
                    value={newComment[post.id] || ''}
                    onChangeText={text =>
                      setNewComment(prev => ({...prev, [post.id]: text}))
                    }
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.commentButton}
                    onPress={() => handleNewComment(post.id)}
                    disabled={loadingComments[post.id]}>
                    {loadingComments[post.id] ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.commentButtonText}>Post</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </>
      ) : (
        <View style={styles.loginContainer}>
          <Button
            title="Connect Facebook Page"
            onPress={handleFacebookLogin}
            color="#1877f2"
          />
          {loading && <ActivityIndicator style={styles.loader} />}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  pageImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  pageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    color: '#1877f2',
    marginTop: 5,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  postText: {
    fontSize: 16,
    marginBottom: 8,
  },
  postTime: {
    color: '#65676b',
    fontSize: 12,
    marginBottom: 15,
  },
  commentSection: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  commentsContainer: {
    marginBottom: 10,
  },
  commentMessageContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 15,
    padding: 10,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
  },
  commentTime: {
    color: '#65676b',
    fontSize: 10,
    marginTop: 4,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 14,
  },
  replyButton: {
    backgroundColor: '#1877f2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  replyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  replyTriggerText: {
    color: '#1877f2',
    fontSize: 12,
    marginTop: 5,
  },
  newCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 14,
  },
  commentButton: {
    backgroundColor: '#1877f2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  commentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  nestedComments: {
    marginTop: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
    paddingLeft: 10,
  },
  noComments: {
    color: '#65676b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  newPostContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  postInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#1877f2',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
