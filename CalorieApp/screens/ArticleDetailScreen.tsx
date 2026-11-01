import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { useTheme } from '../components/ThemeContext';

interface Props {
  url: string;
  title: string;
  onGoBack: () => void;
  type?: 'article' | 'video';
  videoId?: string;
  source?: string;
}

export default function ArticleDetailScreen({
  url,
  title,
  onGoBack,
  type = 'article',
  videoId,
  source,
}: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const contentUrl = useMemo(() => {
    if (type === 'video' && videoId) {
      return (
        'https://www.youtube-nocookie.com/embed/' +
        encodeURIComponent(videoId) +
        '?playsinline=1&rel=0&modestbranding=1'
      );
    }

    return url;
  }, [type, url, videoId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onGoBack}
          style={[
            styles.backButton,
            { backgroundColor: colors.primaryLight },
          ]}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {type === 'video' ? 'Watch in Alviva' : 'Read in Alviva'}
          </Text>

          <Text
            style={[styles.subtitle, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {source || title}
          </Text>
        </View>
      </View>

      <View style={styles.webWrap}>
        {failed ? (
          <View style={styles.errorWrap}>
            <Ionicons
              name="cloud-offline-outline"
              size={42}
              color={colors.textMuted}
            />
            <Text style={[styles.errorTitle, { color: colors.text }]}>
              Content could not be loaded
            </Text>
            <Text style={[styles.errorText, { color: colors.textMuted }]}>
              Check your internet connection and try again.
            </Text>

            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                setFailed(false);
                setLoading(true);
              }}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              key={failed ? 'failed' : contentUrl}
              source={{ uri: contentUrl }}
              style={styles.webView}
              originWhitelist={['https://*', 'http://*']}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
              setSupportMultipleWindows={false}
              onLoadStart={() => {
                setLoading(true);
                setFailed(false);
              }}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setFailed(true);
              }}
              onHttpError={() => {
                setLoading(false);
                setFailed(true);
              }}
            />

            {loading && (
              <View
                style={[
                  styles.loadingOverlay,
                  { backgroundColor: colors.background },
                ]}
              >
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.loadingText,
                    { color: colors.textMuted },
                  ]}
                >
                  {type === 'video'
                    ? 'Loading video...'
                    : 'Loading article...'}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 15, fontWeight: '900' },
  subtitle: { fontSize: 11, marginTop: 2 },
  webWrap: { flex: 1 },
  webView: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: { fontSize: 13, fontWeight: '600' },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 18,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '900' },
});
