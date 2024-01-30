import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthState } from '../contexts/UserContext';
import { useEffect, useState } from 'react';
import { GetProfile } from '~/lib/authServices';
import React from 'react';

interface Props {
  component: React.ComponentType
  path?: string
}

export const PrivateRoute: React.FC<Props> = ({ component: RouteComponent }) => {
  const navigate = useNavigate()

  const [status, setStatus] = useState(Boolean);

  useEffect(() => {
    checkToken();
  }, [RouteComponent]);

  const checkToken = async () => {

    try {
      if (status) return
      let user = await GetProfile(true);
      if (!user) {
        navigate(`/acess_denied`);
      }
      setStatus(true);
      return;
    } catch (error) {
      alert("Erro na pagina");
    }
  }

  if (status) {
    return <RouteComponent />
  }
}