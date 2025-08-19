import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET - Obtener un restaurante específico
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de restaurante requerido" },
        { status: 400 }
      );
    }

    const restauranteRef = doc(db, "restaurantes", id);
    const restauranteSnap = await getDoc(restauranteRef);

    if (!restauranteSnap.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurante = {
      id: restauranteSnap.id,
      ...restauranteSnap.data(),
    };

    return NextResponse.json({
      success: true,
      restaurante,
    });
  } catch (error) {
    console.error("Error al obtener restaurante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un restaurante
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de restaurante requerido" },
        { status: 400 }
      );
    }

    const restauranteRef = doc(db, "restaurantes", id);
    const restauranteSnap = await getDoc(restauranteRef);

    if (!restauranteSnap.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    // Preparar datos para actualización
    const updateData = {
      ...body,
      fechaActualizacion: new Date().toISOString(),
    };

    // Remover campos que no se deben actualizar
    delete updateData.id;
    delete updateData.fechaCreacion;

    await updateDoc(restauranteRef, updateData);

    return NextResponse.json({
      success: true,
      message: "Restaurante actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar restaurante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un restaurante
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de restaurante requerido" },
        { status: 400 }
      );
    }

    const restauranteRef = doc(db, "restaurantes", id);
    const restauranteSnap = await getDoc(restauranteRef);

    if (!restauranteSnap.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    await deleteDoc(restauranteRef);

    return NextResponse.json({
      success: true,
      message: "Restaurante eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar restaurante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
