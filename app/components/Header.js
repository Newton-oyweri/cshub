import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      {/* Light status bar because the header background is black */}
      <StatusBar style="light" /> 
      
      <View style={styles.content}>
        <Text style={styles.headerText}>cshub</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#000000',
    // Ensures the container starts at the top but content respects the notch
    paddingTop: Constants.statusBarHeight, 
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333', // Darker border to match black theme
  },
  content: {
    height: 35, // This is the actual height of the header "bar"
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerText: {
    color: '#FFFFFF', // Changed to white for visibility on black
    fontSize: 20,
    fontWeight: 'bold',
    // Slight adjustment for optical centering on some Android devices
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
});