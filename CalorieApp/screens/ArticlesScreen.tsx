
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';

import { API_URL } from '../constants/api';

const { width } = Dimensions.get('window');

type Category =
  | 'For You'
  | 'Nutrition'
  | 'Fitness'
  | 'Weight Loss'
  | 'Mental Health';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
  category: string;
  readTime: string;
}

interface Video {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  thumb: string;
  url: string;
  category: string;
}

const COLORS = {
  primary: '#6C63FF',
  primaryDark: '#554CE6',
  primarySoft: '#F0EEFF',

  background: '#F7F8FC',
  surface: '#FFFFFF',

  text: '#17171C',
  secondary: '#70717B',
  muted: '#A4A5AE',

  border: '#ECECF2',

  green: '#188B5B',
  greenSoft: '#EAF8F1',

  orange: '#E78A3B',
  orangeSoft: '#FFF3E7',

  pink: '#D84D76',
  pinkSoft: '#FCECF2',

  blue: '#3978D7',
  blueSoft: '#EDF4FF',
};

const CATEGORIES: Category[] = [
  'For You',
  'Nutrition',
  'Fitness',
  'Weight Loss',
  'Mental Health',
];

const TOPICS = [
  {
    label: 'High Protein',
    icon: '💪',
    color: COLORS.primary,
    bg: COLORS.primarySoft,
  },
  {
    label: 'Weight Loss',
    icon: '🔥',
    color: COLORS.orange,
    bg: COLORS.orangeSoft,
  },
  {
    label: 'Gut Health',
    icon: '🌿',
    color: COLORS.green,
    bg: COLORS.greenSoft,
  },
  {
    label: 'Immunity',
    icon: '🛡',
    color: COLORS.blue,
    bg: COLORS.blueSoft,
  },
  {
    label: 'Mental Wellness',
    icon: '🧠',
    color: COLORS.pink,
    bg: COLORS.pinkSoft,
  },
];

const CAT_COLORS: Record<
  string,
  { text: string; bg: string }
> = {
  Nutrition: {
    text: COLORS.green,
    bg: COLORS.greenSoft,
  },
  Fitness: {
    text: COLORS.primary,
    bg: COLORS.primarySoft,
  },
  Wellness: {
    text: COLORS.orange,
    bg: COLORS.orangeSoft,
  },
  Health: {
    text: COLORS.pink,
    bg: COLORS.pinkSoft,
  },
  'Weight Loss': {
    text: COLORS.orange,
    bg: COLORS.orangeSoft,
  },
  'Mental Health': {
    text: '#9B59B6',
    bg: '#F3EAFB',
  },
};

const getCat = (cat: string) =>
  CAT_COLORS[cat] ?? {
    text: COLORS.primary,
    bg: COLORS.primarySoft,
  };

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();

  const hours = Math.floor(diff / 3600000);

  if (hours < 1) return 'Just now';

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) return 'Yesterday';

  return `${days}d ago`;
};

export default function ArticlesScreen() {
  const [activeTab, setActiveTab] =
    useState<Category>('For You');

  const [search, setSearch] = useState('');

  const [articles, setArticles] =
    useState<NewsArticle[]>([]);

  const [videos, setVideos] =
    useState<Video[]>([]);

  const [loadingArticles, setLoadingArticles] =
    useState(false);

  const [loadingVideos, setLoadingVideos] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [contentTab, setContentTab] =
    useState<'articles' | 'videos'>('articles');

  const fetchArticles = async (
    category: string,
    query?: string
  ) => {
    setLoadingArticles(true);

    try {
      let url =
        `${API_URL}/api/articles/news?category=` +
        encodeURIComponent(category);

      if (query) {
        url += `&search=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setArticles(data.data);
      }
    } catch (err) {
      console.log('Articles fetch error:', err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchVideos = async (category: string) => {
    setLoadingVideos(true);

    try {
      const res = await fetch(
        `${API_URL}/api/articles/videos?category=${encodeURIComponent(
          category
        )}`
      );

      const data = await res.json();

      if (data.success) {
        setVideos(data.data);
      }
    } catch (err) {
      console.log('Videos fetch error:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchArticles(activeTab);
    fetchVideos(activeTab);
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchArticles(activeTab, search),
      fetchVideos(activeTab),
    ]);

    setRefreshing(false);
  };

  const handleTopic = (topic: string) => {
    setSearch(topic);
    setContentTab('articles');
    fetchArticles(activeTab, topic);
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            YOUR HEALTH GUIDE
          </Text>

          <Text style={styles.headerTitle}>
            Alviva Health Hub
          </Text>
          <Text style={styles.headerSub}>
            Your daily health & wellness guide.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>♡</Text>
        </View>
      </View>

      {/* ================= SEARCH ================= */}

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search health topics"
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => {
              if (search.trim()) {
                fetchArticles(activeTab, search.trim());
              }
            }}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearch('');
                fetchArticles(activeTab);
              }}
            >
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ================= CATEGORY TABS ================= */}

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((category) => {
            const active = activeTab === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  setActiveTab(category);
                  setSearch('');
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= MAIN CONTENT ================= */}

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ================= CONTENT SWITCH ================= */}

        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              contentTab === 'articles' &&
              styles.segmentButtonActive,
            ]}
            onPress={() => setContentTab('articles')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                contentTab === 'articles' &&
                styles.segmentTextActive,
              ]}
            >
              Articles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              contentTab === 'videos' &&
              styles.segmentButtonActive,
            ]}
            onPress={() => setContentTab('videos')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                contentTab === 'videos' &&
                styles.segmentTextActive,
              ]}
            >
              Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= ARTICLES ================= */}

        {contentTab === 'articles' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Latest for you
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Curated health & wellness insights
                </Text>
              </View>
            </View>

            {loadingArticles ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />

                <Text style={styles.loadingText}>
                  Finding the latest articles...
                </Text>
              </View>
            ) : articles.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>
                    ✦
                  </Text>
                </View>

                <Text style={styles.emptyTitle}>
                  No articles found
                </Text>

                <Text style={styles.emptyDescription}>
                  Try another topic or search term.
                </Text>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() =>
                    fetchArticles(activeTab)
                  }
                >
                  <Text style={styles.retryText}>
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              articles.map((item, index) => {
                const category = getCat(item.category);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.articleCard}
                    onPress={() =>
                      Linking.openURL(item.url)
                    }
                    activeOpacity={0.9}
                  >
                    {/* Image */}

                    <View style={styles.articleImageWrapper}>
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.articleImage}
                        />
                      ) : (
                        <View
                          style={[
                            styles.articleImage,
                            styles.imagePlaceholder,
                          ]}
                        >
                          <Text style={styles.placeholderIcon}>
                            ✦
                          </Text>
                        </View>
                      )}

                      {index === 0 && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredText}>
                            FEATURED
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Body */}

                    <View style={styles.articleBody}>
                      <View style={styles.articleMeta}>
                        <View
                          style={[
                            styles.categoryBadge,
                            {
                              backgroundColor:
                                category.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              {
                                color: category.text,
                              },
                            ]}
                          >
                            {item.category ||
                              'HEALTH'}
                          </Text>
                        </View>

                        <Text style={styles.timeText}>
                          {timeAgo(item.publishedAt)}
                        </Text>
                      </View>

                      <Text
                        style={styles.articleTitle}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>

                      <Text
                        style={styles.articleDescription}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>

                      <View style={styles.articleFooter}>
                        <Text style={styles.sourceText}>
                          {item.source}
                        </Text>

                        <View
                          style={styles.readMoreContainer}
                        >
                          <Text style={styles.readMoreText}>
                            Read
                          </Text>

                          <Text style={styles.arrow}>
                            →
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ================= VIDEOS ================= */}

        {contentTab === 'videos' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Watch & learn
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Short videos to help you stay healthy
                </Text>
              </View>
            </View>

            {loadingVideos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />

                <Text style={styles.loadingText}>
                  Loading videos...
                </Text>
              </View>
            ) : videos.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>
                    ▶
                  </Text>
                </View>

                <Text style={styles.emptyTitle}>
                  No videos found
                </Text>

                <Text style={styles.emptyDescription}>
                  Check another category.
                </Text>
              </View>
            ) : (
              <View style={styles.videoGrid}>
                {videos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoCard}
                    onPress={() =>
                      Linking.openURL(video.url)
                    }
                    activeOpacity={0.9}
                  >
                    <View style={styles.videoImageWrapper}>
                      <Image
                        source={{ uri: video.thumb }}
                        style={styles.videoImage}
                      />

                      <View style={styles.videoOverlay} />

                      <View style={styles.playButton}>
                        <Text style={styles.playIcon}>
                          ▶
                        </Text>
                      </View>

                      <View style={styles.durationBadge}>
                        <Text
                          style={styles.durationText}
                        >
                          {video.duration}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.videoBody}>
                      <Text
                        style={styles.videoTitle}
                        numberOfLines={2}
                      >
                        {video.title}
                      </Text>

                      <Text
                        style={styles.videoChannel}
                        numberOfLines={1}
                      >
                        {video.channel}
                      </Text>

                      <Text style={styles.videoViews}>
                        {video.views} views
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= POPULAR TOPICS ================= */}

        <View style={styles.topicSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Explore topics
              </Text>

              <Text style={styles.sectionSubtitle}>
                Find content based on your goals
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicContent}
          >
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.label}
                style={[
                  styles.topicCard,
                  {
                    backgroundColor: topic.bg,
                  },
                ]}
                onPress={() =>
                  handleTopic(topic.label)
                }
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.topicIcon,
                    {
                      backgroundColor:
                        COLORS.surface,
                    },
                  ]}
                >
                  <Text style={styles.topicEmoji}>
                    {topic.icon}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.topicText,
                    {
                      color: topic.color,
                    },
                  ]}
                >
                  {topic.label}
                </Text>

                <Text
                  style={[
                    styles.topicArrow,
                    {
                      color: topic.color,
                    },
                  ]}
                >
                  →
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ================= GENERAL ================= */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  body: {
    flex: 1,
  },

  /* ================= HEADER ================= */

  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: COLORS.primary,
    marginBottom: 5,
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.6,
  },

  headerSub: {
    marginTop: 3,
    fontSize: 12.5,
    color: COLORS.secondary,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontSize: 24,
    color: COLORS.primary,
    marginTop: -2,
  },

  /* ================= SEARCH ================= */

  searchContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  searchBox: {
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 26,
    color: COLORS.secondary,
    width: 28,
    marginTop: -4,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },

  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E4E4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    fontSize: 20,
    lineHeight: 21,
    color: COLORS.secondary,
    marginTop: -1,
  },

  /* ================= CATEGORY ================= */

  categoryContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  categoryContent: {
    paddingHorizontal: 16,
    paddingBottom: 2,
  },

  categoryButton: {
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginRight: 3,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  categoryButtonActive: {
    borderBottomColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },

  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  /* ================= SEGMENT ================= */

  segmentContainer: {
    marginHorizontal: 16,
    marginTop: 17,
    marginBottom: 3,
    backgroundColor: '#EBEBF1',
    borderRadius: 14,
    padding: 3,
    flexDirection: 'row',
  },

  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  segmentTextActive: {
    color: COLORS.text,
  },

  /* ================= SECTIONS ================= */

  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  sectionHeader: {
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 3,
  },

  /* ================= ARTICLES ================= */

  articleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 15,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  articleImageWrapper: {
    width: '100%',
    height: 175,
    position: 'relative',
  },

  articleImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderIcon: {
    fontSize: 34,
    color: COLORS.primary,
  },

  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(23,23,28,0.82)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  featuredText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  articleBody: {
    padding: 14,
  },

  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },

  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  timeText: {
    fontSize: 10.5,
    color: COLORS.muted,
  },

  articleTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.25,
    marginBottom: 6,
  },

  articleDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.secondary,
    marginBottom: 13,
  },

  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sourceText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.muted,
    maxWidth: '55%',
  },

  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  arrow: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },

  /* ================= VIDEOS ================= */

  videoGrid: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
  },

 videoCard: {
  width: '100%',
  backgroundColor: '#17171C',   // pehle COLORS.surface tha
  borderRadius: 16,
  overflow: 'hidden',
  marginBottom: 14,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
},

  videoImageWrapper: {
    height: 200,
    width: '100%',
    position: 'relative',
    backgroundColor: '#DDD',
  },

  videoImage: {
    width: '100%',
    height: '100%',
  },

  videoOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  playButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -19,
    marginTop: -19,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(23,23,28,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playIcon: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 2,
  },

  durationBadge: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  durationText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  videoBody: {
    padding: 10,
  },
 videoTitle: {
  fontSize: 13,
  lineHeight: 18,
  fontWeight: '800',
  color: COLORS.text,
  marginBottom: 6,
  minHeight: 36,
},

  videoChannel: {
    fontSize: 10.5,
    color: COLORS.secondary,
    marginBottom: 3,
  },

  videoViews: {
    fontSize: 9.5,
    color: COLORS.muted,
  },

  /* ================= TOPICS ================= */

  topicSection: {
    paddingTop: 10,
    paddingHorizontal: 16,
  },

  topicContent: {
    paddingBottom: 5,
    gap: 10,
  },

  topicCard: {
    width: 145,
    minHeight: 105,
    borderRadius: 17,
    padding: 12,
    justifyContent: 'space-between',
  },

  topicIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topicEmoji: {
    fontSize: 18,
  },

  topicText: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 10,
  },

  topicArrow: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    fontSize: 17,
    fontWeight: '800',
  },

  /* ================= LOADING ================= */

  loadingContainer: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
  },

  loadingText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 10,
  },

  /* ================= EMPTY ================= */

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyIconText: {
    color: COLORS.primary,
    fontSize: 23,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  emptyDescription: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 5,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
  },

  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});

