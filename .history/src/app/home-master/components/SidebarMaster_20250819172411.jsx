"use client";
import { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaPowerOff,
  FaStore,
  FaMoneyBill,
  FaHistory,
  FaToggleOn,
  FaChartLine,
  FaCog,
  FaBell,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.js";

const opciones = [
  {
    id: "inicio",
    label: "Dashboard",
    icon: FaHome,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "restaurantes",
    label: "Restaurantes",
    icon: FaStore,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "pagos",
    label: "Pagos",
    icon: FaMoneyBill,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "activacion",
    label: "Activación",
    icon: FaToggleOn,
    color: "from-purple-500 to-pink-500",
  },
];

export default function Sidebar({ onChangeVista }) {
  const [abierto, setAbierto] = useState(false); // Cambiado a false para móviles
  const [opcionActiva, setOpcionActiva] = useState("inicio");
  const { usuario } = useAuth();
  const [userImage, setUserImage] = useState("");
  const sidebarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // En móviles, el sidebar debe estar cerrado por defecto
      if (window.innerWidth < 768) {
        setAbierto(false);
      } else {
        setAbierto(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getUserImage = () => {
      if (usuario?.tipo === "superadmin") {
        const userImageFromStorage =
          localStorage.getItem("superadminImage") ||
          localStorage.getItem("imagen");
        if (userImageFromStorage) {
          setUserImage(userImageFromStorage);
        }
      }
    };

    getUserImage();
  }, [usuario]);

  // Effect para cerrar el sidebar al hacer clic fuera (solo en desktop)
  useEffect(() => {
    if (isMobile) return; // No aplicar en móviles

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setAbierto(false);
      }
    };

    if (abierto) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [abierto, isMobile]);

  // Cerrar sidebar en móviles al hacer clic en una opción
  const handleOptionClick = (id) => {
    setOpcionActiva(id);
    onChangeVista?.(id);
    if (isMobile) {
      setAbierto(false);
    }
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isMobile && abierto && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Botón de menú para móviles */}
      {isMobile && (
        <button
          onClick={() => setAbierto(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-gray-800 rounded-lg text-white shadow-lg lg:hidden"
        >
          <FaChartLine size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed lg:relative h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700/50 transition-all duration-300 ease-in-out shadow-2xl z-50
          ${isMobile 
            ? `${abierto ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'}`
            : `${abierto ? 'w-64' : 'w-20'}`
          }
          flex flex-col justify-between`}
        onMouseEnter={() => !isMobile && !abierto && setAbierto(true)}
      >
        {/* Botón de cerrar para móviles */}
        {isMobile && (
          <button
            onClick={() => setAbierto(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white lg:hidden"
          >
            <FaTimes size={20} />
          </button>
        )}

        {/* Header */}
        <div className="p-4 pt-16 lg:pt-4">
          {/* Logo/Brand */}
          <div
            className={`flex items-center ${
              abierto ? "justify-start" : "justify-center"
            } mb-8`}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaChartLine className="text-white text-lg" />
            </div>
            {abierto && (
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                <p className="text-gray-400 text-xs">Control Center</p>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div
            className={`flex items-center ${
              abierto ? "justify-start" : "justify-center"
            } mb-6`}
          >
            <div className="relative">
              {userImage ? (
                <img
                  src={userImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              {(!userImage || userImage === "") && (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-500/50 shadow-lg">
                  {usuario?.email?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            {abierto && (
              <div className="ml-3">
                <p className="text-white font-medium text-sm">Super Admin</p>
                <p className="text-gray-400 text-xs">{usuario?.email}</p>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {opciones.map(({ id, label, icon: Icon, color }) => {
              const activo = opcionActiva === id;

              return (
                <button
                  key={id}
                  onClick={() => handleOptionClick(id)}
                  className={`group relative w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                    activo
                      ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  } ${abierto ? "justify-start" : "justify-center"}`}
                >
                  <div className={`relative ${abierto ? "mr-3" : ""}`}>
                    <Icon
                      size={20}
                      className={`transition-all duration-200 ${
                        activo
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                    {activo && (
                      <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm"></div>
                    )}
                  </div>
                  {abierto && (
                    <span
                      className={`font-medium text-sm transition-all duration-200 ${
                        activo
                          ? "text-white"
                          : "text-gray-300 group-hover:text-white"
                      }`}
                    >
                      {label}
                    </span>
                  )}
                  {activo && abierto && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          {/* Quick Actions */}
          {abierto && (
            <div className="mb-4 space-y-2">
              <button className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                <FaBell size={16} className="mr-3" />
                <span className="text-sm">Notificaciones</span>
              </button>
              <button className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                <FaCog size={16} className="mr-3" />
                <span className="text-sm">Configuración</span>
              </button>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/home-master/login";
            }}
            className={`w-full flex items-center px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 ${
              abierto ? "justify-start" : "justify-center"
            }`}
          >
            <FaPowerOff size={18} className={`${abierto ? "mr-3" : ""}`} />
            {abierto && (
              <span className="font-medium text-sm">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
