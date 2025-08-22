"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  where,
} from "firebase/firestore";
import {
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaDollarSign,
  FaStore,
  FaCalendarAlt,
  FaSync,
  FaCalendar,
  FaDownload,
} from "react-icons/fa";
import { usePaymentHistory } from "../../../hooks/usePaymentHistory";
import { usePagos } from "../../../hooks/usePagos";

export default function VistaConfirmaciones() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all", "virtual", "cash"
  const [downloadingContract, setDownloadingContract] = useState(null);
  const [updatingTransactions, setUpdatingTransactions] = useState(false);

  // Hooks para descarga de contratos
  const { downloadContract } = usePaymentHistory();
  const { restaurants } = usePagos();

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        setLoading(true);
        console.log("🔍 Cargando confirmaciones de pagos...");

        // Query para obtener todos los pagos ordenados por fecha
        const pagosQuery = query(
          collection(db, "paymentTransactions"),
          orderBy("date", "desc")
        );

        // Listener en tiempo real para nuevos pagos
        const unsubscribe = onSnapshot(
          pagosQuery,
          (snapshot) => {
            const pagosData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            console.log("📊 Pagos cargados:", pagosData.length);

            // Log para verificar qué datos tienen los documentos
            pagosData.forEach((pago, index) => {
              console.log(`📄 Pago ${index + 1} (ID: ${pago.id}):`, {
                restaurantName: pago.restaurantName,
                email: pago.email,
                telefono: pago.telefono,
                direccion: pago.direccion,
                password: pago.password,
                codigoActivacion: pago.codigoActivacion,
                cantidadUsuarios: pago.cantidadUsuarios,
                conFinanzas: pago.conFinanzas,
                status: pago.status,
                paymentMethod: pago.paymentMethod,
              });
            });

            setPagos(pagosData);
            setLoading(false);
          },
          (error) => {
            console.error("❌ Error cargando pagos:", error);
            setError("Error al cargar los pagos");
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("❌ Error en cargarPagos:", error);
        setError("Error al cargar los pagos");
        setLoading(false);
      }
    };

    cargarPagos();
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "pagado":
        return <FaCheckCircle className="text-green-500" />;
      case "pending":
      case "pendiente":
        return <FaClock className="text-yellow-500" />;
      case "rejected":
      case "rechazado":
      case "cancelled":
      case "cancelado":
        return <FaTimes className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "pagado":
        return "Aprobado";
      case "pending":
      case "pendiente":
        return "Pendiente";
      case "rejected":
      case "rechazado":
        return "Rechazado";
      case "cancelled":
      case "cancelado":
        return "Cancelado";
      default:
        return status || "Desconocido";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "pagado":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
      case "rechazado":
      case "cancelled":
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Determinar si el pago es virtual (tarjeta) o efectivo
  const getPaymentType = (pago) => {
    // Si el ID del pago contiene la palabra "CASH", es efectivo
    // Si contiene "VIRTUAL", es virtual
    if (pago.paymentId && typeof pago.paymentId === "string") {
      if (pago.paymentId.toUpperCase().includes("CASH")) {
        return "cash";
      } else if (pago.paymentId.toUpperCase().includes("VIRTUAL")) {
        return "virtual";
      }
    }
    // Por defecto, si no tiene paymentId o no coincide con los patrones, es virtual
    return "virtual";
  };

  // Obtener color según tipo de pago
  const getPaymentTypeColor = (pago) => {
    const type = getPaymentType(pago);
    return type === "virtual" ? "text-blue-600" : "text-green-600";
  };

  // Obtener icono según tipo de pago
  const getPaymentTypeIcon = (pago) => {
    const type = getPaymentType(pago);
    return type === "virtual" ? "💳" : "💰";
  };

  // Obtener tipo de periodicidad (mensual/anual)
  const getPaymentPeriodicity = (pago) => {
    if (pago.periodicidad) {
      return pago.periodicidad === "anual" ? "anual" : "mensual";
    }
    // Si no tiene periodicidad, determinar por el ID del pago
    if (pago.paymentId && typeof pago.paymentId === "string") {
      if (pago.paymentId.toUpperCase().includes("ANUAL")) {
        return "anual";
      }
    }
    return "mensual"; // Por defecto mensual
  };

  // Filtrar pagos según el tipo seleccionado
  const getFilteredPagos = () => {
    if (filterType === "all") return pagos;

    return pagos.filter((pago) => {
      const type = getPaymentType(pago);
      return type === filterType;
    });
  };

  const filteredPagos = getFilteredPagos();

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const refreshPagos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Actualizando datos de pagos...");

      // Recargar los datos manualmente
      const pagosQuery = query(
        collection(db, "paymentTransactions"),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(pagosQuery);
      const pagosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("📊 Pagos actualizados:", pagosData.length);
      setPagos(pagosData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error actualizando pagos:", error);
      setError("Error al actualizar los pagos");
      setLoading(false);
    }
  };

  const updateOldTransactions = async () => {
    try {
      setUpdatingTransactions(true);
      console.log("🔄 Actualizando transacciones antiguas...");

      // Primero actualizar campos faltantes
      const response1 = await fetch("/api/debug-update-old-transactions", {
        method: "POST",
      });

      const result1 = await response1.json();

      if (!result1.success) {
        throw new Error(result1.error || "Error actualizando campos");
      }

      console.log("✅ Campos actualizados:", result1.message);

      // Luego actualizar paymentIds
      const response2 = await fetch("/api/debug-update-payment-ids", {
        method: "POST",
      });

      const result2 = await response2.json();

      if (!result2.success) {
        throw new Error(result2.error || "Error actualizando paymentIds");
      }

      console.log("✅ PaymentIds actualizados:", result2.message);

      alert(
        `✅ Actualización completada:\n${result1.message}\n${result2.message}`
      );

      // Recargar los pagos después de la actualización
      refreshPagos();
    } catch (error) {
      console.error("❌ Error actualizando transacciones:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setUpdatingTransactions(false);
    }
  };

  // Función para descargar contrato
  const handleDownloadContract = async (pago) => {
    try {
      console.log("🖱️ Botón de descarga clickeado para pago:", pago.id);
      setDownloadingContract(pago.id);

      console.log("🔍 Generando contrato para pago:", pago.id);
      console.log(
        "📄 Datos completos del pago:",
        JSON.stringify(pago, null, 2)
      );

      // Verificar si el pago tiene los campos necesarios
      const camposFaltantes = [];
      if (!pago.email) camposFaltantes.push("email");
      if (!pago.password) camposFaltantes.push("password");
      if (!pago.direccion) camposFaltantes.push("direccion");

      if (camposFaltantes.length > 0) {
        console.warn("⚠️ Campos faltantes en el pago:", camposFaltantes);
        console.warn(
          "⚠️ Este pago puede ser de una versión anterior del sistema"
        );
      }

      console.log("📧 Email del pago:", pago.email);
      console.log("📞 Teléfono del pago:", pago.telefono);
      console.log("📍 Dirección del pago:", pago.direccion);
      console.log("🔑 Contraseña del pago:", pago.password);
      console.log("🔑 Código de activación del pago:", pago.codigoActivacion);
      console.log("👥 Cantidad de usuarios del pago:", pago.cantidadUsuarios);
      console.log("💰 Con finanzas del pago:", pago.conFinanzas);

      // Crear objeto restaurante directamente desde los datos del pago
      // Ya que ahora TODOS los datos están en paymentTransactions
      const restaurant = {
        id: pago.restaurantId || pago.id,
        nombre: pago.restaurantName || pago.restaurantId || "Restaurante",
        propietario: pago.propietario || "Propietario",
        direccion: pago.direccion || "Dirección no especificada",
        telefono: pago.telefono || "Teléfono no especificado",
        email: pago.email || "Email no especificado",
        codigoActivacion:
          pago.codigoActivacion ||
          pago.externalReference ||
          pago.restaurantId ||
          pago.id,
        password: pago.password || "N/A",
        periodicidad: pago.periodicidad || "Mensual",
        cantUsuarios: pago.cantidadUsuarios || "1",
        finanzas: pago.conFinanzas || false,
        tipoServicio: pago.tipoServicio || "sinFinanzas",
        formaPago: pago.formaPago || pago.paymentMethod || "efectivo",
        moneda: pago.moneda || pago.currency || "USD",
        logo: pago.logo || "",
      };

      console.log(
        "📄 Datos finales del restaurante para contrato:",
        restaurant
      );

      console.log("🔄 Llamando a downloadContract...");
      const result = await downloadContract(pago, restaurant);

      if (result.success) {
        console.log("✅ Contrato descargado exitosamente");
      } else {
        console.error("❌ Error en downloadContract:", result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("❌ Error al descargar contrato:", error);
      alert(`❌ Error al descargar contrato: ${error.message}`);
    } finally {
      setDownloadingContract(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Cargando Confirmaciones
          </h2>
          <p className="text-gray-400 text-sm">Obteniendo datos de pagos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full mx-auto mb-6"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Confirmaciones de Pagos
              </h1>
              <p className="text-gray-400">
                Historial de todos los pagos realizados en tiempo real
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={updateOldTransactions}
                disabled={updatingTransactions}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  updatingTransactions
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700"
                } text-white`}
              >
                <FaSync
                  className={`w-4 h-4 ${
                    updatingTransactions ? "animate-spin" : ""
                  }`}
                />
                <span>
                  {updatingTransactions
                    ? "Actualizando..."
                    : "Actualizar Transacciones Antiguas"}
                </span>
              </button>
              <button
                onClick={refreshPagos}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                <FaSync
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>{loading ? "Actualizando..." : "Actualizar"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Filtrar por tipo de pago
                </h3>
                <p className="text-sm text-gray-600">
                  Mostrar pagos específicos según el método de pago
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Todos ({pagos.length})
                </button>
                <button
                  onClick={() => setFilterType("virtual")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === "virtual"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  💳 Virtual (
                  {pagos.filter((p) => getPaymentType(p) === "virtual").length})
                </button>
                <button
                  onClick={() => setFilterType("cash")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === "cash"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  💰 Efectivo (
                  {pagos.filter((p) => getPaymentType(p) === "cash").length})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Pagos Aprobados</p>
                <p className="text-2xl font-bold">
                  {filteredPagos.filter((p) => p.status === "approved").length}
                </p>
              </div>
              <FaCheckCircle className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pagos Pendientes</p>
                <p className="text-2xl font-bold">
                  {filteredPagos.filter((p) => p.status === "pending").length}
                </p>
              </div>
              <FaClock className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Pagos Rechazados</p>
                <p className="text-2xl font-bold">
                  {filteredPagos.filter((p) => p.status === "rejected").length}
                </p>
              </div>
              <FaTimes className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Pagos</p>
                <p className="text-2xl font-bold">{filteredPagos.length}</p>
              </div>
              <FaDollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Pagos List */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Pagos ({filteredPagos.length})
            </h2>
          </div>

          {filteredPagos.length === 0 ? (
            <div className="p-8 text-center">
              <FaDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pagos registrados
              </h3>
              <p className="text-gray-500">
                Los pagos aparecerán aquí automáticamente cuando se realicen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Pago
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaStore className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pago.restaurantName || "Restaurante"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {pago.restaurantId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {getPaymentTypeIcon(pago)}
                          </span>
                          <div>
                            <div
                              className={`text-sm font-medium ${getPaymentTypeColor(
                                pago
                              )}`}
                            >
                              {formatAmount(pago.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pago.paymentMethod ||
                                (getPaymentType(pago) === "virtual"
                                  ? "Mercado Pago"
                                  : "Efectivo")}{" "}
                              ({getPaymentPeriodicity(pago)})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            pago.status
                          )}`}
                        >
                          {getStatusIcon(pago.status)}
                          <span className="ml-1">
                            {getStatusText(pago.status)}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCalendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {formatDate(pago.date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.paymentId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {pago.status === "approved" ||
                        pago.status === "pagado" ? (
                          <div className="relative group">
                            <button
                              onClick={() => handleDownloadContract(pago)}
                              disabled={downloadingContract === pago.id}
                              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Descargar contrato de activación"
                            >
                              {downloadingContract === pago.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <FaDownload className="w-4 h-4" />
                              )}
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Descargar contrato
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            <FaDownload className="w-4 h-4 mx-auto" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
