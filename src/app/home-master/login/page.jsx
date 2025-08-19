"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AuthDebugger from "../../../components/AuthDebugger";

export default function LoginSuperadmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("🔐 Intentando login superadmin:", { email, password });

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
          alert("No autorizado - Rol incorrecto");
        }
      } else {
        console.log("❌ Documento no encontrado");
        alert("Usuario no encontrado");
      }
    } catch (err) {
      console.error("❌ Error en login superadmin:", err);
      alert("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-80">
        <h1 className="text-2xl font-bold">Login SuperAdmin</h1>
        <input
          type="email"
          placeholder="Correo"
          className="p-2 bg-gray-800 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="p-2 bg-gray-800 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 p-2 rounded">
          Entrar
        </button>
      </form>
      <AuthDebugger />
    </div>
  );
}
