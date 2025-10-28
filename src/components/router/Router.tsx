import { LoadingOverlay } from '@mantine/core';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Outlet, RouteObject, useRoutes } from 'react-router-dom';
import AccessDenied from '../screens/AcessoNegado';
import UnderConstruction from '../screens/EmConstrucao';
import { AuthenticationForm } from '../screens/Login/AuthenticationForm';
import { Profile } from '../screens/Profile/Profile';
import UploadTrackFile from '../screens/UploadTrackFile/UploadTrackFile';
import { HeaderApp } from './header/HeaderApp';
import { ModalsProvider } from '@mantine/modals';
import { ListaAreaAtuacao } from '../screens/AreaAtuacao/List/ListAreaAtuacao';
import PrivateRoute from './PrivateRoute';
import { ListaFuncionarios } from '../screens/Funcionarios/List/ListFuncionarios';
import { ListPerguntasFrequentes } from '~/lib/repositories/perguntasRepository';
import { ListaPerguntasFrequentes } from '../screens/PerguntasFrequentes/List/PerguntasFrequentes';
import { ConsultaPromocao } from '../screens/ConsultaPromocao/ConsultaPromocao';
import { UploadPromocoes } from '../screens/UploadPromocoes/UploadPromocoes';

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
          element: (
            <PrivateRoute>
              <ProfileScreen />
            </PrivateRoute>
          ),
        },
        {
          path: '/profile',
          element: (
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          ),
        },
        {
          path: '/payment',
          element: (
            <PrivateRoute>
              <PaymentScreen />
            </PrivateRoute>
          ),
        },
        {
          path: '/news',
          element: (
            <PrivateRoute>
              <UnderConstruction />
            </PrivateRoute>
          ),
        },
        {
          path: '/areas_atuacao',
          element: (
            <PrivateRoute>
              <ListaAreaAtuacao />
            </PrivateRoute>
          ),
        },
        {
          path: '/funcionarios',
          element: (
            <PrivateRoute>
              <ListaFuncionarios />
            </PrivateRoute>
          ),
        },
        {
          path: '/consulta_propmocao',
          element: (
            <PrivateRoute>
              <ConsultaPromocao />
            </PrivateRoute>
          ),
        },
        {
          path: '/perguntas_frequentes',
          element: (
            <PrivateRoute>
              <ListaPerguntasFrequentes />
            </PrivateRoute>
          ),
        },
        {
          path: '/upload_promocao',
          element: (
            <PrivateRoute>
              <UploadPromocoes />
            </PrivateRoute>
          ),
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
