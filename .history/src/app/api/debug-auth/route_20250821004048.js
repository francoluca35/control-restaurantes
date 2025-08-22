import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Debugging auth for email:", email);

    // Verificar si el usuario existe
    const userDocRef = doc(db, "usuarios", email);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.log("❌ Usuario no encontrado, creando...");

      // Crear el usuario con rol superadmin
      await setDoc(userDocRef, {
        email: email,
        rol: "superadmin",
        tipo: "superadmin",
        fechaCreacion: new Date(),
        activo: true,
      });

      console.log("✅ Usuario creado con rol superadmin");

      return NextResponse.json({
        success: true,
        message: "Usuario creado con rol superadmin",
        user: {
          email: email,
          rol: "superadmin",
          tipo: "superadmin",
        },
      });
    } else {
      const userData = userSnap.data();
      console.log("📋 Usuario encontrado:", userData);

      // Verificar si tiene el rol correcto
      if (userData.rol !== "superadmin") {
        console.log("⚠️ Rol incorrecto, actualizando...");

        // Actualizar el rol
        await setDoc(
          userDocRef,
          {
            ...userData,
            rol: "superadmin",
            tipo: "superadmin",
          },
          { merge: true }
        );

        console.log("✅ Rol actualizado a superadmin");

        return NextResponse.json({
          success: true,
          message: "Rol actualizado a superadmin",
          user: {
            ...userData,
            rol: "superadmin",
            tipo: "superadmin",
          },
        });
      } else {
        console.log("✅ Usuario ya tiene rol superadmin");

        return NextResponse.json({
          success: true,
          message: "Usuario ya tiene rol superadmin",
          user: userData,
        });
      }
    }
  } catch (error) {
    console.error("❌ Error en debug-auth:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
