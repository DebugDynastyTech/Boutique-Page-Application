import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  StatusBar,
  BackHandler,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';

// ── Change this URL any time ──────────────────────────────────
const WEBSITE_URL = 'https://app.boutiquepage.in/login';

// ── Palette ────────────────────────────────────────────────────
const C = {
  bg:        '#0a2a2a',
  gold:      '#C9A84C',
  goldLight: '#F0D080',
  goldDim:   '#9a7a2e',
};

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  webWrap: {
    flex: 1,
    backgroundColor: C.bg,
  },
  web: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Splash ──────────────────────────────────────────────────
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  splashImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // ── Progress bar area ───────────────────────────────────────
  progressArea: {
    position: 'absolute',
    bottom: '18%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressTrack: {
    width: '55%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: C.gold,
  },
  progressGlow: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 20,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.goldLight,
    shadowColor: C.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    marginTop: 14,
    color: '#d4cbb8',
    fontSize: 11,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  credit: {
    position: 'absolute',
    bottom: 30,
    color: C.goldDim,
    fontSize: 10,
    letterSpacing: 5,
    opacity: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // ── Offline / Error ─────────────────────────────────────────
  offlineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: C.bg,
  },
  offlineTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  offlineText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  refreshBtn: {
    borderWidth: 1,
    borderColor: C.gold,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  refreshText: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '500',
  },
});

// ── Main component ─────────────────────────────────────────────
export default function HomeScreen() {
  const { width, height }           = useWindowDimensions();
  const insets                      = useSafeAreaInsets();
  const [splashDone, setSplashDone] = useState(false);
  const webViewRef                  = useRef<any>(null);
  const canGoBack                   = useRef(false);
  const [isConnected, setIsConnected] = useState(true);
  const [hasError, setHasError]       = useState(false);

  // ── Animation refs ───────────────────────────────────────────
  const splashOpacity  = useRef(new Animated.Value(1)).current;
  const imageScale     = useRef(new Animated.Value(1.05)).current;
  const imageOpacity   = useRef(new Animated.Value(0)).current;
  const progressWidth  = useRef(new Animated.Value(0)).current;
  const progressGlow   = useRef(new Animated.Value(0.4)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  // ── Network listener ─────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected ?? false);
    });
    return () => unsubscribe();
  }, []);

  // ── Android back-button handler ──────────────────────────────
  useEffect(() => {
    const onBack = () => {
      if (!splashDone) return true;
      if (canGoBack.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [splashDone]);

  // ── Splash animation sequence ────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1, duration: 800, useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1, duration: 2500,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }).start();
    }, 600);

    Animated.timing(progressWidth, {
      toValue: 1, duration: 2800,
      easing: Easing.inOut(Easing.quad), useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(progressGlow, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(progressGlow, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Hide splash ──────────────────────────────────────────────
  const hideSplash = useCallback(() => {
    Animated.timing(splashOpacity, {
      toValue: 0, duration: 600,
      easing: Easing.in(Easing.quad), useNativeDriver: true,
    }).start(() => setSplashDone(true));
  }, [splashOpacity]);

  const onWebViewLoadEnd = useCallback(() => {
    hideSplash();
  }, [hideSplash]);

  // Fallback: hide splash after 6 s max
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!splashDone) hideSplash();
    }, 6000);
    return () => clearTimeout(timeout);
  }, [splashDone, hideSplash]);

  const onNavigationStateChange = useCallback((state: any) => {
    canGoBack.current = state.canGoBack;
  }, []);

  return (
    // SafeAreaView with edges top+bottom handles notch, status bar,
    // navigation bar, and rounded corners on ALL Android & iOS devices.
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.bg}
        translucent={false}
      />

      <View style={styles.root}>
        {/* ── WebView / Offline screen ──────────────────────── */}
        <View style={styles.webWrap}>
          {!isConnected || hasError ? (
            <View style={styles.offlineContainer}>
              <Text style={styles.offlineTitle}>
                {!isConnected ? 'No Internet Connection' : 'Something went wrong'}
              </Text>
              <Text style={styles.offlineText}>
                {!isConnected
                  ? 'Please connect to the internet and try again.'
                  : 'Unable to load the page. Please try again.'}
              </Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={() => {
                  setHasError(false);
                  webViewRef.current?.reload();
                }}
              >
                <Text style={styles.refreshText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={{ uri: WEBSITE_URL }}
              style={styles.web}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              mixedContentMode="never"
              originWhitelist={['https://*']}
              onNavigationStateChange={onNavigationStateChange}
              onLoadEnd={onWebViewLoadEnd}
              onError={() => {
                setHasError(true);
                if (!splashDone) hideSplash();
              }}
              onHttpError={() => {
                setHasError(true);
                if (!splashDone) hideSplash();
              }}
            />
          )}
        </View>

        {/* ── Splash overlay (covers the entire screen) ─────── */}
        {!splashDone && (
          <Animated.View
            style={[
              styles.splash,
              { opacity: splashOpacity },
            ]}
            pointerEvents={splashDone ? 'none' : 'auto'}
          >
            {/* Full-screen splash image */}
            <Animated.Image
              source={require('../assets/splash.png')}
              style={[
                styles.splashImage,
                { opacity: imageOpacity, transform: [{ scale: imageScale }] },
              ]}
              resizeMode="cover"
            />

            {/* Progress bar */}
            <View style={styles.progressArea}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                >
                  <Animated.View style={[styles.progressGlow, { opacity: progressGlow }]} />
                </Animated.View>
              </View>

              <Animated.Text style={[styles.loadingText, { opacity: loadingOpacity }]}>
                L O A D I N G . . .
              </Animated.Text>
            </View>

            {/* Bottom credit */}
            <Animated.Text style={[styles.credit, { opacity: loadingOpacity }]}>
              Made in India 🇮🇳
            </Animated.Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
