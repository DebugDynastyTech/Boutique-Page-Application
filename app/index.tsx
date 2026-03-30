import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  StatusBar,
  BackHandler,
  Alert,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { WebView } from 'react-native-webview';
import NetInfo from "@react-native-community/netinfo";

// ── Change this URL any time ──────────────────────────────────
const WEBSITE_URL = 'https://app.boutiquepage.in/login';

// ── Palette ────────────────────────────────────────────────────
const C = {
  bg:        '#0a2a2a',
  gold:      '#C9A84C',
  goldLight: '#F0D080',
  goldDim:   '#9a7a2e',
  cream:     '#c8b080',
};
// ── Dynamic styles function ────────────────────────────────
const createStyles = (width: number, height: number) => 
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    webWrap: { flex: 1, backgroundColor: C.bg },
    web: { flex: 1, backgroundColor: C.bg },

    // ── Splash ──────────────────────────────────────────────────
    splash: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: C.bg,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99,
    },

    splashImage: {
      position: "absolute",
      width: width,
      height: height,
    },

    // ── Progress bar area ───────────────────────────────────────
    progressArea: {
      position: "absolute",
      bottom: height * 0.18,
      alignItems: "center",
      width: "100%",
    },

    progressTrack: {
      width: width * 0.55,
      height: 6,
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      borderRadius: 3,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      borderRadius: 3,
      backgroundColor: C.gold,
    },

    progressGlow: {
      position: "absolute",
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
      color: "#d4cbb8",
      fontSize: 11,
      letterSpacing: 4,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },

    credit: {
      position: "absolute",
      bottom: 30,
      color: C.goldDim,
      fontSize: 10,
      letterSpacing: 5,
      opacity: 0.5,
      fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    },

    offlineContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: C.bg,
    },

    offlineImage: {
      width: 220,
      height: 180,
      marginBottom: 20,
    },

    offlineTitle: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "600",
      marginBottom: 8,
    },

    offlineText: {
      fontSize: 13,
      color: "#aaa",
      textAlign: "center",
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
      fontWeight: "500",
    },
  });
export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const [splashDone, setSplashDone]   = useState(false);
  const webViewRef                    = useRef<any>(null);
  const canGoBack                     = useRef(false);

  // ── Animation refs ───────────────────────────────────────────
  const splashOpacity   = useRef(new Animated.Value(1)).current;
  const imageScale      = useRef(new Animated.Value(1.05)).current;
  const imageOpacity    = useRef(new Animated.Value(0)).current;
  const progressWidth   = useRef(new Animated.Value(0)).current;
  const progressGlow    = useRef(new Animated.Value(0.4)).current;
  const loadingOpacity  = useRef(new Animated.Value(0)).current;
  const [isConnected, setIsConnected] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

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
    // 1. Fade in the splash image with a subtle zoom
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Show loading text after a brief delay
    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 600);

    // 3. Animate the progress bar
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 2800,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // 4. Pulse glow on the progress bar (continues while page loads)
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressGlow, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(progressGlow, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onNavigationStateChange = useCallback((state: any) => {
    canGoBack.current = state.canGoBack;
  }, []);

  // Handle WebView load completion - hide splash when page is fully loaded
  const hideSplash = useCallback(() => {
    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 600,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => setSplashDone(true));
  }, [splashOpacity]);

  const onWebViewLoadEnd = useCallback(() => {
    setPageLoaded(true);
    // Hide splash after page loads (with minimum 2.5s splash display)
    hideSplash();
  }, [hideSplash]);

  // Fallback timeout - hide splash after max 6 seconds regardless of load status
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!splashDone) {
        hideSplash();
      }
    }, 6000);

    return () => clearTimeout(timeout);
  }, [splashDone, hideSplash]);

  // Generate responsive styles based on current dimensions
  const s = createStyles(width, height);

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.bg}
        translucent={false}
      />

      {/* ── WebView — ALWAYS rendered, loads in background ─── */}
      <View style={s.webWrap}>
        {!isConnected || hasError ? (
          <View style={s.offlineContainer}>
            <Text style={s.offlineTitle}>
              {!isConnected
                ? "No Internet Connection"
                : "Something went wrong"}
            </Text>

            <Text style={s.offlineText}>
              {!isConnected
                ? "Please connect to the internet."
                : "Unable to load the page. Please try again."}
            </Text>

            <TouchableOpacity
              style={s.refreshBtn}
              onPress={() => {
                setHasError(false);
                webViewRef.current?.reload();
              }}
            >
              <Text style={s.refreshText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: WEBSITE_URL }}
            style={s.web}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="never"
            originWhitelist={["https://*"]}
            onNavigationStateChange={onNavigationStateChange}
            onLoadEnd={onWebViewLoadEnd}
            onError={(error) => {
              setHasError(true);
              // Still hide splash even on error
              if (!splashDone) {
                hideSplash();
              }
            }}
            onHttpError={(error) => {
              setHasError(true);
              // Still hide splash even on error
              if (!splashDone) {
                hideSplash();
              }
            }}
          />
        )}
      </View>

      {/* ── Splash Screen overlay (rendered on top) ────────── */}
      <Animated.View style={[s.splash, { opacity: splashOpacity, pointerEvents: splashDone ? 'none' : 'auto' }]}>
        {/* Full-screen splash image with subtle zoom effect */}
        <Animated.Image
          source={require("../assets/splash.png")}
          style={[
            s.splashImage,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
          resizeMode="cover"
        />

        {/* Animated progress bar overlay (positioned over the image's loading area) */}
        <View style={s.progressArea}>
          {/* Progress bar track */}
          <View style={s.progressTrack}>
            <Animated.View
              style={[
                s.progressFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              {/* Glow effect on the progress bar */}
              <Animated.View
                style={[s.progressGlow, { opacity: progressGlow }]}
              />
            </Animated.View>
          </View>

          {/* Loading text */}
          <Animated.Text style={[s.loadingText, { opacity: loadingOpacity }]}>
            L O A D I N G . . .
          </Animated.Text>
        </View>

        {/* Bottom credit */}
        <Animated.Text style={[s.credit, { opacity: loadingOpacity }]}>
          Made in India 🇮🇳
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
