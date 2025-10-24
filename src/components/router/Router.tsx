import { LoadingOverlay } from '@mantine/core';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Outlet, RouteObject, useRoutes } from 'react-router-dom';
import AccessDenied from '../screens/AcessoNegado';
import UnderConstruction from '../screens/EmConstrucao';
import { AuthenticationForm } from '../screens/Login/AuthenticationForm';
import { Profile } from '../screens/Profile/Profile';
import UploadTrackFile from '../screens/UploadTrackFile/UploadTrackFile';
import { HeaderApp } from './header/HeaderApp';
import { PrivateRoute } from './PrivateRoute';
import { ModalsProvider } from '@mantine/modals';

const Loading = () => <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;

const IndexScreen = lazy(() => import('~/components/screens/Home/Home'));
const ProfileScreen = lazy(() => import('~/components/screens/Profile/ProfileForm'));
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
        },
        {
          path: '/profileForm',
          element: <PrivateRoute component={ProfileScreen} />,
        },
        {
          path: '/profile',
          element: <PrivateRoute component={Profile} />,
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
          path: '/uploadTrackFile',
          element: <PrivateRoute component={UploadTrackFile} />,
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
