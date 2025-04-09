import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

const Twitter = () => {
  return (
    <View style={styles.container}>
      <Button
        title="Connect Twitter"
        onPress={() => {
          console.log('Button Pressed');
        }}
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
