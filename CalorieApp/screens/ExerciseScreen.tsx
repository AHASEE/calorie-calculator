// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   StyleSheet, Linking, ActivityIndicator,
//   Image, RefreshControl,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { COLORS } from '../constants/theme';

// const ARTICLES = [
//   {
//     title: "10 Best Foods for Weight Loss",
//     description: "Discover the top foods that can help you lose weight naturally and stay healthy.",
//     url: "https://www.healthline.com/nutrition/weight-loss-foods",
//     image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
//     source: "Healthline",
//   },
//   {
//     title: "How Many Calories Should You Eat Per Day?",
//     description: "Calorie needs vary by age, sex, height, weight, and physical activity level.",
//     url: "https://www.healthline.com/nutrition/how-many-calories-per-day",
//     image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
//     source: "Healthline",
//   },
//   {
//     title: "7 Benefits of High-Intensity Interval Training",
//     description: "HIIT workouts are one of the most efficient ways to burn fat and improve fitness.",
//     url: "https://www.healthline.com/nutrition/benefits-of-hiit",
//     image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400",
//     source: "WebMD",
//   },
//   {
//     title: "The Importance of Protein in Your Diet",
//     description: "Protein is essential for muscle building, weight loss, and overall health.",
//     url: "https://www.healthline.com/nutrition/10-reasons-to-eat-more-protein",
//     image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
//     source: "Medical News",
//   },
//   {
//     title: "Best Morning Exercises to Start Your Day",
//     description: "Starting your day with exercise can boost energy and improve mood all day long.",
//     url: "https://www.healthline.com/health/fitness-exercise/morning-exercises",
//     image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
//     source: "Fitness Magazine",
//   },
// ];

// const VIDEOS = [
//   {
//     videoId: "ml6cT4AZdqI",
//     title: "Full Body Workout for Beginners",
//     channel: "FitnessBlender",
//     thumbnail: "https://img.youtube.com/vi/ml6cT4AZdqI/mqdefault.jpg",
//   },
//   {
//     videoId: "UItWltVZZmE",
//     title: "What I Eat in a Day - Healthy Meal Plan",
//     channel: "Healthy Eating",
//     thumbnail: "https://img.youtube.com/vi/UItWltVZZmE/mqdefault.jpg",
//   },
//   {
//     videoId: "cbKkB3POqaY",
//     title: "10 Minute Morning Yoga for Energy",
//     channel: "Yoga With Adriene",
//     thumbnail: "https://img.youtube.com/vi/cbKkB3POqaY/mqdefault.jpg",
//   },
//   {
//     videoId: "v7AYKMP6rOE",
//     title: "High Protein Meal Prep for the Week",
//     channel: "Nutrition Made Simple",
//     thumbnail: "https://img.youtube.com/vi/v7AYKMP6rOE/mqdefault.jpg",
//   },
// ];

// export default function ExerciseScreen() {
//   const [tab, setTab] = useState<'articles' | 'videos'>('articles');
//   const [refreshing, setRefreshing] = useState(false);

//   const onRefresh = () => {
//     setRefreshing(true);
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Health Hub 💪</Text>
//         <Text style={styles.subtitle}>Articles & workout videos</Text>
//       </View>

//       <View style={styles.tabRow}>
//         <TouchableOpacity
//           style={[styles.tab, tab === 'articles' && styles.tabActive]}
//           onPress={() => setTab('articles')}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="newspaper" size={15} color={tab === 'articles' ? 'white' : COLORS.primary} />
//           <Text style={[styles.tabText, tab === 'articles' && styles.tabTextActive]}>Articles</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, tab === 'videos' && styles.tabActive]}
//           onPress={() => setTab('videos')}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="logo-youtube" size={15} color={tab === 'videos' ? 'white' : COLORS.primary} />
//           <Text style={[styles.tabText, tab === 'videos' && styles.tabTextActive]}>Videos</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scroll}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
//       >
//         {tab === 'articles' && ARTICLES.map((a, i) => (
//           <TouchableOpacity
//             key={i}
//             style={styles.card}
//             onPress={() => Linking.openURL(a.url).catch(() => {})}
//             activeOpacity={0.85}
//           >
//             <Image source={{ uri: a.image }} style={styles.cardImage} resizeMode="cover" />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardSource}>{a.source}</Text>
//               <Text style={styles.cardTitle} numberOfLines={2}>{a.title}</Text>
//               <Text style={styles.cardDesc} numberOfLines={2}>{a.description}</Text>
//               <View style={styles.readMore}>
//                 <Text style={styles.readMoreText}>Read more</Text>
//                 <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
//               </View>
//             </View>
//           </TouchableOpacity>
//         ))}

//         {tab === 'videos' && VIDEOS.map((v, i) => (
//           <TouchableOpacity
//             key={i}
//             style={styles.card}
//             onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${v.videoId}`).catch(() => {})}
//             activeOpacity={0.85}
//           >
//             <View style={styles.thumbContainer}>
//               <Image source={{ uri: v.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
//               <View style={styles.playBtn}>
//                 <Ionicons name="play" size={20} color="white" />
//               </View>
//             </View>
//             <View style={styles.cardBody}>
//               <Text style={styles.cardTitle} numberOfLines={2}>{v.title}</Text>
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
//                 <Ionicons name="logo-youtube" size={14} color="#FF0000" />
//                 <Text style={styles.cardSource}>{v.channel}</Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         ))}

//         <View style={{ height: 20 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background },
//   header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
//   title: { fontSize: 24, fontWeight: '900', color: COLORS.text },
//   subtitle: { fontSize: 13, color: '#888', fontWeight: '600', marginTop: 2 },
//   tabRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
//   tab: {
//     flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
//     gap: 6, paddingVertical: 10, borderRadius: 12,
//     backgroundColor: COLORS.primaryLight,
//     borderWidth: 1, borderColor: COLORS.primary,
//   },
//   tabActive: { backgroundColor: COLORS.primary },
//   tabText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
//   tabTextActive: { color: 'white' },
//   scroll: { paddingHorizontal: 16 },
//   card: {
//     backgroundColor: 'white', borderRadius: 18, marginBottom: 16,
//     overflow: 'hidden',
//     shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
//   },
//   cardImage: { width: '100%', height: 160 },
//   cardBody: { padding: 14 },
//   cardSource: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
//   cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, lineHeight: 22, marginBottom: 6 },
//   cardDesc: { fontSize: 13, color: '#888', lineHeight: 19, marginBottom: 8 },
//   readMore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   readMoreText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
//   thumbContainer: { position: 'relative' },
//   thumbnail: { width: '100%', height: 180 },
//   playBtn: {
//     position: 'absolute', top: '50%', left: '50%',
//     marginTop: -24, marginLeft: -24,
//     width: 48, height: 48, borderRadius: 24,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     alignItems: 'center', justifyContent: 'center',
//   },
// });