import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from '../contexts/UserContext';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { state } = useAuthState();
  console.log('PrivateRoute auth state:', state);
  return state.state !== 'SIGNED_OUT' ? children : <Navigate to="/acess_denied" />;
};

export default PrivateRoute;
