import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { API_URL } from '../constants/api';

interface Scan {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_size: string;
  scanned_at: string;
}

interface DayGroup {
  date: string;
  label: string;
  scans: Scan[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface Props {
  token: string;
  dailyGoal: number;
}

// Date ko readable label mein convert karo
const getDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// Goal status
const getGoalStatus = (calories: number, goal: number) => {
  const ratio = calories / goal;
  if (calories === 0) return { icon: '❌', color: '#ccc', label: 'No data' };
  if (ratio <= 1.05) return { icon: '✅', color: '#4CAF50', label: 'Goal met' };
  if (ratio <= 1.2)  return { icon: '⚠️', color: '#FF9800', label: 'Slightly over' };
  return { icon: '🔴', color: '#F44336', label: 'Over goal' };
};

export default function HistoryScreen({ token, dailyGoal }: Props) {
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Scans ko 7 din ke groups mein organize karo
  const organizeScans = (scans: Scan[]): DayGroup[] => {
    const groups: Record<string, DayGroup> = {};

    // Last 7 din ke empty groups banao
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      groups[dateKey] = {
        date: dateKey,
        label: getDateLabel(date.toISOString()),
        scans: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }

    // Scans ko groups mein daalo
    scans.forEach(scan => {
      const dateKey = new Date(scan.scanned_at).toISOString().split('T')[0];
      if (groups[dateKey]) {
        groups[dateKey].scans.push(scan);
        groups[dateKey].totalCalories += scan.calories || 0;
        groups[dateKey].totalProtein  += scan.protein  || 0;
        groups[dateKey].totalCarbs    += scan.carbs    || 0;
        groups[dateKey].totalFat      += scan.fat      || 0;
      }
    });

    // Sort by date descending
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  };

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/scans/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.scans) {
        setDayGroups(organizeScans(data.scans));
      }
    } catch (e) {
      console.log('History fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleDelete = (scanId: string, dayDate: string) => {
    Alert.alert('Delete Scan', 'Yeh scan delete karna chahte hain?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await fetch(`${API_URL}/api/scans/${scanId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            // Local state update
            setDayGroups(prev => prev.map(day => {
              if (day.date !== dayDate) return day;
              const updatedScans = day.scans.filter(s => s.id !== scanId);
              return {
                ...day,
                scans: updatedScans,
                totalCalories: updatedScans.reduce((sum, s) => sum + s.calories, 0),
                totalProtein:  updatedScans.reduce((sum, s) => sum + s.protein,  0),
                totalCarbs:    updatedScans.reduce((sum, s) => sum + s.carbs,    0),
                totalFat:      updatedScans.reduce((sum, s) => sum + s.fat,      0),
              };
            }));
          } catch (e) {
            Alert.alert('Error', 'Delete nahi hua — dobara try karein');
          }
        },
      },
    ]);
  };

  // Weekly summary calculate karo
  const weeklyAvg = dayGroups.length > 0
    ? Math.round(dayGroups.filter(d => d.totalCalories > 0).reduce((sum, d) => sum + d.totalCalories, 0) / Math.max(dayGroups.filter(d => d.totalCalories > 0).length, 1))
    : 0;

  const goalsMetCount = dayGroups.filter(d => d.totalCalories > 0 && d.totalCalories <= dailyGoal * 1.05).length;

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingTxt}>History load ho rahi hai...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 History</Text>
        <Text style={styles.headerSub}>Last 7 days</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Weekly Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Week Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{weeklyAvg}</Text>
              <Text style={styles.summaryLabel}>Avg kcal/day</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{dailyGoal}</Text>
              <Text style={styles.summaryLabel}>Daily Goal</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>{goalsMetCount}/7</Text>
              <Text style={styles.summaryLabel}>Goals Met</Text>
            </View>
          </View>
        </View>

        {/* 7 Day List */}
        <View style={styles.section}>
          {dayGroups.map((day) => {
            const status = getGoalStatus(day.totalCalories, dailyGoal);
            const isExpanded = expandedDay === day.date;
            const progressWidth = Math.min((day.totalCalories / dailyGoal) * 100, 100);

            return (
              <View key={day.date} style={styles.dayCard}>
                {/* Day Header */}
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => setExpandedDay(isExpanded ? null : day.date)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dayLeft}>
                    <Text style={styles.dayLabel}>{day.label}</Text>
                    <Text style={styles.dayDate}>{new Date(day.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}</Text>
                  </View>

                  <View style={styles.dayRight}>
                    {day.totalCalories > 0 ? (
                      <>
                        <Text style={styles.dayKcal}>{day.totalCalories} kcal</Text>
                        <Text style={styles.dayScanCount}>{day.scans.length} scans</Text>
                      </>
                    ) : (
                      <Text style={styles.noData}>No data</Text>
                    )}
                    <Text style={styles.statusIcon}>{status.icon}</Text>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#aaa" />
                  </View>
                </TouchableOpacity>

                {/* Progress Bar */}
                {day.totalCalories > 0 && (
                  <View style={styles.progressWrap}>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${progressWidth}%`, backgroundColor: status.color }]} />
                    </View>
                    <Text style={[styles.progressTxt, { color: status.color }]}>
                      {Math.round(progressWidth)}% of goal
                    </Text>
                  </View>
                )}

                {/* Macros Row */}
                {day.totalCalories > 0 && (
                  <View style={styles.macrosRow}>
                    {[
                      { l: 'P', v: Math.round(day.totalProtein), c: COLORS.success },
                      { l: 'C', v: Math.round(day.totalCarbs),   c: COLORS.info    },
                      { l: 'F', v: Math.round(day.totalFat),     c: COLORS.warning },
                    ].map(m => (
                      <View key={m.l} style={[styles.macroBadge, { backgroundColor: m.c + '22' }]}>
                        <Text style={[styles.macroBadgeTxt, { color: m.c }]}>{m.l}: {m.v}g</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Expanded — individual scans */}
                {isExpanded && (
                  <View style={styles.scansWrap}>
                    {day.scans.length === 0 ? (
                      <Text style={styles.noScans}>Is din koi scan nahi tha 🍽️</Text>
                    ) : (
                      day.scans.map(scan => (
                        <View key={scan.id} style={styles.scanItem}>
                          <View style={styles.scanEmoji}>
                            <Text style={{ fontSize: 20 }}>🍱</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.scanName}>{scan.food_name}</Text>
                            <Text style={styles.scanTime}>
                              {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {scan.serving_size ? ` • ${scan.serving_size}` : ''}
                            </Text>
                          </View>
                          <Text style={styles.scanKcal}>{scan.calories} kcal</Text>
                          <TouchableOpacity onPress={() => handleDelete(scan.id, day.date)} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={16} color="#FF5252" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt: { color: '#888', fontSize: 14 },

  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },

  summaryCard: { margin: 16, backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  summaryTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: '600' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },

  section: { paddingHorizontal: 16 },

  dayCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  dayLeft: { flex: 1 },
  dayLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  dayDate: { fontSize: 12, color: '#aaa', marginTop: 2 },
  dayRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayKcal: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  dayScanCount: { fontSize: 11, color: '#aaa' },
  noData: { fontSize: 13, color: '#ccc', fontWeight: '600' },
  statusIcon: { fontSize: 16 },

  progressWrap: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBg: { flex: 1, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressTxt: { fontSize: 11, fontWeight: '700', minWidth: 70 },

  macrosRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  macroBadge: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  macroBadgeTxt: { fontSize: 11, fontWeight: '700' },

  scansWrap: { borderTopWidth: 1, borderTopColor: '#f5f5f5', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  noScans: { color: '#ccc', fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  scanItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8f8f8' },
  scanEmoji: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  scanName: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  scanTime: { fontSize: 11, color: '#aaa', marginTop: 2 },
  scanKcal: { fontSize: 13, fontWeight: '900', color: COLORS.primary },
  deleteBtn: { padding: 6 },
});