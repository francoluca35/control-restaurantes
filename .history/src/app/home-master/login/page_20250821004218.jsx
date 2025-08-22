"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AuthDebugger from "../../../components/AuthDebugger.js";
import ConfigDebugger from "../../../components/ConfigDebugger.jsx";
import { useAuth } from "../../context/AuthContext";

export default function LoginSuperadmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔐 Intentando login superadmin:", { email, password });

      // Check if Firebase is available
      if (!auth) {
        throw new Error(
          "Firebase no está configurado. Por favor, crea un archivo .env.local con las credenciales de Firebase. Revisa env.example para ver las variables necesarias."
        );
      }

      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase Auth exitoso:", user);

      // Usar user.user.email (no user.email)
      const docRef = doc(db, "usuarios", user.user.email);
      console.log("🔍 Verificando documento:", user.user.email);

      const snap = await getDoc(docRef);
      console.log("📄 Documento encontrado:", snap.exists());

      if (snap.exists()) {
        const userData = snap.data();
        console.log("📋 Datos del usuario:", userData);

        if (userData.rol === "superadmin") {
          console.log("✅ Rol superadmin confirmado");

          // Guardar datos del superadmin en localStorage
          localStorage.setItem("superAdminUser", user.user.email);
          localStorage.setItem("superAdminRole", "superadmin");
          localStorage.setItem("superadminImage", userData.imagen || "");
          localStorage.setItem("imagen", userData.imagen || "");

          console.log("💾 Datos guardados en localStorage");

          // Redirigir inmediatamente al dashboard
          console.log("🔄 Redirigiendo al dashboard...");
          router.push("/home-master/dashboard");
        } else {
          console.log("❌ Rol incorrecto:", userData.rol);
          setError("No autorizado - Rol incorrecto");
        }
      } else {
        console.log("❌ Documento no encontrado");
        setError("Usuario no encontrado");
      }
    } catch (err) {
      console.error("❌ Error en login superadmin:", err);
      setError("Error al iniciar sesión: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col space-y-4 w-80">
        <h1 className="text-2xl font-bold">Login SuperAdmin</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Correo"
            className="p-2 bg-gray-800 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="p-2 bg-gray-800 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-2 rounded ${
              isLoading ? "bg-gray-600" : "bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Entrar"}
          </button>
        </form>

        {/* Botón para arreglar autenticación */}
        <div className="text-center mt-4">
          <button
            onClick={async () => {
              if (!email) {
                alert("Por favor ingresa un email primero");
                return;
              }

              try {
                const response = await fetch(
                  `/api/debug-auth?email=${encodeURIComponent(email)}`
                );
                const data = await response.json();

                if (data.success) {
                  alert("✅ " + data.message);
                  // Limpiar el formulario
                  setEmail("");
                  setPassword("");
                  setError(null);
                } else {
                  alert("❌ Error: " + data.error);
                }
              } catch (error) {
                alert("❌ Error al arreglar autenticación: " + error.message);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            🔧 Arreglar Autenticación
          </button>
        </div>

        {/* Enlace a página de debug */}
        <div className="text-center mt-2">
          <a
            href="/debug"
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            🔧 Ver Debug Completo
          </a>
        </div>
      </div>
    </div>
  );
}
