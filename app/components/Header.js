import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

// Skyla Color Palette
const SKYLA_CYAN = '#0DDDF0';
const SKYLA_DARK = '#0F1C38';

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      {/* Light status bar for the dark background */}
      <StatusBar style="light" /> 
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.headerText}>cs</Text>
          <Text style={[styles.headerText, { color: SKYLA_CYAN }]}>hub</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: SKYLA_DARK, // Updated to match app theme
    // Dynamic padding ensures content starts exactly below the status bar/notch
    paddingTop: Constants.statusBarHeight, 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    height: 20, // Slightly taller for a more premium "app-like" feel
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'lowercase',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-condensed',
      },
    }),
  },
});