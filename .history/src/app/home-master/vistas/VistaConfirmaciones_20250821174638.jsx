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
  FaFilter,
  FaChartLine,
  FaCreditCard,
  FaMoneyBillWave,
  FaEye,
  FaEyeSlash,
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    if (!status) return <FaClock className="w-4 h-4" />;

    switch (status.toLowerCase()) {
      case "approved":
      case "pagado":
	return <FaCheckCircle className="w-4 h-4" />;
      case "pending":
      case "pendiente":
	return <FaClock className="w-4 h-4" />;
      case "rejected":
      case "rechazado":
	return <FaTimes className="w-4 h-4" />;
      default:
	return <FaClock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Pendiente";

    switch (status.toLowerCase()) {
      case "approved":
      case "pagado":
	return "Aprobado";
      case "pending":
      case "pendiente":
	return "Pendiente";
      case "rejected":
      case "rechazado":
	return "Rechazado";
      default:
	return "Pendiente";
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
	return "bg-red-100 text-red-800 border-red-200";
      default:
	return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentType = (pago) => {
    if (
      pago.paymentMethod === "mercadopago" ||
      pago.paymentId?.includes("VIRTUAL")
    ) {
      return "virtual";
    }
    return "cash";
  };

  const getPaymentTypeIcon = (pago) => {
    return getPaymentType(pago) === "virtual" ? "💳" : "💰";
  };

  const getPaymentTypeColor = (pago) => {
    return getPaymentType(pago) === "virtual"
      ? "text-purple-600"
      : "text-green-600";
  };

  const getPaymentPeriodicity = (pago) => {
    if (pago.periodicidad) {
      return pago.periodicidad === "anual" ? "anual" : "mensual";
    }
    return "mensual";
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "$0";

    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) return "$0";

      return new Intl.NumberFormat("es-AR", {
	style: "currency",
	currency: "ARS",
      }).format(numericAmount);
    } catch (error) {
      console.error(
	"Error formateando monto:",
	error,
	"Monto original:",
	amount
      );
      return "$0";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    let dateObj;

    try {
      // Si es un Timestamp de Firestore
      if (date && typeof date === "object" && date.toDate) {
	dateObj = date.toDate();
      }
      // Si es una string
      else if (typeof date === "string") {
	dateObj = new Date(date);
      }
      // Si ya es un objeto Date
      else if (date instanceof Date) {
	dateObj = date;
      }
      // Si es un timestamp numérico
      else if (typeof date === "number") {
	dateObj = new Date(date);
      }
      // Fallback
      else {
	dateObj = new Date();
      }

      // Verificar que la fecha es válida
      if (isNaN(dateObj.getTime())) {
	return "Fecha inválida";
      }

      return dateObj.toLocaleDateString("es-AR", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formateando fecha:", error, "Fecha original:", date);
      return "Error de fecha";
    }
  };

  const refreshPagos = () => {
    window.location.reload();
  };

  const updateOldTransactions = async () => {
    try {
      setUpdatingTransactions(true);
      const response = await fetch("/api/debug-update-transactions-dni", {
	method: "POST",
      });
      const result = await response.json();

      if (result.success) {
	alert(`✅ ${result.message}`);
	refreshPagos();
      } else {
	alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating transactions:", error);
      alert("❌ Error al actualizar transacciones");
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

  // Filtrar pagos
  const filteredPagos = pagos.filter((pago) => {
    const matchesFilter =
      filterType === "all" ||
      (filterType === "virtual" && getPaymentType(pago) === "virtual") ||
      (filterType === "cash" && getPaymentType(pago) === "cash");

    const matchesSearch =
      !searchTerm ||
      pago.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.restaurantId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.paymentId?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
	<div className="text-center max-w-sm">
	  <div className="relative">
	    <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
	    <div
	      className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-500 rounded-full animate-spin mx-auto"
	      style={{ animationDelay: "0.5s" }}
	    ></div>
	  </div>
	  <h2 className="text-white text-xl font-semibold mb-2 animate-pulse">
	    Cargando Confirmaciones
	  </h2>
	  <p className="text-purple-300 text-sm">
	    Obteniendo datos de pagos...
	  </p>
	</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
	<div className="text-center max-w-sm">
	  <div className="w-20 h-20 border-4 border-red-500/30 border-t-red-500 rounded-full mx-auto mb-6 animate-pulse"></div>
	  <h2 className="text-white text-xl font-semibold mb-2">Error</h2>
	  <p className="text-red-400 text-sm">{error}</p>
	</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
	{/* Header con Glassmorphism */}
	<div className="mb-8">
	  <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
	    <div className="flex items-center justify-between">
	      <div>
		<h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
		  Confirmaciones de Pagos
		</h1>
		<p className="text-purple-200 text-lg">
		  Historial de todos los pagos realizados en tiempo real
		</p>
	      </div>
	      <div className="flex space-x-3">
		<button
		  onClick={updateOldTransactions}
		  disabled={updatingTransactions}
		  className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 ${
		    updatingTransactions
		      ? "bg-gray-600/50 cursor-not-allowed"
		      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl"
		  } text-white font-medium`}
		>
		  <FaSync
		    className={`w-4 h-4 ${
		      updatingTransactions ? "animate-spin" : ""
		    }`}
		  />
		  <span>
		    {updatingTransactions
		      ? "Actualizando..."
		      : "Actualizar Transacciones"}
		  </span>
		</button>

		  <FaSync
		    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
		  />
		  
	      </div>
	    </div>
	  </div>
	</div>

	{/* Barra de búsqueda y filtros */}
	<div className="mb-6">
	  <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
	    <div className="flex items-center justify-between mb-4">
	      <div className="flex-1 max-w-md">
		<div className="relative">
		  <input
		    type="text"
		    placeholder="Buscar por restaurante, ID o payment ID..."
		    value={searchTerm}
		    onChange={(e) => setSearchTerm(e.target.value)}
		    className="w-full px-4 py-3 pl-10 bg-white/20 border border-white/30 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
		  />
		  <FaEye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />
		</div>
	      </div>
	      <button
		onClick={() => setShowFilters(!showFilters)}
		className="ml-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
	      >
		<FaFilter className="w-4 h-4" />
	      </button>
	    </div>

	    {/* Filtros expandibles */}
	    {showFilters && (
	      <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
		<h3 className="text-lg font-semibold text-white mb-3 flex items-center">
		  <FaFilter className="w-4 h-4 mr-2" />
		  Filtrar por tipo de pago
		</h3>
		<div className="flex flex-wrap gap-3">
		  <button
		    onClick={() => setFilterType("all")}
		    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
		      filterType === "all"
			? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
			: "bg-white/20 text-purple-200 hover:bg-white/30 border border-white/30"
		    }`}
		  >
		    Todos ({pagos.length})
		  </button>
		  <button
		    onClick={() => setFilterType("virtual")}
		    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
		      filterType === "virtual"
			? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
			: "bg-white/20 text-purple-200 hover:bg-white/30 border border-white/30"
		    }`}
		  >
		    <FaCreditCard className="w-4 h-4" />
		    <span>
		      Virtual (
		      {
			pagos.filter((p) => getPaymentType(p) === "virtual")
			  .length
		      }
		      )
		    </span>
		  </button>
		  <button
		    onClick={() => setFilterType("cash")}
		    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
		      filterType === "cash"
			? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
			: "bg-white/20 text-purple-200 hover:bg-white/30 border border-white/30"
		    }`}
		  >
		    <FaMoneyBillWave className="w-4 h-4" />
		    <span>
		      Efectivo (
		      {pagos.filter((p) => getPaymentType(p) === "cash").length}
		      )
		    </span>
		  </button>
		</div>
	      </div>
	    )}
	  </div>
	</div>

	{/* Stats Cards con Glassmorphism */}
	<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
	  <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
	    <div className="flex items-center justify-between">
	      <div>
		<p className="text-green-200 text-sm font-medium">
		  Pagos Aprobados
		</p>
		<p className="text-3xl font-bold text-white">
		  {filteredPagos.filter((p) => p.status === "approved").length}
		</p>
	      </div>
	      <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
		<FaCheckCircle className="w-6 h-6 text-green-300" />
	      </div>
	    </div>
	  </div>

	  <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
	    <div className="flex items-center justify-between">
	      <div>
		<p className="text-yellow-200 text-sm font-medium">
		  Pagos Pendientes
		</p>
		<p className="text-3xl font-bold text-white">
		  {filteredPagos.filter((p) => p.status === "pending").length}
		</p>
	      </div>
	      <div className="w-12 h-12 bg-yellow-500/30 rounded-xl flex items-center justify-center">
		<FaClock className="w-6 h-6 text-yellow-300" />
	      </div>
	    </div>
	  </div>

	  <div className="backdrop-blur-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-red-500/30 shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
	    <div className="flex items-center justify-between">
	      <div>
		<p className="text-red-200 text-sm font-medium">
		  Pagos Rechazados
		</p>
		<p className="text-3xl font-bold text-white">
		  {filteredPagos.filter((p) => p.status === "rejected").length}
		</p>
	      </div>
	      <div className="w-12 h-12 bg-red-500/30 rounded-xl flex items-center justify-center">
		<FaTimes className="w-6 h-6 text-red-300" />
	      </div>
	    </div>
	  </div>

	  <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
	    <div className="flex items-center justify-between">
	      <div>
		<p className="text-blue-200 text-sm font-medium">Total Pagos</p>
		<p className="text-3xl font-bold text-white">
		  {filteredPagos.length}
		</p>
	      </div>
	      <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
		<FaDollarSign className="w-6 h-6 text-blue-300" />
	      </div>
	    </div>
	  </div>
	</div>

	{/* Tabla de Pagos con Glassmorphism */}
	<div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
	  <div className="px-6 py-4 bg-white/10 border-b border-white/20">
	    <h2 className="text-xl font-semibold text-white flex items-center">
	      <FaChartLine className="w-5 h-5 mr-2" />
	      Historial de Pagos ({filteredPagos.length})
	    </h2>
	  </div>

	  {filteredPagos.length === 0 ? (
	    <div className="p-12 text-center">
	      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
		<FaDollarSign className="w-12 h-12 text-purple-300" />
	      </div>
	      <h3 className="text-xl font-medium text-white mb-2">
		No hay pagos registrados
	      </h3>
	      <p className="text-purple-200">
		Los pagos aparecerán aquí automáticamente cuando se realicen.
	      </p>
	    </div>
	  ) : (
	    <div className="overflow-x-auto">
	      <table className="min-w-full divide-y divide-white/20">
		<thead className="bg-white/10">
		  <tr>
		    <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
		      Restaurante
		    </th>
		    <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
		      Monto
		    </th>
		    <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
		      Estado
		    </th>
		    <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
		      Fecha
		    </th>
		    <th className="px-6 py-4 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
		      ID Pago
		    </th>
		    <th className="px-6 py-4 text-center text-xs font-medium text-purple-200 uppercase tracking-wider">
		      Contrato
		    </th>
		  </tr>
		</thead>
		<tbody className="divide-y divide-white/20">
		  {filteredPagos.map((pago, index) => (
		    <tr
		      key={pago.id}
		      className="hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]"
		      style={{ animationDelay: `${index * 50}ms` }}
		    >
		      <td className="px-6 py-4 whitespace-nowrap">
			<div className="flex items-center">
			  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
			    <FaStore className="w-5 h-5 text-white" />
			  </div>
			  <div>
			    <div className="text-sm font-medium text-white">
			      {pago.restaurantName ||
				pago.restaurantId ||
				"Restaurante"}
			    </div>
			    <div className="text-sm text-purple-200">
			      ID: {pago.restaurantId || "N/A"}
			    </div>
			  </div>
			</div>
		      </td>
		      <td className="px-6 py-4 whitespace-nowrap">
			<div className="flex items-center">
			  <span className="text-2xl mr-3">
			    {getPaymentTypeIcon(pago)}
			  </span>
			  <div>
			    <div
			      className={`text-lg font-bold ${getPaymentTypeColor(
				pago
			      )}`}
			    >
			      {formatAmount(pago.amount)}
			    </div>
			    <div className="text-sm text-purple-200">
			      {pago.paymentMethod ||
				(getPaymentType(pago) === "virtual"
				  ? "Mercado Pago"
				  : "Efectivo") ||
				"N/A"}{" "}
			      ({getPaymentPeriodicity(pago)})
			    </div>
			  </div>
			</div>
		      </td>
		      <td className="px-6 py-4 whitespace-nowrap">
			<span
			  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${
			    pago.status === "approved" ||
			    pago.status === "pagado"
			      ? "bg-green-500/20 text-green-300 border-green-500/30"
			      : pago.status === "pending" ||
				pago.status === "pendiente"
			      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
			      : "bg-red-500/20 text-red-300 border-red-500/30"
			  }`}
			>
			  {getStatusIcon(pago.status)}
			  <span className="ml-2">
			    {getStatusText(pago.status)}
			  </span>
			</span>
		      </td>
		      <td className="px-6 py-4 whitespace-nowrap">
			<div className="flex items-center">
			  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
			    <FaCalendar className="w-4 h-4 text-white" />
			  </div>
			  <div className="text-sm text-white">
			    {formatDate(pago.date)}
			  </div>
			</div>
		      </td>
		      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200 font-mono">
			{pago.paymentId || "N/A"}
		      </td>
		      <td className="px-6 py-4 whitespace-nowrap text-center">
			{pago.status === "approved" ||
			pago.status === "pagado" ? (
			  <div className="relative group">
			    <button
			      onClick={() => handleDownloadContract(pago)}
			      disabled={downloadingContract === pago.id}
			      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
			      title="Descargar contrato de activación"
			    >
			      {downloadingContract === pago.id ? (
				<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
			      ) : (
				<FaDownload className="w-5 h-5 text-white" />
			      )}
			    </button>
			    {/* Tooltip mejorado */}
			    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 text-sm text-white bg-gray-900/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg">
			      Descargar contrato
			      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90"></div>
			    </div>
			  </div>
			) : (
			  <div className="w-12 h-12 bg-gray-500/30 rounded-xl flex items-center justify-center">
			    <FaDownload className="w-5 h-5 text-gray-400" />
			  </div>
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
