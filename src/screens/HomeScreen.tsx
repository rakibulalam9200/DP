/* eslint-disable react-native/no-inline-styles */
import React from 'react';
// import Facebook from '../components/Facebook';
import {
  Alert,
  Button,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import Twitter from '../components/Twitter';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const HomeScreen = () => {
  const openInAppBrowser = async socialUrl => {
    const url = socialUrl;
    try {
      const isAvailable = await InAppBrowser.isAvailable();
      if (isAvailable) {
        await InAppBrowser.open(url, {
          // Custom UI settings
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: '#6200EE',
          preferredControlTintColor: 'white',
          readerMode: false,
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          navigationBarColor: '#6200EE',
          navigationBarDividerColor: 'white',
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
        });
      } else {
        Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        backgroundColor={'light'}
        barStyle={'dark-content'}
        translucent={false}
      />

      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => openInAppBrowser('https://x.com')}
          style={{
            backgroundColor: 'black',
            padding: 10,
            borderRadius: 5,
            flex: 1,
            flexDirection: 'row',
            height: 40,
            width: '48%',
            marginRight: 5,
            justifyContent: 'center',
          }}>
          <Text
            style={{color: 'white', fontWeight: 'bold', textAlign: 'center'}}>
            TWITTER
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openInAppBrowser('https://www.facebook.com/')}
          style={{
            backgroundColor: 'blue',
            padding: 10,
            borderRadius: 5,
            flex: 1,
            flexDirection: 'row',
            height: 40,
            width: '48%',
            marginLeft: 5,
            justifyContent: 'center',
          }}>
          <Text
            style={{color: 'white', fontWeight: 'bold', textAlign: 'center'}}>
            FACEBOOK
          </Text>
        </TouchableOpacity>
      </View>
      {/* <Facebook /> */}
      {/* <Twitter /> */}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
    flex: 1,
    flexDirection: 'row',
  },
});
