import RouteErrorBoundary from '@/pages/error/RouteErrorBoundary';
import { lazyPage } from '@/routes/lazyPage';
import { DashboardLayout } from './layout/DashboardLayout';

const DashboardHome = lazyPage(() =>
  import('./pages/DashboardHome').then((module) => ({
    default: module.DashboardHome,
  }))
);
const UsersList = lazyPage(() =>
  import('@/features/users/pages/UsersList').then((module) => ({
    default: module.UsersList,
  }))
);
const FormationsList = lazyPage(() =>
  import('@/features/formations/pages/FormationsList').then((module) => ({
    default: module.FormationsList,
  }))
);
const CreateFormationPage = lazyPage(
  () => import('./pages/formations/CreateFormationPage')
);
const EditFormationPage = lazyPage(
  () => import('@/features/formations/pages/EditFormationPage')
);
const CertificatesList = lazyPage(() =>
  import('@/features/certificates/pages/CertificatesList').then((module) => ({
    default: module.CertificatesList,
  }))
);
const PaymentsPage = lazyPage(() =>
  import('./pages/PaymentsPage').then((module) => ({
    default: module.PaymentsPage,
  }))
);
const ProfilePage = lazyPage(() =>
  import('@/features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);

export const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: DashboardHome,
      },
      {
        path: 'users',
        element: UsersList,
      },
      {
        path: 'formations',
        children: [
          {
            index: true,
            element: FormationsList,
          },
          {
            path: 'new',
            element: CreateFormationPage,
          },
          {
            path: 'edit/:id',
            element: EditFormationPage,
          },
        ],
      },
      {
        path: 'certificates',
        element: CertificatesList,
      },
      {
        path: 'payments',
        element: PaymentsPage,
      },
      {
        path: 'profile',
        element: ProfilePage,
      },
    ],
  },
];
