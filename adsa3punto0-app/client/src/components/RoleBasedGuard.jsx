// src/components/RoleBasedGuard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleBasedGuard = ({ allowedRoles, children }) => {
  const { userProfile } = useAuth();

  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    // Si el usuario no tiene el perfil o su rol no está permitido, no renderiza nada.
    return null; 
  }

  // Si el rol está permitido, renderiza los componentes hijos.
  return <>{children}</>;
};

export default RoleBasedGuard;