import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Pregnancy, Moment, Milestone, MomentOrigin } from '../types/pregnancy';
import { BabyProfile } from '../types';
import { loadJSON } from '../utils/storage';
import { loadPregnancyMeta, savePregnancyMeta } from '../utils/pregnancyStorage';
import * as momentsStore from '../utils/momentsStore';
import * as milestonesStore from '../utils/milestonesStore';
import { generateMilestones } from '../utils/milestones';

const LEGACY_KEY = 'mommy_pregnancies';

const defaultDueDate = new Date();
defaultDueDate.setMonth(defaultDueDate.getMonth() + 6);
const defaultStartDate = new Date(defaultDueDate);
defaultStartDate.setDate(defaultStartDate.getDate() - 280);

interface PregnancyContextType {
  pregnancies: Pregnancy[];
  currentPregnancy: Pregnancy | null;
  selectedPregnancyId: string | null;
  setSelectedPregnancyId: (id: string | null) => void;
  /** ONLY call from + Add Moment button with origin "manual". For milestone memories use updateMilestoneWithMoment. */
  addMoment: (moment: Omit<Moment, 'id' | 'type' | 'origin'>, origin?: MomentOrigin) => void;
  linkMomentToMilestone: (momentId: string, milestoneId: string) => void;
  /** Adds memory inside milestone — creates moment with origin "milestone" (never appears in Your Moments). */
  updateMilestoneWithMoment: (milestoneId: string, moment: Omit<Moment, 'id' | 'type' | 'origin'>) => void;
  archiveCurrentPregnancy: () => void;
  createNewPregnancy: (profile?: BabyProfile) => void;
  updateCurrentPregnancy: (updates: Partial<Pick<Pregnancy, 'dueDate' | 'startDate'>>) => void;
  getMomentById: (id: string) => Moment | null;
  getMomentsByMilestoneId: (milestoneId: string) => Moment[];
  /** ONLY manual moments — for "Your Moments" screen. Never includes milestone-origin moments. */
  getManualMoments: () => Moment[];
  removeMoment: (id: string) => void;
  restoreMoment: (moment: Moment) => void;
  updateMoment: (momentId: string, updates: Partial<Pick<Moment, 'imageUri' | 'note' | 'title' | 'createdAt'>>) => void;
  unlinkMomentFromMilestone: (momentId: string, milestoneId: string) => void;
  isLoaded: boolean;
}

const PregnancyContext = createContext<PregnancyContextType>({
  pregnancies: [],
  currentPregnancy: null,
  selectedPregnancyId: null,
  setSelectedPregnancyId: () => {},
  addMoment: () => {},
  linkMomentToMilestone: () => {},
  updateMilestoneWithMoment: () => {},
  archiveCurrentPregnancy: () => {},
  createNewPregnancy: () => {},
  updateCurrentPregnancy: () => {},
  getMomentById: () => null,
  getMomentsByMilestoneId: () => [],
  getManualMoments: () => [],
  removeMoment: () => {},
  restoreMoment: () => {},
  updateMoment: () => {},
  unlinkMomentFromMilestone: () => {},
  isLoaded: false,
});

export function PregnancyProvider({
  children,
  profile,
  profileLoaded = true,
}: {
  children: React.ReactNode;
  profile: BabyProfile;
  profileLoaded?: boolean;
}) {
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [selectedPregnancyId, setSelectedPregnancyId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const persistMeta = useCallback(async (meta: { id: string; startDate: string; dueDate: string; status: 'active' | 'archived' }[]) => {
    await savePregnancyMeta(meta);
  }, []);

  useEffect(() => {
    if (!profileLoaded) return;

    (async () => {
      const raw = await loadJSON<{ id: string; moments?: unknown[]; milestones?: unknown[]; startDate?: string; dueDate?: string; status?: string }[]>(LEGACY_KEY);
      const isLegacy = raw && raw.length > 0 && Array.isArray((raw[0] as { moments?: unknown }).moments);

      if (raw && raw.length > 0 && isLegacy) {
        const meta = raw.map((p) => ({
          id: p.id,
          startDate: p.startDate ?? defaultStartDate.toISOString(),
          dueDate: p.dueDate ?? defaultDueDate.toISOString(),
          status: (p.status as 'active' | 'archived') ?? 'active',
        }));
        await savePregnancyMeta(meta);

        const migrated: Pregnancy[] = [];
        for (const p of raw) {
          const rawLegacy = (p.moments ?? []) as unknown[];
          const moments = rawLegacy.length > 0
            ? momentsStore.cleanMoments(rawLegacy)
            : await momentsStore.loadMoments(p.id);
          await momentsStore.saveMoments(p.id, moments);
          const milestones = await milestonesStore.loadMilestones(p.id, p.dueDate ?? defaultDueDate.toISOString());
          await milestonesStore.saveMilestones(p.id, milestones);
          const m = meta.find((x) => x.id === p.id)!;
          const status: 'active' | 'archived' = m.status === 'archived' ? 'archived' : 'active';
          migrated.push({
            id: m.id,
            startDate: m.startDate,
            dueDate: m.dueDate,
            status,
            moments,
            milestones,
          });
        }
        setPregnancies(migrated);
        const active = migrated.find((p) => p.status === 'active');
        setSelectedPregnancyId(active?.id ?? migrated[0]?.id ?? null);
      } else if (!raw || raw.length === 0) {
        const id = `pregnancy-${Date.now()}`;
        const initial: Pregnancy = {
          id,
          startDate: profile.startDate ?? defaultStartDate.toISOString(),
          dueDate: profile.dueDate ?? defaultDueDate.toISOString(),
          status: 'active',
          moments: [],
          milestones: generateMilestones(profile.dueDate ?? defaultDueDate.toISOString()),
        };
        await savePregnancyMeta([{ id: initial.id, startDate: initial.startDate, dueDate: initial.dueDate, status: initial.status }]);
        await momentsStore.saveMoments(id, []);
        await milestonesStore.saveMilestones(id, initial.milestones);
        setPregnancies([initial]);
        setSelectedPregnancyId(id);
      } else {
        const meta = raw as { id: string; startDate: string; dueDate: string; status: string }[];
        const loaded: Pregnancy[] = [];
        for (const m of meta) {
          const moments = await momentsStore.loadMoments(m.id);
          const milestones = await milestonesStore.loadMilestones(m.id, m.dueDate ?? defaultDueDate.toISOString());
          const status: 'active' | 'archived' = m.status === 'archived' ? 'archived' : 'active';
          loaded.push({
            id: m.id,
            startDate: m.startDate,
            dueDate: m.dueDate,
            status,
            moments,
            milestones,
          });
        }
        setPregnancies(loaded);
        const active = loaded.find((p) => p.status === 'active');
        setSelectedPregnancyId(active?.id ?? loaded[0]?.id ?? null);
      }
      setIsLoaded(true);
    })();
  }, [profileLoaded]);

  useEffect(() => {
    if (!isLoaded || pregnancies.length === 0) return;
    persistMeta(pregnancies.map((p) => ({ id: p.id, startDate: p.startDate, dueDate: p.dueDate, status: p.status })));
    const updated = pregnancies.map((p) => {
      const validMoments = momentsStore.validateMomentsOnly(p.moments);
      if (validMoments.length !== p.moments.length && __DEV__) {
        console.error('[PregnancyContext] GUARD: Removed milestone from moments[]');
      }
      momentsStore.saveMoments(p.id, validMoments);
      milestonesStore.saveMilestones(p.id, p.milestones);
      return validMoments.length !== p.moments.length ? { ...p, moments: validMoments } : p;
    });
    const needsUpdate = updated.some((p, i) => p !== pregnancies[i]);
    if (needsUpdate) setPregnancies(updated);
  }, [pregnancies, isLoaded, persistMeta]);

  const currentPregnancy = useMemo(() => {
    if (!selectedPregnancyId) return pregnancies.find((p) => p.status === 'active') ?? pregnancies[0] ?? null;
    return pregnancies.find((p) => p.id === selectedPregnancyId) ?? pregnancies[0] ?? null;
  }, [pregnancies, selectedPregnancyId]);

  /** ONLY + Add Moment button: origin "manual". Creates moment visible in Your Moments. */
  const addMoment = useCallback((moment: Omit<Moment, 'id' | 'type' | 'origin'>, origin: MomentOrigin = 'manual') => {
    const id = `moment-${Date.now()}`;
    const full: Moment = {
      ...moment,
      type: 'moment',
      origin,
      id,
      title: moment.title ?? moment.note ?? 'Moment',
      createdAt: moment.createdAt ?? new Date().toISOString(),
    };
    setPregnancies((prev) => {
      const currId = prev.find((p) => p.status === 'active')?.id ?? prev[0]?.id;
      if (!currId) return prev;
      return prev.map((p) =>
        p.id === currId ? { ...p, moments: [full, ...p.moments] } : p
      );
    });
  }, []);

  const linkMomentToMilestone = useCallback((momentId: string, milestoneId: string) => {
    setPregnancies((prev) =>
      prev.map((p) => {
        const mom = p.moments.find((m) => m.id === momentId);
        const prevMilestoneId = mom?.linkedMilestoneId;
        const moments = p.moments.map((m) =>
          m.id === momentId ? { ...m, linkedMilestoneId: milestoneId } : m
        );
        const milestones = p.milestones.map((m) => {
          const ids = m.linkedMomentIds ?? [];
          if (m.id === prevMilestoneId && ids.includes(momentId)) {
            return { ...m, linkedMomentIds: ids.filter((id) => id !== momentId) };
          }
          if (m.id === milestoneId && !ids.includes(momentId)) {
            return { ...m, linkedMomentIds: [...ids, momentId] };
          }
          return m;
        });
        return { ...p, moments, milestones };
      })
    );
  }, []);

  /** Adds memory inside milestone. Creates moment with origin "milestone" — NEVER appears in Your Moments. */
  const updateMilestoneWithMoment = useCallback(
    (milestoneId: string, moment: Omit<Moment, 'id' | 'type' | 'origin'>) => {
      const newMomentId = `moment-${Date.now()}`;
      const full: Moment = {
        ...moment,
        type: 'moment',
        origin: 'milestone',
        id: newMomentId,
        title: moment.title ?? moment.note ?? 'Memory',
        createdAt: moment.createdAt ?? new Date().toISOString(),
        linkedMilestoneId: milestoneId,
      };
      setPregnancies((prev) => {
        const currId = selectedPregnancyId ?? prev.find((p) => p.status === 'active')?.id ?? prev[0]?.id;
        if (!currId) return prev;
        return prev.map((p) => {
          if (p.id !== currId) return p;
          const milestones = p.milestones.map((m) =>
            m.id === milestoneId
              ? { ...m, linkedMomentIds: [...(m.linkedMomentIds ?? []), newMomentId] }
              : m
          );
          return { ...p, moments: [full, ...p.moments], milestones };
        });
      });
    },
    [selectedPregnancyId]
  );

  const archiveCurrentPregnancy = useCallback(() => {
    setPregnancies((prev) =>
      prev.map((p) => (p.status === 'active' ? { ...p, status: 'archived' as const } : p))
    );
  }, []);

  const createNewPregnancy = useCallback((fromProfile?: BabyProfile) => {
    const dueDate = fromProfile?.dueDate ?? defaultDueDate.toISOString();
    const startDate = fromProfile?.startDate ?? defaultStartDate.toISOString();
    const id = `pregnancy-${Date.now()}`;
    const newP: Pregnancy = {
      id,
      startDate,
      dueDate,
      status: 'active',
      moments: [],
      milestones: generateMilestones(dueDate),
    };
    setPregnancies((prev) => [newP, ...prev]);
    setSelectedPregnancyId(id);
  }, []);

  const updateCurrentPregnancy = useCallback((updates: Partial<Pick<Pregnancy, 'dueDate' | 'startDate'>>) => {
    setPregnancies((prev) => {
      const currId = prev.find((p) => p.status === 'active')?.id ?? prev[0]?.id;
      if (!currId) return prev;
      return prev.map((p) => {
        if (p.id !== currId) return p;
        const next = { ...p, ...updates };
        if (updates.dueDate) {
          const fresh = generateMilestones(updates.dueDate);
          const old = p.milestones;
          next.milestones = fresh.map((f) => {
            const o = old.find((m) => m.id === f.id);
            return o ? { ...f, linkedMomentIds: o.linkedMomentIds ?? [] } : f;
          });
        }
        return next;
      });
    });
  }, []);

  const getMomentById = useCallback((id: string): Moment | null => {
    for (const p of pregnancies) {
      const m = p.moments.find((mom) => mom.id === id && mom.type === 'moment');
      if (m) return m;
    }
    return null;
  }, [pregnancies]);

  const getMomentsByMilestoneId = useCallback(
    (milestoneId: string): Moment[] => {
      const curr = currentPregnancy ?? pregnancies[0];
      if (!curr) return [];
      return curr.moments.filter(
        (m) => m.type === 'moment' && m.linkedMilestoneId === milestoneId
      );
    },
    [pregnancies, currentPregnancy]
  );

  /** RENDER FIREWALL: Only manual moments for "Your Moments" screen. */
  const getManualMoments = useCallback((): Moment[] => {
    const curr = currentPregnancy ?? pregnancies[0];
    if (!curr) return [];
    return curr.moments.filter((m) => m.type === 'moment' && m.origin === 'manual');
  }, [pregnancies, currentPregnancy]);

  const removeMoment = useCallback((momentId: string) => {
    setPregnancies((prev) =>
      prev.map((p) => {
        const moments = p.moments.filter((m) => m.id !== momentId);
        const milestones = p.milestones.map((m) => ({
          ...m,
          linkedMomentIds: (m.linkedMomentIds ?? []).filter((id) => id !== momentId),
        }));
        return moments.length !== p.moments.length || JSON.stringify(milestones) !== JSON.stringify(p.milestones)
          ? { ...p, moments, milestones }
          : p;
      })
    );
  }, []);

  const restoreMoment = useCallback((moment: Moment) => {
    setPregnancies((prev) => {
      const currId = prev.find((p) => p.status === 'active')?.id ?? prev[0]?.id;
      if (!currId) return prev;
      return prev.map((p) => {
        if (p.id !== currId) return p;
        if (p.moments.some((m) => m.id === moment.id)) return p;
        const milestones = moment.linkedMilestoneId
          ? p.milestones.map((m) =>
              m.id === moment.linkedMilestoneId
                ? { ...m, linkedMomentIds: [...(m.linkedMomentIds ?? []), moment.id] }
                : m
            )
          : p.milestones;
        return { ...p, moments: [moment, ...p.moments], milestones };
      });
    });
  }, []);

  const updateMoment = useCallback((momentId: string, updates: Partial<Pick<Moment, 'imageUri' | 'note' | 'title' | 'createdAt'>>) => {
    setPregnancies((prev) =>
      prev.map((p) => ({
        ...p,
        moments: p.moments.map((m) =>
          m.id === momentId ? { ...m, ...updates } : m
        ),
      }))
    );
  }, []);

  const unlinkMomentFromMilestone = useCallback((momentId: string, milestoneId: string) => {
    setPregnancies((prev) =>
      prev.map((p) => {
        const mom = p.moments.find((m) => m.id === momentId);
        const isMilestoneOrigin = mom?.origin === 'milestone';
        const moments = isMilestoneOrigin
          ? p.moments.filter((m) => m.id !== momentId)
          : p.moments.map((m) =>
              m.id === momentId ? { ...m, linkedMilestoneId: undefined } : m
            );
        const milestones = p.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, linkedMomentIds: (m.linkedMomentIds ?? []).filter((id) => id !== momentId) }
            : m
        );
        return { ...p, moments, milestones };
      })
    );
  }, []);

  return (
    <PregnancyContext.Provider
      value={{
        pregnancies,
        currentPregnancy,
        selectedPregnancyId,
        setSelectedPregnancyId,
        addMoment,
        linkMomentToMilestone,
        updateMilestoneWithMoment,
        archiveCurrentPregnancy,
        createNewPregnancy,
        updateCurrentPregnancy,
        getMomentById,
        getMomentsByMilestoneId,
        getManualMoments,
        removeMoment,
        restoreMoment,
        updateMoment,
        unlinkMomentFromMilestone,
        isLoaded,
      }}
    >
      {children}
    </PregnancyContext.Provider>
  );
}

export function usePregnancy() {
  return useContext(PregnancyContext);
}
