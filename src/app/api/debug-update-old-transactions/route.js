import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔄 Iniciando actualización de transacciones antiguas...");

    // Obtener todas las transacciones
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);

    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const docSnapshot of paymentsSnapshot.docs) {
      const paymentData = docSnapshot.data();
      const transactionId = docSnapshot.id;

      // Verificar si faltan campos críticos
      const camposFaltantes = [];
      if (!paymentData.email) camposFaltantes.push("email");
      if (!paymentData.password) camposFaltantes.push("password");
      if (!paymentData.direccion) camposFaltantes.push("direccion");

      if (camposFaltantes.length > 0) {
        try {
          // Crear datos por defecto basados en la información disponible
          const updateData = {};

          // Email: usar el restaurantId como base si no existe
          if (!paymentData.email) {
            updateData.email = `${
              paymentData.restaurantId ||
              paymentData.externalReference ||
              transactionId
            }@restaurante.com`;
          }

          // Password: usar un valor por defecto
          if (!paymentData.password) {
            updateData.password = "12345";
          }

          // Dirección: usar un valor por defecto
          if (!paymentData.direccion) {
            updateData.direccion = "Dirección del restaurante";
          }

          // Actualizar el documento
          await updateDoc(
            doc(db, "paymentTransactions", transactionId),
            updateData
          );

          console.log(
            `✅ Transacción ${transactionId} actualizada con campos: ${camposFaltantes.join(
              ", "
            )}`
          );
          console.log(`📝 Datos agregados:`, updateData);
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
          `⏭️ Transacción ${transactionId} ya tiene todos los campos necesarios`
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
