import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Linking, ActivityIndicator,
  RefreshControl, Dimensions,
} from 'react-native';

import { API_URL } from '../constants/api';
const { width } = Dimensions.get('window');


type Category = 'For You' | 'Nutrition' | 'Fitness' | 'Weight Loss' | 'Mental Health';

interface NewsArticle {
  id: string; title: string; description: string; url: string;
  image: string; source: string; publishedAt: string; category: string; readTime: string;
}
interface Video {
  id: string; videoId: string; title: string; channel: string;
  duration: string; views: string; thumb: string; url: string; category: string;
}

const CATEGORIES: Category[] = ['For You', 'Nutrition', 'Fitness', 'Weight Loss', 'Mental Health'];
const TOPICS = [
  { label: '💪 High Protein', color: '#6C63FF' },
  { label: '🔥 Weight Loss', color: '#E8965C' },
  { label: '🌿 Gut Health', color: '#1A6B4A' },
  { label: '🛡️ Immunity', color: '#2196F3' },
  { label: '🧠 Mental Wellness', color: '#E04B6B' },
];
const CAT_COLORS: Record<string, { text: string; bg: string }> = {
  Nutrition: { text: '#1A6B4A', bg: '#E8F5E9' },
  Fitness: { text: '#6C63FF', bg: '#EEF0FF' },
  Wellness: { text: '#E8965C', bg: '#FFF3E0' },
  Health: { text: '#E04B6B', bg: '#FCE4EC' },
  'Weight Loss': { text: '#E8965C', bg: '#FFF3E0' },
  'Mental Health': { text: '#9B59B6', bg: '#F3E5F5' },
};
const getCat = (cat: string) => CAT_COLORS[cat] ?? { text: '#6C63FF', bg: '#EEF0FF' };
const PURPLE = '#6C63FF';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function ArticlesScreen() {
  const [activeTab, setActiveTab] = useState<Category>('For You');
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [contentTab, setContentTab] = useState<'articles' | 'videos'>('articles');

  const fetchArticles = async (category: string, query?: string) => {
    setLoadingArticles(true);
    try {
      let url = `${API_URL}/api/articles/news?category=${encodeURIComponent(category)}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch (err) {
      console.log('Articles fetch error:', err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchVideos = async (category: string) => {
    setLoadingVideos(true);
    try {
      const res = await fetch(`${API_URL}/api/articles/videos?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (data.success) setVideos(data.data);
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
    await fetchArticles(activeTab, search);
    await fetchVideos(activeTab);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📰 Health Hub</Text>
        <Text style={styles.headerSub}>Stay informed. Stay healthy.</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 15 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor="#BBB"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => { if (search.trim()) fetchArticles(activeTab, search); }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); fetchArticles(activeTab); }}>
              <Text style={{ color: '#aaa', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsOuter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={styles.tabBtn} onPress={() => setActiveTab(cat)}>
              <Text style={[styles.tabTxt, activeTab === cat && styles.tabTxtOn]}>{cat}</Text>
              {activeTab === cat && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles / Videos Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, contentTab === 'articles' && styles.toggleBtnOn]} onPress={() => setContentTab('articles')}>
          <Text style={[styles.toggleTxt, contentTab === 'articles' && styles.toggleTxtOn]}>📰 Articles</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, contentTab === 'videos' && styles.toggleBtnOn]} onPress={() => setContentTab('videos')}>
          <Text style={[styles.toggleTxt, contentTab === 'videos' && styles.toggleTxtOn]}>🎥 Videos</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />}
      >
        {contentTab === 'articles' && (
          <View style={styles.section}>
            {loadingArticles ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={PURPLE} size="large" />
                <Text style={styles.loadingTxt}>Loading articles...</Text>
              </View>
            ) : articles.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40 }}>📭</Text>
                <Text style={styles.emptyTxt}>No articles found</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchArticles(activeTab)}>
                  <Text style={styles.retryTxt}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              articles.map(item => (
                <TouchableOpacity key={item.id} style={styles.artCard} onPress={() => Linking.openURL(item.url)} activeOpacity={0.88}>
                  {item.image
                    ? <Image source={{ uri: item.image }} style={styles.artImage} />
                    : <View style={[styles.artImage, { backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 30 }}>📰</Text></View>
                  }
                  <View style={styles.artBody}>
                    <View style={styles.artTopRow}>
                      <View style={[styles.catChip, { backgroundColor: getCat(item.category).bg }]}>
                        <Text style={[styles.catChipTxt, { color: getCat(item.category).text }]}>{item.source}</Text>
                      </View>
                      <Text style={styles.artTime}>{timeAgo(item.publishedAt)}</Text>
                    </View>
                    <Text style={styles.artTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.artDesc} numberOfLines={2}>{item.description}</Text>
                    <Text style={styles.readMore}>Read more →</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {contentTab === 'videos' && (
          <View style={styles.section}>
            {loadingVideos ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={PURPLE} size="large" />
                <Text style={styles.loadingTxt}>Loading videos...</Text>
              </View>
            ) : (
              <View style={styles.videosGrid}>
                {videos.map(v => (
                  <TouchableOpacity key={v.id} style={styles.videoCard} onPress={() => Linking.openURL(v.url)} activeOpacity={0.88}>
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: v.thumb }} style={styles.videoThumb} />
                      <View style={styles.playBtn}><Text style={{ color: '#fff', fontSize: 14 }}>▶</Text></View>
                      <View style={styles.durationBadge}><Text style={styles.durationTxt}>{v.duration}</Text></View>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
                      <Text style={styles.videoChannel}>🎬 {v.channel}</Text>
                      <Text style={styles.videoViews}>{v.views} views</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Popular Topics */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <Text style={styles.secTitle}>🔥 Popular Topics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {TOPICS.map(t => (
              <TouchableOpacity key={t.label} style={styles.topicChip} onPress={() => {
                const cat = t.label.split(' ').slice(1).join(' ');
                setSearch(cat);
                fetchArticles(activeTab, cat);
                setContentTab('articles');
              }}>
                <Text style={[styles.topicTxt, { color: t.color }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  searchWrap: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 14 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a', padding: 0 },
  tabsOuter: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 12, position: 'relative' },
  tabTxt: { fontSize: 13, fontWeight: '500', color: '#999' },
  tabTxtOn: { color: PURPLE, fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2.5, backgroundColor: PURPLE, borderRadius: 2 },
  toggleRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  toggleBtnOn: { backgroundColor: PURPLE, borderColor: PURPLE },
  toggleTxt: { fontSize: 13, fontWeight: '600', color: '#888' },
  toggleTxtOn: { color: '#fff' },
  body: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 8 },
  secTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingTxt: { color: '#888', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTxt: { fontSize: 15, color: '#999' },
  retryBtn: { backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8, marginTop: 8 },
  retryTxt: { color: '#fff', fontWeight: '700' },
  artCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  artImage: { width: '100%', height: 180 },
  artBody: { padding: 14 },
  artTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catChip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  catChipTxt: { fontSize: 11, fontWeight: '700' },
  artTime: { fontSize: 11, color: '#bbb' },
  artTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', lineHeight: 22, marginBottom: 6 },
  artDesc: { fontSize: 13, color: '#888', lineHeight: 19, marginBottom: 8 },
  readMore: { fontSize: 12, color: PURPLE, fontWeight: '700' },
  videosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  videoCard: { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 4 },
  videoThumb: { width: '100%', height: 100 },
  playBtn: { position: 'absolute', top: '30%', left: '38%', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  durationTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  videoInfo: { padding: 10 },
  videoTitle: { fontSize: 12, fontWeight: '700', color: '#1a1a1a', lineHeight: 17, marginBottom: 4 },
  videoChannel: { fontSize: 11, color: '#888', marginBottom: 2 },
  videoViews: { fontSize: 10, color: '#bbb' },
  topicChip: { backgroundColor: '#fff', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 9, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  topicTxt: { fontSize: 13, fontWeight: '600' },
});