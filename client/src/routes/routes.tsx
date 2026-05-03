import { dashboardRoutes } from '@/features/dashboard/routes';
import RouteErrorBoundary from '@/pages/error/RouteErrorBoundary';
import UserLayout from '@/layouts/UserLayout';
import { createBrowserRouter } from 'react-router-dom';
import { lazyPage } from './lazyPage';

const HomePage = lazyPage(() => import('@/pages/home/Home'));
const LoginPage = lazyPage(() => import('@/pages/auth/Login'));
const RegisterPage = lazyPage(() => import('@/pages/auth/Register'));
const VerifyOtpPage = lazyPage(() => import('@/pages/auth/VerifyOTP'));
const ProfilePage = lazyPage(() =>
  import('@/features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);
const AboutPage = lazyPage(() => import('@/pages/APropos'));
const PaymentMethodSelectionPage = lazyPage(() =>
  import('@/features/paiements').then((module) => ({
    default: module.PaymentMethodSelectionPage,
  }))
);
const PaiementPage = lazyPage(() =>
  import('@/features/paiements').then((module) => ({
    default: module.PaiementPage,
  }))
);
const PaiementHistoryPage = lazyPage(() =>
  import('@/features/paiements').then((module) => ({
    default: module.PaiementHistoryPage,
  }))
);
const PaymentConfirmationPage = lazyPage(() =>
  import('@/features/paiements').then((module) => ({
    default: module.PaymentConfirmationPage,
  }))
);
const MesAttestationsPage = lazyPage(() =>
  import('@/features/attestations/pages/MesAttestationsPage').then((module) => ({
    default: module.MesAttestationsPage,
  }))
);
const FormationsPage = lazyPage(() => import('@/pages/FormationsPage'));
const FormationConfirmationPage = lazyPage(() =>
  import('@/pages/FormationConfirmationPage')
);
const PageError = lazyPage(() => import('@/pages/error/PageError'));

const RouterInstance = createBrowserRouter([
  {
    path: '/',
    element: <UserLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: HomePage,
      },
      { path: 'login', element: LoginPage },
      { path: 'register', element: RegisterPage },
      { path: 'verify-otp', element: VerifyOtpPage },
      {
        path: 'profile',
        element: ProfilePage,
      },
      {
        path: 'a-propos',
        element: AboutPage,
      },
      {
        path: 'formations/:id/paiement/selection',
        element: PaymentMethodSelectionPage,
      },
      {
        path: 'formations/:id/paiement',
        element: PaiementPage,
      },
      {
        path: 'mon-compte/paiements',
        element: PaiementHistoryPage,
      },
      {
        path: 'paiement/confirmation',
        element: PaymentConfirmationPage,
      },
      {
        path: 'mes-attestations',
        element: MesAttestationsPage,
      },
      {
        path: 'formations',
        element: FormationsPage,
      },
      {
        path: 'formations/:id',
        element: FormationsPage,
      },
      {
        path: 'formations/:id/confirmation',
        element: FormationConfirmationPage,
      },
      { path: '*', element: PageError },
    ],
  },
  ...dashboardRoutes,
  {
    path: '*',
    element: PageError,
  },
]);

export const router = RouterInstance;
