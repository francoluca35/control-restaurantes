import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status");
    const externalReference = searchParams.get("external_reference");

    // Redirigir a la página de pendiente con los parámetros
    const pendingUrl = `/pago-pendiente?payment_id=${paymentId}&status=${status}&external_reference=${externalReference}`;

    return NextResponse.redirect(new URL(pendingUrl, request.url));
  } catch (error) {
    console.error("Error en callback de pendiente:", error);
    return NextResponse.redirect(new URL("/pago-error", request.url));
  }
}
