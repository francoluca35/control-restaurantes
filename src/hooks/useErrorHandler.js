"use client";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

// Categorías de errores
export const ERROR_CATEGORIES = {
  NETWORK: "network",
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  DATABASE: "database",
  UNKNOWN: "unknown",
};

// Mensajes de error personalizados
const ERROR_MESSAGES = {
  [ERROR_CATEGORIES.NETWORK]: {
    default: "Error de conexión. Verifica tu internet e intenta nuevamente.",
    timeout: "La operación tardó demasiado. Intenta nuevamente.",
    offline: "No hay conexión a internet. Verifica tu conexión.",
  },
  [ERROR_CATEGORIES.VALIDATION]: {
    default: "Los datos ingresados no son válidos.",
    required: "Este campo es obligatorio.",
    email: "El formato del email no es válido.",
    minLength: "Debe tener al menos {min} caracteres.",
    maxLength: "Debe tener máximo {max} caracteres.",
  },
  [ERROR_CATEGORIES.AUTHENTICATION]: {
    default: "Error de autenticación.",
    invalidCredentials: "Credenciales incorrectas.",
    sessionExpired: "Tu sesión ha expirado. Inicia sesión nuevamente.",
  },
  [ERROR_CATEGORIES.AUTHORIZATION]: {
    default: "No tienes permisos para realizar esta acción.",
    insufficientPermissions: "Permisos insuficientes.",
  },
  [ERROR_CATEGORIES.DATABASE]: {
    default: "Error en la base de datos.",
    notFound: "El recurso no fue encontrado.",
    alreadyExists: "El recurso ya existe.",
    constraintViolation: "Violación de restricción de datos.",
  },
  [ERROR_CATEGORIES.UNKNOWN]: {
    default: "Ha ocurrido un error inesperado. Intenta nuevamente.",
  },
};

// Función para categorizar errores
const categorizeError = (error) => {
  if (
    error.code === "auth/user-not-found" ||
    error.code === "auth/wrong-password"
  ) {
    return ERROR_CATEGORIES.AUTHENTICATION;
  }
  if (error.code === "auth/insufficient-permission") {
    return ERROR_CATEGORIES.AUTHORIZATION;
  }
  if (error.code === "firestore/not-found") {
    return ERROR_CATEGORIES.DATABASE;
  }
  if (error.code === "firestore/already-exists") {
    return ERROR_CATEGORIES.DATABASE;
  }
  if (error.name === "ValidationError") {
    return ERROR_CATEGORIES.VALIDATION;
  }
  if (error.message?.includes("network") || error.message?.includes("fetch")) {
    return ERROR_CATEGORIES.NETWORK;
  }
  return ERROR_CATEGORIES.UNKNOWN;
};

// Función para obtener mensaje de error
const getErrorMessage = (error, context = "") => {
  const category = categorizeError(error);
  const messages = ERROR_MESSAGES[category];

  // Si hay un mensaje específico para el contexto
  if (context && messages[context]) {
    return messages[context];
  }

  // Si el error tiene un mensaje personalizado
  if (error.userMessage) {
    return error.userMessage;
  }

  // Mensaje por defecto de la categoría
  return messages.default || ERROR_MESSAGES[ERROR_CATEGORIES.UNKNOWN].default;
};

// Función para loggear errores
const logError = (error, context, category) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    category,
    message: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name,
  };

  // En desarrollo, mostrar en consola
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error in ${context}`);
    console.error("Error details:", errorLog);
    console.error("Original error:", error);
    console.groupEnd();
  }

  // En producción, enviar a servicio de logging
  // TODO: Implementar servicio de logging (Sentry, LogRocket, etc.)
};

export const useErrorHandler = () => {
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleError = useCallback(
    (error, context = "general", options = {}) => {
      const category = categorizeError(error);
      const message = getErrorMessage(error, context);

      // Loggear el error
      logError(error, context, category);

      // Actualizar estado de errores
      setErrors((prev) => ({
        ...prev,
        [context]: {
          message,
          category,
          timestamp: Date.now(),
        },
      }));

      // Mostrar notificación al usuario
      if (options.showToast !== false) {
        const toastOptions = {
          duration: options.duration || 5000,
          position: options.position || "top-right",
        };

        if (category === ERROR_CATEGORIES.AUTHENTICATION) {
          toast.error(message, toastOptions);
        } else if (category === ERROR_CATEGORIES.VALIDATION) {
          toast.error(message, toastOptions);
        } else {
          toast.error(message, toastOptions);
        }
      }

      // Callback personalizado
      if (options.onError) {
        options.onError(error, category, message);
      }

      return { category, message };
    },
    []
  );

  const clearError = useCallback((context) => {
    if (context) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[context];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback(
    (context) => {
      return !!errors[context];
    },
    [errors]
  );

  const getError = useCallback(
    (context) => {
      return errors[context];
    },
    [errors]
  );

  const withErrorHandling = useCallback(
    (asyncFunction, context = "general", options = {}) => {
      return async (...args) => {
        try {
          setIsProcessing(true);
          clearError(context);
          const result = await asyncFunction(...args);
          return result;
        } catch (error) {
          handleError(error, context, options);
          throw error;
        } finally {
          setIsProcessing(false);
        }
      };
    },
    [handleError, clearError]
  );

  return {
    errors,
    isProcessing,
    handleError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
    withErrorHandling,
  };
};

// Hook para validación de formularios
export const useValidation = () => {
  const { handleError } = useErrorHandler();

  const validateField = useCallback((value, rules) => {
    const errors = [];

    if (rules.required && (!value || value.trim() === "")) {
      errors.push("Este campo es obligatorio");
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`Debe tener al menos ${rules.minLength} caracteres`);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`Debe tener máximo ${rules.maxLength} caracteres`);
    }

    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push("El formato del email no es válido");
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || "El formato no es válido");
    }

    return errors;
  }, []);

  const validateForm = useCallback(
    (data, schema) => {
      try {
        const validatedData = schema.parse(data);
        return { isValid: true, data: validatedData, errors: {} };
      } catch (error) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          const field = err.path.join(".");
          fieldErrors[field] = err.message;
        });

        handleError(error, "validation", { showToast: false });
        return { isValid: false, data: null, errors: fieldErrors };
      }
    },
    [handleError]
  );

  return {
    validateField,
    validateForm,
  };
};
