import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔄 Iniciando actualización de paymentIds...");

    // Obtener todas las transacciones
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);

    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const docSnapshot of paymentsSnapshot.docs) {
      const paymentData = docSnapshot.data();
      const transactionId = docSnapshot.id;

      // Verificar si el paymentId tiene el formato correcto
      const hasCorrectFormat =
        paymentData.paymentId &&
        (paymentData.paymentId.toUpperCase().includes("CASH") ||
          paymentData.paymentId.toUpperCase().includes("VIRTUAL"));

      if (!hasCorrectFormat) {
        try {
          // Generar nuevo paymentId basado en el tipo de pago
          let newPaymentId;

          if (paymentData.paymentMethod === "efectivo") {
            // Para pagos en efectivo
            const moneda = paymentData.moneda || paymentData.currency || "ARS";
            newPaymentId = `CASH${
              moneda === "USD" ? "USD" : "ARS"
            }_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          } else {
            // Para pagos virtuales (Mercado Pago)
            const moneda = paymentData.moneda || paymentData.currency || "ARS";
            const mercadopagoId =
              paymentData.mercadopagoPaymentId ||
              paymentData.paymentId ||
              transactionId;
            newPaymentId = `VIRTUAL${
              moneda === "USD" ? "USD" : "ARS"
            }_${mercadopagoId}_${Date.now()}`;
          }

          // Actualizar el documento
          await updateDoc(doc(db, "paymentTransactions", transactionId), {
            paymentId: newPaymentId,
          });

          console.log(
            `✅ Transacción ${transactionId} actualizada con nuevo paymentId: ${newPaymentId}`
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
          `⏭️ Transacción ${transactionId} ya tiene paymentId correcto: ${paymentData.paymentId}`
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
