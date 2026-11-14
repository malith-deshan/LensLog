import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

// Content for the three main settings
const SETTINGS = [
  {
    key: 'iso',
    title: 'ISO',
    icon: 'sunny-outline',
    summary: "How sensitive the camera's sensor is to light.",
    details:
      'A low ISO gives clean, detailed photos but needs plenty of light. A high ISO lets you shoot in the dark, but adds grain (noise) to the image.',
    scale: [
      { value: '100', note: 'Bright sun, cleanest image' },
      { value: '400', note: 'Cloudy day or shade' },
      { value: '1600', note: 'Indoors or evening' },
      { value: '6400', note: 'Very dark, expect noise' },
    ],
    tip: 'Start at the lowest ISO that still gives you a fast enough shutter speed.',
  },
  {
    key: 'aperture',
    title: 'Aperture',
    icon: 'aperture-outline',
    summary: 'How wide the lens opening is, written as an f-number.',
    details:
      'A small f-number (f/1.8) is a wide opening: more light and a blurry background. A large f-number (f/16) is a narrow opening: less light, but more of the scene is sharp.',
    scale: [
      { value: 'f/1.8', note: 'Very blurry background (portraits)' },
      { value: 'f/4', note: 'Soft background, good sharpness' },
      { value: 'f/8', note: 'Sharp all round (general use)' },
      { value: 'f/16', note: 'Everything sharp (landscapes)' },
    ],
    tip: 'Remember: small number = big opening = more blur.',
  },
  {
    key: 'shutter',
    title: 'Shutter Speed',
    icon: 'timer-outline',
    summary: 'How long the sensor is exposed to light.',
    details:
      'A fast shutter speed freezes motion. A slow shutter speed lets light in for longer, which blurs movement and creates effects like silky water or light trails.',
    scale: [
      { value: '1/2000s', note: 'Freezes birds and sports' },
      { value: '1/250s', note: 'People walking' },
      { value: '1/60s', note: 'Slowest safe speed handheld' },
      { value: '2s+', note: 'Needs a tripod, silky water' },
    ],
    tip: 'A handy rule: handheld shutter speed should be about 1 divided by your focal length (e.g. 1/50s for a 50mm lens).',
  },
];

// Practical examples
const EXAMPLES = [
  {
    title: 'Bright sunny day',
    icon: 'sunny',
    iso: '100',
    aperture: 'f/8',
    shutter: '1/250s',
  },
  {
    title: 'Portrait with soft background',
    icon: 'person',
    iso: '200',
    aperture: 'f/2',
    shutter: '1/200s',
  },
  {
    title: 'Moving subject or sports',
    icon: 'bicycle',
    iso: '800',
    aperture: 'f/5.6',
    shutter: '1/1000s',
  },
  {
    title: 'Landscape on a tripod',
    icon: 'image',
    iso: '100',
    aperture: 'f/11',
    shutter: '1/60s',
  },
  {
    title: 'Silky waterfall',
    icon: 'water',
    iso: '100',
    aperture: 'f/16',
    shutter: '2s',
  },
  {
    title: 'Night sky and stars',
    icon: 'moon',
    iso: '3200',
    aperture: 'f/2.8',
    shutter: '20s',
  },
  {
    title: 'Indoor, low light',
    icon: 'home',
    iso: '1600',
    aperture: 'f/2.8',
    shutter: '1/100s',
  },
];

// Exposure triangle trade-offs
const TRIANGLE = [
  {
    setting: 'ISO',
    icon: 'sunny-outline',
    up: 'Brighter, but more noise',
    down: 'Cleaner, but darker',
  },
  {
    setting: 'Aperture',
    icon: 'aperture-outline',
    up: 'Small opening (high f): darker, more sharp',
    down: 'Wide opening (low f): brighter, blurry background',
  },
  {
    setting: 'Shutter',
    icon: 'timer-outline',
    up: 'Slower: brighter, but motion blur',
    down: 'Faster: darker, but frozen motion',
  },
];

export default function CameraSettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ---------- Intro ---------- */}
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Ionicons name="school" size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.introTitle}>Camera Settings Guide</Text>
        <Text style={styles.introText}>
          Three settings control how bright your photo is and how it looks.
          Learn them once and you can shoot in any situation.
        </Text>
      </View>

      {/* ---------- ISO, Aperture, Shutter ---------- */}
      {SETTINGS.map((item) => (
        <View key={item.key} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name={item.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>

          <Text style={styles.summary}>{item.summary}</Text>
          <Text style={styles.body}>{item.details}</Text>

          <View style={styles.scale}>
            {item.scale.map((row) => (
              <View key={row.value} style={styles.scaleRow}>
                <View style={styles.valueChip}>
                  <Text style={styles.valueChipText}>{row.value}</Text>
                </View>
                <Text style={styles.scaleNote}>{row.note}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.primary} />
            <Text style={styles.tipText}>{item.tip}</Text>
          </View>
        </View>
      ))}

      {/* ---------- Exposure triangle ---------- */}
      <Text style={styles.sectionTitle}>The Exposure Triangle</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          ISO, aperture, and shutter speed work together. Change one and the
          photo gets brighter or darker, so you must balance it with another.
        </Text>

        {/* Simple triangle diagram built from three labelled points */}
        <View style={styles.triangle}>
          <View style={styles.triangleTop}>
            <View style={styles.trianglePoint}>
              <Text style={styles.trianglePointText}>Aperture</Text>
            </View>
          </View>
          <View style={styles.triangleBottom}>
            <View style={styles.trianglePoint}>
              <Text style={styles.trianglePointText}>ISO</Text>
            </View>
            <View style={styles.triangleCenter}>
              <Text style={styles.triangleCenterText}>Exposure</Text>
            </View>
            <View style={styles.trianglePoint}>
              <Text style={styles.trianglePointText}>Shutter</Text>
            </View>
          </View>
        </View>

        {TRIANGLE.map((row) => (
          <View key={row.setting} style={styles.triangleRow}>
            <View style={styles.triangleRowHeader}>
              <Ionicons name={row.icon} size={18} color={COLORS.primary} />
              <Text style={styles.triangleSetting}>{row.setting}</Text>
            </View>
            <View style={styles.trade}>
              <Ionicons name="arrow-up" size={14} color={COLORS.primary} />
              <Text style={styles.tradeText}>{row.up}</Text>
            </View>
            <View style={styles.trade}>
              <Ionicons name="arrow-down" size={14} color={COLORS.muted} />
              <Text style={styles.tradeText}>{row.down}</Text>
            </View>
          </View>
        ))}

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={18} color={COLORS.primary} />
          <Text style={styles.tipText}>
            Example: you open the aperture one step (more light). To keep the
            same brightness, use a faster shutter speed or a lower ISO.
          </Text>
        </View>
      </View>

      {/* ---------- Practical examples ---------- */}
      <Text style={styles.sectionTitle}>Practical Examples</Text>
      <Text style={styles.sectionHint}>
        Good starting points. Adjust them to your light.
      </Text>
      {EXAMPLES.map((ex) => (
        <View key={ex.title} style={styles.exampleCard}>
          <View style={styles.exampleHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name={ex.icon} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.exampleTitle}>{ex.title}</Text>
          </View>
          <View style={styles.exampleValues}>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleValue}>{ex.iso}</Text>
              <Text style={styles.exampleLabel}>ISO</Text>
            </View>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleValue}>{ex.aperture}</Text>
              <Text style={styles.exampleLabel}>Aperture</Text>
            </View>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleValue}>{ex.shutter}</Text>
              <Text style={styles.exampleLabel}>Shutter</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },

  // Intro
  intro: { alignItems: 'center', marginBottom: 20 },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  introText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
  },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  summary: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  body: { color: COLORS.white, fontSize: 14, lineHeight: 22 },

  // Scale rows
  scale: { marginTop: 14 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  valueChip: {
    minWidth: 74,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginRight: 12,
  },
  valueChipText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  scaleNote: { flex: 1, color: COLORS.muted, fontSize: 13 },

  // Tip box
  tipBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  tipText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 10,
  },

  // Section headings
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionHint: { color: COLORS.muted, fontSize: 13, marginBottom: 12 },

  // Exposure triangle diagram
  triangle: { alignItems: 'center', marginVertical: 18 },
  triangleTop: { alignItems: 'center' },
  triangleBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
  },
  trianglePoint: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  trianglePointText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
  triangleCenter: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  triangleCenterText: { color: COLORS.muted, fontSize: 12 },

  triangleRow: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  triangleRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  triangleSetting: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  trade: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  tradeText: { flex: 1, color: COLORS.muted, fontSize: 13, marginLeft: 8 },

  // Examples
  exampleCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  exampleHeader: { flexDirection: 'row', alignItems: 'center' },
  exampleTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  exampleValues: { flexDirection: 'row', marginTop: 12, marginHorizontal: -4 },
  exampleBox: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  exampleValue: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  exampleLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
});