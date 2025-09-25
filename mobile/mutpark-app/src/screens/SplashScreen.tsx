import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useAppDispatch } from '@/hooks/redux';
import { setInitialized, setHasSeenOnboarding } from '@/store/slices/appSlice';
import { setUser } from '@/store/slices/authSlice';
import { loadBookmarks } from '@/store/slices/bookmarksSlice';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const dispatch = useAppDispatch();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user has seen onboarding
      const hasSeenOnboarding = await SecureStore.getItemAsync('hasSeenOnboarding');
      if (hasSeenOnboarding) {
        dispatch(setHasSeenOnboarding(true));
      }

      // Check for stored user session
      const userToken = await SecureStore.getItemAsync('userToken');
      const userData = await SecureStore.getItemAsync('userData');

      if (userToken && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch(setUser(user));
        } catch (error) {
          console.error('Failed to parse user data:', error);
          // Clear corrupted data
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userData');
        }
      }

      // Load offline bookmarks
      dispatch(loadBookmarks());

      // Simulate minimum splash time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      dispatch(setInitialized(true));
    } catch (error) {
      console.error('App initialization failed:', error);
      dispatch(setInitialized(true));
    }
  };

  return (
    <LinearGradient
      colors={['#dc2626', '#b91c1c', '#991b1b']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.brandText}>MutPark</Text>
          <Text style={styles.taglineText}>터키에서 만나는 한국의 맛</Text>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Korean pattern decoration */}
        <View style={styles.patternContainer}>
          <View style={[styles.patternElement, styles.pattern1]} />
          <View style={[styles.patternElement, styles.pattern2]} />
          <View style={[styles.patternElement, styles.pattern3]} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taglineText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  patternElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  pattern1: {
    width: 100,
    height: 100,
    top: height * 0.1,
    left: width * 0.1,
    transform: [{ rotate: '45deg' }],
  },
  pattern2: {
    width: 80,
    height: 80,
    top: height * 0.2,
    right: width * 0.1,
    transform: [{ rotate: '30deg' }],
  },
  pattern3: {
    width: 60,
    height: 60,
    bottom: height * 0.2,
    left: width * 0.2,
    transform: [{ rotate: '60deg' }],
  },
});