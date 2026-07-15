import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import {
  DSA_CATEGORIES,
  LLD_CATEGORIES,
  ALL_CATEGORIES,
  DIFFICULTY_ORDER,
  type PracticeCategory,
  type PracticeQuestion,
} from '@/constants/practice-data';

const SOLVED_KEY = 'practice_solved_v1';

function useSolvedQuestions() {
  const [solved, setSolved] = useState<Set<string>>(() => new Set());
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(SOLVED_KEY).then((raw) => {
      if (raw) {
        try {
          setSolved(new Set(JSON.parse(raw) as string[]));
        } catch {
          // ignore parse errors
        }
      }
      setLoaded(true);
    });
  }, []);

  const toggleSolved = useCallback(async (id: string) => {
    setSolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      AsyncStorage.setItem(SOLVED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { solved, toggleSolved, loaded };
}

const DIFFICULTY_COLOR = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
} as const;

type FilterDiff = 'All' | 'Easy' | 'Medium' | 'Hard';
type TabType = 'dsa' | 'lld';

function QuestionModal({
  question,
  category,
  isSolved,
  onToggle,
  onClose,
}: {
  question: PracticeQuestion;
  category: PracticeCategory;
  isSolved: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const diffColor = DIFFICULTY_COLOR[question.difficulty];
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggle = (key: string) =>
    setExpandedSection((prev) => (prev === key ? null : key));

  const sections = [
    { key: 'problem', label: 'Problem Statement', content: question.problemStatement },
    { key: 'approach', label: 'Approach', content: question.approach },
    {
      key: 'hints',
      label: 'Interview Hints',
      content: question.hints.map((h, i) => `${i + 1}. ${h}`).join('\n\n'),
    },
    {
      key: 'complexity',
      label: 'Complexity',
      content: `Time: ${question.timeComplexity}\n\nSpace: ${question.spaceComplexity}`,
    },
  ];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Modal header */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={styles.modalTitleBlock}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={2}>
              {question.title}
            </Text>
            <View style={styles.modalBadgeRow}>
              <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
                <Text style={[styles.diffBadgeText, { color: diffColor }]}>{question.difficulty}</Text>
              </View>
              <View style={[styles.catBadge, { backgroundColor: category.color + '15' }]}>
                <Text style={[styles.catBadgeText, { color: category.color }]}>{category.title}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
              {question.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
          {sections.map((sec) => (
            <View key={sec.key} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => toggle(sec.key)}
                activeOpacity={0.8}
                style={styles.sectionHeader}
              >
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{sec.label}</Text>
                <Feather
                  name={expandedSection === sec.key ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
              {expandedSection === sec.key && (
                <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
                  <Text style={[styles.sectionContent, { color: colors.foreground }]}>{sec.content}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Mark solved button */}
        <View style={[styles.modalFooter, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: 24 }]}>
          <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.85}
            style={[
              styles.solveBtn,
              { backgroundColor: isSolved ? colors.secondary : '#10b981' },
            ]}
          >
            <Feather name={isSolved ? 'x-circle' : 'check-circle'} size={18} color={isSolved ? colors.mutedForeground : '#fff'} />
            <Text style={[styles.solveBtnText, { color: isSolved ? colors.mutedForeground : '#fff' }]}>
              {isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function QuestionCard({
  question,
  category,
  isSolved,
  onPress,
}: {
  question: PracticeQuestion;
  category: PracticeCategory;
  isSolved: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const diffColor = DIFFICULTY_COLOR[question.difficulty];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.questionCard,
        {
          backgroundColor: colors.card,
          borderColor: isSolved ? '#10b98130' : colors.border,
        },
      ]}
    >
      {/* Left accent */}
      <View style={[styles.cardAccent, { backgroundColor: isSolved ? '#10b981' : category.color }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text
            style={[styles.cardTitle, { color: isSolved ? colors.mutedForeground : colors.foreground }]}
            numberOfLines={2}
          >
            {question.title}
          </Text>
          {isSolved && (
            <Feather name="check-circle" size={16} color="#10b981" style={{ marginLeft: 8, flexShrink: 0 }} />
          )}
        </View>
        <View style={styles.cardMetaRow}>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + '18' }]}>
            <Text style={[styles.diffBadgeText, { color: diffColor }]}>{question.difficulty}</Text>
          </View>
          <View style={styles.cardTags}>
            {question.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={[styles.tagSmall, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagSmallText, { color: colors.mutedForeground }]}>{tag}</Text>
              </View>
            ))}
            {question.tags.length > 2 && (
              <Text style={[styles.moreTagsText, { color: colors.mutedForeground }]}>
                +{question.tags.length - 2}
              </Text>
            )}
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ flexShrink: 0 }} />
    </TouchableOpacity>
  );
}

function CategorySection({
  category,
  solved,
  diffFilter,
  onQuestion,
}: {
  category: PracticeCategory;
  solved: Set<string>;
  diffFilter: FilterDiff;
  onQuestion: (q: PracticeQuestion, cat: PracticeCategory) => void;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const filtered = category.questions.filter(
    (q) => diffFilter === 'All' || q.difficulty === diffFilter,
  );
  if (filtered.length === 0) return null;

  const solvedCount = filtered.filter((q) => solved.has(q.id)).length;

  return (
    <View style={[styles.catSection, { borderColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        style={[styles.catHeader, { backgroundColor: colors.card }]}
      >
        <View style={[styles.catIconBg, { backgroundColor: category.color + '20' }]}>
          <Feather name={category.icon as any} size={16} color={category.color} />
        </View>
        <View style={styles.catTitleBlock}>
          <Text style={[styles.catTitle, { color: colors.foreground }]}>{category.title}</Text>
          <Text style={[styles.catMeta, { color: colors.mutedForeground }]}>
            {solvedCount}/{filtered.length} solved
          </Text>
        </View>
        {/* Progress pip */}
        <View style={[styles.catProgress, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.catProgressFill,
              {
                backgroundColor: category.color,
                width: filtered.length > 0 ? `${(solvedCount / filtered.length) * 100}%` : '0%',
              },
            ]}
          />
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.catQuestions, { borderTopColor: colors.border }]}>
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              category={category}
              isSolved={solved.has(q.id)}
              onPress={() => onQuestion(q, category)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { solved, toggleSolved, loaded } = useSolvedQuestions();

  const [activeTab, setActiveTab] = useState<TabType>('dsa');
  const [diffFilter, setDiffFilter] = useState<FilterDiff>('All');
  const [selectedQuestion, setSelectedQuestion] = useState<{
    question: PracticeQuestion;
    category: PracticeCategory;
  } | null>(null);

  const categories = activeTab === 'dsa' ? DSA_CATEGORIES : LLD_CATEGORIES;

  const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0);
  const solvedQuestions = categories.reduce(
    (sum, c) => sum + c.questions.filter((q) => solved.has(q.id)).length,
    0,
  );

  const DIFF_FILTERS: FilterDiff[] = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Practice</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {solvedQuestions}/{totalQuestions} solved
          </Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={[styles.segmented, { borderBottomColor: colors.border }]}>
        {(['dsa', 'lld'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
            style={[
              styles.segTab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.segTabText,
                { color: activeTab === tab ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab === 'dsa' ? 'DSA' : 'Low-Level Design'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Difficulty filter */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {DIFF_FILTERS.map((f) => {
            const isActive = diffFilter === f;
            const color = f === 'All' ? colors.primary : DIFFICULTY_COLOR[f as Exclude<FilterDiff, 'All'>];
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setDiffFilter(f)}
                activeOpacity={0.7}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? (f === 'All' ? colors.primary : DIFFICULTY_COLOR[f as Exclude<FilterDiff, 'All'>]) : colors.secondary,
                    borderColor: isActive ? 'transparent' : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: isActive ? '#fff' : colors.mutedForeground }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category list */}
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategorySection
            category={item}
            solved={solved}
            diffFilter={diffFilter}
            onQuestion={(q, cat) => setSelectedQuestion({ question: q, category: cat })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No questions match this filter.
            </Text>
          </View>
        }
      />

      {/* Question detail modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion.question}
          category={selectedQuestion.category}
          isSolved={solved.has(selectedQuestion.question.id)}
          onToggle={() => toggleSolved(selectedQuestion.question.id)}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 2 },
  segmented: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  segTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segTabText: { fontSize: 13, fontWeight: '600' },
  filterRow: { borderBottomWidth: StyleSheet.hairlineWidth, height: 50, justifyContent: 'center' },
  filterScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  // Category section
  catSection: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  catIconBg: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catTitleBlock: { flex: 1 },
  catTitle: { fontSize: 14, fontWeight: '700' },
  catMeta: { fontSize: 11, marginTop: 1 },
  catProgress: { width: 40, height: 4, borderRadius: 100, overflow: 'hidden' },
  catProgressFill: { height: '100%', borderRadius: 100 },
  catQuestions: { borderTopWidth: StyleSheet.hairlineWidth, padding: 10, gap: 8 },
  // Question card
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 12, gap: 6 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitle: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  diffBadgeText: { fontSize: 10, fontWeight: '700' },
  cardTags: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  tagSmall: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  tagSmallText: { fontSize: 10, fontWeight: '500' },
  moreTagsText: { fontSize: 10 },
  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  closeBtn: { alignSelf: 'flex-start', padding: 4 },
  modalTitleBlock: { gap: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', lineHeight: 26 },
  modalBadgeRow: { flexDirection: 'row', gap: 8 },
  catBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  catBadgeText: { fontSize: 11, fontWeight: '600' },
  tagScroll: {},
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, marginRight: 6 },
  tagText: { fontSize: 11, fontWeight: '500' },
  modalBody: { padding: 16, gap: 10, paddingBottom: 40 },
  sectionCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  sectionLabel: { fontSize: 14, fontWeight: '700' },
  sectionBody: { borderTopWidth: StyleSheet.hairlineWidth, padding: 14 },
  sectionContent: { fontSize: 14, lineHeight: 22 },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  solveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  solveBtnText: { fontSize: 15, fontWeight: '700' },
});
