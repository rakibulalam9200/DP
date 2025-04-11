import React from 'react';
import {Alert, Button, Linking, StyleSheet, Text, View} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const Twitter = () => {
  const openInAppBrowser = async () => {
    const url = 'https://twitter.com/ReactNative';
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
    <View style={styles.container}>
      <Button
        title="Open React Native Website"
        onPress={openInAppBrowser}
        color="#1877f2"
      />
    </View>
  );
};

export default Twitter;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
  },
});
