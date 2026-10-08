import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, StatusBar, Platform, RefreshControl,
  TextInput, Modal,
} from 'react-native';
import ArticleDetailScreen from './screens/ArticleDetailScreen'; // ✅ ADDED
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import CircularProgress from './components/CircularProgress';
import NutrientBar from './components/NutrientBar';
import StatCard from './components/StatCard';
import WaterTracker from './components/WaterTracker';
import { API_URL } from './constants/api';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ArticlesScreen from './screens/ArticlesScreen';
import GoalSetupScreen from './screens/GoalSetupScreen';
import HistoryScreen from './screens/HistoryScreen';
import { Linking } from 'react-native';
import { supabase } from './lib/supabase';

// ── TYPES ─────────────────────────────────────────────────
interface ScanResult {
  foodName: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
}

interface DailyStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  dailyGoal: number;
  remaining: number;
  progress: number;
  name: string;
}

interface RecentScan {
  id: string;
  food_name: string;
  calories: number;
  scanned_at: string;
}

interface StreakData {
  current: number;
  longest: number;
  isActiveToday: boolean;
}

type ScanStage = 'idle' | 'identifying' | 'confirming' | 'fetching' | 'done';

const PORTION_SIZES = [
  { label: 'Small',  multiplier: 0.6,  desc: '~60% serving' },
  { label: 'Medium', multiplier: 1.0,  desc: 'Standard serving' },
  { label: 'Large',  multiplier: 1.5,  desc: '~150% serving' },
  { label: 'Custom', multiplier: null, desc: 'Enter grams' },
];

const getFoodEmoji = (foodName: string): string => {
  const name = foodName.toLowerCase();
  if (name.includes('biryani') || name.includes('rice')) return '🍚';
  if (name.includes('chicken') || name.includes('karahi') || name.includes('murgh')) return '🍗';
  if (name.includes('beef') || name.includes('nihari') || name.includes('meat')) return '🥩';
  if (name.includes('roti') || name.includes('paratha') || name.includes('bread') || name.includes('naan')) return '🫓';
  if (name.includes('daal') || name.includes('lentil') || name.includes('soup')) return '🍲';
  if (name.includes('salad') || name.includes('vegetable') || name.includes('sabzi')) return '🥗';
  if (name.includes('egg') || name.includes('anda')) return '🍳';
  if (name.includes('fruit') || name.includes('apple') || name.includes('banana')) return '🍎';
  if (name.includes('cake') || name.includes('dessert') || name.includes('sweet') || name.includes('halwa')) return '🍰';
  if (name.includes('pizza')) return '🍕';
  if (name.includes('burger')) return '🍔';
  if (name.includes('fish') || name.includes('seafood')) return '🐟';
  if (name.includes('milk') || name.includes('yogurt') || name.includes('dahi')) return '🥛';
  if (name.includes('almond') || name.includes('nut') || name.includes('dry fruit')) return '🌰';
  if (name.includes('ice cream')) return '🍦';
  if (name.includes('tea') || name.includes('chai') || name.includes('coffee')) return '☕';
  return '🍱';
};

const getStreakBadge = (streak: number): string => {
  if (streak >= 100) return '🥇';
  if (streak >= 30)  return '🥈';
  if (streak >= 7)   return '🥉';
  return '🔥';
};

const ARTICLES = [
  { title: "10 Best Foods for Weight Loss", desc: "Discover top foods that help you lose weight naturally.", url: "https://www.healthline.com/nutrition/weight-loss-foods", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", source: "Healthline" },
  { title: "How Many Calories Per Day?", desc: "Calorie needs vary by age, sex, height, weight and activity.", url: "https://www.healthline.com/nutrition/how-many-calories-per-day", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400", source: "Healthline" },
  { title: "7 Benefits of HIIT Training", desc: "HIIT workouts are most efficient way to burn fat and improve fitness.", url: "https://www.healthline.com/nutrition/benefits-of-hiit", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400", source: "WebMD" },
  { title: "Importance of Protein in Diet", desc: "Protein is essential for muscle building, weight loss and health.", url: "https://www.healthline.com/nutrition/10-reasons-to-eat-more-protein", img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400", source: "Medical News" },
  { title: "Best Morning Exercises", desc: "Starting day with exercise boosts energy and improves mood.", url: "https://www.healthline.com/health/fitness-exercise/morning-exercises", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", source: "Fitness Mag" },
];

const VIDEOS = [
  { id: "ml6cT4AZdqI", title: "Full Body Workout for Beginners", channel: "FitnessBlender", thumb: "https://img.youtube.com/vi/ml6cT4AZdqI/mqdefault.jpg" },
  { id: "UItWltVZZmE", title: "Healthy Meal Plan - What I Eat", channel: "Healthy Eating", thumb: "https://img.youtube.com/vi/UItWltVZZmE/mqdefault.jpg" },
  { id: "cbKkB3POqaY", title: "10 Min Morning Yoga for Energy", channel: "Yoga With Adriene", thumb: "https://img.youtube.com/vi/cbKkB3POqaY/mqdefault.jpg" },
  { id: "v7AYKMP6rOE", title: "High Protein Meal Prep", channel: "Nutrition Made Simple", thumb: "https://img.youtube.com/vi/v7AYKMP6rOE/mqdefault.jpg" },
];

// ── HEALTH HUB ────────────────────────────────────────────
function HealthHub({ onSelectArticle }: { onSelectArticle: (a: any) => void }) { // ✅ UPDATED
  const { colors } = useTheme();
  const [tab, setTab] = React.useState<'articles' | 'videos'>('articles');
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>Health Hub 💪</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600', marginTop: 2 }}>Articles & workout videos</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 }}>
        {['articles', 'videos'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t as any)} activeOpacity={0.8}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: tab === t ? colors.primary : colors.primaryLight, borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: tab === t ? 'white' : colors.primary }}>
              {t === 'articles' ? '📰 Articles' : '🎥 Videos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
        {tab === 'articles' && ARTICLES.map((a, i) => (
          <TouchableOpacity key={i} onPress={() => onSelectArticle(a)} activeOpacity={0.85} // ✅ CHANGED
            style={{ backgroundColor: colors.card, borderRadius: 18, marginBottom: 16, overflow: 'hidden', elevation: 3 }}>
            <Image source={{ uri: a.img }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginBottom: 4 }}>{a.source}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, lineHeight: 22, marginBottom: 6 }} numberOfLines={2}>{a.title}</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 8 }} numberOfLines={2}>{a.desc}</Text>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>Read more →</Text>
            </View>
          </TouchableOpacity>
        ))}
        {tab === 'videos' && VIDEOS.map((v, i) => (
          <TouchableOpacity key={i} onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${v.id}`)} activeOpacity={0.85}
            style={{ backgroundColor: colors.card, borderRadius: 18, marginBottom: 16, overflow: 'hidden', elevation: 3 }}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: v.thumb }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
              <View style={{ position: 'absolute', top: '40%', left: '45%', width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: 18 }}>▶</Text>
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, lineHeight: 20, marginBottom: 6 }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>🎬 {v.channel}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── MAIN APP INNER ────────────────────────────────────────
function AppInner() {
  const { colors, isDark, toggleTheme } = useTheme();

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [screen, setScreen] = useState<'login' | 'signup' | 'home' | 'goalSetup'>('login');
  const [activeTab, setActiveTab] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null); // ✅ ADDED

  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [identifiedFood, setIdentifiedFood] = useState('');
  const [editedFood, setEditedFood] = useState('');
  const [usdaResult, setUsdaResult] = useState<ScanResult | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<string>('Medium');
  const [customGrams, setCustomGrams] = useState('');
  const [showPortionModal, setShowPortionModal] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, isActiveToday: false });

  const timezone =
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone || 'UTC';

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.access_token && session.user) {
        setToken(session.access_token);
        setCurrentUser(session.user);
        setScreen('home');
      }

      setAuthChecking(false);
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (session?.access_token && session.user) {
          setToken(session.access_token);
          setCurrentUser(session.user);

          if (
            event === 'SIGNED_IN' ||
            event === 'INITIAL_SESSION'
          ) {
            setScreen('home');
          }
        } else if (event === 'SIGNED_OUT') {
          setToken(null);
          setCurrentUser(null);
          setScreen('login');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const [statsRes, scansRes] = await Promise.all([
        fetch(`${API_URL}/api/goals/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Timezone': timezone,
          },
        }),
        fetch(`${API_URL}/api/scans/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Timezone': timezone,
          },
        }),
      ]);
      const statsData = await statsRes.json();
      const scansData = await scansRes.json();
      if (statsData.success) setStats(statsData.stats);
      if (scansData.scans) setRecentScans(scansData.scans.slice(0, 5));
    } catch (e) { console.log('Stats fetch error:', e); }
    finally { setLoadingStats(false); }
  }, [token]);

  const fetchStreak = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/streak`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Timezone': timezone,
        },
      });
      const data = await res.json();
      if (data.success) setStreak(data.streak);
    } catch (e) { console.log('Streak fetch error:', e); }
  }, [token]);

  const updateStreak = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/streak/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Timezone': timezone,
        },
      });
      const data = await res.json();
      if (data.success) {
        setStreak(data.streak);
        if (data.milestone) {
          Alert.alert(`${data.milestone.badge} Milestone!`, data.milestone.message, [{ text: 'Awesome! 🎉' }]);
        }
      }
    } catch (e) { console.log('Streak update error:', e); }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchStreak();
    }
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchStreak()]);
    setRefreshing(false);
  };

  const consumed  = stats?.totalCalories ?? 0;
  const remaining = stats?.remaining     ?? 0;
  const dailyGoal = stats?.dailyGoal     ?? 2000;
  const progress  = stats?.progress      ?? 0;

  if (authChecking) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (screen === 'login') return <LoginScreen onLogin={(t, u) => { setToken(t); setCurrentUser(u); setScreen('home'); }} onGoToSignup={() => setScreen('signup')} />;
  if (screen === 'signup') return <SignupScreen onSignup={() => setScreen('login')} onGoToLogin={() => setScreen('login')} />;
  if (screen === 'goalSetup') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <GoalSetupScreen
          token={token!}
          currentGoal={stats?.dailyGoal || 2000}
          currentName={stats?.name || currentUser?.user_metadata?.name || ''}
          onSave={(goal, name) => { setStats(prev => prev ? { ...prev, dailyGoal: goal, name } : null); setScreen('home'); fetchStats(); }}
          onSkip={() => setScreen('home')}
        />
      </SafeAreaView>
    );
  }

  // ✅ ARTICLE DETAIL SCREEN CHECK - SHOW WHEN ARTICLE SELECTED
  if (selectedArticle) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <ArticleDetailScreen 
          url={selectedArticle.url}
          title={selectedArticle.title}
          onGoBack={() => setSelectedArticle(null)}
        />
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow gallery access'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.3 });
    if (!result.canceled && result.assets[0]) { setImage(result.assets[0].uri); setImageBase64(result.assets[0].base64 ?? null); resetScan(); }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.3 });
    if (!result.canceled && result.assets[0]) { setImage(result.assets[0].uri); setImageBase64(result.assets[0].base64 ?? null); resetScan(); }
  };

  const showImageOptions = () => Alert.alert('Select Image', '', [
    { text: '📷 Camera', onPress: takePhoto },
    { text: '🖼️ Gallery', onPress: pickImage },
    { text: 'Cancel', style: 'cancel' },
  ]);

  const identifyFood = async () => {
    if (!imageBase64) return;
    setScanStage('identifying');
    try {
      const res = await fetch(`${API_URL}/api/ai/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await res.json();
      if (!data.success) { Alert.alert('Error', data.error || 'Could not identify food'); setScanStage('idle'); return; }
      setIdentifiedFood(data.foodName);
      setEditedFood(data.foodName);
      setScanStage('confirming');
    } catch (e) { Alert.alert('Error', 'Network error — please check your connection'); setScanStage('idle'); }
  };

  const fetchNutrition = async (foodName: string) => {
    setScanStage('fetching');
    try {
      const res = await fetch(`${API_URL}/api/ai/nutrition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ foodName }),
      });
      const data = await res.json();
      if (!data.success) { Alert.alert('Error', data.error || 'Could not get nutrition data'); setScanStage('idle'); return; }
      setUsdaResult(data.nutrition);
      setShowPortionModal(true);
      setScanStage('confirming');
    } catch (e) { Alert.alert('Error', 'Network error — please check your connection'); setScanStage('idle'); }
  };

  const applyPortion = async () => {
    if (!usdaResult) return;
    const portion = PORTION_SIZES.find(p => p.label === selectedPortion);
    let multiplier = portion?.multiplier ?? 1.0;
    if (selectedPortion === 'Custom') {
      const grams = parseFloat(customGrams);
      if (!grams || grams < 10 || grams > 2000) { Alert.alert('Error', 'Grams must be between 10 and 2000!'); return; }
      multiplier = grams / 100;
    }
    const final: ScanResult = {
      ...usdaResult,
      foodName:      editedFood || usdaResult.foodName,
      totalCalories: Math.round(usdaResult.totalCalories * multiplier),
      protein:       Math.round(usdaResult.protein * multiplier),
      carbs:         Math.round(usdaResult.carbs * multiplier),
      fat:           Math.round(usdaResult.fat * multiplier),
      fiber:         Math.round(usdaResult.fiber * multiplier),
      servingSize:   selectedPortion === 'Custom' ? `${customGrams}g` : `${selectedPortion} (${usdaResult.servingSize})`,
    };
    setShowPortionModal(false);
    setScanResult(final);
    setScanStage('done');
    if (token) {
      try {
        await fetch(`${API_URL}/api/scans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Timezone': timezone,
          },
          body: JSON.stringify({ food_name: final.foodName, calories: final.totalCalories, protein: final.protein, carbs: final.carbs, fat: final.fat, fiber: final.fiber, serving_size: final.servingSize }),
        });
        await fetchStats();
        await updateStreak();
      } catch (e) { console.log('Save error:', e); }
    }
  };

  const resetScan = () => {
    setScanStage('idle'); setScanResult(null); setUsdaResult(null);
    setIdentifiedFood(''); setEditedFood('');
    setSelectedPortion('Medium'); setCustomGrams(''); setShowPortionModal(false);
  };

  const handleLogout = () =>
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            setToken(null);
            setCurrentUser(null);
            setScreen('login');
            setStats(null);
            setRecentScans([]);
            resetScan();
          },
        },
      ]
    );

  const TABS = [
    { icon: 'home' as const,       label: 'Home'     },
    { icon: 'restaurant' as const, label: 'Food'     },
    { icon: 'fitness' as const,    label: 'Exercise' },
    { icon: 'newspaper' as const,  label: 'Articles' },
    { icon: 'time' as const,       label: 'History'  },
  ];

  const BottomNav = () => (
    <View style={[styles.bottomNav, { backgroundColor: colors.navBar, borderTopColor: colors.border }]}>
      {TABS.map((tab, i) => (
        <TouchableOpacity key={tab.label} style={styles.navTab} onPress={() => setActiveTab(i)} activeOpacity={0.7}>
          <Ionicons name={tab.icon} size={22} color={activeTab === i ? colors.primary : colors.textLight} />
          <Text style={[styles.navLabel, { color: activeTab === i ? colors.primary : colors.textLight }, activeTab === i && styles.navLabelActive]}>{tab.label}</Text>
          {activeTab === i && <View style={[styles.navDot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (activeTab === 2) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <HealthHub onSelectArticle={setSelectedArticle} /> {/* ✅ UPDATED */}
      <BottomNav />
    </SafeAreaView>
  );

  if (activeTab === 3) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ArticlesScreen onSelectArticle={setSelectedArticle} /> {/* ✅ UPDATED */}
      <BottomNav />
    </SafeAreaView>
  );

  if (activeTab === 4) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <HistoryScreen token={token!} dailyGoal={dailyGoal} />
      <BottomNav />
    </SafeAreaView>
  );

  const PortionModal = () => (
    <Modal visible={showPortionModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>🍽️ Portion Size</Text>
          <Text style={[styles.modalSubtitle, { color: colors.primary }]}>{editedFood}</Text>
          <Text style={[styles.modalBase, { color: colors.textMuted }]}>Base: {usdaResult?.totalCalories} kcal per {usdaResult?.servingSize}</Text>
          {PORTION_SIZES.map(p => (
            <TouchableOpacity key={p.label} style={[styles.portionBtn, { borderColor: colors.border, backgroundColor: colors.sectionBg }, selectedPortion === p.label && { borderColor: colors.primary, backgroundColor: colors.primary }]} onPress={() => setSelectedPortion(p.label)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.portionLabel, { color: colors.text }, selectedPortion === p.label && { color: '#fff' }]}>{p.label}</Text>
                <Text style={[styles.portionDesc, { color: colors.textMuted }, selectedPortion === p.label && { color: 'rgba(255,255,255,0.8)' }]}>{p.desc}</Text>
              </View>
              {p.multiplier && <Text style={[styles.portionKcal, { color: colors.primary }, selectedPortion === p.label && { color: '#fff' }]}>~{Math.round((usdaResult?.totalCalories ?? 0) * p.multiplier)} kcal</Text>}
              {selectedPortion === p.label && <Text style={{ color: '#fff', marginLeft: 8 }}>✓</Text>}
            </TouchableOpacity>
          ))}
          {selectedPortion === 'Custom' && (
            <View style={styles.gramsInput}>
              <TextInput style={[styles.gramsField, { borderColor: colors.primary, color: colors.text, backgroundColor: colors.inputBg }]} placeholder="Enter grams (e.g. 250)" placeholderTextColor={colors.textLight} keyboardType="numeric" value={customGrams} onChangeText={setCustomGrams} />
              {customGrams ? <Text style={[styles.gramsKcal, { color: colors.primary }]}>~{Math.round((usdaResult?.totalCalories ?? 0) * parseFloat(customGrams) / 100)} kcal</Text> : null}
            </View>
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalCancel, { borderColor: colors.border }]} onPress={() => { setShowPortionModal(false); setScanStage('idle'); }}>
              <Text style={[styles.modalCancelTxt, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalConfirm, { backgroundColor: colors.primary }]} onPress={applyPortion}>
              <Text style={styles.modalConfirmTxt}>✅ Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderScanContent = () => {
    if (scanStage === 'idle') return (
      <>
        <Text style={[styles.scanTitle, { color: colors.text }]}>Find calories in your food</Text>
        <Text style={[styles.scanSubtitle, { color: colors.textMuted }]}>Take a photo — AI identifies, you confirm!</Text>
        <TouchableOpacity style={[styles.scanBtn, { backgroundColor: colors.primary }, !image && styles.scanBtnDisabled]} onPress={identifyFood} disabled={!image} activeOpacity={0.85}>
          <Ionicons name="camera" size={15} color="white" style={{ marginRight: 5 }} />
          <Text style={styles.scanBtnText}>Scan Food</Text>
        </TouchableOpacity>
      </>
    );
    if (scanStage === 'identifying') return (
      <View style={{ gap: 8 }}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>🔍 Identifying food...</Text>
        <View style={[styles.shimmer, { backgroundColor: colors.shimmer }]} />
        <View style={[styles.shimmer, { width: '65%', backgroundColor: colors.shimmer }]} />
      </View>
    );
    if (scanStage === 'confirming' && !showPortionModal && !scanResult) return (
      <View style={{ gap: 8 }}>
        <Text style={[styles.scanTitle, { color: colors.text }]}>Is this correct?</Text>
        <TextInput style={[styles.foodEditInput, { borderColor: colors.primary, color: colors.text, backgroundColor: colors.inputBg }]} value={editedFood} onChangeText={setEditedFood} placeholder="Edit food name..." placeholderTextColor={colors.textLight} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity style={[styles.confirmBtn, { flex: 1, backgroundColor: colors.primary }]} onPress={() => fetchNutrition(editedFood)}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✅ Yes, correct</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.confirmBtn, { flex: 1, backgroundColor: colors.sectionBg }]} onPress={resetScan}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
    if (scanStage === 'fetching') return (
      <View style={{ gap: 8 }}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>📊 Fetching nutrition data...</Text>
        <View style={[styles.shimmer, { backgroundColor: colors.shimmer }]} />
        <View style={[styles.shimmer, { width: '50%', backgroundColor: colors.shimmer }]} />
      </View>
    );
    if (scanStage === 'done' && scanResult) return (
      <View>
        <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={2}>{scanResult.foodName}</Text>
        <Text style={[styles.resultKcal, { color: colors.primary }]}>{scanResult.totalCalories} <Text style={{ fontSize: 13 }}>kcal</Text></Text>
        <Text style={{ fontSize: 10, color: colors.textLight, marginBottom: 6 }}>📏 {scanResult.servingSize}</Text>
        <View style={styles.macroRow}>
          {[{ l: 'P', v: `${scanResult.protein}g`, c: '#22c55e' }, { l: 'C', v: `${scanResult.carbs}g`, c: '#3b82f6' }, { l: 'F', v: `${scanResult.fat}g`, c: '#f59e0b' }].map(m => (
            <View key={m.l} style={[styles.macroBadge, { backgroundColor: m.c + '22' }]}>
              <Text style={[styles.macroBadgeText, { color: m.c }]}>{m.l}: {m.v}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={resetScan} style={[styles.resetBtn, { borderColor: colors.primary }]}>
          <Text style={[styles.resetBtnText, { color: colors.primary }]}>↺ New Scan</Text>
        </TouchableOpacity>
      </View>
    );
    return null;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <PortionModal />

      <View style={[styles.topNav, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>Alviva </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('goalSetup')}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}>

        {/* HERO */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroHello}>Hello, {stats?.name || currentUser?.user_metadata?.name || 'User'} 👋</Text>
            <Text style={styles.heroSub}>Track your calories and{'\n'}achieve your goals</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <TouchableOpacity style={styles.goalBadge} onPress={() => setScreen('goalSetup')}>
                <Text style={styles.goalBadgeTxt}>🎯 Goal: {dailyGoal} kcal</Text>
              </TouchableOpacity>
              {streak.current > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeTxt}>{getStreakBadge(streak.current)} {streak.current} day{streak.current !== 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
          </View>
          <CircularProgress consumed={consumed} goal={dailyGoal} size={120} />
        </View>

        {/* STREAK CARD */}
        {streak.current > 0 && (
          <View style={[styles.streakCard, { backgroundColor: colors.card }]}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakFire}>{getStreakBadge(streak.current)}</Text>
              <View>
                <Text style={[styles.streakCount, { color: colors.text }]}>{streak.current} Day Streak!</Text>
                <Text style={[styles.streakSub, { color: colors.textMuted }]}>
                  {streak.isActiveToday ? '✅ Active today' : '⚠️ Log today to keep streak!'}
                </Text>
              </View>
            </View>
            <View style={styles.streakRight}>
              <Text style={[styles.streakBest, { color: colors.textMuted }]}>Best</Text>
              <Text style={[styles.streakBestNum, { color: colors.primary }]}>{streak.longest}</Text>
            </View>
          </View>
        )}

        {/* TODAY OVERVIEW */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today Overview</Text>
        {loadingStats ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 20 }} /> : (
          <View style={styles.statsRow}>
            <StatCard icon="🔥" value={consumed}       label="Consumed"  />
            <StatCard icon="⚡" value={remaining}       label="Remaining" />
            <StatCard icon="🎯" value={dailyGoal}       label="Goal"      />
            <StatCard icon="📊" value={`${progress}%`} label="Progress"  />
          </View>
        )}

        {/* WATER TRACKER */}
        {token && <WaterTracker token={token} />}

        {/* SCAN CARD */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Scan Food to Calculate Calories</Text>
        <View style={[styles.scanCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <TouchableOpacity style={[styles.imageBox, { backgroundColor: colors.primaryLight }]} onPress={showImageOptions} activeOpacity={0.85}>
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.foodImage} />
                {(['tl','tr','bl','br'] as const).map(c => (
                  <View key={c} style={[styles.bracket, c==='tl' ? styles.bracketTL : c==='tr' ? styles.bracketTR : c==='bl' ? styles.bracketBL : styles.bracketBR]} />
                ))}
              </>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={{ fontSize: 28 }}>📷</Text>
                <Text style={[styles.uploadText, { color: colors.primary }]}>Tap to upload photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.scanRight}>{renderScanContent()}</View>
        </View>

        {/* TODAY'S SCANS */}
        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Scans</Text>
          <TouchableOpacity onPress={() => setActiveTab(4)}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All →</Text>
          </TouchableOpacity>
        </View>
        {recentScans.length === 0 ? (
          <View style={[styles.emptyScans, { backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🍽️</Text>
            <Text style={[styles.emptyScansTxt, { color: colors.textLight }]}>No scans today — take a photo of your food!</Text>
          </View>
        ) : recentScans.map((s) => (
          <View key={s.id} style={[styles.recentItem, { backgroundColor: colors.card }]}>
            <View style={[styles.recentEmoji, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 26 }}>{getFoodEmoji(s.food_name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recentName, { color: colors.text }]} numberOfLines={1}>{s.food_name}</Text>
              <Text style={[styles.recentKcal, { color: colors.primary }]}>{s.calories} kcal</Text>
              <Text style={[styles.recentTime, { color: colors.textLight }]}>
                {new Date(s.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </View>
        ))}

        {/* NUTRIENTS */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nutrients Summary</Text>
        <View style={[styles.nutrientsCard, { backgroundColor: colors.card }]}>
          <NutrientBar label="Carbohydrates" current={stats?.totalCarbs   ?? 0} total={250} color="#3b82f6" />
          <NutrientBar label="Proteins"      current={stats?.totalProtein ?? 0} total={100} color="#22c55e" />
          <NutrientBar label="Fats"          current={stats?.totalFat     ?? 0} total={70}  color="#f59e0b" />
          <NutrientBar label="Fiber"         current={stats?.totalFiber   ?? 0} total={30}  color={colors.primary} />
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  navTitle: { fontSize: 17, fontWeight: '900' },
  themeToggle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  hero: { borderRadius: 24, padding: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  heroLeft: { flex: 1 },
  heroHello: { fontSize: 22, fontWeight: '900', color: 'white', marginBottom: 6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', lineHeight: 19 },
  goalBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start' },
  goalBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  streakBadge: { backgroundColor: 'rgba(255,165,0,0.3)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start' },
  streakBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  streakCard: { borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakFire: { fontSize: 32 },
  streakCount: { fontSize: 16, fontWeight: '900' },
  streakSub: { fontSize: 12, marginTop: 2 },
  streakRight: { alignItems: 'center' },
  streakBest: { fontSize: 11, fontWeight: '600' },
  streakBestNum: { fontSize: 22, fontWeight: '900' },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  scanCard: { borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', padding: 14, flexDirection: 'row', gap: 14, marginBottom: 20, elevation: 2 },
  imageBox: { width: 120, height: 160, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  foodImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center', paddingHorizontal: 8 },
  uploadText: { fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  bracket: { position: 'absolute', width: 16, height: 16, borderColor: 'white', borderWidth: 0 },
  bracketTL: { top: 6, left: 6, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
  bracketTR: { top: 6, right: 6, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
  bracketBL: { bottom: 6, left: 6, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
  bracketBR: { bottom: 6, right: 6, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomLeftRadius: 4 },
  scanRight: { flex: 1, justifyContent: 'center' },
  scanTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  scanSubtitle: { fontSize: 11, fontWeight: '600', lineHeight: 16, marginBottom: 12 },
  scanBtn: { borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  scanBtnDisabled: { backgroundColor: '#ccc', elevation: 0 },
  scanBtnText: { color: 'white', fontSize: 13, fontWeight: '800' },
  shimmer: { height: 12, width: '90%', borderRadius: 6 },
  foodEditInput: { borderWidth: 1.5, borderRadius: 10, padding: 8, fontSize: 13 },
  confirmBtn: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center' },
  resultName: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  resultKcal: { fontSize: 26, fontWeight: '900', lineHeight: 30, marginBottom: 2 },
  macroRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 8 },
  macroBadge: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7 },
  macroBadgeText: { fontSize: 11, fontWeight: '700' },
  resetBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start' },
  resetBtnText: { fontSize: 11, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  emptyScans: { borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16 },
  emptyScansTxt: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  recentItem: { borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, elevation: 2 },
  recentEmoji: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recentName: { fontSize: 14, fontWeight: '800' },
  recentKcal: { fontSize: 14, fontWeight: '900' },
  recentTime: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  nutrientsCard: { borderRadius: 20, padding: 18, marginBottom: 4, elevation: 2 },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 12, elevation: 8 },
  navTab: { flex: 1, alignItems: 'center', gap: 2 },
  navLabel: { fontSize: 11, fontWeight: '600' },
  navLabelActive: { fontWeight: '800' },
  navDot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  modalSubtitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  modalBase: { fontSize: 12, marginBottom: 16 },
  portionBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 10 },
  portionLabel: { fontSize: 14, fontWeight: '800' },
  portionDesc: { fontSize: 11, marginTop: 2 },
  portionKcal: { fontSize: 14, fontWeight: '900' },
  gramsInput: { marginBottom: 10 },
  gramsField: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 15 },
  gramsKcal: { fontSize: 13, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: { flex: 1, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  modalCancelTxt: { fontSize: 14, fontWeight: '700' },
  modalConfirm: { flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  modalConfirmTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
});