import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@learn_progress_v1';

type ProgressMap = Record<string, boolean>; // lessonId → completed

let cache: ProgressMap | null = null;
const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach((fn) => fn());
}

async function load(): Promise<ProgressMap> {
  if (cache !== null) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    cache = {};
  }
  return cache;
}

async function save(map: ProgressMap): Promise<void> {
  cache = map;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
  notifyAll();
}

export function useLearnProgress() {
  const [progress, setProgress] = useState<ProgressMap>(cache ?? {});

  useEffect(() => {
    let mounted = true;
    load().then((p) => { if (mounted) setProgress({ ...p }); });

    const refresh = () => { if (mounted) setProgress({ ...(cache ?? {}) }); };
    listeners.add(refresh);
    return () => {
      mounted = false;
      listeners.delete(refresh);
    };
  }, []);

  const markComplete = useCallback(async (lessonId: string) => {
    const current = await load();
    await save({ ...current, [lessonId]: true });
  }, []);

  const markIncomplete = useCallback(async (lessonId: string) => {
    const current = await load();
    const next = { ...current };
    delete next[lessonId];
    await save(next);
  }, []);

  const isCompleted = useCallback(
    (lessonId: string) => progress[lessonId] === true,
    [progress],
  );

  const completedCount = useCallback(
    (lessonIds: string[]) => lessonIds.filter((id) => progress[id] === true).length,
    [progress],
  );

  return { progress, markComplete, markIncomplete, isCompleted, completedCount };
}
