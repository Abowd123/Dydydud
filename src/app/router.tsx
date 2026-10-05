import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { RouteFallback } from '@/components/system/RouteFallback';
import { AppLayout } from '@/components/layout/AppLayout';
import { WelcomePage } from '@/features/onboarding/WelcomePage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { useSettings } from '@/store/settings';

/** تقسيم الكود: كل صفحة تنحمل لما تحتاجها (أول تحميل أخف بكثير) */
const page = <K extends string>(load: () => Promise<Record<K, ComponentType<any>>>, key: K) =>
  lazy(() => load().then((m) => ({ default: m[key] })));
const QuestionnairePage = page(() => import('@/features/plan/QuestionnairePage'), 'QuestionnairePage');
const PlanReadyPage = page(() => import('@/features/plan/PlanReadyPage'), 'PlanReadyPage');
const SchedulePage = page(() => import('@/features/schedule/SchedulePage'), 'SchedulePage');
const WorkoutPage = page(() => import('@/features/workout/WorkoutPage'), 'WorkoutPage');
const WorkoutLivePage = page(() => import('@/features/workout/WorkoutLivePage'), 'WorkoutLivePage');
const WorkoutSummaryPage = page(() => import('@/features/workout/WorkoutSummaryPage'), 'WorkoutSummaryPage');
const ExercisesPage = page(() => import('@/features/exercises/ExercisesPage'), 'ExercisesPage');
const ExerciseDetailPage = page(() => import('@/features/exercises/ExerciseDetailPage'), 'ExerciseDetailPage');
const NutritionPage = page(() => import('@/features/nutrition/NutritionPage'), 'NutritionPage');
const ProgressPage = page(() => import('@/features/progress/ProgressPage'), 'ProgressPage');
const CoachPage = page(() => import('@/features/coach/CoachPage'), 'CoachPage');
const MorePage = page(() => import('@/features/profile/MorePage'), 'MorePage');
const ProfilePage = page(() => import('@/features/profile/ProfilePage'), 'ProfilePage');
const UIKitPage = page(() => import('@/features/uikit/UIKitPage'), 'UIKitPage');
const AccountPage = page(() => import('@/features/account/AccountPage'), 'AccountPage');
const RemindersPage = page(() => import('@/features/reminders/RemindersPage'), 'RemindersPage');
const AchievementsPage = page(() => import('@/features/gamification/AchievementsPage'), 'AchievementsPage');
const ChallengesPage = page(() => import('@/features/challenges/ChallengesPage'), 'ChallengesPage');
const LegalPage = page(() => import('@/features/legal/LegalPage'), 'LegalPage');
const DataPage = page(() => import('@/features/data/DataPage'), 'DataPage');
const FormCheckPage = page(() => import('@/features/formcheck/FormCheckPage'), 'FormCheckPage');

function RequireOnboarding({ children }: { children: ReactNode }) {
  const onboarded = useSettings((s) => s.onboarded);
  return onboarded ? <Suspense fallback={<RouteFallback />}>{children}</Suspense> : <Navigate to="/welcome" replace />;
}

const S = ({ children }: { children: ReactNode }) => <Suspense fallback={<RouteFallback />}>{children}</Suspense>;

export const router = createBrowserRouter([
  { path: '/welcome', element: <WelcomePage /> },
  { path: '/onboarding', element: <S><QuestionnairePage /></S> },
  { path: '/privacy', element: <S><LegalPage kind="privacy" /></S> },
  { path: '/terms', element: <S><LegalPage kind="terms" /></S> },
  {
    path: '/plan-ready',
    element: (
      <RequireOnboarding>
        <PlanReadyPage />
      </RequireOnboarding>
    )
  },
  {
    path: '/workout/live',
    element: (
      <RequireOnboarding>
        <WorkoutLivePage />
      </RequireOnboarding>
    )
  },
  {
    path: '/form-check/:id',
    element: (
      <RequireOnboarding>
        <FormCheckPage />
      </RequireOnboarding>
    )
  },
  {
    path: '/coach',
    element: (
      <RequireOnboarding>
        <CoachPage />
      </RequireOnboarding>
    )
  },
  {
    path: '/workout/summary/:id',
    element: (
      <RequireOnboarding>
        <WorkoutSummaryPage />
      </RequireOnboarding>
    )
  },
  {
    path: '/',
    element: (
      <RequireOnboarding>
        <AppLayout />
      </RequireOnboarding>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'schedule', element: <S><SchedulePage /></S> },
      { path: 'workout', element: <S><WorkoutPage /></S> },
      { path: 'exercises', element: <S><ExercisesPage /></S> },
      { path: 'exercises/:id', element: <S><ExerciseDetailPage /></S> },
      { path: 'nutrition', element: <S><NutritionPage /></S> },
      { path: 'progress', element: <S><ProgressPage /></S> },
      { path: 'more', element: <S><MorePage /></S> },
      { path: 'profile', element: <S><ProfilePage /></S> },
      { path: 'ui-kit', element: <S><UIKitPage /></S> },
      { path: 'account', element: <S><AccountPage /></S> },
      { path: 'reminders', element: <S><RemindersPage /></S> },
      { path: 'achievements', element: <S><AchievementsPage /></S> },
      { path: 'challenges', element: <S><ChallengesPage /></S> },
      { path: 'data', element: <S><DataPage /></S> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
