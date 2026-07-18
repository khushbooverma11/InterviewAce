import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { getLessonById } from '@/constants/learn-data';
import type { LessonStep, MultiLangCode } from '@/constants/learn-data';

// ─── Types ────────────────────────────────────────────────────────────────────

const DIFFICULTY_COLOR = {
  Beginner: '#10b981',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
} as const;

type Lang = 'java' | 'cpp' | 'python';
const LANG_ORDER: Lang[] = ['java', 'cpp', 'python'];
const LANG_LABELS: Record<Lang, string> = { java: 'Java', cpp: 'C++', python: 'Python' };

// ─── Syntax highlighter ───────────────────────────────────────────────────────

const TOKEN_COLORS = {
  keyword:    '#569CD6',   // blue
  type:       '#4EC9B0',   // teal
  string:     '#CE9178',   // salmon
  comment:    '#6A9955',   // green
  number:     '#B5CEA8',   // light green
  annotation: '#DCDCAA',   // yellow
  default:    '#D4D4D4',   // light gray
} as const;
type TokenType = keyof typeof TOKEN_COLORS;

const JAVA_KW = new Set([
  'abstract','assert','break','case','catch','class','continue','default','do',
  'else','enum','extends','final','finally','for','if','implements','import',
  'instanceof','interface','new','null','package','private','protected','public',
  'record','return','sealed','static','super','switch','synchronized','this',
  'throw','throws','transient','true','false','try','var','void','volatile','while',
]);
const JAVA_TYPES = new Set([
  'ArrayList','Boolean','Byte','Character','CompletableFuture','Deque','Double',
  'Duration','Float','HashMap','HashSet','Instant','Integer','LinkedList','List',
  'Long','Map','Object','Optional','Queue','Set','Short','String','StringBuilder',
  'TreeMap','TreeSet','UUID','int','long','double','float','boolean','char','byte','short',
]);

const CPP_KW = new Set([
  'auto','break','case','catch','class','const','constexpr','continue','default',
  'delete','do','else','enum','explicit','false','final','for','friend','if',
  'inline','namespace','new','nullptr','operator','override','private','protected',
  'public','return','sizeof','static','struct','super','switch','template',
  'this','throw','true','try','typedef','typename','union','using','virtual',
  'void','volatile','while','include','define','ifndef','endif','pragma',
]);
const CPP_TYPES = new Set([
  'bool','char','deque','double','float','int','int64_t','list','lock_guard',
  'long','map','mutex','optional','pair','queue','set','shared_ptr','short',
  'size_t','stack','string','tuple','uint32_t','unique_ptr','unordered_map',
  'unordered_set','vector','weak_ptr','wstring',
]);

const PY_KW = new Set([
  'False','None','True','and','as','assert','async','await','break','class',
  'continue','def','del','elif','else','except','finally','for','from','global',
  'if','import','in','is','lambda','not','or','pass','raise','return','self',
  'super','try','while','with','yield','abstract','abstractmethod','classmethod',
  'dataclass','override','property','staticmethod','Protocol',
]);
const PY_TYPES = new Set([
  'ABC','Any','Callable','Counter','DefaultDict','Dict','Generator','Iterator',
  'List','Mapping','Optional','Protocol','Sequence','Set','Tuple','Type','Union',
  'bool','dict','float','frozenset','int','list','set','str','tuple',
]);

function getKw(lang: Lang) {
  if (lang === 'cpp') return CPP_KW;
  if (lang === 'python') return PY_KW;
  return JAVA_KW;
}
function getTypes(lang: Lang) {
  if (lang === 'cpp') return CPP_TYPES;
  if (lang === 'python') return PY_TYPES;
  return JAVA_TYPES;
}

interface Token { text: string; type: TokenType }

function tokenize(code: string, lang: Lang): Token[] {
  const kw = getKw(lang);
  const types = getTypes(lang);
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Block comment /* … */
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const ep = end === -1 ? code.length : end + 2;
      tokens.push({ text: code.slice(i, ep), type: 'comment' }); i = ep; continue;
    }
    // Line comment //
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const ep = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, ep), type: 'comment' }); i = ep; continue;
    }
    // Python comment #
    if (lang === 'python' && code[i] === '#') {
      const end = code.indexOf('\n', i);
      const ep = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, ep), type: 'comment' }); i = ep; continue;
    }
    // C++ preprocessor #include / #define
    if (lang === 'cpp' && code[i] === '#') {
      const end = code.indexOf('\n', i);
      const ep = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, ep), type: 'keyword' }); i = ep; continue;
    }
    // Python triple-quoted string """ or '''
    if (lang === 'python' && (code.slice(i, i + 3) === '"""' || code.slice(i, i + 3) === "'''")) {
      const q = code.slice(i, i + 3);
      const end = code.indexOf(q, i + 3);
      const ep = end === -1 ? code.length : end + 3;
      tokens.push({ text: code.slice(i, ep), type: 'string' }); i = ep; continue;
    }
    // String literal " or '
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let j = i + 1;
      while (j < code.length && code[j] !== q && code[j] !== '\n') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), type: 'string' }); i = j + 1; continue;
    }
    // Annotation @
    if (code[i] === '@') {
      let j = i + 1;
      while (j < code.length && /\w/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), type: 'annotation' }); i = j; continue;
    }
    // Number (not preceded by a word char)
    if (/[0-9]/.test(code[i]) && (i === 0 || !/\w/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9._xXaAbBcCdDeEfFLl]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), type: 'number' }); i = j; continue;
    }
    // Word
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      const type: TokenType = kw.has(word) ? 'keyword' : types.has(word) ? 'type' : 'default';
      tokens.push({ text: word, type }); i = j; continue;
    }
    tokens.push({ text: code[i], type: 'default' }); i++;
  }
  return tokens;
}

// ─── SyntaxHighlight component ────────────────────────────────────────────────

function SyntaxHighlight({ code, lang }: { code: string; lang: Lang }) {
  const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
  const tokens = tokenize(code, lang);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Text style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 20, padding: 14 }}>
        {tokens.map((tok, idx) => (
          <Text key={idx} style={{ color: TOKEN_COLORS[tok.type] }}>
            {tok.text}
          </Text>
        ))}
      </Text>
    </ScrollView>
  );
}

// ─── Language tabs ────────────────────────────────────────────────────────────

function LanguageTabs({
  available,
  selected,
  onSelect,
  accentColor,
}: {
  available: Lang[];
  selected: Lang;
  onSelect: (l: Lang) => void;
  accentColor: string;
}) {
  return (
    <View style={tabStyles.row}>
      <Text style={tabStyles.label}>LANGUAGE:</Text>
      {available.map((lang) => {
        const active = lang === selected;
        return (
          <TouchableOpacity
            key={lang}
            onPress={() => onSelect(lang)}
            activeOpacity={0.75}
            style={[
              tabStyles.tab,
              active
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : tabStyles.inactiveTab,
            ]}
          >
            <Text
              style={[
                tabStyles.tabText,
                active ? { color: '#fff', fontWeight: '700' } : tabStyles.inactiveText,
              ]}
            >
              {LANG_LABELS[lang]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginRight: 2,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
    borderColor: '#374151',
  },
  tabText: {
    fontSize: 12,
  },
  inactiveText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

// ─── StepCard ─────────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  trackColor,
  initiallyOpen,
}: {
  step: LessonStep;
  index: number;
  trackColor: string;
  initiallyOpen: boolean;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(initiallyOpen);
  const [selectedLang, setSelectedLang] = useState<Lang>('java');

  const hasMultiLang = !!(step.codeExamples);
  const availableLangs: Lang[] = hasMultiLang
    ? LANG_ORDER.filter((l) => !!step.codeExamples![l])
    : [];

  // Parse simple **bold** markdown
  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={i} style={{ fontWeight: '700', color: colors.foreground }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return (
        <Text key={i} style={{ color: colors.foreground }}>
          {part}
        </Text>
      );
    });
  }

  // Determine which lang to show (fallback to first available)
  const activeLang: Lang =
    availableLangs.includes(selectedLang) ? selectedLang : availableLangs[0] ?? 'java';
  const activeCode = hasMultiLang ? step.codeExamples![activeLang] : undefined;

  return (
    <View
      style={[
        styles.stepCard,
        {
          backgroundColor: colors.card,
          borderColor: open ? trackColor + '50' : colors.border,
        },
      ]}
    >
      {/* Step header */}
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
        style={styles.stepHeader}
      >
        <View style={[styles.stepNumBadge, { backgroundColor: trackColor + '20' }]}>
          <Text style={[styles.stepNumText, { color: trackColor }]}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      {open && (
        <View style={[styles.stepBody, { borderTopColor: colors.border }]}>
          <Text style={[styles.stepContent, { color: colors.foreground }]}>
            {renderContent(step.content)}
          </Text>

          {/* ── Multi-language code block ── */}
          {hasMultiLang && availableLangs.length > 0 && (
            <View
              style={[
                styles.multiCodeBlock,
                { backgroundColor: '#0D1117', borderColor: colors.border },
              ]}
            >
              <LanguageTabs
                available={availableLangs}
                selected={activeLang}
                onSelect={setSelectedLang}
                accentColor={trackColor}
              />
              <View style={[styles.codeDivider, { backgroundColor: colors.border }]} />
              {activeCode && <SyntaxHighlight code={activeCode} lang={activeLang} />}
            </View>
          )}

          {/* ── Legacy single-language code block ── */}
          {!hasMultiLang && step.codeExample && (
            <View
              style={[
                styles.codeBlock,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              {step.codeLanguage && (
                <View style={[styles.codeLangRow, { borderBottomColor: colors.border }]}>
                  <Feather name="code" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.codeLangText, { color: colors.mutedForeground }]}>
                    {step.codeLanguage}
                  </Text>
                </View>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text
                  style={[
                    styles.codeText,
                    { color: colors.foreground, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
                  ]}
                >
                  {step.codeExample}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const found = getLessonById(lessonId);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isCompleted, markComplete, markIncomplete } = useLearnProgress();
  const scrollRef = useRef<ScrollView>(null);

  if (!found) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Lesson not found.</Text>
      </View>
    );
  }

  const { lesson, chapter, track } = found;
  const trackColor = track.color;
  const diffColor = DIFFICULTY_COLOR[lesson.difficulty];
  const completed = isCompleted(lesson.id);

  // Prev / next lesson in same track
  const allLessons = track.chapters.flatMap((ch) => ch.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Chapter progress
  const chapterLessons = chapter.lessons.map((l) => l.id);
  const chapterDone = chapterLessons.filter((id) => isCompleted(id)).length;

  const handleToggleComplete = () => {
    if (completed) {
      markIncomplete(lesson.id);
    } else {
      markComplete(lesson.id);
      if (nextLesson) {
        setTimeout(() => {
          router.replace(`/learn/lesson/${nextLesson.id}`);
        }, 600);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: '',
          headerBackTitle: chapter.title,
          headerRight: () => (
            <View style={styles.headerProgress}>
              <Text style={[styles.headerProgressText, { color: colors.mutedForeground }]}>
                {chapterDone}/{chapterLessons.length}
              </Text>
            </View>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson meta */}
        <View style={styles.lessonMeta}>
          <Text style={[styles.chapterLabel, { color: trackColor }]}>
            {chapter.title.toUpperCase()}
          </Text>
          <Text style={[styles.lessonTitle, { color: colors.foreground }]}>
            {lesson.title}
          </Text>
          <Text style={[styles.lessonDesc, { color: colors.mutedForeground }]}>
            {lesson.description}
          </Text>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: diffColor + '18' }]}>
              <Text style={[styles.badgeText, { color: diffColor }]}>
                {lesson.difficulty}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Feather name="clock" size={11} color={colors.mutedForeground} />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                {lesson.estimatedMinutes} min
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Feather name="layers" size={11} color={colors.mutedForeground} />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                {lesson.steps.length} steps
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Steps */}
        <View style={styles.steps}>
          {lesson.steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              trackColor={trackColor}
              initiallyOpen={i === 0}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom actions bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => prevLesson && router.replace(`/learn/lesson/${prevLesson.id}`)}
            disabled={!prevLesson}
            activeOpacity={0.7}
            style={[
              styles.navBtn,
              { backgroundColor: colors.secondary, opacity: prevLesson ? 1 : 0.3 },
            ]}
          >
            <Feather name="arrow-left" size={16} color={colors.foreground} />
            <Text style={[styles.navBtnText, { color: colors.foreground }]}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleComplete}
            activeOpacity={0.85}
            style={[
              styles.completeBtn,
              { backgroundColor: completed ? colors.secondary : trackColor, flex: 1 },
            ]}
          >
            {completed ? (
              <>
                <Feather name="check-circle" size={16} color={trackColor} />
                <Text style={[styles.completeBtnText, { color: trackColor }]}>Completed</Text>
              </>
            ) : (
              <>
                <Text style={styles.completeBtnText}>Mark Complete</Text>
                <Feather name="check" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nextLesson && router.replace(`/learn/lesson/${nextLesson.id}`)}
            disabled={!nextLesson}
            activeOpacity={0.7}
            style={[
              styles.navBtn,
              { backgroundColor: colors.secondary, opacity: nextLesson ? 1 : 0.3 },
            ]}
          >
            <Text style={[styles.navBtnText, { color: colors.foreground }]}>Next</Text>
            <Feather name="arrow-right" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerProgress: { paddingRight: 4 },
  headerProgressText: { fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20, gap: 0 },
  lessonMeta: { gap: 8, marginBottom: 20 },
  chapterLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  lessonTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30 },
  lessonDesc: { fontSize: 14, lineHeight: 20 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 20 },
  steps: { gap: 10 },

  stepCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  stepNumBadge: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumText: { fontSize: 12, fontWeight: '800' },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  stepBody: {
    paddingHorizontal: 16, paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 14, gap: 12,
  },
  stepContent: { fontSize: 14, lineHeight: 22 },

  // Multi-language code block (dark, VS Code-like)
  multiCodeBlock: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  codeDivider: { height: StyleSheet.hairlineWidth },

  // Legacy single-language code block
  codeBlock: { borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  codeLangRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  codeLangText: { fontSize: 11, fontWeight: '600' },
  codeText: { fontSize: 12, lineHeight: 19, padding: 12 },

  bottomBar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  navRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
  },
  navBtnText: { fontSize: 13, fontWeight: '600' },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 13, borderRadius: 12,
  },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
