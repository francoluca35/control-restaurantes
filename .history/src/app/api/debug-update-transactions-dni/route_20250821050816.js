import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔄 Iniciando actualización de transacciones con DNI y nombre completo...");

    // Obtener todas las transacciones
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);

    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const docSnapshot of paymentsSnapshot.docs) {
      const paymentData = docSnapshot.data();
      const transactionId = docSnapshot.id;

      // Solo actualizar transacciones que no tengan los campos nombreCompleto y dni
      if (!paymentData.nombreCompleto || !paymentData.dni) {
        try {
          // Obtener los datos del restaurante para completar la información
          const restaurantId = paymentData.restaurantId;
          let restaurantData = null;

          if (restaurantId) {
            try {
              const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));
              if (restaurantDoc.exists()) {
                restaurantData = restaurantDoc.data();
              }
            } catch (error) {
              console.warn(`⚠️ No se pudo obtener datos del restaurante ${restaurantId}:`, error);
            }
          }

          // Preparar los datos a actualizar
          const updateData = {};

          // Agregar nombreCompleto si no existe
          if (!paymentData.nombreCompleto) {
            updateData.nombreCompleto = restaurantData?.nombreCompleto || "N/A";
          }

          // Agregar dni si no existe
          if (!paymentData.dni) {
            updateData.dni = restaurantData?.dni || "N/A";
          }

          // Actualizar el documento de la transacción
          await updateDoc(doc(db, "paymentTransactions", transactionId), updateData);

          console.log(
            `✅ Transacción ${transactionId} actualizada: nombreCompleto = ${updateData.nombreCompleto}, dni = ${updateData.dni}`
          );
          updatedCount++;
        } catch (error) {
          console.error(
            `❌ Error actualizando transacción ${transactionId}:`,
            error
          );
          errorCount++;
        }
      } else {
        console.log(
          `⏭️ Transacción ${transactionId} ya tiene los campos requeridos`
        );
        skippedCount++;
      }
    }

    console.log(
      `📊 Actualización completada: ${updatedCount} transacciones actualizadas, ${skippedCount} omitidas, ${errorCount} errores`
    );

    return NextResponse.json({
      success: true,
      message: `Actualización completada: ${updatedCount} transacciones actualizadas, ${skippedCount} omitidas, ${errorCount} errores`,
      updatedCount,
      skippedCount,
      errorCount,
    });
  } catch (error) {
    console.error("❌ Error en actualización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
