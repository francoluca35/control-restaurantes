// Script para probar MercadoPago
const testMercadoPago = async () => {
  try {
    console.log("🧪 Probando conexión a MercadoPago...");

    const response = await fetch("http://localhost:3000/api/test-mercadopago");
    const data = await response.json();

    console.log("📊 Respuesta:", data);

    if (data.success) {
      console.log("✅ MercadoPago funciona correctamente!");
      console.log("🔑 Preference ID:", data.preferenceId);
    } else {
      console.log("❌ Error en MercadoPago:", data.error);
    }
  } catch (error) {
    console.log("❌ Error de conexión:", error.message);
  }
};

// Ejecutar la prueba
testMercadoPago();
