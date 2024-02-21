import { LoadingOverlay } from '@mantine/core';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Outlet, RouteObject, useRoutes } from 'react-router-dom';
import AccessDenied from '../screens/AcessoNegado';
import Beapilot from '../screens/Beapilot/Beapilot';
import UnderConstruction from '../screens/EmConstrucao';
import { AuthenticationForm } from '../screens/Login/AuthenticationForm';
import { Preferences } from '../screens/Preference/Preferences';
import Customize from '../screens/Scene/Customize/Customize';
import UploadTrackFile from '../screens/UploadTrackFile/UploadTrackFile';
import { HeaderApp } from './header/HeaderApp';
import { PrivateRoute } from './PrivateRoute';
import { ModalsProvider } from '@mantine/modals';

const Loading = () => <LoadingOverlay
  visible={true}
  zIndex={1000}
  overlayProps={{ radius: "sm", blur: 2 }}
/>;

const IndexScreen = lazy(() => import('~/components/screens/Home/Home'));
const ProfileScreen = lazy(() => import('~/components/screens/Profile/ProfileForm'));
const ActivityScreen = lazy(() => import('~/components/screens/Activity/Activity'))
const ActivityDateScreen = lazy(() => import('~/components/screens/Activity/ActivityDate'))
const SceneScreen = lazy(() => import('~/components/screens/Scene/Scene'))
const PaymentScreen = lazy(() => import('~/components/screens/Payment/PaymentForm'));
const Page404Screen = lazy(() => import('~/components/screens/404'));


function Layout() {
  return (
    <>
      <ModalsProvider>
        <HeaderApp />
        <Outlet />
      </ModalsProvider>
    </>
  );
}

export const Router = () => {
  return (
    <BrowserRouter>
      <InnerRouter />
    </BrowserRouter>
  );
};

const InnerRouter = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <IndexScreen />,
        },
        {
          path: '/login',
          element: <AuthenticationForm />,
        }, {
          path: '/beapilot',
          element: <Beapilot />,
        },
        {
          path: '/profile',
          element: <PrivateRoute component={ProfileScreen} />,
        },
        {
          path: '/preferences',
          element: <PrivateRoute component={Preferences} />,
        },
        {
          path: '/sincronize',
          element: <PrivateRoute component={UnderConstruction} />,
        },
        {
          path: '/payment',
          element: <PrivateRoute component={PaymentScreen} />,
        },
        {
          path: '/news',
          element: <PrivateRoute component={UnderConstruction} />,
        },
        {
          path: '/customize',
          element: <Customize />,
        },
        {
          path: '/uploadTrackFile',
          element: <PrivateRoute component={UploadTrackFile} />,
        },
        {
          path: '/activity',
          element: <ActivityScreen />,
        },
        {
          path: '/activity/:id',
          element: <ActivityDateScreen />,
        },
        {
          path: '/scene/:id',
          element: <SceneScreen model={null} points={null} />,
        },
        {
          path: '/acess_denied',
          element: <AccessDenied />,
        },
        {
          path: '*',
          element: <Page404Screen />,
        },
      ],
    },
  ];
  const element = useRoutes(routes);
  return (
    <div>
      <Suspense fallback={<Loading />}>{element}</Suspense>
    </div>
  );
};
