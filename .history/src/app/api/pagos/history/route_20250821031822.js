import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant_id");
    const limitCount = parseInt(searchParams.get("limit")) || 50;

    // Si no se proporciona restaurant_id, obtener todos los pagos
    if (!restaurantId) {
      // Obtener todos los pagos
      const paymentsRef = collection(db, "payments");
      const paymentsQuery = query(
        paymentsRef,
        orderBy("date", "desc"),
        limit(limitCount)
      );

      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments = [];

      paymentsSnapshot.forEach((doc) => {
        const payment = doc.data();
        payments.push({
          id: doc.id,
          ...payment,
          date: payment.date?.toDate?.() || payment.date,
        });
      });

      // Obtener todas las transacciones
      const transactionsRef = collection(db, "paymentTransactions");
      const transactionsQuery = query(
        transactionsRef,
        orderBy("date", "desc"),
        limit(limitCount)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = [];

      transactionsSnapshot.forEach((doc) => {
        const transaction = doc.data();
        transactions.push({
          id: doc.id,
          ...transaction,
          date: transaction.date?.toDate?.() || transaction.date,
        });
      });

      // Calcular estadísticas
      const totalPayments = payments.length + transactions.length;
      const approvedPayments =
        payments.filter((p) => p.status === "approved").length +
        transactions.filter((t) => t.status === "approved").length;
      const totalAmount =
        payments
          .filter((p) => p.status === "approved")
          .reduce((sum, p) => sum + (p.amount || 0), 0) +
        transactions
          .filter((t) => t.status === "approved")
          .reduce((sum, t) => sum + (t.amount || t.transaction_amount || 0), 0);

      return NextResponse.json({
        payments,
        transactions,
        statistics: {
          totalPayments,
          approvedPayments,
          totalAmount,
          approvalRate:
            totalPayments > 0 ? (approvedPayments / totalPayments) * 100 : 0,
        },
      });
    }

    // Obtener pagos del restaurante
    const paymentsRef = collection(db, "payments");
    const paymentsQuery = query(
      paymentsRef,
      where("restaurantId", "==", restaurantId),
      orderBy("date", "desc"),
      limit(limitCount)
    );

    const paymentsSnapshot = await getDocs(paymentsQuery);
    const payments = [];

    paymentsSnapshot.forEach((doc) => {
      const payment = doc.data();
      payments.push({
        id: doc.id,
        ...payment,
        date: payment.date?.toDate?.() || payment.date,
      });
    });

    // Obtener transacciones del restaurante
    const transactionsRef = collection(db, "paymentTransactions");
    const transactionsQuery = query(
      transactionsRef,
      where("restaurantId", "==", restaurantId),
      orderBy("date", "desc"),
      limit(limitCount)
    );

    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions = [];

    transactionsSnapshot.forEach((doc) => {
      const transaction = doc.data();
      transactions.push({
        id: doc.id,
        ...transaction,
        date: transaction.date?.toDate?.() || transaction.date,
      });
    });

    // Calcular estadísticas
    const totalPayments = payments.length;
    const approvedPayments = payments.filter(
      (p) => p.status === "approved"
    ).length;
    const totalAmount = payments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPlatformFees = payments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const totalRestaurantAmount = payments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + (p.restaurantAmount || 0), 0);

    return NextResponse.json({
      payments,
      transactions,
      statistics: {
        totalPayments,
        approvedPayments,
        totalAmount,
        totalPlatformFees,
        totalRestaurantAmount,
        approvalRate:
          totalPayments > 0 ? (approvedPayments / totalPayments) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Error getting payment history:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial de pagos" },
      { status: 500 }
    );
  }
}
