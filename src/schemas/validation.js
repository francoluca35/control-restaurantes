import { z } from "zod";

// Esquemas base
export const emailSchema = z
  .string()
  .min(1, "El email es requerido")
  .email("El formato del email no es válido")
  .max(255, "El email es demasiado largo");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña es demasiado larga")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
  );

export const phoneSchema = z
  .string()
  .min(1, "El teléfono es requerido")
  .regex(/^\+?[1-9]\d{1,14}$/, "El formato del teléfono no es válido");

export const nameSchema = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre es demasiado largo")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    "El nombre solo puede contener letras y espacios"
  );

// Esquemas para autenticación
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z
  .object({
    nombreCompleto: nameSchema,
    usuario: z
      .string()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(50, "El usuario es demasiado largo")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "El usuario solo puede contener letras, números y guiones bajos"
      ),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    codActivacion: z.string().min(1, "El código de activación es requerido"),
    rol: z.enum(["admin", "usuario", "superadmin"], {
      errorMap: () => ({ message: "El rol seleccionado no es válido" }),
    }),
    foto: z.instanceof(File, { message: "La foto es requerida" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Esquemas para restaurantes
export const restaurantSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre del restaurante debe tener al menos 2 caracteres")
    .max(100, "El nombre del restaurante es demasiado largo"),
  email: emailSchema,
  direccion: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección es demasiado larga"),
  telefono: phoneSchema,
  codigoActivacion: z
    .string()
    .min(6, "El código de activación debe tener al menos 6 caracteres")
    .max(20, "El código de activación es demasiado largo"),
  cantidadUsuarios: z
    .number()
    .min(1, "Debe permitir al menos 1 usuario")
    .max(100, "No puede permitir más de 100 usuarios"),
  conFinanzas: z.boolean().default(false),
  password: z
    .string()
    .min(4, "La contraseña debe tener al menos 4 caracteres")
    .max(50, "La contraseña es demasiado larga"),
  logo: z.string().optional(),
  tipoServicio: z.string().min(1, "Debe seleccionar un tipo de servicio"),
  formaPago: z.string().min(1, "Debe seleccionar una forma de pago"),
  periodicidad: z.string().min(1, "Debe seleccionar una periodicidad"),
});

export const restaurantUpdateSchema = restaurantSchema.partial();

// Esquemas para productos
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del producto es requerido")
    .max(100, "El nombre del producto es demasiado largo"),
  price: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999, "El precio es demasiado alto"),
  discount: z
    .number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor al 100%")
    .default(0),
  description: z
    .string()
    .max(500, "La descripción es demasiado larga")
    .optional(),
  mainCategoryId: z.string().min(1, "La categoría principal es requerida"),
  subCategoryId: z.string().min(1, "La subcategoría es requerida"),
});

export const productUpdateSchema = productSchema.partial();

// Esquemas para categorías
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la categoría es requerido")
    .max(50, "El nombre de la categoría es demasiado largo")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras y espacios"
    ),
});

export const subCategorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la subcategoría es requerido")
    .max(50, "El nombre de la subcategoría es demasiado largo")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras y espacios"
    ),
  mainCategoryId: z.string().min(1, "La categoría principal es requerida"),
});

// Esquemas para mesas
export const tableSchema = z.object({
  numero: z
    .number()
    .min(1, "El número de mesa debe ser mayor a 0")
    .max(999, "El número de mesa es demasiado alto"),
  capacidad: z
    .number()
    .min(1, "La capacidad debe ser mayor a 0")
    .max(20, "La capacidad no puede ser mayor a 20")
    .default(4),
  estado: z
    .enum(["libre", "ocupado", "reservado"], {
      errorMap: () => ({ message: "El estado seleccionado no es válido" }),
    })
    .default("libre"),
  ubicacion: z.string().max(100, "La ubicación es demasiado larga").optional(),
});

export const tableUpdateSchema = tableSchema.partial();

// Esquemas para pedidos
export const orderItemSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  quantity: z
    .number()
    .min(1, "La cantidad debe ser mayor a 0")
    .max(99, "La cantidad no puede ser mayor a 99"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  discount: z
    .number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor al 100%")
    .default(0),
});

export const orderSchema = z.object({
  tableId: z.string().min(1, "La mesa es requerida"),
  items: z.array(orderItemSchema).min(1, "Debe agregar al menos un producto"),
  clientData: z
    .object({
      name: nameSchema.optional(),
      email: emailSchema.optional(),
      phone: phoneSchema.optional(),
    })
    .optional(),
  total: z.number().min(0, "El total no puede ser negativo"),
  status: z
    .enum(["pendiente", "preparando", "listo", "entregado", "cancelado"], {
      errorMap: () => ({ message: "El estado seleccionado no es válido" }),
    })
    .default("pendiente"),
  paymentMethod: z
    .enum(["efectivo", "tarjeta", "mercadopago"], {
      errorMap: () => ({
        message: "El método de pago seleccionado no es válido",
      }),
    })
    .optional(),
  notes: z.string().max(500, "Las notas son demasiado largas").optional(),
});

// Esquemas para pagos
export const paymentSchema = z.object({
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  method: z.enum(["efectivo", "tarjeta", "mercadopago", "transferencia"], {
    errorMap: () => ({
      message: "El método de pago seleccionado no es válido",
    }),
  }),
  reference: z.string().max(100, "La referencia es demasiado larga").optional(),
  description: z
    .string()
    .max(200, "La descripción es demasiado larga")
    .optional(),
  category: z.enum(["ingreso", "egreso"], {
    errorMap: () => ({ message: "La categoría seleccionada no es válida" }),
  }),
});

// Esquemas para inventario
export const inventoryItemSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  quantity: z.number().min(0, "La cantidad no puede ser negativa"),
  minStock: z
    .number()
    .min(0, "El stock mínimo no puede ser negativo")
    .default(0),
  maxStock: z
    .number()
    .min(0, "El stock máximo no puede ser negativo")
    .optional(),
  unit: z.string().max(20, "La unidad es demasiado larga").default("unidad"),
});

export const inventoryMovementSchema = z.object({
  itemId: z.string().min(1, "El item es requerido"),
  type: z.enum(["entrada", "salida", "ajuste"], {
    errorMap: () => ({
      message: "El tipo de movimiento seleccionado no es válido",
    }),
  }),
  quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
  reason: z
    .string()
    .min(1, "La razón es requerida")
    .max(200, "La razón es demasiado larga"),
  date: z.date().default(() => new Date()),
  notes: z.string().max(500, "Las notas son demasiado largas").optional(),
});

// Esquemas para configuración
export const userSettingsSchema = z.object({
  language: z
    .enum(["es", "en"], {
      errorMap: () => ({ message: "El idioma seleccionado no es válido" }),
    })
    .default("es"),
  currency: z
    .enum(["ARS", "USD", "EUR"], {
      errorMap: () => ({ message: "La moneda seleccionada no es válida" }),
    })
    .default("ARS"),
  timezone: z.string().default("America/Argentina/Buenos_Aires"),
  dateFormat: z
    .enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], {
      errorMap: () => ({
        message: "El formato de fecha seleccionado no es válido",
      }),
    })
    .default("DD/MM/YYYY"),
  timeFormat: z
    .enum(["12h", "24h"], {
      errorMap: () => ({
        message: "El formato de hora seleccionado no es válido",
      }),
    })
    .default("24h"),
  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    })
    .default({}),
  security: z
    .object({
      twoFactorAuth: z.boolean().default(false),
      sessionTimeout: z
        .number()
        .min(5, "El tiempo de sesión debe ser al menos 5 minutos")
        .max(1440, "El tiempo de sesión no puede ser mayor a 24 horas")
        .default(30),
      passwordPolicy: z
        .enum(["weak", "medium", "strong"], {
          errorMap: () => ({
            message: "La política de contraseña seleccionada no es válida",
          }),
        })
        .default("strong"),
    })
    .default({}),
});

// Esquemas para búsqueda y filtros
export const searchSchema = z.object({
  query: z.string().max(100, "La búsqueda es demasiado larga").optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  minPrice: z
    .number()
    .min(0, "El precio mínimo no puede ser negativo")
    .optional(),
  maxPrice: z
    .number()
    .min(0, "El precio máximo no puede ser negativo")
    .optional(),
  status: z
    .enum(["active", "inactive", "all"], {
      errorMap: () => ({ message: "El estado seleccionado no es válido" }),
    })
    .default("all"),
  sortBy: z
    .enum(["name", "price", "date", "popularity"], {
      errorMap: () => ({
        message: "El criterio de ordenamiento seleccionado no es válido",
      }),
    })
    .default("name"),
  sortOrder: z
    .enum(["asc", "desc"], {
      errorMap: () => ({ message: "El orden seleccionado no es válido" }),
    })
    .default("asc"),
  page: z.number().min(1, "La página debe ser mayor a 0").default(1),
  limit: z
    .number()
    .min(1, "El límite debe ser mayor a 0")
    .max(100, "El límite no puede ser mayor a 100")
    .default(20),
});

// Función helper para validar formularios
export const validateForm = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { isValid: true, data: validatedData, errors: {} };
  } catch (error) {
    const fieldErrors = {};
    error.errors.forEach((err) => {
      const field = err.path.join(".");
      fieldErrors[field] = err.message;
    });

    return { isValid: false, data: null, errors: fieldErrors };
  }
};

// Función helper para validar campos individuales
export const validateField = (schema, fieldName, value) => {
  try {
    schema.parse({ [fieldName]: value });
    return { isValid: true, error: null };
  } catch (error) {
    const fieldError = error.errors.find((err) => err.path[0] === fieldName);
    return {
      isValid: false,
      error: fieldError ? fieldError.message : "Campo inválido",
    };
  }
};

// Exportar todos los esquemas
export const schemas = {
  // Autenticación
  login: loginSchema,
  register: registerSchema,

  // Restaurantes
  restaurant: restaurantSchema,
  restaurantUpdate: restaurantUpdateSchema,

  // Productos
  product: productSchema,
  productUpdate: productUpdateSchema,

  // Categorías
  category: categorySchema,
  subCategory: subCategorySchema,

  // Mesas
  table: tableSchema,
  tableUpdate: tableUpdateSchema,

  // Pedidos
  order: orderSchema,
  orderItem: orderItemSchema,

  // Pagos
  payment: paymentSchema,

  // Inventario
  inventoryItem: inventoryItemSchema,
  inventoryMovement: inventoryMovementSchema,

  // Configuración
  userSettings: userSettingsSchema,

  // Búsqueda
  search: searchSchema,
};
