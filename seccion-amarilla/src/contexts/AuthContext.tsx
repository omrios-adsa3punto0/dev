// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";

type Role = "EST1" | "EST2" | "EST3" | "EST4" | "EST5" | "admin";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: Role;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "admin",
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const role: Role = "admin"; // puedes cambiarlo según tu lógica

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        console.log("✅ Usuario autenticado:", u);
        console.log("Nombre:", u.displayName);
        console.log("Email:", u.email);
        console.log("UID:", u.uid);
        console.log("Foto:", u.photoURL);
      } else {
        console.log("⚠ No hay usuario autenticado");
      }
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, role, signInWithGoogle, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
