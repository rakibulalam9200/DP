/* eslint-disable react-native/no-inline-styles */
import React from 'react';
// import Facebook from '../components/Facebook';
import {SafeAreaView, StatusBar} from 'react-native';
import Twitter from '../components/Twitter';

const HomeScreen = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        backgroundColor={'light'}
        barStyle={'dark-content'}
        translucent={false}
      />
      {/* <Facebook /> */}
      <Twitter />
    </SafeAreaView>
  );
};

export default HomeScreen;
