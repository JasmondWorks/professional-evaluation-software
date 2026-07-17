"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Clock,
  Users,
  BarChart3,
  Calculator,
  FileText,
  Plus,
  Check,
  Trash2,
  Download,
  Info,
  X,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { getCurrentUser, getAccessToken } from "@/app/utils/auth";
import { useAuth } from "@/app/components/useAuth";
import Link from "next/link";

const CONFIDENCE_ACCURACY_MAP: Record<
  number,
  { accuracy: number; zValue: number }
> = {
  90: { accuracy: 10, zValue: 1.645 },
  95: { accuracy: 5, zValue: 2 }, // K=2 per Barnes (1968) — eq 6.3
  99: { accuracy: 1, zValue: 2.576 },
};

const MONTH_DAY_CONSTANTS: Record<number, number> = {
  1: 30,
  2: 27,
  3: 30,
  4: 29,
  5: 30,
  6: 29,
  7: 30,
  8: 30,
  9: 29,
  10: 30,
  11: 29,
  12: 30,
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Position {
  id: string; // local temp id OR db numeric id (as string)
  dbId?: number; // set once persisted
  name: string;
  department: string;
  performanceAllowance: number;
}

interface Observation {
  id: string;
  dbId?: number;
  positionId: string; // matches Position.id (local or db)
  date: string;
  time: string;
  isBusy: boolean;
  performanceRating: number;
  notes?: string;
}

interface StudyParameters {
  confidenceLevel: number;
  desiredAccuracy: number;
  preliminaryP: number;
  totalObservations: number;
  studyMonths: number[];
  studyMonth?: number;
  observationsPerDay: number;
  workingHoursPerDay: number;
  workStartTime: string;
  minCycleDuration: number;
  maxDuration: number;
  estimatedStudyDays: number;
  availableAnnualHours: number;
  defaultPerformanceAllowance: number;
}

interface StudyMeta {
  org: string;
  department: string;
  analyst: string;
}

interface AnalysisResult {
  positionId: string;
  positionName: string;
  utilizationFactor: number;
  busyCount: number;
  totalObservations: number;
  avgPerformanceRating: number;
  performanceAllowance: number;
  estimatedAnnualManHours: number;
  estimatedBasicManHours: number;
  estimatedStandardManHours: number;
}

const DEFAULT_PARAMS: StudyParameters = {
  confidenceLevel: 95,
  desiredAccuracy: 5,
  preliminaryP: 0.5,
  totalObservations: 0,
  studyMonths: [new Date().getMonth() + 1],
  observationsPerDay: 10,
  workingHoursPerDay: 8,
  workStartTime: "08:00",
  minCycleDuration: 30,
  maxDuration: 0,
  estimatedStudyDays: 0,
  availableAnnualHours: 2080,
  defaultPerformanceAllowance: 15,
};

const WorkSamplingPageInner: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role } = useAuth();
  const [samplingUseFactor, setSamplingUseFactor] = useState<number | "">("");
  const [samplingAvailableHours, setSamplingAvailableHours] = useState<
    number | ""
  >(2080);
  const [samplingCalculatedStaff, setSamplingCalculatedStaff] = useState<
    number | null
  >(null);
  const [samplingStaffError, setSamplingStaffError] = useState<string | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<
    "positions" | "parameters" | "observations" | "analysis"
  >("positions");
  const [studyDbId, setStudyDbId] = useState<number | null>(null);
  const [studyMeta, setStudyMeta] = useState<StudyMeta>({
    org: "",
    department: "",
    analyst: "",
  });
  const [positions, setPositions] = useState<Position[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [studyParameters, setStudyParameters] =
    useState<StudyParameters>(DEFAULT_PARAMS);
  const [newPosition, setNewPosition] = useState({
    name: "",
    department: "",
    performanceAllowance: 15,
  });
  const [newObservation, setNewObservation] = useState({
    positionId: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    isBusy: true,
    performanceRating: 100,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null,
  );
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  // Locked schedule — set when admin explicitly saves parameters
  const [lockedDates, setLockedDates] = useState<string[]>([]);
  const [lockedTimes, setLockedTimes] = useState<string[]>([]);
  const [paramsSaved, setParamsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    org?: string;
    dept?: string;
    role?: string;
  } | null>(null);
  // Refs to hold latest generated schedule so saveAndLockParameters can access them
  const latestScheduleDates = useRef<string[]>([]);
  const latestScheduleTimes = useRef<string[]>([]);
  const paramsSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds the latest values for use inside the debounced save — avoids stale closures
  const latestSavePayload = useRef({ studyDbId, studyParameters, studyMeta });
  // True while the initial DB load is populating state — prevents spurious auto-saves
  const isLoadingFromDb = useRef(false);

  useEffect(() => {
    if (studyParameters.availableAnnualHours) {
      setSamplingAvailableHours(studyParameters.availableAnnualHours);
    }
  }, [studyParameters.availableAnnualHours]);

  // ── Read current user from JWT and auto-fill study meta ──────────────────────
  useEffect(() => {
    const user = getCurrentUser<{
      name?: string;
      org?: string;
      dept?: string;
      role?: string;
    }>();
    if (!user) return;
    setCurrentUser(user);
    // Only pre-fill if this is a fresh study (no studyId in URL yet)
    const idParam = new URLSearchParams(window.location.search).get("studyId");
    if (!idParam) {
      setStudyMeta((prev) => ({
        ...prev,
        org: user.org ?? prev.org,
        analyst: user.name ?? prev.analyst,
      }));
    }
  }, []);

  // ── Load study from DB on mount if ?studyId= is in the URL ──────────────────
  const [studyList, setStudyList] = useState<any[]>([]);
  const [isListView, setIsListView] = useState(!searchParams.get("studyId"));
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (isListView) {
      setLoading(true);
      fetch("/api/workSampling/studies")
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setStudyList(json.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isListView]);

  const confirmDeleteStudy = async () => {
    if (deleteConfirmId === null) return;
    try {
      const res = await fetch(`/api/workSampling/studies/${deleteConfirmId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setStudyList((prev) => prev.filter((s) => s.id !== deleteConfirmId));
        setDeleteConfirmId(null);
      } else {
        alert(json.error || "Failed to delete study");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const studyIdParam = searchParams.get("studyId");
  useEffect(() => {
    // Drive the view from the URL so opening a study from the list (which only
    // changes ?studyId=) actually switches out of list view and loads it.
    if (!studyIdParam) {
      setIsListView(true);
      return;
    }
    setIsListView(false);
    // Already have this study in memory (e.g. just created it) — don't reload.
    if (String(latestSavePayload.current.studyDbId ?? "") === studyIdParam) return;

    setLoading(true);
    isLoadingFromDb.current = true;
    fetch(`/api/workSampling/studies/${studyIdParam}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const { study, positions: dbPos, observations: dbObs } = json.data;
        setStudyDbId(study.id);
        setStudyMeta({
          org: study.org ?? "",
          department: study.department ?? "",
          analyst: study.analyst ?? "",
        });
        // Restore locked schedule from DB (handle legacy integers or new date strings)
        const dbLockedDates: any[] = Array.isArray(study.lockedDates)
          ? study.lockedDates
          : [];
        const dbLockedTimes: string[] = Array.isArray(study.lockedTimes)
          ? study.lockedTimes
          : [];
        if (dbLockedDates.length > 0 || dbLockedTimes.length > 0) {
          setLockedDates(dbLockedDates);
          setLockedTimes(dbLockedTimes);
          setParamsSaved(true);
        } else if (study.estimatedStudyDays && study.estimatedStudyDays > 0) {
          // Legacy fallback — params were saved but schedule wasn't persisted
          setParamsSaved(true);
        }
        setStudyParameters((prev) => ({
          ...prev,
          confidenceLevel: study.confidenceLevel ?? prev.confidenceLevel,
          preliminaryP: study.preliminaryP ?? prev.preliminaryP,
          studyMonths:
            Array.isArray(study.studyMonths) && study.studyMonths.length > 0
              ? study.studyMonths
              : study.studyMonth
                ? [study.studyMonth]
                : prev.studyMonths,
          observationsPerDay:
            study.observationsPerDay ?? prev.observationsPerDay,
          workingHoursPerDay:
            study.workingHoursPerDay ?? prev.workingHoursPerDay,
          workStartTime: study.workStartTime ?? prev.workStartTime,
          minCycleDuration: study.minCycleDuration ?? prev.minCycleDuration,
          availableAnnualHours:
            study.availableAnnualHours ?? prev.availableAnnualHours,
          defaultPerformanceAllowance:
            study.defaultPerformanceAllowance ??
            prev.defaultPerformanceAllowance,
        }));
        const mappedPositions = dbPos.map((p: any) => ({
          id: String(p.id),
          dbId: p.id,
          name: p.name,
          department: p.department ?? "",
          performanceAllowance: p.performanceAllowance ?? 15,
        }));
        setPositions(mappedPositions);
        // Auto-select the first position if available
        if (mappedPositions.length > 0) {
          setSelectedPositionId(mappedPositions[0].id);
        }
        setObservations(
          dbObs.map((o: any) => ({
            id: String(o.id),
            dbId: o.id,
            positionId: String(o.positionId),
            date: o.date,
            time: o.time,
            isBusy: o.isBusy,
            performanceRating: o.performanceRating ?? 100,
            notes: o.notes ?? "",
          })),
        );
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        // Allow a tick for all the setStates above to flush before re-enabling auto-save
        setTimeout(() => {
          isLoadingFromDb.current = false;
        }, 100);
      });
  }, [studyIdParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived early so effects below can reference it
  const selectedPosition = useMemo(
    () => positions.find((p) => p.id === selectedPositionId) ?? null,
    [positions, selectedPositionId],
  );

  // Keep latestSavePayload in sync — merge JWT-derived fields so they're always saved
  useEffect(() => {
    const mergedMeta = {
      ...studyMeta,
      org: studyMeta.org || currentUser?.org || "",
      analyst: studyMeta.analyst || currentUser?.name || "",
      department: selectedPosition
        ? selectedPosition.department
        : studyMeta.department,
    };
    latestSavePayload.current = {
      studyDbId,
      studyParameters,
      studyMeta: mergedMeta,
    };
  }, [studyDbId, studyParameters, studyMeta, currentUser, selectedPosition]);

  // ── Auto-recalculate derived params (N, B, study days) ───────────────────────
  // NOTE: this effect only updates computed fields; the save effect below ignores
  // changes that originate from here because they set no "user-edited" flag.
  useEffect(() => {
    const mapping = CONFIDENCE_ACCURACY_MAP[studyParameters.confidenceLevel];
    if (!mapping) return;
    const { accuracy, zValue } = mapping;
    const a = accuracy / 100,
      p = studyParameters.preliminaryP,
      k = zValue;
    const N = Math.ceil((k * k * (1 - p)) / (a * a * p));
    const W_minutes = studyParameters.workingHoursPerDay * 60;
    const n = studyParameters.observationsPerDay;
    const A = studyParameters.minCycleDuration;
    const B = Math.max(0, (2 * W_minutes - n * A) / n);
    const studyDays = Math.ceil(N / n);
    setStudyParameters((prev) => ({
      ...prev,
      desiredAccuracy: accuracy,
      totalObservations: N,
      maxDuration: Math.round(B * 100) / 100,
      estimatedStudyDays: studyDays,
    }));
  }, [
    studyParameters.confidenceLevel,
    studyParameters.preliminaryP,
    studyParameters.observationsPerDay,
    studyParameters.workingHoursPerDay,
    studyParameters.minCycleDuration,
  ]);

  // Sync default PA to new-position form
  useEffect(() => {
    setNewPosition((prev) => ({
      ...prev,
      performanceAllowance: studyParameters.defaultPerformanceAllowance,
    }));
  }, [studyParameters.defaultPerformanceAllowance]);

  // Keep observation form in sync with the selected position — reset date/time so dropdowns start fresh
  useEffect(() => {
    if (selectedPositionId) {
      setNewObservation((prev) => ({
        ...prev,
        positionId: selectedPositionId,
        date: "",
        time: "",
      }));
    }
  }, [selectedPositionId]);

  // Pre-fill observation form with existing values if selected date/time changes
  useEffect(() => {
    if (selectedPositionId && newObservation.date && newObservation.time) {
      const match = observations.find(
        (o) =>
          o.positionId === selectedPositionId &&
          o.date === newObservation.date &&
          o.time === newObservation.time,
      );
      if (match) {
        setNewObservation((prev) => ({
          ...prev,
          isBusy: match.isBusy,
          performanceRating: match.performanceRating ?? 100,
          notes: match.notes ?? "",
        }));
      } else {
        setNewObservation((prev) => ({
          ...prev,
          isBusy: true,
          performanceRating: 100,
          notes: "",
        }));
      }
    }
  }, [selectedPositionId, newObservation.date, newObservation.time]); // NOT depending on observations list directly to avoid overriding user typing on save

  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const showSaved = () => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  /** Ensure a study record exists in the DB. Returns the db id. */
  const ensureStudy = useCallback(async (): Promise<number> => {
    // Read latest values from ref to avoid stale closure
    const {
      studyDbId: currentId,
      studyParameters: sp,
      studyMeta: sm,
    } = latestSavePayload.current;
    if (currentId) return currentId;
    setSaveStatus("saving");
    const res = await fetch("/api/workSampling/studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sm,
        confidenceLevel: sp.confidenceLevel,
        desiredAccuracy: sp.desiredAccuracy,
        preliminaryP: sp.preliminaryP,
        totalObservationsRequired: sp.totalObservations,
        studyMonths: sp.studyMonths,
        observationsPerDay: sp.observationsPerDay,
        workingHoursPerDay: sp.workingHoursPerDay,
        workStartTime: sp.workStartTime,
        minCycleDuration: sp.minCycleDuration,
        maxDuration: sp.maxDuration,
        estimatedStudyDays: sp.estimatedStudyDays,
        availableAnnualHours: sp.availableAnnualHours,
        defaultPerformanceAllowance: sp.defaultPerformanceAllowance,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    const newId: number = json.data.id;
    setStudyDbId(newId);
    // Update the ref immediately so subsequent calls in the same tick see it
    latestSavePayload.current = {
      ...latestSavePayload.current,
      studyDbId: newId,
    };
    router.replace(`?studyId=${newId}`, { scroll: false });
    showSaved();
    return newId;
  }, [router]); // stable — router is stable, everything else read from ref

  // ── Add position ─────────────────────────────────────────────────────────────
  const addPosition = async () => {
    if (!newPosition.name.trim() || !newPosition.department.trim()) {
      setError("Please fill in both Position Name and Department.");
      return;
    }
    const localId = `tmp_${Date.now()}`;
    const optimistic: Position = {
      id: localId,
      name: newPosition.name.trim(),
      department: newPosition.department.trim(),
      performanceAllowance: newPosition.performanceAllowance,
    };
    setPositions((prev) => {
      const updated = [...prev, optimistic];
      // Auto-select the first position added
      if (updated.length === 1) setSelectedPositionId(optimistic.id);
      return updated;
    });
    setNewPosition({
      name: "",
      department: "",
      performanceAllowance: studyParameters.defaultPerformanceAllowance,
    });
    setError(null);

    try {
      setSaveStatus("saving");
      const sid = await ensureStudy();
      const res = await fetch("/api/workSampling/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyId: sid,
          name: optimistic.name,
          department: optimistic.department,
          performanceAllowance: optimistic.performanceAllowance,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      // Replace temp id with real db id
      const dbId: number = json.data.id;
      setPositions((prev) =>
        prev.map((p) =>
          p.id === localId ? { ...p, id: String(dbId), dbId } : p,
        ),
      );
      // Update any pre-existing observations that used localId (edge case)
      setObservations((prev) =>
        prev.map((o) =>
          o.positionId === localId ? { ...o, positionId: String(dbId) } : o,
        ),
      );
      showSaved();
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setPositions((prev) => prev.filter((p) => p.id !== localId)); // rollback
      setError("Failed to save position. Please try again.");
    }
  };

  // ── Remove position ───────────────────────────────────────────────────────────
  const removePosition = async (id: string) => {
    const pos = positions.find((p) => p.id === id);
    setPositions((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      // If removed position was selected, select the next available one
      if (id === selectedPositionId) {
        setSelectedPositionId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
    setObservations((prev) => prev.filter((o) => o.positionId !== id));

    if (pos?.dbId) {
      try {
        await fetch("/api/workSampling/positions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: pos.dbId }),
        });
      } catch (err) {
        console.error("Failed to delete position from DB", err);
      }
    }
  };

  // ── Add/Update observation ───────────────────────────────────────────────────
  const addObservation = async () => {
    if (!newObservation.positionId) {
      setError("Please select a position before recording an observation.");
      return;
    }

    const existing = observations.find(
      (o) =>
        o.positionId === newObservation.positionId &&
        o.date === newObservation.date &&
        o.time === newObservation.time,
    );

    if (existing) {
      // Optimistic update of existing observation
      const localId = existing.id;
      const prevObservation = { ...existing };
      setObservations((prev) =>
        prev.map((o) =>
          o.id === localId
            ? {
                ...o,
                isBusy: newObservation.isBusy,
                performanceRating: newObservation.performanceRating,
                notes: newObservation.notes,
              }
            : o,
        ),
      );
      setError(null);

      try {
        setSaveStatus("saving");
        const res = await fetch("/api/workSampling/observations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            positionId: Number(newObservation.positionId),
            date: newObservation.date,
            time: newObservation.time,
            isBusy: newObservation.isBusy,
            performanceRating: newObservation.performanceRating,
            notes: newObservation.notes,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const dbId: number = json.data.id;
        setObservations((prev) =>
          prev.map((o) =>
            o.id === localId ? { ...o, id: String(dbId), dbId } : o,
          ),
        );
        showSaved();
      } catch (err) {
        console.error(err);
        setSaveStatus("error");
        // Rollback
        setObservations((prev) =>
          prev.map((o) => (o.id === localId ? prevObservation : o)),
        );
        setError("Failed to update observation. Please try again.");
      }
      return;
    }

    // Standard insert flow
    const localId = `tmp_${Date.now()}`;
    const optimistic: Observation = { id: localId, ...newObservation };
    setObservations((prev) => [...prev, optimistic]);
    setNewObservation((prev) => ({ ...prev, notes: "" }));
    setError(null);

    try {
      setSaveStatus("saving");
      const res = await fetch("/api/workSampling/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId: Number(optimistic.positionId),
          date: optimistic.date,
          time: optimistic.time,
          isBusy: optimistic.isBusy,
          performanceRating: optimistic.performanceRating,
          notes: optimistic.notes,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const dbId: number = json.data.id;
      setObservations((prev) =>
        prev.map((o) =>
          o.id === localId ? { ...o, id: String(dbId), dbId } : o,
        ),
      );
      showSaved();
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setObservations((prev) => prev.filter((o) => o.id !== localId));
      setError("Failed to save observation. Please try again.");
    }
  };

  // ── Remove observation ────────────────────────────────────────────────────────
  const removeObservation = async (id: string) => {
    const obs = observations.find((o) => o.id === id);
    setObservations((prev) => prev.filter((o) => o.id !== id));

    if (obs?.dbId) {
      try {
        await fetch("/api/workSampling/observations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: obs.dbId }),
        });
      } catch (err) {
        console.error("Failed to delete observation from DB", err);
      }
    }
  };

  // ── Save parameters (debounced 1 s) ──────────────────────────────────────────
  // Uses latestSavePayload ref so the closure is never stale.
  const scheduleSave = useCallback(() => {
    if (isLoadingFromDb.current) return; // don't save during initial DB hydration
    if (paramsSaveTimer.current) clearTimeout(paramsSaveTimer.current);
    paramsSaveTimer.current = setTimeout(async () => {
      const {
        studyDbId: id,
        studyParameters: sp,
        studyMeta: sm,
      } = latestSavePayload.current;
      if (!id) return; // no study record yet — saved on first addPosition
      try {
        setSaveStatus("saving");
        const res = await fetch(`/api/workSampling/studies/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...sm,
            confidenceLevel: sp.confidenceLevel,
            desiredAccuracy: sp.desiredAccuracy,
            preliminaryP: sp.preliminaryP,
            totalObservationsRequired: sp.totalObservations,
            studyMonth: sp.studyMonth,
            observationsPerDay: sp.observationsPerDay,
            workingHoursPerDay: sp.workingHoursPerDay,
            workStartTime: sp.workStartTime,
            minCycleDuration: sp.minCycleDuration,
            maxDuration: sp.maxDuration,
            estimatedStudyDays: sp.estimatedStudyDays,
            availableAnnualHours: sp.availableAnnualHours,
            defaultPerformanceAllowance: sp.defaultPerformanceAllowance,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        showSaved();
      } catch (err) {
        console.error("Failed to save parameters:", err);
        setSaveStatus("error");
      }
    }, 1000);
  }, []); // stable — reads from ref, never stale

  // ── Explicit "Save & Lock Parameters" ────────────────────────────────────────
  const saveAndLockParameters = async () => {
    try {
      setSaveStatus("saving");
      const sid = await ensureStudy(); // creates study if not yet created
      const { studyParameters: sp, studyMeta: sm } = latestSavePayload.current;
      const datesToLock = [...latestScheduleDates.current];
      const timesToLock = [...latestScheduleTimes.current];
      const res = await fetch(`/api/workSampling/studies/${sid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sm,
          confidenceLevel: sp.confidenceLevel,
          desiredAccuracy: sp.desiredAccuracy,
          preliminaryP: sp.preliminaryP,
          totalObservationsRequired: sp.totalObservations,
          studyMonths: sp.studyMonths,
          observationsPerDay: sp.observationsPerDay,
          workingHoursPerDay: sp.workingHoursPerDay,
          workStartTime: sp.workStartTime,
          minCycleDuration: sp.minCycleDuration,
          maxDuration: sp.maxDuration,
          estimatedStudyDays: sp.estimatedStudyDays,
          availableAnnualHours: sp.availableAnnualHours,
          defaultPerformanceAllowance: sp.defaultPerformanceAllowance,
          lockedDates: datesToLock,
          lockedTimes: timesToLock,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      // Lock the currently generated dates and times
      setLockedDates(datesToLock);
      setLockedTimes(timesToLock);
      setParamsSaved(true);
      showSaved();
    } catch (err) {
      console.error("Failed to save parameters:", err);
      setSaveStatus("error");
    }
  };
  // The isLoadingFromDb guard inside scheduleSave prevents saves during hydration.
  useEffect(() => {
    scheduleSave();
  }, [studyParameters, studyMeta]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Schedule generation ───────────────────────────────────────────────────────
  const generateRandomSchedule = useMemo(() => {
    const n = studyParameters.observationsPerDay;
    const A = studyParameters.minCycleDuration;
    const B = studyParameters.maxDuration;
    const [h, m] = studyParameters.workStartTime.split(":");
    const Y0 = parseInt(h) * 60 + parseInt(m);
    const end = Y0 + studyParameters.workingHoursPerDay * 60;
    const times: string[] = [];
    let cur = Y0;
    for (let i = 0; i < n; i++) {
      const R = Math.random();
      cur += A + (B - A) * R;
      if (cur < end) {
        times.push(
          `${Math.floor(cur / 60)
            .toString()
            .padStart(2, "0")}:${Math.round(cur % 60)
            .toString()
            .padStart(2, "0")}`,
        );
      }
    }
    return times;
  }, [
    studyParameters.observationsPerDay,
    studyParameters.minCycleDuration,
    studyParameters.maxDuration,
    studyParameters.workStartTime,
    studyParameters.workingHoursPerDay,
  ]);

  const generateRandomDates = useMemo(() => {
    const { studyMonths, estimatedStudyDays } = studyParameters;
    if (!studyMonths || studyMonths.length === 0) return [];

    const year = new Date().getFullYear();
    const dates: string[] = [];

    // Split the estimatedStudyDays roughly equally across the selected months
    // In practice, we do it based on working days ratio or simply divide
    const totalK = studyMonths.reduce(
      (sum, m) => sum + (MONTH_DAY_CONSTANTS[m] || 30),
      0,
    );

    studyMonths.forEach((studyMonth) => {
      const k = MONTH_DAY_CONSTANTS[studyMonth] || 30;
      const targetDays = Math.ceil(estimatedStudyDays * (k / totalK));

      let attempts = 0;
      const monthDates: string[] = [];
      while (
        monthDates.length < Math.min(targetDays, 15) &&
        attempts < targetDays * 10
      ) {
        attempts++;
        const x = Math.floor(1.0 + k * Math.random());
        const d = new Date(year, studyMonth - 1, x);
        const dow = d.getDay();

        const dateStr = `${year}-${String(studyMonth).padStart(2, "0")}-${String(x).padStart(2, "0")}`;

        if (
          d.getMonth() === studyMonth - 1 &&
          dow !== 0 &&
          dow !== 6 &&
          !monthDates.includes(dateStr) &&
          !excludedDates.includes(dateStr)
        ) {
          monthDates.push(dateStr);
        }
      }
      dates.push(...monthDates.sort());
    });

    return dates.sort();
  }, [
    studyParameters.studyMonths,
    studyParameters.estimatedStudyDays,
    excludedDates,
  ]);

  // Keep refs in sync so saveAndLockParameters can read them without stale closure
  useEffect(() => {
    latestScheduleDates.current = generateRandomDates;
  }, [generateRandomDates]);
  useEffect(() => {
    latestScheduleTimes.current = generateRandomSchedule;
  }, [generateRandomSchedule]);

  // ── Analysis ──────────────────────────────────────────────────────────────────
  const analysisResults: AnalysisResult[] = positions.map((pos) => {
    const posObs = observations.filter((o) => o.positionId === pos.id);
    const busyCount = posObs.filter((o) => o.isBusy).length;
    const total = posObs.length;
    const Ui = total > 0 ? busyCount / total : 0;
    const avgPerf =
      total > 0
        ? posObs.reduce((s, o) => s + o.performanceRating, 0) / total
        : 0;
    const EAMi = Ui * studyParameters.availableAnnualHours;
    const EBMi = EAMi * (avgPerf / 100);
    const ESMi = EBMi + EBMi * (pos.performanceAllowance / 100);
    return {
      positionId: pos.id,
      positionName: pos.name,
      utilizationFactor: Ui * 100,
      busyCount,
      totalObservations: total,
      avgPerformanceRating: avgPerf,
      performanceAllowance: pos.performanceAllowance,
      estimatedAnnualManHours: EAMi,
      estimatedBasicManHours: EBMi,
      estimatedStandardManHours: ESMi,
    };
  });
  const TAM = analysisResults.reduce(
    (s, r) => s + r.estimatedStandardManHours,
    0,
  );

  const handleCalculateSamplingStaff = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSamplingStaffError(null);
    if (
      !samplingAvailableHours ||
      Number(samplingAvailableHours) <= 0 ||
      !samplingUseFactor ||
      Number(samplingUseFactor) <= 0
    ) {
      setSamplingStaffError(
        "⚠️ Available hours and Use factor must be greater than zero.",
      );
      return;
    }
    const staff =
      TAM / (Number(samplingAvailableHours) * Number(samplingUseFactor));
    setSamplingCalculatedStaff(staff);

    // Persist the result so it shows up in Staff Number > History.
    try {
      setSaveStatus("saving");
      const res = await fetch("/api/staffEstimation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          methodType: "Work Sampling",
          staffNeeded: staff,
          availableHoursPerPerson: Number(samplingAvailableHours),
          utilizationFactor: Number(samplingUseFactor),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      showSaved();
    } catch (err) {
      console.error("Failed to save staff estimate", err);
      setSaveStatus("error");
      setSamplingStaffError(
        "Staff number calculated, but saving to history failed.",
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const SaveIndicator = () => (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full ${
        saveStatus === "saving"
          ? "bg-yellow-100 text-yellow-700"
          : saveStatus === "saved"
            ? "bg-green-100 text-green-700"
            : saveStatus === "error"
              ? "bg-red-100 text-red-700"
              : "hidden"
      }`}
    >
      {saveStatus === "saving"
        ? "Saving…"
        : saveStatus === "saved"
          ? "Saved"
          : "Save failed"}
    </span>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: "#322b80" }}
        />
      </div>
    );

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {isListView ? (
          <div>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#322b80" }}>
                  Work Sampling Studies
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage all work sampling analyses
                </p>
              </div>
              <button
                onClick={() => {
                  setIsListView(false);
                  setStudyDbId(null);
                  setPositions([]);
                  setObservations([]);
                  setStudyParameters(DEFAULT_PARAMS);
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg hover:opacity-90 font-medium text-sm transition-all shadow-md"
                style={{ backgroundColor: "#16a34a" }}
              >
                <Plus size={16} /> New Study
              </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              {studyList.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    No work sampling studies found.
                  </p>
                  <button
                    onClick={() => {
                      setIsListView(false);
                      setStudyDbId(null);
                      setPositions([]);
                      setObservations([]);
                      setStudyParameters(DEFAULT_PARAMS);
                    }}
                    className="mt-4 text-indigo-600 underline"
                  >
                    Create one now
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">ID</th>
                        <th className="px-4 py-3">Organization</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Analyst</th>
                        <th className="px-4 py-3">Months</th>
                        <th className="px-4 py-3">Positions</th>
                        <th className="px-4 py-3 rounded-tr-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {studyList.map((study) => (
                        <tr
                          key={study.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            #{study.id}
                          </td>
                          <td className="px-4 py-3">{study.org || "—"}</td>
                          <td className="px-4 py-3">
                            {study.department || "—"}
                          </td>
                          <td className="px-4 py-3">{study.analyst || "—"}</td>
                          <td className="px-4 py-3">
                            {Array.isArray(study.studyMonths) &&
                            study.studyMonths.length > 0
                              ? study.studyMonths
                                  .map((m: number) => MONTH_NAMES[m - 1])
                                  .join(", ")
                              : study.studyMonth
                                ? MONTH_NAMES[study.studyMonth - 1]
                                : "—"}
                          </td>
                          <td className="px-4 py-3 font-medium text-indigo-600">
                            {study.positionCount || 0}
                          </td>
                          <td className="px-4 py-3 flex items-center gap-4">
                            <Link
                              href={`/evaluation/staff/sampling?studyId=${study.id}`}
                              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                              Open <ChevronRight size={14} />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirmId(study.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete Study"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: "#322b80" }}>
                  Work Sampling Analysis
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {studyDbId
                    ? `Study #${studyDbId}`
                    : "New study — will be saved when you add a position"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SaveIndicator />
                <button
                  onClick={() => {
                    setIsListView(true);
                    setStudyDbId(null);
                    router.push("/evaluation/staff/sampling");
                  }}
                  className="text-xs text-indigo-600 underline border-none bg-transparent cursor-pointer"
                >
                  &larr; Back to List
                </button>
                {studyDbId && (
                  <button
                    onClick={() => {
                      setIsListView(false);
                      setStudyDbId(null);
                      setPositions([]);
                      setObservations([]);
                      setStudyParameters(DEFAULT_PARAMS);
                      router.push("/evaluation/staff/sampling");
                    }}
                    className="text-xs text-indigo-600 underline border-none bg-transparent cursor-pointer ml-3"
                  >
                    + New study
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap mb-6 bg-white rounded-lg shadow p-1 gap-1">
              {[
                {
                  key: "positions" as const,
                  label: "Positions",
                  icon: Users,
                  done: positions.length > 0,
                },
                {
                  key: "parameters" as const,
                  label: "Study Parameters",
                  icon: Calculator,
                  done: paramsSaved,
                },
                {
                  key: "observations" as const,
                  label: "Observations",
                  icon: Clock,
                  done: observations.length > 0,
                },
                {
                  key: "analysis" as const,
                  label: "Analysis",
                  icon: BarChart3,
                  done: analysisResults.some((r) => r.totalObservations > 0),
                },
              ].map(({ key, label, icon: Icon, done }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    activeTab === key
                      ? "text-white shadow"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === key ? "#322b80" : "transparent",
                  }}
                >
                  <Icon size={16} />
                  {label}
                  {done ? (
                    <CheckCircle2
                      size={14}
                      className={
                        activeTab === key ? "text-green-300" : "text-green-500"
                      }
                    />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activeTab === key ? "bg-yellow-300" : "bg-yellow-400"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              {/* ── POSITIONS TAB ── */}
              {activeTab === "positions" && (
                <div>
                  <h2
                    className="text-2xl font-bold mb-2 flex items-center gap-2"
                    style={{ color: "#322b80" }}
                  >
                    <Users size={24} /> Position Management
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Click a position to select it — the Parameters, Observations
                    and Analysis tabs will focus on it.
                  </p>

                  <div className="grid md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg items-end">
                    <label className="flex flex-col text-sm font-medium text-gray-700">
                      Position Name
                      <input
                        type="text"
                        placeholder="e.g. Machine Operator"
                        value={newPosition.name}
                        onChange={(e) =>
                          setNewPosition((p) => ({ ...p, name: e.target.value }))
                        }
                        className="mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent font-normal"
                      />
                    </label>
                    <label className="flex flex-col text-sm font-medium text-gray-700">
                      Department
                      <input
                        type="text"
                        placeholder="e.g. Production"
                        value={newPosition.department}
                        onChange={(e) =>
                          setNewPosition((p) => ({
                            ...p,
                            department: e.target.value,
                          }))
                        }
                        className="mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent font-normal"
                      />
                    </label>
                    <label className="flex flex-col text-sm font-medium text-gray-700">
                      Performance Allowance (%)
                      <input
                        type="number"
                        placeholder="15"
                        min={0}
                        max={100}
                        value={newPosition.performanceAllowance}
                        onChange={(e) =>
                          setNewPosition((p) => ({
                            ...p,
                            performanceAllowance: Number(e.target.value),
                          }))
                        }
                        className="mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent font-normal"
                        title="Performance Allowance % (from Table 5.2)"
                      />
                    </label>
                    <button
                      onClick={addPosition}
                      className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 h-[48px]"
                      style={{ backgroundColor: "#322b80" }}
                    >
                      <Plus size={20} /> Add Position
                    </button>
                    {error && (
                      <div className="md:col-span-4 text-red-500 text-sm font-medium">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {positions.length === 0 ? (
                      <p className="text-gray-400 text-center py-10">
                        No positions yet. Add your first position above.
                      </p>
                    ) : (
                      positions.map((pos) => {
                        const isSelected = pos.id === selectedPositionId;
                        const posObs = observations.filter(
                          (o) => o.positionId === pos.id,
                        );
                        const busyCount = posObs.filter((o) => o.isBusy).length;
                        return (
                          <div
                            key={pos.id}
                            onClick={() => setSelectedPositionId(pos.id)}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50 shadow-md"
                                : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {/* Selection indicator */}
                              <div
                                className={`w-3 h-3 rounded-full flex-shrink-0 ${isSelected ? "bg-indigo-600" : "bg-gray-300"}`}
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {pos.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {pos.department}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <span
                                  className="px-2 py-1 rounded-full font-medium"
                                  style={{
                                    backgroundColor: "#322b8015",
                                    color: "#322b80",
                                  }}
                                >
                                  PA: {pos.performanceAllowance}%
                                </span>
                                <span className="text-gray-400">
                                  {posObs.length} obs · {busyCount} busy
                                </span>
                                {!pos.dbId && (
                                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                                    saving…
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded ml-2">
                                  Selected
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePosition(pos.id);
                              }}
                              className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg ml-3"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Next step navigation */}
                  <div className="mt-8 flex items-center justify-between border-t pt-6">
                    <div className="text-sm text-gray-500">
                      {positions.length === 0 ? (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <AlertCircle size={14} /> Add at least one position to
                          continue
                        </span>
                      ) : !selectedPosition ? (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <AlertCircle size={14} /> Click a position above to
                          select it
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 size={14} />{" "}
                          <strong>{selectedPosition.name}</strong> selected —{" "}
                          {positions.length} position
                          {positions.length !== 1 ? "s" : ""} total
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveTab("parameters")}
                      disabled={positions.length === 0}
                      className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      style={{ backgroundColor: "#322b80" }}
                    >
                      Continue to Parameters <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── PARAMETERS TAB ── */}
              {activeTab === "parameters" && (
                <div>
                  <div className="mb-6">
                    <h2
                      className="text-2xl font-bold flex items-center gap-2"
                      style={{ color: "#322b80" }}
                    >
                      <Calculator size={24} /> Study Parameters
                      {!studyDbId && (
                        <span className="text-sm font-normal text-gray-400 ml-2">
                          (saved when you add a position)
                        </span>
                      )}
                    </h2>
                    {selectedPosition ? (
                      <p className="text-sm text-gray-500 mt-1">
                        These parameters apply to the whole study. Currently
                        viewing in context of{" "}
                        <span className="font-semibold text-indigo-700">
                          {selectedPosition.name}
                        </span>{" "}
                        (PA: {selectedPosition.performanceAllowance}%).
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">
                        No position selected — go to the Positions tab and click
                        a position first.
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* Study meta */}
                      <div className="border rounded-lg overflow-hidden">
                        <div
                          className="px-5 py-3 font-semibold text-white text-sm"
                          style={{ backgroundColor: "#1e1b4b" }}
                        >
                          Study Info
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Organisation
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={studyMeta.org || currentUser?.org || ""}
                              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-0.5">
                              Auto-filled from your account
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Department
                              {selectedPosition && (
                                <span className="ml-2 text-xs text-indigo-600">
                                  (from selected position)
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              readOnly={!!selectedPosition}
                              value={
                                selectedPosition
                                  ? selectedPosition.department
                                  : studyMeta.department
                              }
                              onChange={(e) =>
                                setStudyMeta((prev) => ({
                                  ...prev,
                                  department: e.target.value,
                                }))
                              }
                              placeholder="Select a position to auto-fill"
                              className={`mt-1 w-full px-4 py-2.5 border rounded-lg ${
                                selectedPosition
                                  ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "border-gray-300"
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Analyst
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={
                                studyMeta.analyst || currentUser?.name || ""
                              }
                              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-0.5">
                              Auto-filled from your account
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* A: Sampling Accuracy */}
                      <div className="border rounded-lg overflow-hidden">
                        <div
                          className="px-5 py-3 font-semibold text-white text-sm"
                          style={{ backgroundColor: "#322b80" }}
                        >
                          A. Sampling Accuracy
                        </div>
                        <div className="p-5 space-y-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Confidence Level (%)
                            <select
                              value={studyParameters.confidenceLevel}
                              onChange={(e) =>
                                setStudyParameters((p) => ({
                                  ...p,
                                  confidenceLevel: Number(e.target.value),
                                }))
                              }
                              className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                            >
                              <option value={90}>90%</option>
                              <option value={95}>95%</option>
                              <option value={99}>99%</option>
                            </select>
                          </label>
                          <label className="block text-sm font-medium text-gray-700">
                            Desired Accuracy (%) — auto
                            <div className="relative mt-1">
                              <input
                                readOnly
                                value={studyParameters.desiredAccuracy}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                              />
                              <Info
                                size={14}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                            </div>
                          </label>
                          <label className="block text-sm font-medium text-gray-700">
                            Preliminary P (Proportion Busy)
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max="0.99"
                              value={studyParameters.preliminaryP}
                              onChange={(e) =>
                                setStudyParameters((p) => ({
                                  ...p,
                                  preliminaryP: Number(e.target.value),
                                }))
                              }
                              className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                            />
                          </label>
                        </div>
                      </div>

                      {/* B: Schedule */}
                      <div className="border rounded-lg overflow-hidden">
                        <div
                          className="px-5 py-3 font-semibold text-white text-sm"
                          style={{ backgroundColor: "#4338a8" }}
                        >
                          B. Schedule Configuration
                        </div>
                        <div className="p-5 space-y-4">
                          <div className="block text-sm font-medium text-gray-700">
                            Study Months
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {MONTH_NAMES.map((n, i) => {
                                const monthIndex = i + 1;
                                const isSelected =
                                  studyParameters.studyMonths.includes(
                                    monthIndex,
                                  );
                                return (
                                  <label
                                    key={i}
                                    className="flex items-center gap-2 text-sm font-normal cursor-pointer bg-gray-50 px-3 py-2 rounded border hover:bg-gray-100"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        setStudyParameters((p) => {
                                          const next = e.target.checked
                                            ? [
                                                ...p.studyMonths,
                                                monthIndex,
                                              ].sort((a, b) => a - b)
                                            : p.studyMonths.filter(
                                                (m) => m !== monthIndex,
                                              );
                                          // Ensure at least one month is selected
                                          if (next.length === 0) return p;
                                          return { ...p, studyMonths: next };
                                        });
                                      }}
                                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    {n}{" "}
                                    <span className="text-gray-400 text-xs">
                                      (k={MONTH_DAY_CONSTANTS[monthIndex]})
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Observations/Day (n)
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={studyParameters.observationsPerDay}
                                onChange={(e) =>
                                  setStudyParameters((p) => ({
                                    ...p,
                                    observationsPerDay: Number(e.target.value),
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                              />
                            </label>
                            <label className="block text-sm font-medium text-gray-700">
                              Working Hours/Day (W)
                              <input
                                type="number"
                                min={1}
                                max={24}
                                value={studyParameters.workingHoursPerDay}
                                onChange={(e) =>
                                  setStudyParameters((p) => ({
                                    ...p,
                                    workingHoursPerDay: Number(e.target.value),
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                              />
                            </label>
                            <label className="block text-sm font-medium text-gray-700">
                              Work Start Time (Y₀)
                              <input
                                type="time"
                                value={studyParameters.workStartTime}
                                onChange={(e) =>
                                  setStudyParameters((p) => ({
                                    ...p,
                                    workStartTime: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                              />
                            </label>
                            <label className="block text-sm font-medium text-gray-700">
                              Min Cycle Duration A (min)
                              <input
                                type="number"
                                min={1}
                                max={120}
                                value={studyParameters.minCycleDuration}
                                onChange={(e) =>
                                  setStudyParameters((p) => ({
                                    ...p,
                                    minCycleDuration: Number(e.target.value),
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border text-sm">
                            <span className="text-gray-600">
                              Max Duration (B):
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: "#322b80" }}
                            >
                              {studyParameters.maxDuration.toFixed(1)} min
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                              B = (2W×60 − n×A) / n
                            </span>
                          </div>
                          {studyParameters.maxDuration <=
                            studyParameters.minCycleDuration && (
                            <p className="text-amber-600 text-sm bg-amber-50 p-2 rounded">
                              B must be greater than A — reduce observations/day
                              or increase working hours.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* C: Work Year */}
                      <div className="border rounded-lg overflow-hidden">
                        <div
                          className="px-5 py-3 font-semibold text-white text-sm"
                          style={{ backgroundColor: "#5b4fc7" }}
                        >
                          C. Work Year &amp; Allowance
                        </div>
                        <div className="p-5 space-y-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Available Annual Hours
                            <input
                              type="number"
                              min={0}
                              value={studyParameters.availableAnnualHours}
                              onChange={(e) =>
                                setStudyParameters((p) => ({
                                  ...p,
                                  availableAnnualHours: Number(e.target.value),
                                }))
                              }
                              className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                            />
                            <span className="text-xs text-gray-400">
                              Standard: 2080 hrs
                            </span>
                          </label>
                          <label className="block text-sm font-medium text-gray-700">
                            Default Performance Allowance (PA%)
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={
                                studyParameters.defaultPerformanceAllowance
                              }
                              onChange={(e) =>
                                setStudyParameters((p) => ({
                                  ...p,
                                  defaultPerformanceAllowance: Number(
                                    e.target.value,
                                  ),
                                }))
                              }
                              className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Save & Lock button */}
                      <div
                        className={`border rounded-lg p-5 ${paramsSaved ? "border-green-300 bg-green-50" : "border-indigo-200 bg-indigo-50"}`}
                      >
                        {paramsSaved ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-green-700 font-semibold">
                              Parameters saved — study is ready for observation
                              entry
                            </div>
                            <p className="text-xs text-green-600">
                              {lockedDates.length} study dates and{" "}
                              {lockedTimes.length} daily time slots are locked
                              in. Go to the{" "}
                              <button
                                onClick={() => setActiveTab("observations")}
                                className="underline font-semibold"
                              >
                                Observations tab
                              </button>{" "}
                              to start recording.
                            </p>
                            <button
                              onClick={() => {
                                setParamsSaved(false);
                                setLockedDates([]);
                                setLockedTimes([]);
                              }}
                              className="text-xs text-gray-500 underline"
                            >
                              Edit parameters (will clear locked schedule)
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-indigo-800">
                              When you're happy with the parameters above, save
                              them to lock the study schedule. This will
                              generate and store the observation dates and daily
                              time slots.
                            </p>
                            {positions.length === 0 && (
                              <p className="text-xs text-amber-600">
                                Add at least one position before saving.
                              </p>
                            )}
                            <button
                              onClick={saveAndLockParameters}
                              disabled={
                                positions.length === 0 ||
                                saveStatus === "saving"
                              }
                              className="w-full py-3 px-6 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              style={{ backgroundColor: "#322b80" }}
                            >
                              {saveStatus === "saving"
                                ? "Saving…"
                                : "Save & Lock Study Parameters"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Calculated requirements + schedule preview */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg sticky top-6 space-y-3">
                        <h3
                          className="font-semibold text-base"
                          style={{ color: "#322b80" }}
                        >
                          Calculated Requirements
                        </h3>
                        {[
                          [
                            "K (std deviations)",
                            CONFIDENCE_ACCURACY_MAP[
                              studyParameters.confidenceLevel
                            ]?.zValue ?? "—",
                          ],
                          [
                            "Required Observations (N)",
                            studyParameters.totalObservations.toLocaleString(),
                          ],
                          [
                            "Estimated Study Duration",
                            `${studyParameters.estimatedStudyDays} days`,
                          ],
                          [
                            "Max Duration (B)",
                            `${studyParameters.maxDuration.toFixed(1)} min`,
                          ],
                        ].map(([label, val]) => (
                          <div
                            key={label as string}
                            className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 text-sm"
                          >
                            <span className="text-gray-600">{label}</span>
                            <span
                              className="font-bold"
                              style={{ color: "#322b80" }}
                            >
                              {val}
                            </span>
                          </div>
                        ))}
                        {studyParameters.confidenceLevel === 95 && (
                          <div className="px-3 py-2 rounded-lg text-xs text-indigo-700 bg-indigo-50 border border-indigo-100">
                            At K=2, A=5%: N = 1600 × (1−P) / P (eq 6.3)
                            <br />= 1600 ×{" "}
                            {(1 - studyParameters.preliminaryP).toFixed(
                              3,
                            )} / {studyParameters.preliminaryP.toFixed(3)} ={" "}
                            <strong>
                              {Math.ceil(
                                (1600 * (1 - studyParameters.preliminaryP)) /
                                  studyParameters.preliminaryP,
                              )}
                            </strong>
                          </div>
                        )}

                        {/* Sample times */}
                        <div className="border-t pt-4 mt-2">
                          <p
                            className="text-sm font-medium mb-2"
                            style={{ color: "#322b80" }}
                          >
                            Sample Times ({studyParameters.observationsPerDay}{" "}
                            obs/day)
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {generateRandomSchedule.map((t, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded text-xs"
                              >
                                <span
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                  style={{
                                    backgroundColor: "#322b80",
                                    fontSize: "9px",
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <span className="font-mono">{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sample dates */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p
                              className="text-sm font-medium"
                              style={{ color: "#322b80" }}
                            >
                              Study Dates
                            </p>
                            <span className="text-xs text-gray-400">
                              {generateRandomDates.length} days total
                            </span>
                          </div>

                          {studyParameters.studyMonths
                            .sort((a, b) => a - b)
                            .map((month) => {
                              // Filter the generated dates for this month
                              const monthStr = String(month).padStart(2, "0");
                              const monthDates = generateRandomDates.filter(
                                (d) => d.split("-")[1] === monthStr,
                              );
                              if (monthDates.length === 0) return null;

                              return (
                                <div key={month} className="mb-4 last:mb-0">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">
                                    {MONTH_NAMES[month - 1]}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {monthDates.map((dateStr) => {
                                      const [y, m, d] = dateStr.split("-");
                                      const dateObj = new Date(
                                        Number(y),
                                        Number(m) - 1,
                                        Number(d),
                                      );
                                      const dn = dateObj.toLocaleDateString(
                                        "en-US",
                                        { weekday: "short" },
                                      );
                                      return (
                                        <div
                                          key={dateStr}
                                          onClick={() =>
                                            setExcludedDates((p) => [
                                              ...p,
                                              dateStr,
                                            ])
                                          }
                                          className="group flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50 cursor-pointer text-xs"
                                        >
                                          <span className="group-hover:text-red-700">
                                            {dn} {Number(d)}
                                          </span>
                                          <X
                                            size={10}
                                            className="text-gray-400 group-hover:text-red-500"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}

                          <p className="text-xs text-gray-400 mt-2">
                            Click to exclude (e.g. public holidays)
                          </p>
                          {excludedDates.length > 0 && (
                            <div className="mt-2 border-t pt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-red-600 font-medium">
                                  Excluded dates
                                </span>
                                <button
                                  onClick={() => setExcludedDates([])}
                                  className="text-xs text-gray-500 flex items-center gap-1"
                                >
                                  <RotateCcw size={10} /> Restore all
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {excludedDates.sort().map((dateStr) => {
                                  const [y, m, d] = dateStr.split("-");
                                  const dateObj = new Date(
                                    Number(y),
                                    Number(m) - 1,
                                    Number(d),
                                  );
                                  const dn = dateObj.toLocaleDateString(
                                    "en-US",
                                    { weekday: "short", month: "short" },
                                  );
                                  return (
                                    <div
                                      key={dateStr}
                                      onClick={() =>
                                        setExcludedDates((p) =>
                                          p.filter((d) => d !== dateStr),
                                        )
                                      }
                                      className="px-2 py-1 rounded border border-red-200 bg-red-50 hover:bg-green-50 cursor-pointer text-xs text-red-500 line-through"
                                    >
                                      {dn} {Number(d)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── OBSERVATIONS TAB ── */}
              {activeTab === "observations" && (
                <div>
                  <div className="mb-6">
                    <h2
                      className="text-2xl font-bold flex items-center gap-2"
                      style={{ color: "#322b80" }}
                    >
                      <Clock size={24} /> Data Collection
                    </h2>
                    {selectedPosition ? (
                      <p className="text-sm text-gray-500 mt-1">
                        Recording observations for{" "}
                        <span className="font-semibold text-indigo-700">
                          {selectedPosition.name}
                        </span>
                        . Switch position from the{" "}
                        <button
                          onClick={() => setActiveTab("positions")}
                          className="underline text-indigo-600 hover:text-indigo-800"
                        >
                          Positions tab
                        </button>
                        .
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">
                        No position selected — go to the{" "}
                        <button
                          onClick={() => setActiveTab("positions")}
                          className="underline text-amber-700"
                        >
                          Positions tab
                        </button>{" "}
                        and click a position first.
                      </p>
                    )}
                  </div>

                  {positions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Users size={48} className="mx-auto mb-3 opacity-40" />
                      <p>Add positions first before recording observations.</p>
                    </div>
                  ) : (
                    <>
                      {/* Schedule reference panel */}
                      {paramsSaved &&
                      (lockedDates.length > 0 || lockedTimes.length > 0) ? (
                        <div className="mb-6 p-4 rounded-lg border border-indigo-200 bg-indigo-50">
                          <p className="text-sm font-semibold text-indigo-800 mb-3">
                            Study Schedule (from saved parameters)
                          </p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-indigo-700 mb-2">
                                Observation Dates
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {lockedDates.map((dateStr) => {
                                  // Handle both new string dates and legacy day numbers
                                  let fullDateStr = dateStr;
                                  let dn = "";
                                  let dayNum = "";

                                  if (
                                    typeof dateStr === "number" ||
                                    !dateStr.includes("-")
                                  ) {
                                    // Legacy format (integer day)
                                    const day = Number(dateStr);
                                    const month =
                                      studyParameters.studyMonths[0] ||
                                      studyParameters.studyMonth ||
                                      1;
                                    const d = new Date(
                                      new Date().getFullYear(),
                                      month - 1,
                                      day,
                                    );
                                    dn = d.toLocaleDateString("en-US", {
                                      weekday: "short",
                                    });
                                    dayNum = String(day);
                                    fullDateStr = `${new Date().getFullYear()}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                  } else {
                                    // New format (YYYY-MM-DD)
                                    const [y, m, d] = dateStr.split("-");
                                    const dateObj = new Date(
                                      Number(y),
                                      Number(m) - 1,
                                      Number(d),
                                    );
                                    dn = dateObj.toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                    });
                                    dayNum = String(Number(d));
                                    fullDateStr = dateStr;
                                  }

                                  const obsOnDay = observations.filter(
                                    (o) =>
                                      o.positionId === selectedPositionId &&
                                      o.date === fullDateStr,
                                  ).length;

                                  return (
                                    <button
                                      key={dateStr}
                                      onClick={() =>
                                        setNewObservation((prev) => ({
                                          ...prev,
                                          date: fullDateStr,
                                        }))
                                      }
                                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                                        newObservation.date === fullDateStr
                                          ? "border-indigo-600 bg-indigo-600 text-white"
                                          : obsOnDay > 0
                                            ? "border-green-400 bg-green-50 text-green-800"
                                            : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100"
                                      }`}
                                    >
                                      {dn} {dayNum}
                                      {obsOnDay > 0 && (
                                        <span className="ml-1 opacity-70">
                                          ({obsOnDay})
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-indigo-700 mb-2">
                                Daily Time Slots ({lockedTimes.length} per day)
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {lockedTimes.map((t, i) => {
                                  const obsAtTime = observations.filter(
                                    (o) =>
                                      o.positionId === selectedPositionId &&
                                      o.date === newObservation.date &&
                                      o.time === t,
                                  ).length;
                                  return (
                                    <button
                                      key={i}
                                      onClick={() =>
                                        setNewObservation((prev) => ({
                                          ...prev,
                                          time: t,
                                        }))
                                      }
                                      className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                                        newObservation.time === t
                                          ? "border-indigo-600 bg-indigo-600 text-white"
                                          : obsAtTime > 0
                                            ? "border-green-400 bg-green-50 text-green-800"
                                            : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100"
                                      }`}
                                    >
                                      {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-indigo-500 mt-2">
                            Click a date or time to pre-fill the form below.
                            Green = already has observations.
                          </p>
                        </div>
                      ) : !paramsSaved ? (
                        <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50">
                          <p className="text-sm text-amber-800">
                            Study parameters have not been saved yet. Go to{" "}
                            <button
                              onClick={() => setActiveTab("parameters")}
                              className="underline font-semibold"
                            >
                              Study Parameters
                            </button>{" "}
                            and click "Save & Lock Study Parameters" first.
                          </p>
                        </div>
                      ) : (
                        /* Legacy fallback: params saved but schedule was never persisted */
                        <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50">
                          <p className="text-sm text-amber-800 mb-3">
                            <AlertCircle
                              size={14}
                              className="inline mr-1.5 -mt-0.5"
                            />
                            Study parameters are saved, but the observation
                            schedule was not locked. Click below to generate and
                            lock the schedule so you can record observations.
                          </p>
                          <button
                            onClick={saveAndLockParameters}
                            disabled={saveStatus === "saving"}
                            className="px-5 py-2 text-sm text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-40"
                            style={{ backgroundColor: "#322b80" }}
                          >
                            {saveStatus === "saving"
                              ? "Saving…"
                              : "Lock Schedule Now"}
                          </button>
                        </div>
                      )}
                      {/* Position selector pills */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {positions
                          .filter((p) => p.dbId)
                          .map((pos) => (
                            <button
                              key={pos.id}
                              onClick={() => setSelectedPositionId(pos.id)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                pos.id === selectedPositionId
                                  ? "border-indigo-600 bg-indigo-600 text-white"
                                  : "border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                              }`}
                            >
                              {pos.name}
                              <span className="ml-1.5 opacity-70">
                                (
                                {
                                  observations.filter(
                                    (o) => o.positionId === pos.id,
                                  ).length
                                }
                                )
                              </span>
                            </button>
                          ))}
                      </div>

                      <div className="grid md:grid-cols-6 gap-3 mb-6 p-5 bg-gray-50 rounded-lg">
                        {/* Position — fixed to selection */}
                        <div className="md:col-span-2 px-4 py-3 border border-indigo-200 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-800 flex items-center gap-2">
                          <Users size={14} />
                          {selectedPosition ? (
                            selectedPosition.name
                          ) : (
                            <span className="text-gray-400">
                              Select a position above
                            </span>
                          )}
                        </div>

                        {/* Date — dropdown of locked study dates */}
                        <select
                          value={newObservation.date}
                          onChange={(e) =>
                            setNewObservation((p) => ({
                              ...p,
                              date: e.target.value,
                              time: "",
                            }))
                          }
                          disabled={
                            !selectedPosition ||
                            !paramsSaved ||
                            lockedDates.length === 0
                          }
                          className="px-4 py-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <option value="">— Select date —</option>
                          {lockedDates.map((dateVal) => {
                            let dateStr = String(dateVal);
                            let dn = "";
                            let displayLabel = "";

                            if (
                              typeof dateVal === "number" ||
                              !dateStr.includes("-")
                            ) {
                              // Legacy format (integer day)
                              const day = Number(dateVal);
                              const month =
                                studyParameters.studyMonths[0] ||
                                studyParameters.studyMonth ||
                                1;
                              const year = new Date().getFullYear();
                              const dObj = new Date(year, month - 1, day);
                              dn = dObj.toLocaleDateString("en-US", {
                                weekday: "short",
                              });
                              dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                              const mName = MONTH_NAMES[month - 1]
                                ? MONTH_NAMES[month - 1].slice(0, 3)
                                : "";
                              displayLabel = `${dn}, ${mName} ${day}`;
                            } else {
                              // New YYYY-MM-DD format
                              const [y, m, d] = dateStr.split("-");
                              const month = Number(m);
                              const day = Number(d);
                              const dObj = new Date(Number(y), month - 1, day);
                              dn = dObj.toLocaleDateString("en-US", {
                                weekday: "short",
                              });
                              const mName = MONTH_NAMES[month - 1]
                                ? MONTH_NAMES[month - 1].slice(0, 3)
                                : "";
                              displayLabel = `${dn}, ${mName} ${day}`;
                            }

                            const obsCount = observations.filter(
                              (o) =>
                                o.positionId === selectedPositionId &&
                                o.date === dateStr,
                            ).length;

                            return (
                              <option key={String(dateVal)} value={dateStr}>
                                {displayLabel}
                                {obsCount > 0 ? ` (${obsCount} recorded)` : ""}
                              </option>
                            );
                          })}
                        </select>

                        {/* Time — dropdown of locked daily time slots */}
                        <select
                          value={newObservation.time}
                          onChange={(e) =>
                            setNewObservation((p) => ({
                              ...p,
                              time: e.target.value,
                            }))
                          }
                          disabled={
                            !selectedPosition ||
                            !paramsSaved ||
                            lockedTimes.length === 0
                          }
                          className="px-4 py-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <option value="">— Select time —</option>
                          {lockedTimes.map((t, i) => {
                            const alreadyRecorded = observations.some(
                              (o) =>
                                o.positionId === selectedPositionId &&
                                o.date === newObservation.date &&
                                o.time === t,
                            );
                            return (
                              <option key={i} value={t}>
                                {t}
                                {alreadyRecorded ? " (recorded)" : ""}
                              </option>
                            );
                          })}
                        </select>

                        {/* Busy / Not Busy */}
                        <select
                          value={newObservation.isBusy.toString()}
                          onChange={(e) =>
                            setNewObservation((p) => ({
                              ...p,
                              isBusy: e.target.value === "true",
                            }))
                          }
                          className="px-4 py-3 border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="true">Busy</option>
                          <option value="false">Not Busy</option>
                        </select>

                        {/* Performance rating */}
                        <input
                          type="number"
                          placeholder="Performance Rating %"
                          min={0}
                          max={200}
                          value={newObservation.performanceRating}
                          onChange={(e) =>
                            setNewObservation((p) => ({
                              ...p,
                              performanceRating: Number(e.target.value),
                            }))
                          }
                          className="px-4 py-3 border border-gray-300 rounded-lg"
                        />

                        {(() => {
                          const exists = observations.some(
                            (o) =>
                              o.positionId === selectedPositionId &&
                              o.date === newObservation.date &&
                              o.time === newObservation.time,
                          );
                          return (
                            <button
                              onClick={addObservation}
                              disabled={
                                !selectedPosition ||
                                !newObservation.date ||
                                !newObservation.time
                              }
                              className="md:col-span-6 flex items-center justify-center gap-2 px-5 py-3 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              style={{
                                backgroundColor: exists ? "#16a34a" : "#322b80",
                              }}
                            >
                              {exists ? (
                                <Check size={18} />
                              ) : (
                                <Plus size={18} />
                              )}
                              {selectedPosition
                                ? exists
                                  ? `Update observation for ${selectedPosition.name}`
                                  : `Record observation for ${selectedPosition.name}`
                                : "Select a position first"}
                            </button>
                          );
                        })()}
                        {error && (
                          <div className="md:col-span-6 text-red-500 text-sm">
                            {error}
                          </div>
                        )}
                      </div>

                      {/* Observations table filtered to selected position */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr
                              style={{
                                backgroundColor: "#322b80",
                                color: "white",
                              }}
                            >
                              <th className="p-3 text-left">Position</th>
                              <th className="p-3 text-left">Date</th>
                              <th className="p-3 text-left">Time</th>
                              <th className="p-3 text-left">Status</th>
                              <th className="p-3 text-left">Perf. %</th>
                              <th className="p-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const filtered = selectedPositionId
                                ? observations.filter(
                                    (o) => o.positionId === selectedPositionId,
                                  )
                                : observations;
                              if (filtered.length === 0)
                                return (
                                  <tr>
                                    <td
                                      colSpan={6}
                                      className="p-8 text-center text-gray-400"
                                    >
                                      No observations recorded for{" "}
                                      {selectedPosition?.name ??
                                        "this position"}{" "}
                                      yet.
                                    </td>
                                  </tr>
                                );
                              return filtered.map((obs) => {
                                const pos = positions.find(
                                  (p) => p.id === obs.positionId,
                                );
                                return (
                                  <tr
                                    key={obs.id}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                  >
                                    <td className="p-3">{pos?.name ?? "—"}</td>
                                    <td className="p-3">{obs.date}</td>
                                    <td className="p-3 font-mono">
                                      {obs.time}
                                    </td>
                                    <td className="p-3">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${obs.isBusy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}
                                      >
                                        {obs.isBusy ? "Busy" : "Not Busy"}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      {obs.performanceRating}%
                                    </td>
                                    <td className="p-3">
                                      {!obs.dbId ? (
                                        <span className="text-xs text-yellow-500">
                                          saving…
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            removeObservation(obs.id)
                                          }
                                          className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                      {/* Next step navigation */}
                      <div className="mt-8 flex items-center justify-between border-t pt-6">
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const posObs = selectedPositionId
                              ? observations.filter(
                                  (o) => o.positionId === selectedPositionId,
                                )
                              : observations;
                            return posObs.length > 0 ? (
                              <span className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle2 size={14} /> {posObs.length}{" "}
                                observation{posObs.length !== 1 ? "s" : ""}{" "}
                                recorded
                                {selectedPosition
                                  ? ` for ${selectedPosition.name}`
                                  : ""}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-amber-600">
                                <AlertCircle size={14} /> No observations
                                recorded yet
                              </span>
                            );
                          })()}
                        </div>
                        <button
                          onClick={() => setActiveTab("analysis")}
                          disabled={observations.length === 0}
                          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          style={{ backgroundColor: "#322b80" }}
                        >
                          View Analysis <ChevronRight size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── ANALYSIS TAB ── */}
              {activeTab === "analysis" && (
                <div>
                  <div className="mb-6">
                    <h2
                      className="text-2xl font-bold flex items-center gap-2"
                      style={{ color: "#322b80" }}
                    >
                      <BarChart3 size={24} /> Analysis Results
                    </h2>
                    {selectedPosition && (
                      <p className="text-sm text-gray-500 mt-1">
                        Row for{" "}
                        <span className="font-semibold text-indigo-700">
                          {selectedPosition.name}
                        </span>{" "}
                        is highlighted.
                      </p>
                    )}
                  </div>

                  {analysisResults.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <FileText size={48} className="mx-auto mb-3 opacity-40" />
                      <p>Add positions and observations to see analysis.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Summary cards */}
                      <div className="grid md:grid-cols-5 gap-4">
                        {[
                          {
                            label: "Total Positions",
                            val: positions.length,
                            color: "#322b80",
                          },
                          {
                            label: "Total Observations",
                            val: observations.length,
                            color: "#16a34a",
                          },
                          {
                            label: "Avg Utilization",
                            val: `${Math.round(analysisResults.reduce((s, r) => s + r.utilizationFactor, 0) / analysisResults.length)}%`,
                            color: "#2563eb",
                          },
                          {
                            label: "Avg Performance",
                            val: `${Math.round(analysisResults.reduce((s, r) => s + r.avgPerformanceRating, 0) / analysisResults.length)}%`,
                            color: "#7c3aed",
                          },
                          {
                            label: "TAM (Σ ESMᵢ)",
                            val: Math.round(TAM).toLocaleString(),
                            color: "#d97706",
                          },
                        ].map(({ label, val, color }) => (
                          <div
                            key={label}
                            className="p-5 rounded-lg text-white"
                            style={{ backgroundColor: color }}
                          >
                            <p className="text-xs font-medium opacity-80 mb-1">
                              {label}
                            </p>
                            <p className="text-2xl font-bold">{val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Detail table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr
                              style={{
                                backgroundColor: "#322b80",
                                color: "white",
                              }}
                            >
                              <th className="p-3 text-left">Position</th>
                              <th className="p-3 text-right">Obs.</th>
                              <th className="p-3 text-right">Busy</th>
                              <th className="p-3 text-right">Uᵢ (%)</th>
                              <th className="p-3 text-right">Perf.</th>
                              <th className="p-3 text-right">PA%</th>
                              <th className="p-3 text-right">EAMᵢ</th>
                              <th className="p-3 text-right">EBMᵢ</th>
                              <th className="p-3 text-right">ESMᵢ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysisResults.map((r) => (
                              <tr
                                key={r.positionId}
                                onClick={() =>
                                  setSelectedPositionId(r.positionId)
                                }
                                className={`border-b border-gray-100 cursor-pointer transition-colors ${
                                  r.positionId === selectedPositionId
                                    ? "bg-indigo-50 font-medium"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <td className="p-3 font-medium">
                                  {r.positionName}
                                </td>
                                <td className="p-3 text-right">
                                  {r.totalObservations}
                                </td>
                                <td className="p-3 text-right">
                                  {r.busyCount}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="h-1.5 rounded-full"
                                        style={{
                                          width: `${Math.min(r.utilizationFactor, 100)}%`,
                                          backgroundColor: "#322b80",
                                        }}
                                      />
                                    </div>
                                    <span className="font-medium">
                                      {r.utilizationFactor.toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  {r.avgPerformanceRating.toFixed(1)}%
                                </td>
                                <td className="p-3 text-right">
                                  {r.performanceAllowance}%
                                </td>
                                <td className="p-3 text-right">
                                  {r.estimatedAnnualManHours.toFixed(1)}
                                </td>
                                <td className="p-3 text-right">
                                  {r.estimatedBasicManHours.toFixed(1)}
                                </td>
                                <td
                                  className="p-3 text-right font-bold"
                                  style={{ color: "#322b80" }}
                                >
                                  {r.estimatedStandardManHours.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                            <tr
                              className="border-t-2 font-bold"
                              style={{ backgroundColor: "#f5f3ff" }}
                            >
                              <td
                                className="p-3"
                                colSpan={8}
                                style={{ color: "#322b80" }}
                              >
                                TAM = Σ ESMᵢ (eq 6.15)
                              </td>
                              <td
                                className="p-3 text-right text-lg"
                                style={{ color: "#322b80" }}
                              >
                                {TAM.toFixed(1)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Formula reference */}
                      <div className="p-4 rounded-lg border bg-gray-50 text-xs text-gray-600 space-y-1">
                        <p
                          className="font-semibold text-sm mb-2"
                          style={{ color: "#322b80" }}
                        >
                          Formulas (Charles-Owaba)
                        </p>
                        <p>
                          <code>Uᵢ</code> = Busy / Total{" "}
                          <span className="text-gray-400">(eq 6.11)</span>
                        </p>
                        <p>
                          <code>EAMᵢ</code> = Uᵢ × Available Annual Hours{" "}
                          <span className="text-gray-400">(eq 6.12)</span>
                        </p>
                        <p>
                          <code>EBMᵢ</code> = EAMᵢ × Perf. Rating / 100{" "}
                          <span className="text-gray-400">(eq 6.13)</span>
                        </p>
                        <p>
                          <code>ESMᵢ</code> = EBMᵢ + EBMᵢ × PA / 100{" "}
                          <span className="text-gray-400">(eq 6.14)</span>
                        </p>
                        <p>
                          <code>TAM</code> = Σ ESMᵢ{" "}
                          <span className="text-gray-400">(eq 6.15)</span>
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p>
                            <code>Total Staff</code> = TAM / (Available Hours ×
                            Use Factor)
                          </p>
                        </div>
                      </div>

                      {/* Staff Determination Section */}
                      <div className="p-6 rounded-lg border bg-gray-50 border-gray-200 space-y-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                          <Users size={18} style={{ color: "#322b80" }} />
                          Staff Determination
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Available Hours
                            </label>
                            <input
                              type="number"
                              value={samplingAvailableHours}
                              onChange={(e) =>
                                setSamplingAvailableHours(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Use Factor
                            </label>
                            {/* Decimal 0–1 only, with a slider (matches the
                                advanced-constraints control in Personnel Utilisation). */}
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={samplingUseFactor === "" ? 0 : samplingUseFactor}
                                onChange={(e) =>
                                  setSamplingUseFactor(parseFloat(e.target.value))
                                }
                                className="w-full min-w-0 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pes"
                              />
                              <input
                                type="number"
                                min={0}
                                max={1}
                                step={0.01}
                                placeholder="0.85"
                                value={samplingUseFactor}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (v === "") return setSamplingUseFactor("");
                                  const n = parseFloat(v);
                                  if (isNaN(n)) return;
                                  // clamp to a valid 0–1 decimal
                                  setSamplingUseFactor(Math.min(1, Math.max(0, n)));
                                }}
                                className="w-16 flex-shrink-0 rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-1 py-1.5 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all text-center font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {role === "super-admin" || role === "admin" ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <button
                                onClick={handleCalculateSamplingStaff}
                                className="flex items-center justify-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow"
                                style={{ backgroundColor: "#322b80" }}
                              >
                                Save &amp; Calculate Number of Staff
                              </button>
                              <Link
                                href="/models/staff-number/history"
                                className="text-sm font-medium text-indigo-600 hover:underline"
                              >
                                View History &rarr;
                              </Link>
                            </div>

                            {samplingStaffError && (
                              <p className="text-red-500 text-xs font-medium">
                                {samplingStaffError}
                              </p>
                            )}

                            {samplingCalculatedStaff !== null && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 font-semibold text-sm">
                                Recommended number of staff:{" "}
                                <span className="font-mono font-bold text-base text-pes underline">
                                  {samplingCalculatedStaff.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
                            Only administrators are authorized to calculate the
                            final number of staff.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const blob = new Blob(
                              [
                                JSON.stringify(
                                  {
                                    studyDbId,
                                    positions,
                                    observations,
                                    studyParameters,
                                    analysisResults,
                                    TAM,
                                    exportDate: new Date().toISOString(),
                                  },
                                  null,
                                  2,
                                ),
                              ],
                              { type: "application/json" },
                            );
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(blob);
                            a.download = `work-sampling-${studyDbId ?? "new"}-${new Date().toISOString().split("T")[0]}.json`;
                            a.click();
                            URL.revokeObjectURL(a.href);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg hover:opacity-90 text-sm font-medium"
                          style={{ backgroundColor: "#322b80" }}
                        >
                          <Download size={16} /> Export JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold">
                  Delete Study #{deleteConfirmId}?
                </h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                This action is irreversible and will permanently remove this
                study, along with all associated positions and observations.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStudy}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Delete Study
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with Suspense — required by Next.js App Router for useSearchParams
const WorkSamplingPage: React.FC = () => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: "#322b80" }}
        />
      </div>
    }
  >
    <WorkSamplingPageInner />
  </Suspense>
);

export default WorkSamplingPage;
