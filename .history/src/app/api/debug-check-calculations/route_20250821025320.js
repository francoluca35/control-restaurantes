import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request) {
  try {
    console.log("🔍 Verificando cálculos de ingresos...");

    // Obtener todas las transacciones
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);

    let ingresosMensualesARS = 0;
    let ingresosMensualesUSD = 0;
    let ingresosAnualesARS = 0;
    let ingresosAnualesUSD = 0;

    const transactions = [];

    paymentsSnapshot.docs.forEach((doc) => {
      const paymentData = doc.data();
      if (paymentData.status === "approved") {
        const amount = paymentData.amount || 0;

        // Determinar si es pago mensual o anual
        const isAnnualPayment =
          paymentData.periodicidad === "anual" ||
          (paymentData.paymentId &&
            typeof paymentData.paymentId === "string" &&
            paymentData.paymentId.toUpperCase().includes("ANUAL"));

        // Determinar la moneda usando es_usd
        let isARS = false;
        let isUSD = false;

        if (paymentData.es_usd !== undefined) {
          isUSD = paymentData.es_usd === true;
          isARS = paymentData.es_usd === false;
        } else {
          // Fallback para transacciones antiguas
          isARS =
            paymentData.currency === "ARS" || paymentData.moneda === "ARS";
          isUSD =
            paymentData.currency === "USD" || paymentData.moneda === "USD";
        }

        // Calcular ingresos
        if (isAnnualPayment) {
          if (isARS) {
            ingresosAnualesARS += amount;
          } else if (isUSD) {
            ingresosAnualesUSD += amount;
          }
        } else {
          if (isARS) {
            ingresosMensualesARS += amount;
          } else if (isUSD) {
            ingresosMensualesUSD += amount;
          }
        }

        transactions.push({
          id: doc.id,
          restaurantId: paymentData.restaurantId,
          restaurantName: paymentData.restaurantName,
          amount: amount,
          paymentMethod: paymentData.paymentMethod,
          es_usd: paymentData.es_usd,
          periodicidad: paymentData.periodicidad,
          isAnnual: isAnnualPayment,
          isARS: isARS,
          isUSD: isUSD,
          category: isAnnualPayment
            ? isARS
              ? "Anual ARS"
              : "Anual USD"
            : isARS
            ? "Mensual ARS"
            : "Mensual USD",
        });
      }
    });

    console.log("📊 Cálculos de ingresos:", {
      ingresosMensualesARS,
      ingresosMensualesUSD,
      ingresosAnualesARS,
      ingresosAnualesUSD,
      totalTransactions: transactions.length,
    });

    return NextResponse.json({
      success: true,
      calculations: {
        ingresosMensualesARS,
        ingresosMensualesUSD,
        ingresosAnualesARS,
        ingresosAnualesUSD,
        totalTransactions: transactions.length,
      },
      transactions: transactions,
    });
  } catch (error) {
    console.error("❌ Error verificando cálculos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
