import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import CircularProgress from './components/CircularProgress';
import NutrientBar from './components/NutrientBar';
import StatCard from './components/StatCard';
import { COLORS, CALORIE_GOAL } from './constants/theme';
import { API_URL } from './constants/api';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ArticlesScreen from './screens/ArticlesScreen'; // ✅ NAYA IMPORT

// ⚠️ GROQ API KEY
const GROQ_API_KEY = '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';

interface ScanResult {
  foodName: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
}

interface RecentScan {
  name: string;
  kcal: number;
  time: string;
  emoji: string;
}


import { Linking } from 'react-native';

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

function HealthHub() {
  const [tab, setTab] = React.useState<'articles' | 'videos'>('articles');
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f4fc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#111' }}>Health Hub 💪</Text>
        <Text style={{ fontSize: 13, color: '#888', fontWeight: '600', marginTop: 2 }}>Articles & workout videos</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 }}>
        {['articles', 'videos'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t as any)}
            activeOpacity={0.8}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 6, paddingVertical: 10, borderRadius: 12,
              backgroundColor: tab === t ? '#6750c8' : '#ede9ff',
              borderWidth: 1, borderColor: '#6750c8',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: tab === t ? 'white' : '#6750c8' }}>
              {t === 'articles' ? '📰 Articles' : '🎥 Videos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
        {tab === 'articles' && ARTICLES.map((a, i) => (
          <TouchableOpacity key={i} onPress={() => Linking.openURL(a.url)} activeOpacity={0.85}
            style={{ backgroundColor: 'white', borderRadius: 18, marginBottom: 16, overflow: 'hidden', elevation: 3 }}>
            <Image source={{ uri: a.img }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#6750c8', marginBottom: 4 }}>{a.source}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#111', lineHeight: 22, marginBottom: 6 }} numberOfLines={2}>{a.title}</Text>
              <Text style={{ fontSize: 13, color: '#888', lineHeight: 19, marginBottom: 8 }} numberOfLines={2}>{a.desc}</Text>
              <Text style={{ fontSize: 12, color: '#6750c8', fontWeight: '700' }}>Read more →</Text>
            </View>
          </TouchableOpacity>
        ))}
        {tab === 'videos' && VIDEOS.map((v, i) => (
          <TouchableOpacity key={i} onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${v.id}`)} activeOpacity={0.85}
            style={{ backgroundColor: 'white', borderRadius: 18, marginBottom: 16, overflow: 'hidden', elevation: 3 }}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: v.thumb }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
              <View style={{ position: 'absolute', top: '40%', left: '45%', width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: 18 }}>▶</Text>
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#111', lineHeight: 20, marginBottom: 6 }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>🎬 {v.channel}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function App() {
  // Auth states
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [screen, setScreen] = useState<'login' | 'signup' | 'home'>('login');

  // Home states
  const [activeTab, setActiveTab] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([
    { name: 'Chicken Salad Bowl', kcal: 520, time: 'Today, 12:30 PM', emoji: '🥗' },
  ]);

  const consumed = 750 + (scanResult?.totalCalories ?? 0);
  const remaining = Math.max(CALORIE_GOAL - consumed, 0);
  const progress = Math.round((consumed / CALORIE_GOAL) * 100);

  // Auth screens
  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={(t, u) => {
          setToken(t);
          setCurrentUser(u);
          setScreen('home');
        }}
        onGoToSignup={() => setScreen('signup')}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignupScreen
        onSignup={() => setScreen('login')}
        onGoToLogin={() => setScreen('login')}
      />
    );
  }

  // Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Chahiye', 'Gallery access ke liye permission dein');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.3,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setScanResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Chahiye', 'Camera access ke liye permission dein');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.3,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setScanResult(null);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Tasveer Choose Karein', '', [
      { text: '📷 Camera', onPress: takePhoto },
      { text: '🖼️ Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Groq API + Backend Save
  const analyzeFood = async () => {
    if (!imageBase64) return;
    setLoading(true);
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                },
                {
                  type: 'text',
                  text: 'Analyze this food image. Reply ONLY with valid JSON, no markdown:\n{"foodName":"string","totalCalories":number,"protein":number,"carbs":number,"fat":number,"fiber":number,"servingSize":"string"}',
                },
              ],
            }],
            temperature: 0.1,
            max_tokens: 300,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          Alert.alert('⏳ Limit', 'Thoda wait karein aur dobara try karein!');
        } else {
          Alert.alert('API Error', data?.error?.message || 'Koi masla aaya');
        }
        return;
      }

      const rawText = data.choices?.[0]?.message?.content || '';
      if (!rawText) {
        Alert.alert('Error', 'AI ne jawab nahi diya — dobara try karein!');
        return;
      }

      const cleanText = rawText.replace(/```json|```/g, '').trim();
      const parsed: ScanResult = JSON.parse(cleanText);
      setScanResult(parsed);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setRecentScans(prev => [
        { name: parsed.foodName, kcal: parsed.totalCalories, time: `Today, ${timeStr}`, emoji: '🍱' },
        ...prev.slice(0, 4),
      ]);

      // Backend mein save karo
      if (token) {
        try {
          await fetch(`${API_URL}/scans`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              food_name: parsed.foodName,
              calories: parsed.totalCalories,
              protein: parsed.protein,
              carbs: parsed.carbs,
              fat: parsed.fat,
              fiber: parsed.fiber,
              serving_size: parsed.servingSize,
            }),
          });
        } catch (e) {
          console.log('Save error:', e);
        }
      }

    } catch (e: any) {
      Alert.alert('Error', 'Network masla — internet check karein!');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setImage(null);
    setImageBase64(null);
    setScanResult(null);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Logout karna chahte hain?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: () => {
          setToken(null);
          setCurrentUser(null);
          setScreen('login');
        }
      },
    ]);
  };

  const carbsCurrent   = 150 + (scanResult ? Math.round(scanResult.carbs * 0.6)   : 0);
  const proteinCurrent = 45  + (scanResult ? Math.round(scanResult.protein * 0.5) : 0);
  const fatCurrent     = 25  + (scanResult ? Math.round(scanResult.fat * 0.4)     : 0);
  const fiberCurrent   = 10  + (scanResult?.fiber ?? 0);

  // ✅ UPDATED TABS — Articles tab index 3 pe add kiya
  const TABS = [
    { icon: 'home' as const,       label: 'Home'     },
    { icon: 'restaurant' as const, label: 'Food'     },
    { icon: 'fitness' as const,    label: 'Exercise' },
    { icon: 'newspaper' as const,  label: 'Articles' }, // ✅ NAYA
    { icon: 'time' as const,       label: 'History'  },
  ];

  // ── Exercise tab (index 2) ─────────────────────────────────────────────────
  if (activeTab === 2) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <HealthHub />
        <View style={styles.bottomNav}>
          {TABS.map((tab, i) => (
            <TouchableOpacity key={tab.label} style={styles.navTab} onPress={() => setActiveTab(i)} activeOpacity={0.7}>
              <Ionicons name={tab.icon} size={22} color={activeTab === i ? COLORS.primary : '#aaa'} />
              <Text style={[styles.navLabel, activeTab === i && styles.navLabelActive]}>{tab.label}</Text>
              {activeTab === i && <View style={styles.navDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // ── ✅ Articles tab (index 3) ──────────────────────────────────────────────
  if (activeTab === 3) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ArticlesScreen />
        <View style={styles.bottomNav}>
          {TABS.map((tab, i) => (
            <TouchableOpacity key={tab.label} style={styles.navTab} onPress={() => setActiveTab(i)} activeOpacity={0.7}>
              <Ionicons name={tab.icon} size={22} color={activeTab === i ? COLORS.primary : '#aaa'} />
              <Text style={[styles.navLabel, activeTab === i && styles.navLabelActive]}>{tab.label}</Text>
              {activeTab === i && <View style={styles.navDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* TOP NAV */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="menu" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Calorie Calculator</Text>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroHello}>
              Hello, {currentUser?.user_metadata?.name || 'Ali'} 👋
            </Text>
            <Text style={styles.heroSub}>Track your calories and{'\n'}achieve your goals</Text>
          </View>
          <CircularProgress consumed={consumed} goal={CALORIE_GOAL} size={120} />
        </View>

        {/* TODAY OVERVIEW */}
        <Text style={styles.sectionTitle}>Today Overview</Text>
        <View style={styles.statsRow}>
          <StatCard icon="🔥" value={consumed}       label="Consumed"  />
          <StatCard icon="🔥" value={remaining}       label="Remaining" />
          <StatCard icon="🎯" value={CALORIE_GOAL}    label="Goal"      />
          <StatCard icon="📊" value={`${progress}%`} label="Progress"  />
        </View>

        {/* SCAN FOOD */}
        <Text style={styles.sectionTitle}>Scan Food to Calculate Calories</Text>
        <View style={styles.scanCard}>
          <TouchableOpacity style={styles.imageBox} onPress={showImageOptions} activeOpacity={0.85}>
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.foodImage} />
                {(['tl','tr','bl','br'] as const).map(c => (
                  <View key={c} style={[styles.bracket,
                    c==='tl' ? styles.bracketTL : c==='tr' ? styles.bracketTR :
                    c==='bl' ? styles.bracketBL : styles.bracketBR
                  ]} />
                ))}
              </>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={{ fontSize: 28 }}>📷</Text>
                <Text style={styles.uploadText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.scanRight}>
            {!scanResult && !loading && (
              <>
                <Text style={styles.scanTitle}>Find calories in your food</Text>
                <Text style={styles.scanSubtitle}>Take a photo and we'll calculate calories.</Text>
                <TouchableOpacity
                  style={[styles.scanBtn, !image && styles.scanBtnDisabled]}
                  onPress={analyzeFood}
                  disabled={!image}
                  activeOpacity={0.85}
                >
                  <Ionicons name="camera" size={15} color="white" style={{ marginRight: 5 }} />
                  <Text style={styles.scanBtnText}>Scan Food</Text>
                </TouchableOpacity>
              </>
            )}

            {loading && (
              <View style={{ gap: 8 }}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>Analyzing...</Text>
                <View style={styles.shimmer} />
                <View style={[styles.shimmer, { width: '65%' }]} />
              </View>
            )}

            {scanResult && !loading && (
              <View>
                <Text style={styles.resultName} numberOfLines={2}>{scanResult.foodName}</Text>
                <Text style={styles.resultKcal}>{scanResult.totalCalories} <Text style={{ fontSize: 13 }}>kcal</Text></Text>
                <View style={styles.macroRow}>
                  {[
                    { l: 'P', v: `${scanResult.protein}g`, c: COLORS.success },
                    { l: 'C', v: `${scanResult.carbs}g`,   c: COLORS.info    },
                    { l: 'F', v: `${scanResult.fat}g`,     c: COLORS.warning },
                  ].map(m => (
                    <View key={m.l} style={[styles.macroBadge, { backgroundColor: m.c + '22' }]}>
                      <Text style={[styles.macroBadgeText, { color: m.c }]}>{m.l}: {m.v}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity onPress={resetScan} style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>↺ New Scan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* RECENT SCANS */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        {recentScans.map((s, i) => (
          <TouchableOpacity key={i} style={styles.recentItem} activeOpacity={0.85}>
            <View style={styles.recentEmoji}>
              <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recentName}>{s.name}</Text>
              <Text style={styles.recentKcal}>{s.kcal} kcal</Text>
              <Text style={styles.recentTime}>{s.time}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        ))}

        {/* NUTRIENTS */}
        <Text style={styles.sectionTitle}>Nutrients Summary</Text>
        <View style={styles.nutrientsCard}>
          <NutrientBar label="Carbohydrates" current={carbsCurrent}   total={250} color={COLORS.info}    />
          <NutrientBar label="Proteins"      current={proteinCurrent} total={100} color={COLORS.success} />
          <NutrientBar label="Fats"          current={fatCurrent}     total={70}  color={COLORS.warning} />
          <NutrientBar label="Fiber"         current={fiberCurrent}   total={30}  color={COLORS.primary} />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab.label} style={styles.navTab} onPress={() => setActiveTab(i)} activeOpacity={0.7}>
            <Ionicons name={tab.icon} size={22} color={activeTab === i ? COLORS.primary : '#aaa'} />
            <Text style={[styles.navLabel, activeTab === i && styles.navLabelActive]}>{tab.label}</Text>
            {activeTab === i && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.background,
  },
  navTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  hero: {
    borderRadius: 24, padding: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  heroLeft: { flex: 1 },
  heroHello: { fontSize: 22, fontWeight: '900', color: 'white', marginBottom: 6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', lineHeight: 19 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  scanCard: {
    backgroundColor: 'white', borderRadius: 20,
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed',
    padding: 14, flexDirection: 'row', gap: 14, marginBottom: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  imageBox: {
    width: 120, height: 118, borderRadius: 14,
    backgroundColor: COLORS.primaryLight, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  foodImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center' },
  uploadText: { fontSize: 10, color: COLORS.primary, fontWeight: '700', marginTop: 4 },
  bracket: { position: 'absolute', width: 16, height: 16, borderColor: 'white', borderWidth: 0 },
  bracketTL: { top: 6, left: 6,   borderTopWidth: 2.5, borderLeftWidth: 2.5,   borderTopLeftRadius: 4     },
  bracketTR: { top: 6, right: 6,  borderTopWidth: 2.5, borderRightWidth: 2.5,  borderTopRightRadius: 4    },
  bracketBL: { bottom: 6, left: 6,  borderBottomWidth: 2.5, borderLeftWidth: 2.5,  borderBottomLeftRadius: 4  },
  bracketBR: { bottom: 6, right: 6, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },
  scanRight: { flex: 1, justifyContent: 'center' },
  scanTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  scanSubtitle: { fontSize: 12, color: '#888', fontWeight: '600', lineHeight: 17, marginBottom: 12 },
  scanBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 11, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  scanBtnDisabled: { backgroundColor: '#ccc', shadowOpacity: 0, elevation: 0 },
  scanBtnText: { color: 'white', fontSize: 13, fontWeight: '800' },
  shimmer: { height: 12, width: '90%', backgroundColor: '#ede9ff', borderRadius: 6 },
  resultName: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  resultKcal: { fontSize: 26, fontWeight: '900', color: COLORS.primary, lineHeight: 30, marginBottom: 6 },
  macroRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 8 },
  macroBadge: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7 },
  macroBadgeText: { fontSize: 11, fontWeight: '700' },
  resetBtn: {
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  resetBtnText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '700', marginBottom: 12 },
  recentItem: {
    backgroundColor: 'white', borderRadius: 16,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  recentEmoji: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  recentName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  recentKcal: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  recentTime: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  nutrientsCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 18, marginBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  bottomNav: {
    flexDirection: 'row', backgroundColor: 'white',
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 8,
  },
  navTab: { flex: 1, alignItems: 'center', gap: 2 },
  navLabel: { fontSize: 11, fontWeight: '600', color: '#aaa' },
  navLabelActive: { color: COLORS.primary, fontWeight: '800' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 1 },
});