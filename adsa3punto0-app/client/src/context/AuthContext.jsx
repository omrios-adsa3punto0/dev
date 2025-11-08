// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:5001/adsa3punto0/us-central1/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // <-- NUEVO: para guardar el perfil de nuestra DB
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Usuario ha iniciado sesión, vamos a buscar su perfil
        try {
          const idToken = await user.getIdToken();
          const response = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          });
          setUserProfile(response.data); // <-- Guardamos el perfil
        } catch (error) {
          console.error("No se pudo obtener el perfil del usuario", error);
          // Podrías cerrar la sesión aquí si el perfil no se encuentra
          setUserProfile(null);
        }
      } else {
        // Usuario ha cerrado sesión
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile, // <-- Hacemos disponible el perfil en toda la app
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};