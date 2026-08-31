/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Lock,
  GraduationCap,
  BarChart2,
  Leaf,
  HeartHandshake,
  Share2,
  Mail,
  Heart,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  PhoneCall,
  Info,
  Moon,
  BookOpen,
  Users,
  Activity,
  DollarSign,
  ChevronDown,
  Brain,
  Globe,
  Github,
  Facebook,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Calendar,
  GitCompare,
  X,
  Printer
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  SCREEN_SCORE_TO_MINUTES,
  DEFAULT_LIGHT_EXERCISE_MINUTES,
  DEFAULT_REST_MINUTES,
} from './config/recoveryConstants';
import { Player } from '@lottiefiles/react-lottie-player';
import {
  createCheckin,
  checkSafety,
  getCheckins,
  getRecoveryProfile,
  createSimulation,
  createRecommendations,
  getSimulationHistory,
  isSafetyResult,
  type EvidenceCitation,
  type RecommendationResponse,
  type ScenarioResult,
  type SimulationHistoryItem,
  type ActivityInput,
  type CheckinListItem,
} from './services/api';
import { mapFormDataToCheckinCreate } from './services/checkinMapper';
import {
  adaptRecoveryProfile,
  mergeSimulationResult,
  viewModelToAIRecommendation,
} from './services/recoveryAdapter';
import {
  DEMO_PERSONAS,
  DEFAULT_DEMO_PERSONA_ID,
  type DemoPersonaId,
} from './config/demoPersona';
import type { AIRecommendation, FormData } from './types';
import { translations } from './translations';


const GaugeChart = ({ level, confidence, t, isDarkMode }: { level: string, confidence: number, t?: (key: string) => string, isDarkMode?: boolean }) => {
  // Arc progress: Low=25%, Medium=55%, High=85% of the arc
  const arcProgress = level === 'Low' ? 0.25 : level === 'Medium' ? 0.55 : 0.85;

  // SVG arc calculation for a half-circle gauge
  const cx = 50, cy = 50, r = 40;
  const startAngle = Math.PI; // 180°
  const endAngle = startAngle + arcProgress * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  // Since the maximum arc is 180 degrees (Math.PI), the arc drawn covers at most 180 degrees.
  // Therefore, largeArcFlag is always 0.
  const largeArc = 0;
  const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

  const levelDisplay = (typeof t === 'function')
    ? (level === 'Low' ? t('results.low') : level === 'Medium' ? t('results.medium') : (level === 'High' ? t('results.high') : ''))
    : (level === 'Low' ? 'Low' : level === 'Medium' ? 'Medium' : (level === 'High' ? 'High' : ''));
  const levelColor = level === 'Low' ? '#006b60' : level === 'Medium' ? '#6e3bd8' : '#a53173';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-28 overflow-hidden">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradientNew" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#5bf4de', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#6e3bd8', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Track */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={isDarkMode ? '#1e293b' : '#dde3e7'}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <motion.path
            d={arcPath}
            fill="none"
            stroke="url(#gaugeGradientNew)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </svg>
      </div>
      <div className="text-center -mt-2">
        <div
          className="text-4xl font-black leading-tight"
          style={{ color: levelColor, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          {levelDisplay}
        </div>
        <div className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          {Math.round(confidence * 100)}% {t ? t('ui.confidenceInterval') : 'Confidence Interval'}
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ id, title, description, icon: Icon, colorClass, isBookmarked, onBookmark, bookmarkAriaLabel, detailsLabel, onDetailClick, isDarkMode }: { id: string, title: string, description: string, icon: any, colorClass: string, isBookmarked: boolean, onBookmark: (e: React.MouseEvent) => void, bookmarkAriaLabel: string, detailsLabel: string, onDetailClick: () => void, isDarkMode: boolean }) => {
  return (
    <div onClick={onDetailClick} className="analytics-glass-card dark:bg-slate-800/50 border border-white/50 dark:border-white/10 shadow-[0_12px_32px_rgba(45,51,55,0.1)] rounded-[2.5rem] overflow-hidden p-8 flex flex-col items-center text-center h-full transition-all duration-300 hover:-translate-y-2 group cursor-pointer w-full max-w-md">
      <div className="flex-1 w-full" onClick={(e) => e.stopPropagation()}>
        <h4
          className={`text-2xl font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}
          style={{ 
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
        >
          {title}
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed line-clamp-4"
          style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          {description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button onClick={(e) => { e.stopPropagation(); onDetailClick(); }} className={`text-[10px] font-bold uppercase tracking-widest hover:underline ${isBookmarked ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}
          style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          {detailsLabel}
        </button>
        <button
          onClick={onBookmark}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border
            ${isBookmarked
              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200'
              : 'bg-white dark:bg-white/10 text-slate-400 border-slate-200 dark:border-white/20 hover:bg-teal-600 hover:text-white hover:border-teal-600'}`}
          aria-label={bookmarkAriaLabel}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};


type ActionCardItem = {
  id: string;
  title: string;
  description: string;
  categoryKey: string;
  tradeoff?: string;
  evidence?: EvidenceCitation[];
  activities?: ActivityInput[];
};

const LiquidButton = ({ children, onClick, variant = 'primary', className = "", icon: Icon }: any) => {
  const baseStyle = "relative overflow-hidden rounded-full font-semibold px-8 py-4 transition-all duration-300 flex items-center justify-center gap-2 group";
  const variants = {
    primary: "bg-blue-600 dark:bg-blue-500 backdrop-blur-2xl text-white border border-blue-500/50 shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 hover:-translate-y-0.5",
    secondary: "bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-2xl text-slate-900 dark:text-slate-100 border border-slate-300/50 dark:border-slate-700/50 shadow-md hover:bg-slate-300/80 dark:hover:bg-slate-700/80 hover:-translate-y-0.5",
    outline: "bg-transparent border-2 border-slate-300/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {/* Liquid hover effect overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer delay-100"></div>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {Icon && <Icon className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
      </span>
    </button>
  );
};

const buildActivitiesFromSurvey = (
  formData: FormData
): ActivityInput[] => {
  const activities: ActivityInput[] = [];

  const screenScore = Number(formData.screen_time ?? 0);

  if (screenScore > 0) {
    activities.push({
      activity_id: 'phone_social_media',
      duration_minutes: screenScore * SCREEN_SCORE_TO_MINUTES,
    });
  }

  const studyHours = Number(formData.study_work_hours ?? 0);

  if (studyHours > 0) {
    activities.push({
      activity_id: 'studying',
      duration_minutes: Math.round(studyHours * 60),
    });
  }

  if (formData.exercised_today === 'yes') {
    activities.push({
      activity_id: 'light_exercise',
      duration_minutes: DEFAULT_LIGHT_EXERCISE_MINUTES,
    });
  }

  activities.push({
    activity_id: 'rest',
    duration_minutes: DEFAULT_REST_MINUTES,
  });

  return activities;
};


export default function App() {
  const [hasConsented, setHasConsented] = useState(false);
  const [
    simulationHistory,
    setSimulationHistory
  ] = useState<SimulationHistoryItem[]>([]);
  const [showMotivational, setShowMotivational] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>(() => (localStorage.getItem('concussionrecovery_language') as any) || 'en');
  const [activeDemoUserId, setActiveDemoUserId] = useState<DemoPersonaId>(DEFAULT_DEMO_PERSONA_ID);
  const [recoveryProfile, setRecoveryProfile] = useState<Awaited<ReturnType<typeof getRecoveryProfile>> | null>(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showEthicsModal, setShowEthicsModal] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookmarkedRecs, setBookmarkedRecs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('concussionrecovery_bookmarks') || '[]'); } catch { return []; }
  });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [isSafetyBlocked, setIsSafetyBlocked] = useState(false);
  const emergencyDialogRef = useRef<HTMLDivElement>(null);
  const [checkins, setCheckins] = useState<
    CheckinListItem[]
  >([]);
  const [checkinHistory, setCheckinHistory] =
  useState<CheckinListItem[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [selectedActionDetail, setSelectedActionDetail] = useState<ActionCardItem | null>(null);
  const [stepError, setStepError] = useState<string>('');
  const [isResimulatingAlternative, setIsResimulatingAlternative] = useState(false);
  const [activeDataModule, setActiveDataModule] = useState<'dashboard' | 'analytics'>('dashboard');
  const [stressTrendPeriod, setStressTrendPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [radarAnimated, setRadarAnimated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('concussionrecovery_currentUser'));
  const [showLoginConfirm, setShowLoginConfirm] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const stored = localStorage.getItem('concussionrecovery_currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  // Modern login handlers
  const handleShowLoginConfirm = () => {
    setShowLoginConfirm(true);
  };

  const handleConfirmLogin = () => {
    const modernLoginUrl = window.location.origin + '/src/Modern-Login-master/index.html';
    window.location.assign(modernLoginUrl);
    setShowLoginConfirm(false);
  };

  const handleCancelLogin = () => {
    setShowLoginConfirm(false);
  };

  // Sync login state from popup via localStorage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'concussionrecovery_currentUser') {
        const userData = e.newValue ? JSON.parse(e.newValue) : null;
        setCurrentUser(userData);
        setIsLoggedIn(!!userData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const radarRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const languageOptions = [
    { code: 'en', label: 'English', flag: 'gb' },
    { code: 'vi', label: 'Tiếng Việt', flag: 'vn' }
  ] as const;

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('concussionrecovery_language', language);
  }, [language]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showPrivacyModal || showEthicsModal || showEmergencyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPrivacyModal, showEthicsModal, showEmergencyModal]);

  useEffect(() => {
    if (showEmergencyModal) {
      emergencyDialogRef.current?.focus();
    }
  }, [showEmergencyModal]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Tự động cuộn lên đầu trang khi chuyển đổi các trạng thái xem chính hoặc bước khảo sát
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [isSurveyOpen, isAboutUsOpen, isCompleted, currentStep, activeDataModule]);

  // Translation helper
  const t = (key: string): any => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      if (result && Object.prototype.hasOwnProperty.call(result, k)) {
        result = result[k];
      } else {
        let fallback: any = translations.en;
        for (const fk of keys) {
          if (fallback && Object.prototype.hasOwnProperty.call(fallback, fk)) {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return (typeof result === 'string' || Array.isArray(result)) ? result : key;
  };
const featureLabels: Record<string, Record<string, string>> = {
    headache:                   { vi: 'Đau đầu',                 en: 'Headache' },
    dizziness:                  { vi: 'Chóng mặt',               en: 'Dizziness' },
    blurred_vision:             { vi: 'Mờ mắt',                  en: 'Blurred Vision' },
    nausea:                     { vi: 'Buồn nôn',                en: 'Nausea' },
    sleep_quality:              { vi: 'Chất lượng giấc ngủ',     en: 'Sleep Quality' },
    screen_time:                { vi: 'Thời gian dùng màn hình', en: 'Screen Time' },
    cognitive_load:             { vi: 'Tải nhận thức',           en: 'Cognitive Load' },
    concentration_difficulty:   { vi: 'Khó tập trung',           en: 'Concentration Difficulty' },
    mood:                       { vi: 'Tâm trạng',               en: 'Mood' },
    social_support:             { vi: 'Hỗ trợ xã hội',          en: 'Social Support' },
    overwhelm_level:            { vi: 'Mức độ căng thẳng',       en: 'Overwhelm Level' },
  };
  const getFeatureLabel = (keyObj: string) => {
    if (featureLabels[keyObj]) {
      return (featureLabels[keyObj] as any)[language] || keyObj;
    }
    return keyObj;
  };

  const formatTemplate = (template: string, vars: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));

  const tWith = (key: string, vars: Record<string, string | number>) =>
    formatTemplate(t(key), vars);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    age: '',
    gender: '',
    days_since_injury: '',
    // Step 2: Today's Symptoms
    headache: 0,
    dizziness: 0,
    blurred_vision: 0,
    nausea: 0,
    worsening_headache: false,
    repeated_vomiting: false,
    neurological_danger_sign: false,

    // Step 3
    sleep_quality: 0,
    exercised_today: 'no' as 'yes' | 'no',
    symptoms_worsened_after_activity: 'no' as 'yes' | 'no',
    // Step 4: Cognitive Load
    screen_time: 0,
    study_work_hours: 0,
    concentration_difficulty: 0,
    // Step 5: Mood & Recovery Context
    mood: 0,
    social_support: 0,
    overwhelm_level: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    // Storage version — bump this to clear stale data after format changes
    const STORAGE_VERSION = 'v3'; // v3: raw feature keys in dummy history + ISO date format
    const storedVersion = localStorage.getItem('concussionrecovery_storage_version');
    if (storedVersion !== STORAGE_VERSION) {
      // Clear old history entries that may have bad color data
      Object.keys(localStorage)
        .filter(k => k.startsWith('concussionrecovery_history_'))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('concussionrecovery_storage_version', STORAGE_VERSION);
    }

    let sid = localStorage.getItem('concussionrecovery_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('concussionrecovery_session_id', sid);
    }
    
  }, []);

  const saveToHistory = (result: AIRecommendation) => {
    // Store ISO date string; render uses locale-aware formatting at display time
    const newEntry = {
      date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD'
      stressScore: result.recovery_load_level === 'High' ? 85 : result.recovery_load_level === 'Medium' ? 50 : 20,
      level: result.recovery_load_level,
      features: result.feature_importance
    };
    const sid = localStorage.getItem('concussionrecovery_session_id') || 'default';
    const historyKey = `concussionrecovery_history_${sid}`;
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    existing.push(newEntry);
    if (existing.length > 30) existing.shift();
    localStorage.setItem(historyKey, JSON.stringify(existing));
  };

  // Format a stored ISO date string (YYYY-MM-DD) using the current locale
  const localeMap: Record<string, string> = { vi: 'vi-VN', en: 'en-US' };
  const formatSessionDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00'); // avoid UTC offset shifts
    if (isNaN(d.getTime())) return dateStr;    // fallback for legacy entries
    return d.toLocaleDateString(localeMap[language] ?? 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('concussionrecovery_currentUser');
  };

  const startSurvey = () => {
    setIsSurveyOpen(true);
  };

  const acceptConsent = () => {
    setShowMotivational(true); // Hiển thị trang motivational
  };

  const proceedToSurvey = () => {
    setHasConsented(true); // Đánh dấu đã đọc đầy đủ
    setShowMotivational(false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedRecs(prev => {
      const next = prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id];
      localStorage.setItem('concussionrecovery_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadRecoveryProfile = async () => {
      try {
        const profile = await getRecoveryProfile(
          activeDemoUserId
        );

        if (!cancelled) {
          setRecoveryProfile(profile);
        }

      } catch (error) {
        console.error(
          'Failed to load recovery profile:',
          error
        );

        if (!cancelled) {
          setRecoveryProfile(null);
        }
      }
    };

    loadRecoveryProfile();

    return () => {
      cancelled = true;
    };
  }, [activeDemoUserId]);

  const nextStep = async () => {
    // Validate required fields on step 1
    if (currentStep === 1) {
      const age = parseInt(formData.age as any);

      if (!formData.age || isNaN(age) || age < 10 || age > 100) {
        setStepError(t('survey.errors.invalidAge'));
        return;
      }

      if (!formData.gender) {
        setStepError(t('survey.errors.selectGender'));
        return;
      }
    }

    setStepError('');

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);

      return;
    }

    setIsAnalyzing(true);
    setIsSafetyBlocked(false);
    setRecommendationResult(null);

    try {
      const explicitSafetyInput = {
        worsening_headache: formData.worsening_headache,
        repeated_vomiting: formData.repeated_vomiting,
        neurological_danger_sign: formData.neurological_danger_sign,
      };
      const safetyResult = await checkSafety(explicitSafetyInput);
      if (!safetyResult.downstream_allowed) {
        setAiResult(null);
        setRecommendationResult(null);
        setIsCompleted(false);
        setIsSafetyBlocked(true);
        setShowEmergencyModal(true);
        return;
      }

      const todayIso = new Date()
        .toISOString()
        .slice(0, 10);

      /*
      * STEP 1:
      * Survey → Check-in payload
      */
      const checkinPayload = mapFormDataToCheckinCreate(
        formData,
        activeDemoUserId,
        todayIso
      );

      /*
      * STEP 2:
      * Save check-in → get latest recovery profile
      */
      const [profile] = await Promise.all([
        (async () => {
          await createCheckin(checkinPayload);

          return getRecoveryProfile(
            activeDemoUserId
          );
        })(),

        // Keep analyzing animation visible
        new Promise(resolve =>
          setTimeout(resolve, 3000)
        ),
      ]);

      /*
      * STEP 3:
      * Recovery profile → ViewModel
      */
      let viewModel = adaptRecoveryProfile(profile);

      /*
      * STEP 4:
      * Survey → Activity plan
      */
      const activities =
        buildActivitiesFromSurvey(formData);

      /*
      * STEP 5:
      * Run backend scenario simulation
      */
      const simulationResult =
        await createSimulation({
          user_id: activeDemoUserId,

          activities,

          label: 'Daily recovery activity plan',
        });

      /*
      * STEP 6:
      * Merge simulation into recovery state
      */
      viewModel = mergeSimulationResult(
        viewModel,
        simulationResult
      );

      /*
      * STEP 6B:
      * Track B Planner -> RAG citations -> Safety -> grounded wording.
      * Red flags are explicit user answers; symptom scores are never
      * silently converted into red-flag claims.
      */
      let trackBRecommendation: RecommendationResponse | null = null;
      if (!isSafetyResult(simulationResult)) {
        const recommendationResponse = await createRecommendations({
          scenario_result: simulationResult as ScenarioResult,
          activities,
          safety_input: explicitSafetyInput,
          audience: Number(formData.age) < 18 ? 'pediatric' : 'adult',
          option_count: 3,
        });

        if (isSafetyResult(recommendationResponse)) {
          viewModel = mergeSimulationResult(
            adaptRecoveryProfile(profile),
            recommendationResponse,
          );
        } else {
          trackBRecommendation = recommendationResponse;
        }
      }

      /*
      * STEP 7:
      * Convert backend ViewModel → existing UI type
      */
      const result =
        viewModelToAIRecommendation(viewModel);

      /*
      * STEP 8:
      * Update UI
      */
      setRecoveryProfile(profile);


      const history = await getSimulationHistory(
        activeDemoUserId
      );

      setSimulationHistory(history);
      setAiResult(result);
      setRecommendationResult(trackBRecommendation);
      setIsSafetyBlocked(Boolean(viewModel.safetyBlocked));

      /*
      * Safety / high concern
      */
      if (
        result.recovery_load_level === 'High'
      ) {
        setShowEmergencyModal(true);
      }

    } catch (error) {
      console.error(
        'Error analyzing data:',
        error
      );

      setIsCompleted(false);

      setStepError(
        'Unable to analyze your recovery data. Please check that the backend is running and try again.'
      );

    } finally {
      setIsAnalyzing(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else setIsSurveyOpen(false);
  };

  const simulateAlternative = async (option: ActionCardItem) => {
    if (!option.activities || !recoveryProfile) return;

    setIsResimulatingAlternative(true);
    setStepError('');
    try {
      const simulationResult = await createSimulation({
        user_id: activeDemoUserId,
        activities: option.activities,
        label: option.title,
      });
      if (isSafetyResult(simulationResult)) {
        setRecommendationResult(null);
        setIsSafetyBlocked(true);
        setShowEmergencyModal(true);
        return;
      }

      const recommendationResponse = await createRecommendations({
        scenario_result: simulationResult,
        activities: option.activities,
        safety_input: {
          worsening_headache: formData.worsening_headache,
          repeated_vomiting: formData.repeated_vomiting,
          neurological_danger_sign: formData.neurological_danger_sign,
        },
        audience: Number(formData.age) < 18 ? 'pediatric' : 'adult',
        option_count: 3,
      });
      if (isSafetyResult(recommendationResponse)) {
        setRecommendationResult(null);
        setIsSafetyBlocked(true);
        setShowEmergencyModal(true);
        return;
      }

      const nextViewModel = mergeSimulationResult(
        adaptRecoveryProfile(recoveryProfile),
        simulationResult,
      );
      setAiResult(viewModelToAIRecommendation(nextViewModel));
      setRecommendationResult(recommendationResponse);
      setIsSafetyBlocked(false);
      setSelectedActionDetail(null);
      setSimulationHistory(await getSimulationHistory(activeDemoUserId));
    } catch (error) {
      console.error('Unable to simulate alternative:', error);
      setStepError(
        language === 'vi'
          ? 'Không thể mô phỏng phương án này. Hãy kiểm tra backend và thử lại.'
          : 'Unable to simulate this alternative. Check the backend and try again.',
      );
    } finally {
      setIsResimulatingAlternative(false);
    }
  };

  // Helper to calculate color based on slider value
  const getSliderColor = (value: number, min: number, max: number) => {
    const percentage = (value - min) / (max - min);
    const hue = (1 - percentage) * 120;
    return `hsl(${hue}, 84%, 50%)`;
  };

  // CustomSlider: showDots = true (default) để hiện dấu chấm, false để ẩn
  const CustomSlider = ({ min, max, step, value, onChange, size = 'normal', ariaLabel, showDots = true }: { min: number, max: number, step: number, value: number, onChange: (val: number) => void, size?: 'normal' | 'large', ariaLabel: string, showDots?: boolean }) => {
    const snapPoints = [];
    for (let i = min; i <= max; i += 1) snapPoints.push(i);
    const handleChange = (val: number) => {
      const snapped = Math.round(val);
      onChange(snapped);
    };
    const percentage = ((value - min) / (max - min)) * 100;
    const currentColor = getSliderColor(value, min, max);
    const heightClass = size === 'large' ? 'h-4' : 'h-2';
    const thumbSizeClass = size === 'large'
      ? '[&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8'
      : '[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6';
    const thumbOffset = size === 'large' ? 16 : 12;
    const offsetPx = thumbOffset - (percentage / 100) * (thumbOffset * 2);
    return (
      <div className="relative pt-8 pb-1 w-full group">
        <div
          className="absolute top-0 transform -translate-x-1/2 text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow-md pointer-events-none"
          style={{
            left: `calc(${percentage}% + ${offsetPx}px)`,
            backgroundColor: currentColor
          }}
        >
          {value}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 border-[5px] border-transparent"
            style={{ borderTopColor: currentColor }}
          ></div>
        </div>
        {/* Dấu chấm tròn các mốc nhỏ nằm đè trên track */}

        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className={`w-full appearance-none bg-transparent rounded-full cursor-grab active:cursor-grabbing ${heightClass} ${thumbSizeClass} focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[var(--thumb-color)] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-[var(--thumb-color)] [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform relative z-20`}
          style={{
            background: `linear-gradient(to right, ${currentColor} ${percentage}%, ${isDarkMode ? '#374151' : '#e5e7eb'} ${percentage}%)`,
            '--thumb-color': currentColor,
          } as React.CSSProperties}
        />
      </div>
    );
  };

  const renderConsentScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={`relative backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] rounded-[2rem] overflow-hidden p-8 md:p-12 max-w-3xl w-full mx-auto text-left ${
        isDarkMode 
          ? 'bg-slate-900/95 border-slate-700/50 text-white' 
          : 'bg-white/90 border-white/60 text-slate-900'
      }`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 dark:bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner border relative z-10 ${
        isDarkMode
          ? 'bg-slate-800/80 border-slate-700 text-blue-400'
          : 'bg-gradient-to-br from-blue-100 to-teal-100 border-white text-blue-600'
      }`}>
        <ShieldCheck className="w-8 h-8" />
      </div>
      <h2 className={`text-3xl font-extrabold mb-6 tracking-tight relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('consent.title')}</h2>

      <div className={`space-y-4 mb-10 h-64 overflow-y-auto pr-4 font-medium leading-relaxed relative z-10 custom-scrollbar ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
        <p>{t('consent.welcome')}</p>
        <h3 className={`font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('consent.h1')}</h3>
        <p>{t('consent.p1')}</p>

        <h3 className={`font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('consent.h2')}</h3>
        <p>{t('consent.p2')}</p>

        <h3 className={`font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('consent.h3')}</h3>
        <p>{t('consent.p3')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-end relative z-10">
        <LiquidButton
          variant="secondary"
          onClick={() => setIsSurveyOpen(false)}
        >
          {t('consent.btnDecline')}
        </LiquidButton>
        <LiquidButton
          onClick={acceptConsent}
        >
          {t('consent.btnAccept')}
        </LiquidButton>
      </div>
    </motion.div>
  );

  const renderMotivationalScreen = () => (
    <motion.div
      key={language}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'none' }}
    >
      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 gap-8 w-full max-w-6xl">
        {/* Navigation Buttons: fixed to left/right, vertically centered with image */}
        <div className="w-full flex items-center justify-between relative" style={{ minHeight: '20rem' }}>
          {/* Previous Button - left edge */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => setShowMotivational(false)}
            aria-label="Previous"
            className="w-14 h-14 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-300 shadow transition-all absolute left-0 top-1/2 -translate-y-1/2"
            style={{ zIndex: 20 }}
          >
            <ArrowLeft className="w-7 h-7" />
          </motion.button>
          {/* Large Square Image, centered */}
          <motion.img
            src="https://image2url.com/r2/default/images/1775840954764-fa156538-0eec-4fa2-9e18-56d177c85d21.png"
            alt="Gen Z Motivation"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-80 h-80 rounded-2xl object-cover mx-auto shadow-lg"
            style={{ background: 'transparent', border: 'none' }}
          />
          {/* Next Button - right edge */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={proceedToSurvey}
            aria-label="Next"
            className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all absolute right-0 top-1/2 -translate-y-1/2"
            style={{ zIndex: 20 }}
          >
            <ArrowRight className="w-7 h-7" />
          </motion.button>
        </div>
        {/* Wide Speech Bubble Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`relative px-12 py-8 rounded-[2.5rem] backdrop-blur-md w-full max-w-5xl ${
            isDarkMode
              ? 'bg-slate-800/60 border border-slate-700/50 text-white'
              : 'bg-white/80 border border-white/60 text-slate-900 shadow-xl'
          }`}
        >
          <p className="text-xl leading-relaxed font-medium text-center" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
            {t('motivational.quote')}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderHowItWorksModal = () => (
    <AnimatePresence>
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              key={language}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
                isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              {/* Fixed Header */}
              <div className={`sticky top-0 z-10 border-b p-6 flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('howItWorks.title')}
                </h2>
                <button
                  onClick={() => setIsHowItWorksOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* Intro */}
                <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('howItWorks.intro')}
                </p>

                {/* Pillars Section */}
                <div className="space-y-4">
                  {[
                    { key: 'pillar1' },
                    { key: 'pillar2' },
                    { key: 'pillar3' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`p-5 rounded-xl border ${
                        isDarkMode
                          ? 'bg-gray-800/50 border-gray-700/50'
                          : 'bg-gray-50 border-gray-200/50'
                      }`}
                    >
                      <h3 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t(`howItWorks.${item.key}Title`)}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t(`howItWorks.${item.key}Text`)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reliability Stat */}
                <div className={`p-4 rounded-xl text-center border ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700/50'
                    : 'bg-gray-50 border-gray-200/50'
                }`}>
                  <p className={`font-semibold text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {t('howItWorks.reliability')}
                  </p>
                </div>

                {/* Flowchart Section */}
                <div className="space-y-3 mt-8">
                  <h3 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('howItWorks.processTitle')}
                  </h3>
                  <div className="flex items-center justify-between gap-3">
                    {/* Step 1 */}
                    <div className={`flex-1 p-4 rounded-lg text-center border ${
                      isDarkMode
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-gray-50 border-gray-200/50'
                    }`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('howItWorks.flowStep1')}
                      </p>
                    </div>

                    {/* Arrow 1 */}
                    <div className={`flex-shrink-0 text-2xl ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      →
                    </div>

                    {/* Step 2 */}
                    <div className={`flex-1 p-4 rounded-lg text-center border ${
                      isDarkMode
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-gray-50 border-gray-200/50'
                    }`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('howItWorks.flowStep2')}
                      </p>
                    </div>

                    {/* Arrow 2 */}
                    <div className={`flex-shrink-0 text-2xl ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      →
                    </div>

                    {/* Step 3 */}
                    <div className={`flex-1 p-4 rounded-lg text-center border ${
                      isDarkMode
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-gray-50 border-gray-200/50'
                    }`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('howItWorks.flowStep3')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className={`sticky bottom-0 border-t p-4 bg-gradient-to-r ${
                isDarkMode
                  ? 'border-gray-700 from-gray-800 to-gray-800'
                  : 'border-gray-200 from-gray-50 to-gray-50'
              }`}>
                <button
                  onClick={() => setIsHowItWorksOpen(false)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  {t('howItWorks.close')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );



  const renderEmergencyModal = () => (
    <AnimatePresence>
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            ref={emergencyDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="emergency-dialog-title"
            aria-describedby="emergency-dialog-description"
            tabIndex={-1}
            key={language}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className={`relative backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden p-8 md:p-10 max-w-lg w-full text-center ${isDarkMode ? 'bg-[#0b132b]/80 border-white/10' : 'bg-white/95 border border-gray-200'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
              <AlertTriangle className="w-10 h-10" aria-hidden="true" />
            </div>
            <h2 id="emergency-dialog-title" className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{t('emergency.title')}</h2>
            <p id="emergency-dialog-description" className={`mb-6 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('emergency.desc')}</p>

            <div className={`rounded-2xl p-6 mb-8 text-left ${isDarkMode ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-white text-red-600'}`}>
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('emergency.hotlineLabel')}</div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>1800 599 920</div>
                </div>
              </div>
              <a
                href="tel:1800599920"
                className="block w-full text-center bg-red-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
              >
                {t('emergency.btnCall')}
              </a>
            </div>

            <div className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} dangerouslySetInnerHTML={{ __html: t('emergency.clinic').replace('Phòng Tư vấn Tâm lý', '<strong>Phòng Tư vấn Tâm lý</strong>').replace('University Counseling Center', '<strong>University Counseling Center</strong>') }} />

            <button
              onClick={() => setShowEmergencyModal(false)}
              className={`min-h-12 rounded-lg px-4 font-medium underline focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-950'}`}
            >
              {t('emergency.btnUnderstand')}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderLoginConfirmModal = () => (
    <AnimatePresence>
      {showLoginConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative backdrop-blur-3xl shadow-2xl rounded-[2rem] p-8 max-w-md w-full text-center ${
              isDarkMode ? 'bg-slate-900/90 border border-white/10 text-white' : 'bg-white/95 border border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">Lợi ích khi Đăng nhập</h3>
            <div className={`text-left space-y-4 mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <p className="font-medium text-center opacity-90">Đăng nhập để mở khóa các tính năng nâng cao giúp bạn quản lý sức khỏe tốt hơn:</p>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span><strong>Theo dõi lịch sử:</strong> Xem lại lịch sử làm khảo sát và theo dõi biểu đồ xu hướng căng thẳng qua từng mốc thời gian.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span><strong>AI Cá nhân hóa:</strong> Hệ thống ghi nhớ thói quen sinh hoạt để đưa ra gợi ý và lộ trình phục hồi chính xác hơn.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span><strong>Gợi ý thông minh:</strong> Nhận các chỉ dẫn tốt hơn cho các vấn đề tâm lý dựa trên dữ liệu thói quen đã lưu trữ.</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmLogin}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
              >
                Tiếp tục đăng nhập
              </button>
              <button
                onClick={handleCancelLogin}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Để sau
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderActionDetailModal = () => (
    <AnimatePresence>
      {selectedActionDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" onClick={() => setSelectedActionDetail(null)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-detail-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative max-w-lg w-full rounded-[2.5rem] p-8 md:p-10 shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-100'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button aria-label={language === 'vi' ? 'Đóng giải thích' : 'Close explanation'} onClick={() => setSelectedActionDetail(null)} className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 dark:hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            
            <h3 id="action-detail-title"
              className={`text-2xl font-bold mb-4 pr-8 ${isDarkMode ? 'text-white' : 'text-black'}`}
              style={{ 
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                color: isDarkMode ? '#ffffff' : '#000000'
              }}
            >
              {selectedActionDetail.title}
            </h3>
            
            <p className={`mb-8 text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {selectedActionDetail.description}
            </p>

            {selectedActionDetail.evidence ? (
              <div className="space-y-5">
                {selectedActionDetail.tradeoff && (
                  <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-amber-400/30 bg-amber-400/10' : 'border-amber-200 bg-amber-50'}`}>
                    <h4 className={`mb-1 text-sm font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                      {language === 'vi' ? 'Điểm đánh đổi' : 'Trade-off'}
                    </h4>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {selectedActionDetail.tradeoff}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className={`mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {language === 'vi' ? 'Bằng chứng hướng dẫn' : 'Guideline evidence'}
                  </h4>
                  {selectedActionDetail.evidence.length ? (
                    <ul className="space-y-3">
                      {selectedActionDetail.evidence.map((citation) => (
                        <li key={`${citation.source_id}-${citation.page}-${citation.section}`} className={`rounded-xl border p-4 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                          <p className={`mb-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            “{citation.excerpt}”
                          </p>
                          <a
                            href={citation.canonical_url}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex min-h-11 items-center rounded-lg text-sm font-bold underline underline-offset-4 focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}
                          >
                            {citation.citation}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={`rounded-xl border p-4 text-sm ${isDarkMode ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                      {language === 'vi'
                        ? 'Không truy xuất được nguồn hướng dẫn cho phương án này; hệ thống không đưa ra tuyên bố bằng chứng y khoa.'
                        : 'No guideline source was retrieved for this option, so no clinical-evidence claim is shown.'}
                    </p>
                  )}
                </div>
                {selectedActionDetail.activities && (
                  <button
                    type="button"
                    disabled={isResimulatingAlternative}
                    onClick={() => simulateAlternative(selectedActionDetail)}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                  >
                    <Play className="h-4 w-4" aria-hidden="true" />
                    {isResimulatingAlternative
                      ? (language === 'vi' ? 'Đang mô phỏng...' : 'Simulating...')
                      : (language === 'vi' ? 'Mô phỏng phương án này' : 'Simulate this alternative')}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Các bước thực hiện:
                </h4>
                <ul className="space-y-4">
                  {(Array.isArray(t(`results.actionCards.${selectedActionDetail.id.replace('backend-','').replace('auto-','')}.steps`)) ? t(`results.actionCards.${selectedActionDetail.id.replace('backend-','').replace('auto-','')}.steps`) : [t('ui.noStepsAvailable')]).map((step: string, i: number) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 text-xs font-bold border border-blue-500/20">
                        {i + 1}
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderAboutUs = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="about-placeholder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full min-h-[100vh] pt-32 pb-20 px-6 flex items-center justify-center relative z-10"
      >
        <div className={`relative backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] rounded-[2rem] overflow-hidden p-8 md:p-12 max-w-2xl w-full text-center ${
          isDarkMode
            ? 'bg-slate-900/95 border-slate-700/50 text-white'
            : 'bg-white/90 border-white/60 text-slate-900'
        }`}>
          <h2 className={`text-3xl md:text-4xl font-extrabold mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {t('about.title')}
          </h2>
          <p className={`text-lg leading-relaxed mb-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('about.placeholder')}
          </p>
          <button
            onClick={() => setIsAboutUsOpen(false)}
            className="px-8 py-3 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            {t('about.btnBack')}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  const renderStepContent = () => {
    const questionCardClass = `space-y-4 rounded-[2rem] p-6 border shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)] ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/20 backdrop-blur-3xl border-white/40'}`;
    const questionLabelClass = `block text-base font-bold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`;
    const textHintClass = `text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;
    const inputClass = `w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all font-medium ${isDarkMode ? 'bg-[#0b132b]/60 border-white/15 text-white focus:border-blue-500 focus:ring-blue-500/20' : 'bg-white/90 border-slate-100 text-slate-700 focus:border-blue-500 focus:ring-blue-500/10'}`;
    const selectClass = `w-full p-4 rounded-2xl border-2 appearance-none focus:outline-none focus:ring-4 transition-all font-medium ${isDarkMode ? 'bg-[#0b132b]/60 border-white/15 text-white focus:border-blue-500 focus:ring-blue-500/20' : 'bg-white/90 border-slate-100 text-slate-700 focus:border-blue-500 focus:ring-blue-500/10'}`;
    const choiceButtonClass = (selected: boolean) => (
      `px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${selected
        ? (isDarkMode
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] border-transparent')
        : (isDarkMode
          ? 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50')
      }`
    );

    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <h2 className={`text-2xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('questions.s1Title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q1')}</label>
                <input type="number" min="10" max="100" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="20" className={inputClass} />
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q2')}</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { val: 'male', label: t('questions.genderMale') },
                    { val: 'female', label: t('questions.genderFemale') },
                    { val: 'other', label: t('questions.genderOther') }
                  ].map(gender => (
                    <button key={gender.val} onClick={() => handleInputChange('gender', gender.val)} className={choiceButtonClass(formData.gender === gender.val)}>{gender.label}</button>
                  ))}
                </div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q3')}</label>
                <input type="number" min="0" max="3650" value={formData.days_since_injury} onChange={(e) => handleInputChange('days_since_injury', e.target.value)} placeholder="3" className={inputClass} />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <h2 className={`text-2xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('questions.s2Title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q4')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.headache} onChange={(v) => handleInputChange('headache', v)} ariaLabel="Headache severity" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q5')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.dizziness} onChange={(v) => handleInputChange('dizziness', v)} ariaLabel="Dizziness severity" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q6')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.blurred_vision} onChange={(v) => handleInputChange('blurred_vision', v)} ariaLabel="Blurred vision severity" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q7')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.nausea} onChange={(v) => handleInputChange('nausea', v)} ariaLabel="Nausea severity" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
            </div>

            <fieldset className={`rounded-[2rem] border p-6 ${isDarkMode ? 'border-red-400/30 bg-red-950/20' : 'border-red-200 bg-red-50/80'}`}>
              <legend className={`px-2 text-base font-extrabold ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>
                {language === 'vi' ? 'Kiểm tra dấu hiệu cần chăm sóc khẩn cấp' : 'Check for symptoms needing urgent care'}
              </legend>
              <p className={`mb-4 text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'vi'
                  ? 'Chỉ chọn những dấu hiệu bạn đang thực sự gặp. Nếu có, hệ thống sẽ dừng khuyến nghị kế hoạch và hiển thị hướng dẫn tìm chăm sóc y tế.'
                  : 'Select only symptoms you are actually experiencing. If any apply, planning recommendations stop and urgent-care guidance is shown.'}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    key: 'worsening_headache' as const,
                    label: language === 'vi' ? 'Đau đầu đang nặng dần' : 'A headache that is getting worse',
                  },
                  {
                    key: 'repeated_vomiting' as const,
                    label: language === 'vi' ? 'Nôn nhiều lần' : 'Repeated vomiting',
                  },
                  {
                    key: 'neurological_danger_sign' as const,
                    label: language === 'vi'
                      ? 'Lú lẫn, co giật, yếu/tê tay chân hoặc khó nói'
                      : 'Confusion, seizure, limb weakness/numbness, or trouble speaking',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-red-500 ${
                      formData[item.key]
                        ? (isDarkMode ? 'border-red-400 bg-red-500/20 text-red-100' : 'border-red-500 bg-white text-red-900')
                        : (isDarkMode ? 'border-white/15 bg-white/5 text-slate-200' : 'border-red-100 bg-white/70 text-slate-700')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData[item.key]}
                      onChange={(event) => handleInputChange(item.key, event.target.checked)}
                      className="h-5 w-5 accent-red-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <h2 className={`text-2xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('questions.s3Title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q8')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.sleep_quality} onChange={(v) => handleInputChange('sleep_quality', v)} ariaLabel="Sleep quality" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q9')}</label>
                <div className="flex gap-4">
                  {[
                    { val: 'yes', label: t('questions.yes') },
                    { val: 'no', label: t('questions.no') }
                  ].map(opt => (
                    <button key={opt.val} onClick={() => handleInputChange('exercised_today', opt.val)} className={choiceButtonClass(formData.exercised_today === opt.val)}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q10')}</label>
                <div className="flex gap-4">
                  {[
                    { val: 'yes', label: t('questions.yes') },
                    { val: 'no', label: t('questions.no') }
                  ].map(opt => (
                    <button key={opt.val} onClick={() => handleInputChange('symptoms_worsened_after_activity', opt.val)} className={choiceButtonClass(formData.symptoms_worsened_after_activity === opt.val)}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <h2 className={`text-2xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('questions.s4Title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q11')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.screen_time} onChange={(v) => handleInputChange('screen_time', v)} ariaLabel="Screen time" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q12')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.study_work_hours} onChange={(v) => handleInputChange('study_work_hours', v)} ariaLabel="Study or work hours" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q13')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.concentration_difficulty} onChange={(v) => handleInputChange('concentration_difficulty', v)} ariaLabel="Concentration difficulty" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <h2 className={`text-2xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('questions.s5Title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q14')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.mood} onChange={(v) => handleInputChange('mood', v)} ariaLabel="Mood today" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q15')}</label>
                <CustomSlider min={0} max={3} step={1} value={formData.social_support} onChange={(v) => handleInputChange('social_support', v)} ariaLabel="Social support" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>3</span></div>
              </div>
              <div className={questionCardClass}>
                <label className={questionLabelClass}>{t('questions.q16')}</label>
                <CustomSlider min={0} max={5} step={1} value={formData.overwhelm_level} onChange={(v) => handleInputChange('overwhelm_level', v)} ariaLabel="Stress or overwhelm level" />
                <div className={`flex justify-between ${textHintClass}`}><span>0</span><span>5</span></div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const buildInsightCopy = (result: AIRecommendation) => {
    const sorted = [...result.feature_importance].sort((a, b) => b.importance - a.importance);
    const formatTop = (count: number) =>
      sorted
        .slice(0, count)
        .map((item) => `${getFeatureLabel(item.feature)} (${Math.round(item.importance)}%)`)
        .join(', ');

    const levelLabel = t(`results.${result.recovery_load_level.toLowerCase()}`);
    const confidencePct = Math.round(result.confidence_score * 100);
    const primary = getFeatureLabel(String(sorted[0]?.feature || ''));
    const secondary = getFeatureLabel(String(sorted[1]?.feature || ''));

    switch (language) {
      case 'en':
        return {
          trends: `Current recovery load level: ${levelLabel} (confidence ${confidencePct}%). Top trends: ${formatTop(3)}.`,
          touchpoints: `Strongest drivers: ${formatTop(2)}. Prioritize ${primary}${secondary ? ` and ${secondary}` : ''}.`
        };
      default:
        return {
          trends: `Mức tải hồi phục hiện tại: ${levelLabel} (độ chính xác ${confidencePct}%). Xu hướng chính: ${formatTop(3)}.`,
          touchpoints: `Các yếu tố ảnh hưởng mạnh nhất: ${formatTop(2)}. Ưu tiên theo dõi ${primary}${secondary ? ` và ${secondary}` : ''}.`
        };
    }
  };

  // ─── Dashboard Chart Data ───────────────────────────────────────────────
  const buildRadarData = () => {
    // Normalize each dimension to 0–100 with safety checks.
    // Dimensions: Symptoms, Sleep, Cognitive Load, Physical Activity, Mood.
    // For "Symptoms", "Cognitive Load" the raw scores are severity (0=best),
    // so we invert them — higher radar value always means "doing better".
    try {
      const safeNum = (val: any, def = 0) => {
        const n = Number(val) || def;
        return isNaN(n) ? def : n;
      };

      const hc = safeNum(formData.headache, 0);
      const dz = safeNum(formData.dizziness, 0);
      const bv = safeNum(formData.blurred_vision, 0);
      const na = safeNum(formData.nausea, 0);
      const sq = safeNum(formData.sleep_quality, 0);
      const st = safeNum(formData.screen_time, 0);
      const sw = safeNum(formData.study_work_hours, 0);
      const cd = safeNum(formData.concentration_difficulty, 0);
      const mo = safeNum(formData.mood, 0);
      const worsened = formData.symptoms_worsened_after_activity === 'yes' ? 1 : 0;

      const avgSymptom = (hc + dz + bv + na) / 4;
      const symptoms = Math.round(((5 - avgSymptom) / 5) * 100);
      const sleep = Math.round((sq / 5) * 100);
      const avgCognitive = (st + sw + cd) / 3;
      const cognitiveLoad = Math.round(((5 - avgCognitive) / 5) * 100);
      const physicalActivity = Math.round(((5 - worsened * 5) / 5) * 100);
      const mood = Math.round((mo / 5) * 100);

      const getRadarLabel = (cat: string) => {
        const radMap: any = {
          en: { symptoms: "Symptoms", sleep: "Sleep", cognitiveLoad: "Cognitive Load", physicalActivity: "Physical Activity", mood: "Mood" },
          vi: { symptoms: "Triệu chứng", sleep: "Giấc ngủ", cognitiveLoad: "Tải nhận thức", physicalActivity: "Vận động thể chất", mood: "Tâm trạng" },
        };
        return radMap[language]?.[cat] || radMap.en[cat];
      };

      return [
        { subject: getRadarLabel('symptoms'), value: Math.min(100, Math.max(5, isNaN(symptoms) ? 50 : symptoms)), fullMark: 100 },
        { subject: getRadarLabel('sleep'), value: Math.min(100, Math.max(5, isNaN(sleep) ? 50 : sleep)), fullMark: 100 },
        { subject: getRadarLabel('cognitiveLoad'), value: Math.min(100, Math.max(5, isNaN(cognitiveLoad) ? 50 : cognitiveLoad)), fullMark: 100 },
        { subject: getRadarLabel('physicalActivity'), value: Math.min(100, Math.max(5, isNaN(physicalActivity) ? 50 : physicalActivity)), fullMark: 100 },
        { subject: getRadarLabel('mood'), value: Math.min(100, Math.max(5, isNaN(mood) ? 50 : mood)), fullMark: 100 },
      ];
    } catch (error) {
      console.error('Error in buildRadarData:', error);
      return [
        { subject: 'Symptoms', value: 50, fullMark: 100 },
        { subject: 'Sleep', value: 50, fullMark: 100 },
        { subject: 'Cognitive Load', value: 50, fullMark: 100 },
        { subject: 'Physical Activity', value: 50, fullMark: 100 },
        { subject: 'Mood', value: 50, fullMark: 100 },
      ];
    }
  };

  const buildPeerData = () => {
    try {
      const safeNum = (val: any, def = 0) => {
        const n = Number(val) || def;
        return isNaN(n) ? def : n;
      };

      const sq = safeNum(formData.sleep_quality, 0);
      const hc = safeNum(formData.headache, 0);
      const ss = safeNum(formData.social_support, 0);
      const st = safeNum(formData.screen_time, 0);
      const mo = safeNum(formData.mood, 0);

      const peerData = [
        {
          label: getFeatureLabel('sleep_quality'),
          you: Math.round((sq / 5) * 10),
          avg: 7,
          unit: 'hrs',
          youPct: Math.min(100, Math.round((sq / 5) * 100)),
          avgPct: 70,
        },
        {
          label: getFeatureLabel('headache'),
          you: hc,
          avg: 2,
          unit: '/5',
          youPct: Math.min(100, Math.round((hc / 5) * 100)),
          avgPct: 40,
        },
        {
          label: getFeatureLabel('social_support'),
          you: ss,
          avg: 2,
          unit: '/3',
          youPct: Math.min(100, Math.round((ss / 3) * 100)),
          avgPct: 65,
        },
        {
          label: getFeatureLabel('screen_time'),
          you: st,
          avg: 3,
          unit: '/5',
          youPct: Math.min(100, Math.round((st / 5) * 100)),
          avgPct: 60,
        },
        {
          label: getFeatureLabel('mood'),
          you: mo,
          avg: 3,
          unit: '/5',
          youPct: Math.min(100, Math.round((mo / 5) * 100)),
          avgPct: 60,
        },
      ];
      return peerData;
    } catch (error) {
      console.error('Error in buildPeerData:', error);
      return [
        { label: 'Sleep', you: 0, avg: 7, unit: 'hrs', youPct: 0, avgPct: 70 },
        { label: 'Headache', you: 0, avg: 2, unit: '/5', youPct: 0, avgPct: 40 },
        { label: 'Social', you: 0, avg: 2, unit: '/3', youPct: 0, avgPct: 65 },
        { label: 'Screen Time', you: 0, avg: 3, unit: '/5', youPct: 0, avgPct: 60 },
        { label: 'Mood', you: 0, avg: 3, unit: '/5', youPct: 0, avgPct: 60 },
      ];
    }
  };

  const buildRecoveryTrendData = () => {
    const calculateSymptomBurden = (
      item: CheckinListItem
    ) => {
      const total =
        item.headache +
        item.dizziness +
        item.blurred_vision +
        item.nausea;

      const maxTotal = 4 * 3;

      return Math.round(
        (total / maxTotal) * 100
      );
    };

    if (!checkins || checkins.length === 0) {
      return [];
    }

    const sorted = [...checkins]
      .sort((a, b) =>
        a.checkin_date.localeCompare(
          b.checkin_date
        )
      );

    if (stressTrendPeriod === 'weekly') {
      return sorted
        .slice(-7)
        .map((item) => ({
          label: new Date(
            `${item.checkin_date}T00:00:00`
          ).toLocaleDateString(
            language === 'vi' ? 'vi-VN' : 'en-US',
            {
              weekday: 'short',
            }
          ),

          symptomBurden:
            calculateSymptomBurden(item),

          date: item.checkin_date,
        }));
    }

    const groups = new Map<
      string,
      number[]
    >();

    sorted.forEach((item) => {
      const date = new Date(
        `${item.checkin_date}T00:00:00`
      );

      const weekIndex =
        `W${Math.floor(
          (date.getDate() - 1) / 7
        ) + 1}`;

      const current =
        groups.get(weekIndex) ?? [];

      current.push(
        calculateSymptomBurden(item)
      );

      groups.set(
        weekIndex,
        current
      );
    });

    return Array.from(groups.entries())
      .slice(-4)
      .map(([label, values]) => ({
        label,

        symptomBurden:
          Math.round(
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / values.length
          ),
      }));
  };

  const buildStressTrendData = () => {
    const history = [...checkins]
      .sort(
        (a, b) =>
          new Date(a.checkin_date).getTime() -
          new Date(b.checkin_date).getTime()
      );

    if (history.length === 0) {
      return [];
    }

    const calculateLoad = (session: CheckinListItem) => {
      const symptomScore =
        (
          session.headache +
          session.dizziness +
          session.blurred_vision +
          session.nausea
        ) / 4;

      const cognitiveScore =
        (
          session.concentration_difficulty +
          Math.min(session.screen_time_minutes / 120, 3) +
          Math.min(session.study_work_minutes / 120, 3)
        ) / 3;

      const sleepPenalty =
        session.sleep_quality == null
          ? 0
          : 3 - session.sleep_quality;

      return Math.round(
        ((symptomScore + cognitiveScore + sleepPenalty) / 9) * 100
      );
    };

    const selectedHistory =
      stressTrendPeriod === 'weekly'
        ? history.slice(-7)
        : history.slice(-30);

    return selectedHistory.map((session) => ({
      label: formatSessionDate(session.checkin_date),
      stress: calculateLoad(session),
    }));
  };

  const buildCalendarData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const firstDayOfWeek =
      new Date(year, month, 1).getDay();

    const stressPattern = Array(daysInMonth).fill(0);

    const calculateLevel = (
      session: CheckinListItem
    ) => {
      const symptomAverage =
        (
          session.headache +
          session.dizziness +
          session.blurred_vision +
          session.nausea
        ) / 4;

      if (symptomAverage >= 2) return 3;
      if (symptomAverage >= 1) return 2;

      return 1;
    };

    checkins.forEach((session) => {
      const date = new Date(session.checkin_date);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month
      ) {
        stressPattern[date.getDate() - 1] =
          calculateLevel(session);
      }
    });

    return {
      daysInMonth,
      firstDayOfWeek:
        firstDayOfWeek === 0
          ? 6
          : firstDayOfWeek - 1,
      stressPattern,
      month,
      year,
    };
  };

  // Custom Radar tooltip
  const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      return (
        <div className={`px-3 py-2 rounded-xl text-xs font-bold shadow-lg border ${isDarkMode ? 'bg-slate-900 border-white/10 text-slate-100' : 'bg-white border-white/60 text-slate-800'
          }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          <div className="text-[10px] uppercase tracking-widest mb-1 text-slate-400">{d.payload?.subject}</div>
          <div style={{ color: '#006b60' }}>{d.value}<span className="text-slate-400 font-normal">/100</span></div>
        </div>
      );
    }
    return null;
  };

  const AreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-2 rounded-xl text-xs shadow-lg border ${isDarkMode ? 'bg-slate-900 border-white/10 text-slate-100' : 'bg-white border-white/60 text-slate-800'
          }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
          <div className="font-bold mb-1">{label}</div>
          {payload.map((p: any, i: number) => (
            <div key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
              {p.name}: <span className="font-bold">{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderDashboardView = () => {
    const signal = (() => {
      if (!recoveryProfile) {
        return {
          title: 'Loading recovery signal',
          description: 'Retrieving recent recovery observations.',
          trendLabel: 'Loading',
          trendClass: isDarkMode
            ? 'bg-slate-800/70 text-slate-300 border-slate-700'
            : 'bg-slate-100 text-slate-600 border-slate-200',
          Icon: Activity,
        };
      }

      switch (recoveryProfile.trend) {
        case 'improving':
          return {
            title: 'Recovery trend is improving',
            description:
              'Recent self-reported patterns are trending in a more favorable direction.',
            trendLabel: 'Improving',
            trendClass: isDarkMode
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200',
            Icon: TrendingUp,
          };

        case 'stable':
          return {
            title: 'Recovery trend is stable',
            description:
              'Recent self-reported patterns are not showing a meaningful directional change.',
            trendLabel: 'Stable',
            trendClass: isDarkMode
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              : 'bg-blue-50 text-blue-700 border-blue-200',
            Icon: Minus,
          };

        case 'worsening':
          return {
            title: 'Recovery trend needs attention',
            description:
              'Recent self-reported patterns show a worsening direction that may deserve closer monitoring.',
            trendLabel: 'Needs attention',
            trendClass: isDarkMode
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : 'bg-rose-50 text-rose-700 border-rose-200',
            Icon: TrendingDown,
          };

        case 'insufficient_data':
        default:
          return {
            title: 'Not enough data to determine a trend',
            description:
              'More check-ins are needed before the system can describe a recent recovery pattern.',
            trendLabel: 'Insufficient data',
            trendClass: isDarkMode
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-amber-50 text-amber-700 border-amber-200',
            Icon: Database,
          };
      }
    })();

    const SignalIcon = signal.Icon;
    const radarData = buildRadarData();
    const trendData = buildStressTrendData();
    const calendar = buildCalendarData();
    const peerData = buildPeerData();
    const localeMap: Record<string, string> = { vi: 'vi-VN', en: 'en-US' };
    const monthName = new Date(calendar.year, calendar.month).toLocaleString(localeMap[language], { month: 'long', year: 'numeric' });
    const dayLabels = [t('ui.calendar.mon'), t('ui.calendar.tue'), t('ui.calendar.wed'), t('ui.calendar.thu'), t('ui.calendar.fri'), t('ui.calendar.sat'), t('ui.calendar.sun')];
    const stressColors = [
      isDarkMode ? '#1e293b' : '#f1f4f6',   // 0 = no data
      '#5bf4de',  // 1 = low
      '#6e3bd8',  // 2 = medium
      '#a53173',  // 3 = high
    ];

    return (
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className={`text-3xl lg:text-4xl font-extrabold tracking-tight`}
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>
              {t('ui.dashboard.title')}
            </h2>
            <p className={`mt-2 text-sm md:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
              {t('ui.dashboard.subtitle')}
            </p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest shrink-0 ${isDarkMode ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'bg-teal-600/10 text-teal-700 border border-teal-200'
            }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
            <Activity className="w-4 h-4" /> {t('ui.dashboard.period')}
          </div>
        </div>

        {/* Recovery Signal */}
        <motion.div
          key={`${activeDemoUserId}-${recoveryProfile?.trend ?? 'loading'}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`analytics-glass-card mb-6 overflow-hidden rounded-[2rem] border p-5 md:p-6 ${
            isDarkMode
              ? 'border-white/10 bg-slate-900/50'
              : 'border-white/60 bg-white/70'
          }`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Left */}
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  signal.trendClass
                }`}
              >
                <SignalIcon className="h-6 w-6" />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Recovery Signal
                  </span>

                  {recoveryProfile && (
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${signal.trendClass}`}
                    >
                      {signal.trendLabel}
                    </span>
                  )}
                </div>

                <h3
                  className={`text-lg font-extrabold md:text-xl ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  }}
                >
                  {signal.title}
                </h3>

                <p
                  className={`mt-1 max-w-2xl text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                  style={{
                    fontFamily: "'Manrope', 'Inter', sans-serif",
                  }}
                >
                  {signal.description}
                </p>
              </div>
            </div>

            {/* Right: metadata */}
            {recoveryProfile && (
              <div className="grid grid-cols-3 gap-3 md:min-w-[330px]">
                <div
                  className={`rounded-2xl border px-3 py-3 text-center ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5'
                      : 'border-slate-100 bg-white/60'
                  }`}
                >
                  <div
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Check-ins
                  </div>

                  <div
                    className={`mt-1 text-lg font-extrabold ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {recoveryProfile.checkin_count_in_window}
                  </div>

                  <div
                    className={`text-[9px] ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {recoveryProfile.window_days} days
                  </div>
                </div>

                <div
                  className={`rounded-2xl border px-3 py-3 text-center ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5'
                      : 'border-slate-100 bg-white/60'
                  }`}
                >
                  <div
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Data
                  </div>

                  <div
                    className={`mt-1 text-sm font-extrabold capitalize ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {recoveryProfile.data_sufficiency}
                  </div>
                </div>

                <div
                  className={`rounded-2xl border px-3 py-3 text-center ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5'
                      : 'border-slate-100 bg-white/60'
                  }`}
                >
                  <div
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Uncertainty
                  </div>

                  <div
                    className={`mt-1 text-sm font-extrabold capitalize ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {recoveryProfile.uncertainty}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Observed pattern */}
          {recoveryProfile &&
            recoveryProfile.observed_patterns.length > 0 && (
              <div
                className={`mt-5 border-t pt-4 ${
                  isDarkMode ? 'border-white/10' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Activity
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      isDarkMode ? 'text-teal-300' : 'text-teal-600'
                    }`}
                  />

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      Observed pattern
                    </p>

                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {recoveryProfile.observed_patterns[0].description}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Safety note */}
          <p
            className={`mt-4 text-[10px] leading-relaxed ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Trend labels describe recent self-reported patterns and are not a
            medical recovery status.
          </p>
        </motion.div>

        {/* Row 1: Radar Chart + Summary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: '400px' }}>
          {/* Radar Chart */}
          <div className={`lg:col-span-7 analytics-glass-card rounded-[2rem] p-6 md:p-8 shadow-sm ${isDarkMode ? 'dark' : ''}`} style={{ minHeight: '400px' }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.dashboard.lifeBalance')}</h3>
                <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.dashboard.lifeBalanceDesc')}</p>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-teal-100 text-teal-700 border border-teal-200'
                }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.live')}</span>
            </div>
            <div className="w-full" style={{ height: 320, minWidth: 0, overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height="100%" debounce={10}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <defs>
                    <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#006b60" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#5bf4de" stopOpacity={0.05} />
                    </radialGradient>
                  </defs>
                  <PolarGrid
                    stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
                    strokeDasharray="4 4"
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 9 }}
                    tickCount={4}
                    stroke="transparent"
                  />
                  <Tooltip content={<RadarTooltip />} />
                  <Radar
                    name="You"
                    dataKey="value"
                    stroke="#006b60"
                    strokeWidth={2.5}
                    fill="url(#radarFill)"
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    dot={{ fill: '#006b60', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {radarData.map(d => (
                <div key={d.subject} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{
                    backgroundColor: d.value >= 70 ? '#006b60' : d.value >= 40 ? '#6e3bd8' : '#a53173'
                  }} />
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                    style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                    {d.subject}: <span style={{ color: d.value >= 70 ? '#006b60' : d.value >= 40 ? '#6e3bd8' : '#a53173' }}>{d.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Column */}
          <div className="lg:col-span-5 flex flex-col gap-4" style={{ minHeight: '400px' }}>
            {radarData.map((d, i) => {
              const icons = [BookOpen, Moon, Users, DollarSign, Activity];
              const Icon = icons[i];
              const colors = ['#006b60', '#6e3bd8', '#a53173', '#48e5d0', '#f59e0b'];
              const color = colors[i];
              const level = d.value >= 70 ? t('ui.status.good') : d.value >= 40 ? t('ui.status.fair') : t('ui.status.needsAttention');
              const levelColor = d.value >= 70 ? '#006b60' : d.value >= 40 ? '#6e3bd8' : '#a53173';
              return (
                <div key={d.subject} className={`analytics-glass-card rounded-2xl p-4 flex items-center gap-4 ${isDarkMode ? 'dark' : ''}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color + '20', color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                        style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{d.subject}</span>
                      <span className="text-xs font-bold" style={{ color: levelColor, fontFamily: "'Manrope', 'Inter', sans-serif" }}>{level}</span>
                    </div>
                    <div className={`h-2 rounded-full w-full overflow-hidden ${isDarkMode ? 'bg-slate-700/60' : 'bg-slate-100'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${d.value}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-black shrink-0 w-9 text-right ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                    style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{d.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Area Chart + Calendar Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: '350px' }}>
          {/* Stress Trend Area Chart */}
          <div className={`lg:col-span-8 analytics-glass-card rounded-[2rem] p-6 md:p-8 shadow-sm ${isDarkMode ? 'dark' : ''}`} style={{ minHeight: '350px' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.dashboard.stressTrend')}</h3>
                <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.dashboard.stressTrendDesc')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStressTrendPeriod('weekly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${stressTrendPeriod === 'weekly'
                    ? (isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-600/10 text-teal-700')
                    : (isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100/70')
                    }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.weekly')}</button>
                <button
                  onClick={() => setStressTrendPeriod('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${stressTrendPeriod === 'monthly'
                    ? (isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-600/10 text-teal-700')
                    : (isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100/70')
                    }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.monthly')}</button>
              </div>
            </div>
            <div style={{ height: 240, minWidth: 0, overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height="100%" debounce={10}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006b60" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#006b60" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6e3bd8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6e3bd8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<AreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    name={t('ui.campusAvg')}
                    stroke="#6e3bd8"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    fill="url(#avgGrad)"
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1200}
                  />
                  <Area
                    type="monotone"
                    dataKey="stress"
                    name={t('ui.yourStress')}
                    stroke="#006b60"
                    strokeWidth={3}
                    fill="url(#stressGrad)"
                    strokeLinecap="round"
                    dot={{ fill: '#006b60', r: 4, strokeWidth: 2.5, stroke: isDarkMode ? '#0f172a' : '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#006b60' }}
                    isAnimationActive={true}
                    animationDuration={1400}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: "'Manrope', 'Inter', sans-serif", fontWeight: 700 }}>{value}</span>
                    )}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar Heatmap */}
          <div className={`lg:col-span-4 analytics-glass-card rounded-[2rem] p-6 shadow-sm ${isDarkMode ? 'dark' : ''}`} style={{ minHeight: '350px' }}>
            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.dashboard.moodCalendar')}</h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{monthName}</p>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayLabels.map(d => (
                <div key={d} className={`text-center text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: calendar.firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {/* Day cells */}
              {Array.from({ length: calendar.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const stressLevel = calendar.stressPattern[i] ?? 0;
                const bgColor = stressColors[stressLevel];
                const today = new Date().getDate() === day && new Date().getMonth() === calendar.month;
                return (
                  <div
                    key={`day-${day}`}
                    className="aspect-square rounded-lg transition-transform hover:scale-110 relative flex items-center justify-center"
                    style={{ backgroundColor: bgColor, cursor: 'default' }}
                    title={`${t('ui.day')} ${day}: ${stressLevel === 0 ? t('ui.noData') :
                      stressLevel === 1 ? t('ui.lowStress') :
                        stressLevel === 2 ? t('ui.mediumStress') : t('ui.highStress')
                      }`}
                  >
                    {today && (
                      <span className="absolute inset-0 rounded-lg ring-2 ring-offset-1 ring-white/80" />
                    )}
                    <span className={`text-[9px] font-black ${stressLevel >= 2 ? 'text-white/80' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                      }`}>{day}</span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('results.low')}</span>
              <div className="flex gap-1.5 items-center">
                {stressColors.slice(1).map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('results.high')}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Peer Comparison Horizontal Bar Chart */}
        <div className={`analytics-glass-card rounded-[2rem] p-6 md:p-8 shadow-sm ${isDarkMode ? 'dark' : ''}`} style={{ minHeight: '300px' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.dashboard.peerComparison')}</h3>
              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.dashboard.peerComparisonDesc')}</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, #006b60, #48e5d0)' }} />
                <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.you')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-2.5 rounded-full" style={{ backgroundColor: isDarkMode ? '#334155' : '#ddcdff' }} />
                <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.campusAvg')}</span>
              </div>
            </div>
          </div>
          <div className="space-y-7">
            {peerData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                    style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.youPct >= item.avgPct
                      ? (isDarkMode ? 'bg-teal-500/15 text-teal-300' : 'bg-teal-600/10 text-teal-700')
                      : (isDarkMode ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700')
                      }`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                      You: {item.you}{item.unit}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                      style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>vs Avg: {item.avg}{item.unit}</span>
                  </div>
                </div>
                {/* Avg bar (background) */}
                <div className="relative h-5 w-full rounded-full overflow-hidden" style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${item.avgPct}%`, background: isDarkMode ? '#334155' : '#ddcdff' }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1200 ease-out"
                    style={{
                      width: `${item.youPct}%`,
                      background: 'linear-gradient(90deg, #006b60, #48e5d0)',
                      boxShadow: '4px 0 12px rgba(0,107,96,0.35)'
                    }}
                  />
                  {/* Value label inside bar */}
                  {item.youPct > 15 && (
                    <span className="absolute inset-y-0 flex items-center text-[10px] font-black text-white/90 px-2"
                      style={{ left: `${Math.min(item.youPct - 8, 85)}%`, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                      {item.youPct}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const insightCopy = aiResult ? buildInsightCopy(aiResult) : null;
  const insightMeta = aiResult
    ? {
      levelLabel: aiResult.recovery_load_level === 'Low' ? 'Low' : aiResult.recovery_load_level === 'Medium' ? 'Medium' : 'High',
      confidencePct: Math.round(aiResult.confidence_score * 100),
      topFeatures: [...aiResult.feature_importance].sort((a, b) => b.importance - a.importance).slice(0, 2)
    }
    : null;

  const levelBadgeClass = (level?: string) => {
    if (level === 'High') return isDarkMode ? 'bg-rose-900/40 text-rose-300 border-rose-800/50' : 'bg-rose-50 text-rose-700 border-rose-100';
    if (level === 'Medium') return isDarkMode ? 'bg-amber-900/40 text-amber-300 border-amber-800/50' : 'bg-amber-50 text-amber-700 border-amber-100';
    return isDarkMode ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100';
  };

  const buildPersonalizedActionCards = (result: AIRecommendation, data: typeof formData): ActionCardItem[] => {
    const cards: ActionCardItem[] = [];

    const addCard = (card: ActionCardItem) => {
      if (!cards.some(existing => existing.id === card.id)) {
        cards.push(card);
      }
    };

    const addTemplate = (
      id: string,
      categoryKey: string,
      titleKey: string,
      descKey: string,
      vars: Record<string, string | number> = {}
    ) => {
      addCard({
        id,
        categoryKey,
        title: t(titleKey),
        description: tWith(descKey, vars)
      });
    };

    const sleepScore = Number(data.sleep_quality);
    const screenTimeScore = Number(data.screen_time);
    const studyWorkScore = Number(data.study_work_hours);
    const headacheScore = Number(data.headache);
    const dizzinessScore = Number(data.dizziness);
    const visionScore = Number(data.blurred_vision);
    const nauseaScore = Number(data.nausea);
    const moodScore = Number(data.mood);
    const supportScore = Number(data.social_support);
    const overwhelmScore = Number(data.overwhelm_level);
    const concentrationScore = Number(data.concentration_difficulty);
    const symptomScore = Math.max(headacheScore, dizzinessScore, visionScore, nauseaScore);

    if (sleepScore <= 2) {
      addTemplate('auto-sleep-reset', 'sleep', 'results.actionCards.sleepTitle', 'results.actionCards.sleepDesc', { score: sleepScore });
    }
    if (screenTimeScore >= 4) {
      addTemplate('auto-study-load', 'study', 'results.actionCards.studyLoadTitle', 'results.actionCards.studyLoadDesc', { score: screenTimeScore });
    }
    if (concentrationScore >= 3) {
      addTemplate('auto-study-focus', 'study', 'results.actionCards.studyFocusTitle', 'results.actionCards.studyFocusDesc', { score: concentrationScore });
    }
    if (symptomScore >= 3) {
      addTemplate('auto-anxiety', 'mental', 'results.actionCards.anxietyTitle', 'results.actionCards.anxietyDesc', { score: symptomScore });
    }
    if (moodScore <= 2) {
      addTemplate('auto-mood', 'mental', 'results.actionCards.moodTitle', 'results.actionCards.moodDesc', { score: moodScore });
    }
    if (supportScore <= 1) {
      addTemplate('auto-support', 'social', 'results.actionCards.supportTitle', 'results.actionCards.supportDesc', { score: supportScore });
    }
    if (data.symptoms_worsened_after_activity === 'yes') {
      addTemplate('auto-peer-pressure', 'social', 'results.actionCards.peerTitle', 'results.actionCards.peerDesc', { score: overwhelmScore });
    }
    if (studyWorkScore >= 4) {
      addTemplate('auto-bullying', 'social', 'results.actionCards.bullyingTitle', 'results.actionCards.bullyingDesc', { score: studyWorkScore });
    }
    if (data.exercised_today === 'no') {
      addTemplate('auto-activity', 'exercise', 'results.actionCards.activityTitle', 'results.actionCards.activityDesc', { score: 0 });
    }
    if (overwhelmScore >= 3) {
      addTemplate('auto-needs', 'finance', 'results.actionCards.needsTitle', 'results.actionCards.needsDesc', { score: overwhelmScore });
    }
    if (symptomScore >= 3) {
      addTemplate('auto-relief', 'mental', 'results.actionCards.reliefTitle', 'results.actionCards.reliefDesc', { score: symptomScore });
    }
    if (result.recovery_load_level === 'High') {
      addTemplate('auto-high-stress', 'mental', 'results.actionCards.highStressTitle', 'results.actionCards.highStressDesc');
    }

    const topFeature = [...result.feature_importance].sort((a, b) => b.importance - a.importance)[0];
    if (topFeature) {
      addTemplate('auto-top-driver', 'general', 'results.actionCards.topDriverTitle', 'results.actionCards.topDriverDesc', {
        feature: getFeatureLabel(topFeature.feature),
        pct: Math.round(topFeature.importance)
      });
    }

    const fallbackTemplates = [
      { id: 'auto-breathe', categoryKey: 'mental', titleKey: 'results.actionCards.breatheTitle', descKey: 'results.actionCards.breatheDesc' },
      { id: 'auto-breaks', categoryKey: 'study', titleKey: 'results.actionCards.breaksTitle', descKey: 'results.actionCards.breaksDesc' },
      { id: 'auto-connect', categoryKey: 'social', titleKey: 'results.actionCards.connectTitle', descKey: 'results.actionCards.connectDesc' },
      { id: 'auto-hydrate', categoryKey: 'exercise', titleKey: 'results.actionCards.hydrateTitle', descKey: 'results.actionCards.hydrateDesc' },
      { id: 'auto-week-plan', categoryKey: 'study', titleKey: 'results.actionCards.weekPlanTitle', descKey: 'results.actionCards.weekPlanDesc' }
    ];

    for (const fallback of fallbackTemplates) {
      if (cards.length >= 5) break;
      addTemplate(fallback.id, fallback.categoryKey, fallback.titleKey, fallback.descKey);
    }

    return cards;
  };

  // Map from backend i18n_key to frontend translation key pairs
  const backendI18nMap: Record<string, { titleKey: string; descKey: string }> = {
    highStress: { titleKey: 'results.actionCards.highStressTitle', descKey: 'results.actionCards.highStressDesc' },
    sleep: { titleKey: 'results.actionCards.sleepTitle', descKey: 'results.actionCards.sleepDesc' },
    studyLoad: { titleKey: 'results.actionCards.studyLoadTitle', descKey: 'results.actionCards.studyLoadDesc' },
    anxiety: { titleKey: 'results.actionCards.anxietyTitle', descKey: 'results.actionCards.anxietyDesc' },
    mood: { titleKey: 'results.actionCards.moodTitle', descKey: 'results.actionCards.moodDesc' },
    support: { titleKey: 'results.actionCards.supportTitle', descKey: 'results.actionCards.supportDesc' },
    bullying: { titleKey: 'results.actionCards.bullyingTitle', descKey: 'results.actionCards.bullyingDesc' },
    needs: { titleKey: 'results.actionCards.needsTitle', descKey: 'results.actionCards.needsDesc' },
    weekPlan: { titleKey: 'results.actionCards.weekPlanTitle', descKey: 'results.actionCards.weekPlanDesc' },
  };

  const actionCards: ActionCardItem[] = !isSafetyBlocked && aiResult
    ? (() => {
      const plannerCards: ActionCardItem[] = (recommendationResult?.options ?? []).map((option) => ({
        id: `planner-${option.alternative.alternative_id}`,
        categoryKey: 'study',
        title: option.alternative.title,
        description: option.explanation,
        tradeoff: option.alternative.tradeoff,
        evidence: option.evidence,
        activities: option.alternative.activities,
      }));
      const base = aiResult.recommendations.map((rec: any) => {
        const i18nKey = rec.i18n_key as string | undefined;
        const mapped = i18nKey ? backendI18nMap[i18nKey] : undefined;
        return {
          id: `backend-${rec.reco_id ?? rec.i18n_key ?? Math.random()}`,
          categoryKey: rec.category || 'general',
          title: mapped ? t(mapped.titleKey) : rec.title,
          description: mapped ? t(mapped.descKey) : rec.description,
        };
      });
      const personalized = buildPersonalizedActionCards(aiResult, formData);
      const merged: ActionCardItem[] = [];
      const seen = new Set<string>();
      for (const card of [...plannerCards, ...base, ...personalized]) {
        if (seen.has(card.id)) continue;
        seen.add(card.id);
        merged.push(card);
      }
      return merged;
    })()
    : [];


  return (
    <div className={`min-h-screen font-sans text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-gradient-to-br from-[#020510] via-[#0a0f1e] to-[#0d1b3e]' : 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100'}`}>
      <style>{`
        @media print {
          /* Hide everything by default, then selectively show report */
          body * { visibility: hidden; }
          
          .report-container, .report-container * {
            visibility: visible !important;
          }
          
          /* Reset containers for natural document flow */
          body, html {
            overflow: visible !important;
            height: auto !important;
            background: white !important;
          }

          .report-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100% !important;
            display: block !important;
            overflow: visible !important;
          }

          /* Force both pages to show linearly and override JS conditional styles */
          .page-1, .page-2 {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            max-height: none !important;
            top: 0 !important;
            left: 0 !important;
          }

          .page-1 {
            page-break-after: always;
          }

          /* Prevent cards from being cut between pages */
          .analytics-glass-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 2rem;
          }

          /* Disable UI artifacts and animations */
          * {
            animation: none !important;
            transition: none !important;
            overflow: visible !important;
            max-height: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          header, footer, button, .lucide, .absolute.left-8.top-0, .fixed.inset-0.z-0 {
            display: none !important;
          }

          @page { size: A4; margin: 15mm; }
        }
      `}</style>

      {/* Liquid Glass Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full filter blur-[120px] opacity-30 animate-blob bg-indigo-700" />
<div className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full filter blur-[100px] opacity-15 animate-blob animation-delay-4000 bg-blue-900" />            <div className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full filter blur-[100px] opacity-15 animate-blob animation-delay-4000 bg-blue-900" />
          </>
        ) : (
          <>
            {/* Aurora light — top-left blue */}
            <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full filter blur-[100px] opacity-50 animate-blob" style={{ background: 'radial-gradient(circle, #93c5fd 0%, #bfdbfe 60%, transparent 80%)' }} />
            {/* Aurora light — bottom-right pink/lavender */}
            <div className="absolute bottom-[-5%] right-[-5%] w-[55vw] h-[55vw] rounded-full filter blur-[110px] opacity-45 animate-blob animation-delay-2000" style={{ background: 'radial-gradient(circle, #c4b5fd 0%, #ddd6fe 50%, transparent 80%)' }} />
            {/* Aurora light — center */}
            <div className="absolute top-[30%] left-[30%] w-[35vw] h-[35vw] rounded-full filter blur-[90px] opacity-30 animate-blob animation-delay-4000" style={{ background: 'radial-gradient(circle, #fbcfe8 0%, #f9a8d4 40%, transparent 70%)' }} />
          </>
        )}
      </div>
      {/* Header */}
      <header className="absolute w-full top-0 z-50 transition-colors duration-500">
        <div className={`container mx-auto px-6 py-4 flex items-center justify-between ${!isDarkMode ? 'mt-3' : ''
          }`}>
          {/* Light mode: floating glass pill wrapper */}
          <div className={`flex items-center justify-between w-full transition-all duration-500 ${isDarkMode
            ? ''
            : 'bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full px-5 py-2'
            }`}>
            <div className="flex items-center gap-8 min-w-0">
              <div className={`text-xl font-bold tracking-tight cursor-pointer transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-[#0b132b]'}`} onClick={() => { setIsSurveyOpen(false); setIsCompleted(false); setIsAboutUsOpen(false); setCurrentStep(1); }}>{t('appName')}</div>
              {!isSurveyOpen && !isAboutUsOpen && (
                <nav className={`hidden md:flex items-center gap-6 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-slate-800'}`}>
                  <button onClick={() => setIsAboutUsOpen(true)} className={`transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-blue-700'}`}>{t('nav.about')}</button>
                </nav>
              )}
            </div>



            <div className="flex items-center gap-3">

              {/* Print button — chỉ hiện ở trang kết quả */}
              {isCompleted && aiResult && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    // Force render both modules to ensure all charts and data are initialized before print
                    const originalModule = activeDataModule;
                    setActiveDataModule('dashboard');
                    setTimeout(() => {
                      setActiveDataModule('analytics');
                      setTimeout(() => {
                        window.print();
                        setActiveDataModule(originalModule);
                      }, 500);
                    }, 500);
                  }}
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    isDarkMode
                      ? 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20'
                      : 'bg-white/60 border-white/60 text-slate-700 hover:bg-white/90'
                  }`}
                  title="In báo cáo"
                >
                  <Printer className="w-4 h-4" />
                  In
                </motion.button>
              )}

              {/* Premium Dark / Light Mode Toggle */}
              <motion.div
                className="relative hidden sm:flex w-[130px] h-[43px] rounded-full border-2 border-white/60 cursor-pointer overflow-hidden items-center shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.2),inset_2px_4px_4px_2px_rgba(2,1,68,0.5),inset_-2px_-2px_2px_rgba(1,0,89,0.5)]"
                animate={{ backgroundColor: isDarkMode ? '#0f172a' : '#236fe9' }}
                transition={{ duration: 0.5 }}
                onClick={() => setIsDarkMode(prev => !prev)}
                aria-label={t('ui.toggleDarkMode')}
              >
                {/* Stars Lottie (dark mode) */}
                <motion.div
                  className="absolute left-0 top-0 w-full h-full pointer-events-none z-0"
                  animate={{ opacity: isDarkMode ? 1 : 0, y: isDarkMode ? 0 : 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Player autoplay style={{ width: '100%', height: '100%' }} loop src="https://cdn.prod.website-files.com/6485b1e6f5eb4dc9ec89e560/6485bab4d8da4bb319001bbe_stars.json" />
                </motion.div>
                {/* Clouds Lottie base (light mode) */}
                <motion.div
                  className="absolute pointer-events-none z-0"
                  style={{ width: '140%', height: '200%', left: '-20%', top: '-50%' }}
                  animate={{ opacity: isDarkMode ? 0 : 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <Player autoplay speed={1.5} style={{ width: '100%', height: '100%' }} loop src="https://cdn.prod.website-files.com/6485b1e6f5eb4dc9ec89e560/6485bab50719867ec6c32ff9_clouds.json" />
                </motion.div>
                {/* Static Clouds (light mode) */}
                <motion.div
                  className="absolute bottom-[-20px] left-[-20%] w-[140%] h-[110px] flex flex-col items-center justify-end pointer-events-none z-0"
                  animate={{ y: isDarkMode ? 60 : 0, opacity: isDarkMode ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.img
                    src="https://cdn.prod.website-files.com/69c773b68211f0dc7da25e7a/69c773b78211f0dc7da25ed6_Vectors-Wrapper.svg"
                    className="w-[180px] h-[66px] object-cover absolute bottom-[-8px]"
                    animate={{ x: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 5.33, ease: 'easeInOut' }}
                    alt=""
                  />
                  <motion.img
                    src="https://cdn.prod.website-files.com/69c773b68211f0dc7da25e7a/69c773b78211f0dc7da25ed5_Vectors-Wrapper.svg"
                    className="w-[180px] h-[66px] object-cover absolute bottom-[8px]"
                    animate={{ x: [10, -10, 10] }}
                    transition={{ repeat: Infinity, duration: 6.67, ease: 'easeInOut' }}
                    alt=""
                  />
                </motion.div>
                {/* Ripple rings */}
                <motion.div
                  className="absolute pointer-events-none z-0"
                  style={{ left: '22px', top: '50%' }}
                  animate={{ x: isDarkMode ? 88 : 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  <div className="absolute w-[70px] h-[70px] bg-white/10 rounded-full" style={{ transform: 'translate(-50%, -50%)' }} />
                  <div className="absolute w-[110px] h-[110px] bg-white/10 rounded-full" style={{ transform: 'translate(-50%, -50%)' }} />
                  <div className="absolute w-[150px] h-[150px] bg-white/10 rounded-full" style={{ transform: 'translate(-50%, -50%)' }} />
                </motion.div>
                {/* Glow (moves with thumb) */}
                <motion.div
                  className="absolute flex items-center justify-center mix-blend-screen pointer-events-none z-0"
                  style={{ left: '-50px', top: '50%', transform: 'translateY(-50%)' }}
                  animate={{ x: isDarkMode ? 88 : 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  <motion.img src="https://cdn.prod.website-files.com/69c773b68211f0dc7da25e7a/69c773b78211f0dc7da25ed3_Vectors-Wrapper.svg" className="absolute w-[85px] h-[85px] object-cover" animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} alt="" />
                  <motion.img src="https://cdn.prod.website-files.com/69c773b68211f0dc7da25e7a/69c773b78211f0dc7da25ed2_Vectors-Wrapper.svg" className="absolute w-[114px] h-[114px] object-cover" animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }} alt="" />
                  <motion.img src="https://cdn.prod.website-files.com/69c773b68211f0dc7da25e7a/69c773b78211f0dc7da25ed4_Vectors-Wrapper.svg" className="absolute w-[142px] h-[142px] object-cover" animate={{ scale: [1, 1.02, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }} alt="" />
                </motion.div>
                {/* Thumb: Sun / Moon */}
                <div className="absolute inset-0 flex items-center px-[8px] pointer-events-none z-10">
                  <motion.div
                    className="relative w-[29px] h-[29px] rounded-full flex items-center justify-center"
                    animate={{ x: isDarkMode ? 88 : 0, rotate: isDarkMode ? 360 : 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    <motion.img
                      src="https://cdn.prod.website-files.com/69c773b68211f0dc7da25e7a/69c773b78211f0dc7da25ed0_Vectors-Wrapper.svg"
                      className="absolute w-[29px] h-[29px] rounded-full shadow-[4px_8px_6px_rgba(0,0,0,0.2)]"
                      animate={{ opacity: isDarkMode ? 0 : 1, scale: isDarkMode ? 0.5 : 1 }}
                      transition={{ duration: 0.3 }}
                      alt="Sun"
                    />
                    <motion.img
                      src="https://cdn.prod.website-files.com/69c773b68211f0dc7da25e7a/69c773b78211f0dc7da25ed1_Vectors-Wrapper.svg"
                      className="absolute w-[29px] h-[29px] rounded-full"
                      animate={{ opacity: isDarkMode ? 1 : 0, scale: isDarkMode ? 1 : 0.5 }}
                      transition={{ duration: 0.3 }}
                      alt="Moon"
                    />
                  </motion.div>
                </div>
              </motion.div>

{!isSurveyOpen && (
                <>
                  {!isLoggedIn ? (
                    <button
                      onClick={handleShowLoginConfirm}
                      className={`hidden md:block text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {t('nav.signIn')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isDarkMode ? 'bg-blue-600' : 'bg-blue-600'}`}>
                        {currentUser?.name?.[0] || 'D'}
                      </div>
                      <div className="hidden sm:flex flex-col">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentUser?.name}</span>
                        <button
                          onClick={handleLogout}
                          className={`text-xs font-semibold transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Language switcher */}
              <div className="relative z-50" ref={languageMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLanguageMenuOpen(prev => !prev)}
                  aria-label={t('ui.languageSwitcher')}
                  className={`flex items-center rounded-full p-1 pr-3 cursor-pointer transition-colors border ${isDarkMode
                    ? 'bg-black/90 hover:bg-black border-white/10 shadow-lg shadow-black/20'
                    : 'bg-white/60 hover:bg-white/90 border-white/60 shadow-sm'
                    }`}
                >
                  <img
                    src={`https://hatscripts.github.io/circle-flags/flags/${language === 'en' ? 'gb' : 'vn'}.svg`}
                    alt="flag"
                    className="w-6 h-6 rounded-full object-cover mr-2 shadow-sm"
                  />
                  <span className={`text-[13px] font-bold tracking-wider select-none pointer-events-none ${isDarkMode ? 'text-white' : 'text-[#0b132b]'}`}>
                    {language === 'en' ? 'EN' : 'VI'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`} />
                </button>

                {/* Dropdown Menu */}
                <div className={`absolute top-full right-0 mt-2 w-48 transition-all duration-200 ${isLanguageMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className={`py-2 rounded-2xl border shadow-xl backdrop-blur-xl ${isDarkMode ? 'bg-[#0f172a]/95 border-white/10 shadow-black/50' : 'bg-white/95 border-gray-200 shadow-xl'}`}>
                    {languageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${language === lang.code ? (isDarkMode ? 'bg-teal-500/15 text-teal-300' : 'bg-teal-600/10 text-teal-700') : (isDarkMode ? 'text-gray-300 hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900')}`}
                      >
                        <img
                          src={`https://hatscripts.github.io/circle-flags/flags/${lang.flag}.svg`}
                          alt={lang.code}
                          className="w-5 h-5 rounded-full object-cover shadow-sm"
                        />
                        <span className="font-medium text-sm">{lang.label} ({lang.code.toUpperCase()})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={() => setShowPrivacyModal(false)}>
            <motion.div
              key={language}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`relative backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden p-8 md:p-10 max-w-2xl w-full text-left max-h-[85vh] overflow-y-auto ${isDarkMode ? 'bg-[#0b132b]/95 border-white/10' : 'bg-white/95 border border-gray-200'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-300/40 rounded-2xl flex items-center justify-center text-blue-600">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0b132b]'}`}>{t('legal.privacy.title')}</h2>
              </div>
              <div className={`space-y-5 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{t('legal.privacy.a1h')}</h3>
                  <p>{t('legal.privacy.a1p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{t('legal.privacy.a2h')}</h3>
                  <p>{t('legal.privacy.a2p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{t('legal.privacy.a3h')}</h3>
                  <p>{t('legal.privacy.a3p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{t('legal.privacy.a4h')}</h3>
                  <p>{t('legal.privacy.a4p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{t('legal.privacy.a5h')}</h3>
                  <p>{t('legal.privacy.a5p')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className={`mt-8 w-full py-3 rounded-full font-semibold transition-all ${isDarkMode ? 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('legal.close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ethics Modal */}
      <AnimatePresence>
        {showEthicsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={() => setShowEthicsModal(false)}>
            <motion.div
              key={language}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`relative backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden p-8 md:p-10 max-w-2xl w-full text-left max-h-[85vh] overflow-y-auto ${isDarkMode ? 'bg-[#0b132b]/95 border-white/10' : 'bg-white/95 border border-gray-200'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/20 border border-green-300/40 rounded-2xl flex items-center justify-center text-green-600">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0b132b]'}`}>{t('legal.ethics.title')}</h2>
              </div>
              <div className={`space-y-5 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{t('legal.ethics.a1h')}</h3>
                  <p>{t('legal.ethics.a1p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{t('legal.ethics.a2h')}</h3>
                  <p>{t('legal.ethics.a2p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{t('legal.ethics.a3h')}</h3>
                  <p>{t('legal.ethics.a3p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{t('legal.ethics.a4h')}</h3>
                  <p>{t('legal.ethics.a4p')}</p>
                </div>
                <div>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{t('legal.ethics.a5h')}</h3>
                  <p>{t('legal.ethics.a5p')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEthicsModal(false)}
                className={`mt-8 w-full py-3 rounded-full font-semibold transition-all ${isDarkMode ? 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20' : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('legal.close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {renderHowItWorksModal()}
      {renderEmergencyModal()}
      {renderLoginConfirmModal()}
      {renderActionDetailModal()}

      <AnimatePresence mode="wait">
        {isAboutUsOpen ? (
          renderAboutUs()
        ) : !isSurveyOpen ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section — Left-aligned layout in light mode, space theme in dark mode */}
            <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
              {/* Starfield overlay (Only visible in dark mode) */}
              <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
                {/* Background Space Gradient */}
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)',
                }} />

                {/* Twinkling stars */}
                {[...Array(60)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white animate-pulse"
                    style={{
                      width: `${Math.random() * 2.5 + 0.5}px`,
                      height: `${Math.random() * 2.5 + 0.5}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.7 + 0.1,
                      animationDuration: `${Math.random() * 4 + 2}s`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>

              {isDarkMode ? (
                /* ========== DARK MODE: centered full-globe layout ========== */
                <>
                  {/* Earth Background — centered */}
                  <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 100 }}
                      animate={{ opacity: 0.9, scale: 1, y: -80 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ width: '100vw', maxWidth: '960px', minWidth: '720px', aspectRatio: '1/1' }}
                    >
                      <motion.img
                        src="https://i.pinimg.com/736x/b5/fc/cf/b5fccf011c833f5b05d90c1d909191c5.jpg"
                        alt="Earth"
                        className="w-full h-full object-cover rounded-full"
                        style={{
                          maskImage: 'radial-gradient(circle at 50% 50%, black 65%, transparent 70%)',
                          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 65%, transparent 70%)'
                        }}
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-[#0B0F19]/80 to-[#0B0F19] pointer-events-none" />
                    </motion.div>
                  </div>
                  {/* Bottom gradient */}
                  <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent z-[2] pointer-events-none" />
                  {/* Dark mode content — centered */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-80 md:pb-96" style={{ minHeight: '100vh' }}>
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest mb-8 border bg-white/8 border-white/15 text-white/90 backdrop-blur-md"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635] animate-pulse" />
                      {t('hero.badge')}
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                      className="font-extrabold tracking-tight leading-[1.08] mb-6 text-white"
                      style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)', maxWidth: '800px' }}
                    >
                      {t('hero.title1')}{' '}
                      <span className="text-[#a3e635]">{t('hero.title2')}</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                      className="text-base md:text-lg leading-relaxed mb-10 max-w-xl text-white/70"
                    >
                      {t('hero.subtitle')}
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                      className="flex flex-wrap items-center justify-center gap-4 mb-12"
                    >
                      <button onClick={() => setIsSurveyOpen(true)}
                        className="relative overflow-hidden group flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold bg-[#a3e635] text-black shadow-[0_8px_32px_rgba(163,230,53,0.35)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,1)] transition-all duration-300"
                      >
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        {t('hero.btnStart')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => setIsHowItWorksOpen(true)}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-slate-800 hover:bg-white/50 transition-all duration-300"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {t('hero.btnWatch')}
                      </button>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
                      className="flex flex-wrap items-center gap-6 text-white/50"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#a3e635]" />
                        <span className="text-sm" dangerouslySetInnerHTML={{ __html: t('hero.statsExpert') }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[#a3e635]" />
                        <span className="text-sm">{t('hero.statsAnon')}</span>
                      </div>
                    </motion.div>
                  </div>
                </>
              ) : (
                /* ========== LIGHT MODE: Glassmorphism overlap layout ========== */
                <div className="relative z-10 container mx-auto px-6 flex flex-col justify-center min-h-screen pt-28 pb-16">

                  {/* Background Globe - Absolute positioned behind all content */}
                  <div className="absolute top-1/2 right-[-20%] md:right-[-10%] lg:right-[0%] -translate-y-1/2 w-[600px] h-[600px] lg:w-[900px] lg:h-[900px] pointer-events-none" style={{ zIndex: -10 }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="w-full h-full relative"
                    >
                      <motion.div
                        className="w-full h-full"
                        style={{
                          backgroundImage: 'url(https://image2url.com/r2/default/images/1775833042260-9b4ddd91-fea4-4bd9-acfb-ee4c62c41c64.png)',
                          backgroundSize: '100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 0.9
                        }}
                      />
                      {/* Falling flowers */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={`flower-${i}`}
                          className="absolute rounded-full"
                          style={{
                            width: `${Math.random() * 12 + 8}px`,
                            height: `${Math.random() * 12 + 8}px`,
                            backgroundColor: `rgba(255, 235, 59, ${Math.random() * 0.5 + 0.5})`,
                            left: `${Math.random() * 100}%`,
                            top: '-20px',
                            boxShadow: `0 0 ${Math.random() * 8 + 4}px rgba(255, 235, 59, ${Math.random() * 0.5 + 0.4})`
                          }}
                          animate={{
                            y: ['-20px', '600px'],
                            x: [`${Math.random() * 100 - 50}px`, `${Math.random() * 100 - 50}px`],
                            opacity: [0, 0.95, 0]
                          }}
                          transition={{
                            duration: Math.random() * 6 + 8,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>

                  {/* Foreground Content */}
                  <div className="relative z-10 w-full max-w-2xl text-left">
                    {/* Badge */}
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 bg-white/40 border border-white/60 text-slate-700 shadow-sm backdrop-blur-xl uppercase"
                    >
                      {t('hero.badge')}
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                      className="font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900"
                      style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
                    >
                      {t('hero.title1')}<br />
                      <span className="text-[#0f172a]">{t('hero.title2')}</span>
                    </motion.h1>

                    {/* Subtitle — highly blurred frosted glass card */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                      className="bg-white/20 backdrop-blur-3xl border border-white/60 rounded-3xl p-6 sm:p-8 mb-10 shadow-[0_8px_32px_rgba(255,255,255,0.3)] max-w-xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10" />
                      <p className="relative z-10 text-base sm:text-lg leading-relaxed text-slate-800 font-medium">
                        {t('hero.subtitle')}
                      </p>
                    </motion.div>

                    {/* CTA Buttons in a single subtle pill container layout */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                      className="inline-flex flex-wrap items-center gap-2 p-2 mb-10 bg-white/30 backdrop-blur-2xl border border-white/60 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
                    >
                      <button onClick={() => setIsSurveyOpen(true)}
                        className="relative overflow-hidden group flex items-center gap-2 px-8 py-3.5 rounded-full font-bold bg-[#1d70f5] text-white shadow-[0_4px_16px_rgba(29,112,245,0.4)] hover:shadow-[0_8px_24px_rgba(29,112,245,0.6)] transition-all duration-300"
                      >
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        {t('hero.btnStart')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => setIsHowItWorksOpen(true)}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-slate-800 hover:bg-white/50 transition-all duration-300"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {t('hero.btnWatch')}
                      </button>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
                      className="flex flex-wrap items-center gap-4"
                    >
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-xl shadow-sm text-slate-700">
                        <ShieldCheck className="w-5 h-5 text-slate-700" />
                        <span className="text-xs font-bold uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: t('hero.statsExpert') }} />
                      </div>
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-xl shadow-sm text-slate-700">
                        <Lock className="w-5 h-5 text-slate-700" />
                        <span className="text-xs font-bold uppercase tracking-wide">{t('hero.statsAnon')}</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className={`border-t pt-12 pb-8 relative z-10 transition-colors duration-500 ${isDarkMode
              ? 'border-white/10 bg-black/30 backdrop-blur-2xl'
              : 'border-slate-200/60 bg-white/70 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
              }`}>
              <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#0b132b]'}`}>{t('appName')}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>© 2026 ConcussionRecovery — Plan your safe return to life.</div>
                </div>

                <div className={`flex items-center gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <button onClick={() => setShowPrivacyModal(true)} className={`transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>{t('footer.privacy')}</button>
                  <button onClick={() => setShowEthicsModal(true)} className={`transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>{t('footer.ethics')}</button>
                </div>

                <div className="flex items-center gap-4">
                  <a href="https://github.com/24521450/-mindscan-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 border border-white/20 text-gray-400 hover:bg-white/20 hover:text-white' : 'bg-white/30 border border-white/40 text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://www.facebook.com/Hor1zoNnn/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 border border-white/20 text-gray-400 hover:bg-white/20 hover:text-white' : 'bg-white/30 border border-white/40 text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="mailto:24521450@gm.uit.edu.vn" aria-label="Email" className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 border border-white/20 text-gray-400 hover:bg-white/20 hover:text-white' : 'bg-white/30 border border-white/40 text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : !hasConsented && !showMotivational ? (
          <motion.div
            key="consent"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="container mx-auto px-6 min-h-[100dvh] flex flex-col items-center justify-center py-24"
          >
            {renderConsentScreen()}
          </motion.div>
        ) : !hasConsented && showMotivational ? (
          <motion.div
            key="motivational"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="container mx-auto px-6 min-h-[100dvh] flex flex-col items-center justify-center py-24"
          >
            {renderMotivationalScreen()}
          </motion.div>
        ) : (
          <motion.div
            key="survey"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`container mx-auto px-6 min-h-[100dvh] flex flex-col w-full ${isCompleted ? 'items-stretch justify-start pt-24 pb-12 max-w-[1360px]' : 'items-center justify-center py-24 max-w-3xl'}`}
          >
            {!isCompleted ? (
              <div className={`relative rounded-[2rem] overflow-visible p-8 md:p-12 border shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)] ${isDarkMode ? 'bg-slate-900/80 border-white/10' : 'bg-white/20 backdrop-blur-3xl border-white/40'}`}>
                
                {/* Progress Bar */}
                <div className="mb-12">
                  <div className={`flex justify-between text-sm font-bold mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{t('survey.step')} {currentStep} / 5</span>
                    <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>{Math.round((currentStep / 5) * 100)}% {t('survey.completed')}</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full relative"
                      initial={{ width: `${((currentStep - 1) / 5) * 100}%` }}
                      animate={{ width: `${(currentStep / 5) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>

                {/* Survey Content */}
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                {/* Validation error banner */}
                {stepError && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {stepError}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className={`mt-10 pt-8 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button
                    onClick={prevStep}
                    aria-label={t('survey.btnPrev')}
                    className={`flex items-center gap-2 font-bold px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-white/10 focus:ring-blue-400 focus:ring-offset-[#0b132b]' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 focus:ring-slate-400 focus:ring-offset-white'}`}
                  >
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" /> {t('survey.btnPrev')}
                  </button>
                  <button
                    onClick={nextStep}
                    aria-label={currentStep === 5 ? t('survey.btnSubmit') : t('survey.btnNext')}
                    className={`relative overflow-hidden group rounded-full font-semibold px-8 py-3 transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:-translate-y-0.5 ${isDarkMode ? 'bg-blue-600/30 text-blue-100 border border-blue-500/40 hover:bg-blue-600/40 focus:ring-blue-400 focus:ring-offset-[#0b132b]' : 'bg-white/30 backdrop-blur-2xl text-blue-700 border border-white/50 hover:bg-white/40 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,1)] focus:ring-blue-600 focus:ring-offset-white'}`}
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    {currentStep === 5 ? t('survey.btnSubmit') : t('survey.btnNext')} <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-[2rem] overflow-visible p-8 md:p-12 border shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] ${isDarkMode ? 'bg-slate-900/80 border-white/10' : 'bg-white/20 backdrop-blur-3xl border-white/40'}`}
                style={{ overflow: 'clip' }}

              >
                {isAnalyzing ? (
                  <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-48 h-48 mx-auto mb-8 relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white/20 bg-white">
                      <img 
                        src="https://i.pinimg.com/originals/2c/5f/bd/2c5fbdcabe1a6cc198bc86baee10b59b.gif" 
                        alt="Analyzing..." 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className={`text-2xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('survey.analyzingTitle')}</h2>
                    <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{t('survey.analyzingDesc')}</p>
                  </div>
                ) : aiResult ? (
                  <>
                    {/* NAVIGATION BUTTONS */}
                    <motion.button
                      onClick={() => setActiveDataModule('dashboard')}
                      className={`hidden lg:flex absolute -left-0.5 top-8 z-50 w-14 h-14 rounded-full items-center justify-center font-bold text-2xl shadow-lg leading-none pointer-events-auto ${
                        activeDataModule === 'dashboard'
                          ? (isDarkMode ? 'bg-white/30 text-white border border-white/60' : 'bg-white/30 text-slate-900 border border-white/60')
                          : (isDarkMode ? 'bg-white/15 text-slate-300 hover:bg-white/25 border border-white/30' : 'bg-white/15 text-slate-600 hover:bg-white/25 border border-white/30')
                      }`}
                      whileHover={{ scale: 1.1, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                      title={t('ui.backToDashboard')}
                    >
                      &lt;
                    </motion.button>

                    {/* TOP RIGHT - Go to Analytics */}
                    <motion.button
                      onClick={() => setActiveDataModule('analytics')}
                      className={`hidden lg:flex absolute -right-0.5 top-8 z-50 w-14 h-14 rounded-full items-center justify-center font-bold text-2xl shadow-lg leading-none pointer-events-auto ${
                        activeDataModule === 'analytics'
                          ? (isDarkMode ? 'bg-white/30 text-white border border-white/60' : 'bg-white/30 text-slate-900 border border-white/60')
                          : (isDarkMode ? 'bg-white/15 text-slate-300 hover:bg-white/25 border border-white/30' : 'bg-white/15 text-slate-600 hover:bg-white/25 border border-white/30')
                      }`}
                      whileHover={{ scale: 1.1, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                      title={t('ui.toAnalytics')}
                    >
                      &gt;
                    </motion.button>

                    {/* BOTTOM LEFT - Back to Dashboard */}
                    <motion.button
                      onClick={() => setActiveDataModule('dashboard')}
                      className={`hidden lg:flex absolute left-4 bottom-8 z-50 w-14 h-14 rounded-full items-center justify-center font-bold text-2xl shadow-lg leading-none pointer-events-auto ${
                        activeDataModule === 'dashboard'
                          ? (isDarkMode ? 'bg-white/30 text-white border border-white/60' : 'bg-white/30 text-slate-900 border border-white/60')
                          : (isDarkMode ? 'bg-white/15 text-slate-300 hover:bg-white/25 border border-white/30' : 'bg-white/15 text-slate-600 hover:bg-white/25 border border-white/30')
                      }`}
                      whileHover={{ scale: 1.1, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                      title={t('ui.backToDashboard')}
                    >
                      &lt;
                    </motion.button>

                    {/* BOTTOM RIGHT - Go to Analytics */}
                    <motion.button
                      onClick={() => setActiveDataModule('analytics')}
                      className={`hidden lg:flex absolute right-4 bottom-8 z-50 w-14 h-14 rounded-full items-center justify-center font-bold text-2xl shadow-lg leading-none pointer-events-auto ${
                        activeDataModule === 'analytics'
                          ? (isDarkMode ? 'bg-white/30 text-white border border-white/60' : 'bg-white/30 text-slate-900 border border-white/60')
                          : (isDarkMode ? 'bg-white/15 text-slate-300 hover:bg-white/25 border border-white/30' : 'bg-white/15 text-slate-600 hover:bg-white/25 border border-white/30')
                      }`}
                      whileHover={{ scale: 1.1, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ WebkitFontSmoothing: 'antialiased' }}
                      title={t('ui.toAnalytics')}
                    >
                      &gt;
                    </motion.button>

                    {/* Report Wrapper to control printing scope */}
                    <div className="report-container">
                    {/* Page 1: Dashboard View - Forced render in DOM for print support */}
                    <div
                      style={{
                        visibility: activeDataModule === 'dashboard' ? 'visible' : 'hidden',
                        position: activeDataModule === 'dashboard' ? 'relative' : 'absolute',
                        opacity: activeDataModule === 'dashboard' ? 1 : 0,
                        pointerEvents: activeDataModule === 'dashboard' ? 'auto' : 'none',
                        width: '100%',
                        top: 0,
                        left: 0
                      }}
                      className="w-full page-1"
                    >
                    <div className="text-left w-full max-w-[1320px] mx-auto print-area" style={{
  background: isDarkMode ? 'linear-gradient(135deg, rgba(15,23,42,0.4) 0%, rgba(30,41,59,0.4) 100%)' : 'linear-gradient(135deg, rgba(248,249,250,0.8) 0%, rgba(240,244,248,0.8) 100%)'
                    }}>
                      {/* Existing Medical Report content... */}
                      <div className={`relative rounded-[2.5rem] p-6 md:p-8 xl:p-10 shadow-[0_24px_90px_rgba(45,51,55,0.06)] ${isDarkMode ? 'bg-slate-900/40 border border-white/10' : 'bg-white/95 border border-slate-100'}`}>
                          {/* Existing Header and Charts code... */}
                          <div className="pl-8">
                            {/* Demo Persona Switcher */}
                            <div className="mb-6 flex items-center justify-between">
                              <div>
                                <p
                                  className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}
                                >
                                  Demo Persona
                                </p>

                                <h2
                                  className={`text-xl font-semibold ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}
                                >
                                  Recovery Scenario
                                </h2>
                              </div>

                              <select
                                value={activeDemoUserId}
                                onChange={(e) => setActiveDemoUserId(e.target.value as DemoPersonaId)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium shadow-sm outline-none transition ${
                                  isDarkMode
                                    ? 'border-gray-700 bg-gray-900 text-white focus:border-blue-400'
                                    : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                                }`}
                              >
                                {DEMO_PERSONAS.map((persona) => (
                                  <option
                                    key={persona.id}
                                    value={persona.id}
                                  >
                                    {persona.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {renderDashboardView()}
                          </div>
                      </div>
                    </div>
                    </div> {/* Fix: Changed </motion.div> to </div> to match opening tag at line 1179 */}

                    {/* Page 2: Analytics View */}
                    <motion.div
                      animate={activeDataModule === 'analytics' ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{
                        pointerEvents: activeDataModule === 'analytics' ? 'auto' : 'none',
                        display: activeDataModule === 'analytics' ? 'block' : 'none'
                      }}
                      className="w-full page-2"
                    >
                    <div className="text-left w-full max-w-[1320px] mx-auto print-area" style={{
                      background: isDarkMode ? 'linear-gradient(135deg, rgba(15,23,42,0.4) 0%, rgba(30,41,59,0.4) 100%)' : 'linear-gradient(135deg, rgba(248,249,250,0.8) 0%, rgba(240,244,248,0.8) 100%)'
                    }}>
                      <div className={`relative rounded-[2.5rem] p-6 md:p-8 xl:p-10 shadow-[0_24px_90px_rgba(45,51,55,0.06)] ${isDarkMode ? 'bg-slate-900/40 border border-white/10' : 'bg-white/95 border border-slate-100'}`}>
                          <div className="absolute left-8 top-0 bottom-0 w-1 flex flex-col items-center justify-around pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={`hole-analytics-${i}`}
                                className="w-3 h-3 rounded-full border-2"
                                style={{
                                  borderColor: isDarkMode ? 'rgba(100,116,139,0.5)' : 'rgba(71,85,105,0.4)',
                                  boxShadow: isDarkMode
                                    ? 'inset 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)'
                                    : 'inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 2px rgba(255,255,255,0.8)'
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                              />
                            ))}
                          </div>
                          <div className={`mb-8 pb-6 border-b-2 pl-8 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div>
                                <h2 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
                                  {t('ui.resultsPanel.title')}
                                </h2>
                                <p className={`mt-2 text-sm md:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                                  style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                                  {t('ui.resultsPanel.subtitle')}
                                </p>
                              </div>
                              <motion.div
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'bg-teal-600/10 text-teal-700 border border-teal-200'}`}
                                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <Activity className="w-4 h-4" /> {t('ui.resultsPanel.last30Days')}
                              </motion.div>
                            </div>
                          </div>
                          <div className="pl-8">
                            <section className={`rounded-[2rem] p-6 md:p-8 xl:p-10 ${isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50/50'}`}>
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 flex-1">
                                <div className={`lg:col-span-5 analytics-glass-card rounded-[2rem] p-6 md:p-8 shadow-sm ${isDarkMode ? 'dark' : ''}`}>
                                  <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
                                        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.resultsPanel.stressLoad')}</h3>
                                      <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                                        style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.resultsPanel.stressLoadDesc')}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.live')}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center py-2">
                                    <GaugeChart level={aiResult.recovery_load_level} confidence={aiResult.confidence_score} t={t} isDarkMode={isDarkMode} />
                                  </div>
                                  <div className="mt-4 pt-4 grid grid-cols-3 gap-2" style={{ borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                    <div className="text-center">
                                      <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.status.title')}</div>
                                      <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{insightMeta?.levelLabel || t('results.medium')}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.trend')}</div>
                                      <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.stable')}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.baseline')}</div>
                                      <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{Math.max(0, Math.round((insightMeta?.confidencePct ?? 0) * 0.8))}%</div>
                                    </div>
                                  </div>
                                </div>
                                <div className={`lg:col-span-7 analytics-glass-card rounded-[2rem] p-6 md:p-8 shadow-sm ${isDarkMode ? 'dark' : ''}`}>
                                  <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.impactFactors')}</h3>
                                  <p className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.impactFactorsDesc')}</p>
                                  <div className="w-full h-12 rounded-full overflow-hidden flex" style={{ background: isDarkMode ? '#1e293b' : '#eaeef1' }}>
                                    {aiResult.feature_importance.map((item: any, idx: number) => {
                                      const total = aiResult.feature_importance.reduce((s: number, f: any) => s + f.importance, 0);
                                      const pct = total > 0 ? (item.importance / total) * 100 : 0;
                                      const color = (!item.color || item.color === '#f3f4f6') ? ['#006b60', '#6e3bd8', '#a53173', '#48e5d0'][idx % 4] : item.color;
                                      return (
                                        <div key={`bar-${idx}`} style={{ width: `${pct}%`, backgroundColor: color }}
                                          className="h-full flex items-center justify-center text-[10px] text-white font-bold"
                                          title={`${getFeatureLabel(item.feature)}: ${Math.round(item.importance)}%`}
                                        >
                                          {pct > 8 ? Math.round(item.importance) : ''}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                    {aiResult.feature_importance.slice(0, 4).map((item: any, idx: number) => {
                                      const dotColors = ['#006b60', '#6e3bd8', '#a53173', '#48e5d0'];
                                      const dotColor = (!item.color || item.color === '#f3f4f6') ? dotColors[idx % 4] : item.color;
                                      return (
                                        <div key={`fi-${idx}`} className={`flex items-start gap-3 p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white/40'}`}>
                                          <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: dotColor }} />
                                          <div>
                                            <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{getFeatureLabel(item.feature)}</div>
                                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{Math.round(item.importance)}% {t('ui.impact')}</div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-8 border-t border-slate-200/50 dark:border-white/10 pt-6">
                                    <h4 className={`text-base font-bold mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.criticalTouchpoints')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {(insightMeta?.topFeatures || []).map((item, idx) => (
                                        <span key={`touch-${idx}`}
                                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-white/60 text-slate-700'}`}
                                          style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                                          {getFeatureLabel(item.feature)} ({Math.round(item.importance)}%)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </section>
                              <div className="max-w-2xl mx-auto w-full mt-4">
                                <div className={`analytics-glass-card w-full rounded-[1.75rem] p-5 flex flex-col items-center text-center border border-white/40 ${isDarkMode ? 'dark' : ''}`}>
                                  <h4 className={`text-base font-bold mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.prominentTrends')}</h4>
                                  {(() => {
                                    const rawTrends = String(insightCopy?.trends ?? t('ui.prominentTrendsFallback'));
                                    const tagRegex = /([^,;\n(]+\([^)]+%\))/g;
                                    const tagMatches = rawTrends.match(tagRegex) || [];
                                    const trendsList: string[] = tagMatches.map(s => s.trim()).filter(Boolean);
                                    const displayList = trendsList.length > 0
                                      ? trendsList
                                      : rawTrends.split(/[,;\n•]+/).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
                                    return (
                                      <div className="flex flex-wrap justify-center gap-2">
                                        {displayList.map((item, idx) => (
                                          <span key={`trend-${idx}`}
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-white/60 text-slate-700'}`}
                                            style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                              {sessionHistory?.length > 0 && (
                                <section className="mt-8 space-y-5">
                                  <div className="flex items-end justify-between gap-4">
                                    <div>
                                      <h3 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('results.historyTitle')}</h3>
                                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.anonymousHistoryDesc')}</p>
                                    </div>
                                    <button className={`${isDarkMode ? 'text-teal-300' : 'text-teal-700'} text-sm font-semibold flex items-center gap-1 hover:underline`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.viewFullLog')} <ArrowRight className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <div className={`p-5 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/25 backdrop-blur-3xl border-white/40'}`}>
                                    <div className="space-y-3">
                                      {sessionHistory?.slice(0, 5).map((session, idx) => {
                                        const score = session.level === 'High' ? '8.1' : session.level === 'Medium' ? '6.2' : '4.8';
                                        return (
                                          <div key={`history-${session.date}-${idx}`}
                                            className={`analytics-glass-card rounded-2xl p-4 flex items-center gap-6 border border-white/40 group hover:bg-white/60 transition-colors ${isDarkMode ? 'dark' : ''}`}>
                                            <div className={`w-24 text-xs font-bold shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{formatSessionDate(session.date)}</div>
                                            <div className="flex-1">
                                              {session?.features && (
                                                <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                                                  {session.features?.map((f: any, fi: number) => {
                                                    const ftotal = session.features?.reduce((s: number, x: any) => s + x.importance, 0) || 0;
                                                    const fpct = ftotal > 0 ? (f.importance / ftotal) * 100 : 0;
                                                    const fcolor = (!f.color || f.color === '#f3f4f6') ? ['#006b60', '#6e3bd8', '#a53173', '#48e5d0'][fi % 4] : f.color;
                                                    return <div key={fi} style={{ width: `${fpct}%`, backgroundColor: fcolor }} className="h-full" />;
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                            <div className={`w-10 text-right text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{score}</div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </section>
                              )}
                              <section className="mt-10 mb-12 space-y-5">
                                <div>
                                  <h3 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-gray-200' : 'text-slate-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>{t('ui.recommendedActions')}</h3>
                                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>{t('ui.recommendedActionsDesc')}</p>
                                </div>
                                {recommendationResult && (
                                  <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-blue-400/20 bg-blue-400/10' : 'border-blue-200 bg-blue-50'}`} role="status">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                        {recommendationResult.summary}
                                      </p>
                                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${isDarkMode ? 'bg-slate-900 text-blue-200' : 'bg-white text-blue-800'}`}>
                                        {language === 'vi' ? 'Độ tin cậy quyết định' : 'Decision confidence'}: {Math.round(recommendationResult.confidence_score * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                  {(showAllRecs ? actionCards : actionCards.slice(0, 4)).map((rec) => {
                                    const key = rec.categoryKey || '';
                                    let Icon = Brain;
                                    let colorClass = isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-600/10 text-teal-700';
                                    if (key === 'sleep') { Icon = Moon; colorClass = isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-600/10 text-teal-700'; }
                                    else if (key === 'study') { Icon = BookOpen; colorClass = isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'; }
                                    else if (key === 'social') { Icon = Users; colorClass = isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'; }
                                    else if (key === 'exercise') { Icon = Activity; colorClass = isDarkMode ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-100 text-pink-700'; }
                                    else if (key === 'finance') { Icon = DollarSign; colorClass = isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'; }
                                    else if (key === 'mental') { Icon = HeartHandshake; colorClass = isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-600/10 text-teal-700'; }
                                    return (
                                      <ActionCard
                                        key={rec.id}
                                        id={rec.id}
                                        title={rec.title}
                                        description={rec.description}
                                        icon={Icon}
                                        colorClass={colorClass}
                                        isBookmarked={bookmarkedRecs.includes(rec.id)}
                                        detailsLabel={rec.evidence ? (language === 'vi' ? 'Tại sao?' : 'Why?') : t('ui.details')}
                                        bookmarkAriaLabel={t('results.saveRec')}
                                        onBookmark={(e) => { e.stopPropagation(); toggleBookmark(rec.id); }}
                                        onDetailClick={() => setSelectedActionDetail(rec)}
  isDarkMode={isDarkMode}
                                      />
                                    );
                                  })}
                                </div>
                                {actionCards.length > 4 && (
                                  <div className="text-center mt-6">
                                    <button onClick={() => setShowAllRecs(prev => !prev)}
                                      className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium text-sm underline underline-offset-4`}>
                                      {showAllRecs ? t('ui.showLess') : tWith('ui.showMore', { count: actionCards.length - 4 })}
                                    </button>
                                  </div>
                                )}
                              </section>
                          </div>
                        </div>
                      </div>
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-500'}`}>
                      <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#0b132b]'}`}>{t('results.errorTitle')}</h2>
                    <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('results.errorDesc')}</p>
                    <button
                      onClick={() => {
                        setIsSurveyOpen(false);
                        setIsCompleted(false);
                        setCurrentStep(1);
                        setAiResult(null);
                        setRecommendationResult(null);
                        setIsSafetyBlocked(false);
                      }}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      {t('results.btnHome')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
    </AnimatePresence>
  </div>
  );
}
