import { lazy, Suspense, useState } from 'react';
import { Outlet, RouteObject, useRoutes, BrowserRouter } from 'react-router-dom';
import { HeaderApp } from './header/HeaderApp';
import { FooterApp } from './footer/FooterApp';
import { Partners } from '../shared/Partners';
import { AuthenticationForm } from '../screens/Login/AuthenticationForm';
import { Box, Container, LoadingOverlay } from '@mantine/core';
import { PrivateRoute } from './PrivateRoute';
import AccessDenied from '../screens/AcessoNegado';
import UnderConstruction from '../screens/EmConstrucao';

const Loading = () => <LoadingOverlay
  visible={true}
  zIndex={1000}
  overlayProps={{ radius: "sm", blur: 2 }}
/>;

const IndexScreen = lazy(() => import('~/components/screens/Home/Home'));
const ProfileScreen = lazy(() => import('~/components/screens/Profile/ProfileForm'));
const SincronizeScreen = lazy(() => import('~/components/screens/Sincronize/SincronizeForm'));
const RampScreen = lazy(() => import('~/components/screens/Ramp/Ramp'))
const PaymentScreen = lazy(() => import('~/components/screens/Payment/PaymentForm'));
const Page404Screen = lazy(() => import('~/components/screens/404'));


function Layout() {
  return (
    <>
      <HeaderApp />
      <Outlet/>
      <Container>
        <Partners />
      </Container>
      <FooterApp />
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
          path: '/profile',
          element: <PrivateRoute component={ProfileScreen} />,
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
          path: '/ramp',
          element: <PrivateRoute component={RampScreen} />,
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
