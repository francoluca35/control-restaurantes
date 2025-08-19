"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkAuth = useCallback(async () => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // Verificar si estamos en el sistema de restaurantes o superadmin
    const currentPath = window.location.pathname;
    const isSuperAdminSystem = currentPath.includes("/home-master");
    const isRestaurantSystem = currentPath.includes("/home-comandas");

    console.log("🔍 AuthContext - Verificando sistema:", {
      currentPath,
      isSuperAdminSystem,
      isRestaurantSystem,
    });

    if (isRestaurantSystem) {
      // Sistema de restaurantes - cargar desde localStorage
      console.log("🏪 Sistema de restaurantes detectado");

      const restauranteId = localStorage.getItem("restauranteId");
      const usuarioLocal = localStorage.getItem("usuario");
      const rolLocal = localStorage.getItem("rol");
      const nombreCompleto = localStorage.getItem("nombreCompleto");
      const userImage = localStorage.getItem("userImage");

      console.log("📋 Datos de restaurante en localStorage:", {
        restauranteId,
        usuarioLocal,
        rolLocal,
        nombreCompleto,
        userImage,
      });

      if (restauranteId && usuarioLocal && rolLocal) {
        // Usuario autenticado en sistema de restaurantes
        const userInfo = {
          id: usuarioLocal,
          usuario: usuarioLocal,
          nombreCompleto: nombreCompleto || usuarioLocal,
          imagen: userImage || "",
          restauranteId: restauranteId,
          tipo: "restaurante",
        };

        setUsuario(userInfo);
        setRol(rolLocal);
        console.log("✅ Usuario de restaurante autenticado:", {
          usuario: userInfo,
          rol: rolLocal,
        });
      } else {
        // No hay sesión de restaurante válida
        console.log("❌ No hay sesión de restaurante válida");
        setUsuario(null);
        setRol(null);
      }
    } else if (isSuperAdminSystem) {
      // Sistema de superadmin - usar Firebase Auth
      console.log("👑 Sistema de superadmin detectado");

      let user = auth.currentUser;

      // Si no hay usuario actual, esperar un momento para que Firebase se inicialice
      if (!user) {
        console.log("🔍 Esperando inicialización de Firebase Auth...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        user = auth.currentUser;
      }

      console.log("🔍 AuthContext - Verificando superadmin:", {
        currentPath,
        isSuperAdminSystem,
        hasFirebaseUser: !!user,
        userEmail: user?.email,
      });

      if (user) {
        console.log("🔍 Firebase Auth detectó usuario:", user.email);

        try {
          const docRef = doc(db, "usuarios", user.email);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const userData = snap.data();
            console.log("📋 Datos superadmin:", userData);

            if (userData.rol === "superadmin") {
              const userInfo = {
                email: user.email,
                rol: "superadmin",
                tipo: "superadmin",
              };
              setUsuario(userInfo);
              setRol("superadmin");

              // Guardar en localStorage para persistencia
              localStorage.setItem("superadmin_email", user.email);
              localStorage.setItem("superadmin_rol", "superadmin");

              console.log("✅ Superadmin autenticado - Estado actualizado");
            } else {
              console.log("❌ Usuario no es superadmin");
              setUsuario(null);
              setRol(null);
              localStorage.removeItem("superadmin_email");
              localStorage.removeItem("superadmin_rol");
            }
          } else {
            console.log("❌ Documento superadmin no encontrado");
            setUsuario(null);
            setRol(null);
            localStorage.removeItem("superadmin_email");
            localStorage.removeItem("superadmin_rol");
          }
        } catch (error) {
          console.error("❌ Error al verificar superadmin:", error);
          setUsuario(null);
          setRol(null);
          localStorage.removeItem("superadmin_email");
          localStorage.removeItem("superadmin_rol");
        }
      } else {
        console.log("❌ No hay usuario de Firebase Auth");
        setUsuario(null);
        setRol(null);
        localStorage.removeItem("superadmin_email");
        localStorage.removeItem("superadmin_rol");
      }
    } else {
      // Sistema no reconocido
      console.log("❓ Sistema no reconocido, limpiando autenticación");
      setUsuario(null);
      setRol(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Escuchar cambios en Firebase Auth solo para superadmin
  useEffect(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isSuperAdminSystem = currentPath.includes("/home-master");

    if (isSuperAdminSystem) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("🔄 Firebase Auth state changed:", user?.email);
        if (!isChecking) {
          checkAuth();
        }
      });

      return () => unsubscribe();
    }
  }, [checkAuth, isChecking]);

  // Escuchar cambios en localStorage para restaurantes
  useEffect(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isRestaurantSystem = currentPath.includes("/home-comandas");

    if (isRestaurantSystem) {
      const handleStorageChange = () => {
        console.log(
          "🔄 localStorage changed, verificando autenticación de restaurante"
        );
        checkAuth();
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [checkAuth]);

  const value = {
    usuario,
    rol,
    loading,
    isChecking,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
