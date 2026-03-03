// Tutorial content for all pages
export const tutorialContent = {
  home: {
    title: "Bienvenido a ToolRent",
    steps: [
      {
        title: "Perfil de Usuario",
        description: "Aquí puedes ver tu información de perfil, incluyendo tu nombre de usuario y rol dentro del sistema."
      },
      {
        title: "Sección Clientes",
        description: "Accede a la gestión completa de clientes. Registra nuevos clientes, visualiza su historial de rentales y actualiza su información de contacto."
      },
      {
        title: "Sección Inventario",
        description: "Controla tu inventario de herramientas. Consulta disponibilidad, condición y ubicación de cada artículo del stock."
      },
      {
        title: "Sección Kardex",
        description: "Revisa el histórico completo de transacciones. Sigue todas las rentales, devoluciones y movimientos de inventario."
      }
    ]
  },
  clientes: {
    title: "Gestión de Clientes",
    steps: [
      {
        title: "Buscar Clientes",
        description: "Utiliza la barra de búsqueda para encontrar clientes rápidamente por nombre, email o teléfono."
      },
      {
        title: "Crear Nuevo Cliente",
        description: "Haz clic en el botón 'Agregar Cliente' para registrar un nuevo cliente en el sistema con su información de contacto."
      },
      {
        title: "Ver Detalles",
        description: "Selecciona cualquier cliente para ver su información completa, incluyendo su historial de rentales."
      },
      {
        title: "Editar Cliente",
        description: "Actualiza la información de cualquier cliente haciendo clic en el botón de editar en los detalles del cliente."
      }
    ]
  },
  inventario: {
    title: "Gestión de Inventario",
    steps: [
      {
        title: "Ver Herramientas",
        description: "Visualiza todas las herramientas disponibles en el inventario con su estado actual y disponibilidad."
      },
      {
        title: "Buscar por Categoría",
        description: "Filtra las herramientas por categoría para encontrar exactamente lo que necesitas rápidamente."
      },
      {
        title: "Detalles de Herramientas",
        description: "Haz clic en cualquier herramienta para ver información detallada incluyendo descripción, precio y cantidad disponible."
      },
      {
        title: "Disponibilidad",
        description: "Verifica qué herramientas están disponibles para rentar en este momento."
      }
    ]
  },
  kardex: {
    title: "Kardex - Historial de Transacciones",
    steps: [
      {
        title: "Filtros de Búsqueda",
        description: "Utiliza los filtros para buscar transacciones por cliente, herramienta, fecha o estado."
      },
      {
        title: "Tabla de Historial",
        description: "Visualiza todo el historial de rentales y devoluciones en una tabla detallada."
      },
      {
        title: "Detalles de Transacción",
        description: "Haz clic en cualquier fila para ver los detalles completos de esa transacción."
      },
      {
        title: "Exportar Reporte",
        description: "Genera reportes en PDF o Excel para análisis y documentación de las transacciones."
      }
    ]
  },
  toolDetail: {
    title: "Detalles de Herramienta",
    steps: [
      {
        title: "Información General",
        description: "Visualiza detalles de la herramienta: nombre, categoría, precios de renta y repositorio. Haz clic en 'Editar' para modificar esta información."
      },
      {
        title: "Unidades Registradas",
        description: "Ve la lista de unidades físicas de esta herramienta con su estado (disponible, rentada u otra). Cada unidad tiene un código único para identificarla."
      },
      {
        title: "Filtrar Unidades",
        description: "Usa los filtros de estado para ver solo las unidades que te interesen (por ejemplo, solo las disponibles para rentar)."
      },
      {
        title: "Agregar Nuevas Unidades",
        description: "Haz clic en el botón para registrar nuevas unidades físicas de esta herramienta al sistema."
      }
    ]
  },
  clientDetail: {
    title: "Detalles del Cliente",
    steps: [
      {
        title: "Información Personal",
        description: "Visualiza los datos del cliente: RUT, nombre, teléfono, email. El estado indica si el cliente está activo o bloqueado. Haz clic en 'Editar Info' para cambiar sus datos."
      },
      {
        title: "Gestión de Deuda",
        description: "Si el cliente tiene una deuda pendiente, aquí puedes verla y registrar un pago ingresando el monto y haciendo clic en 'Pagar'."
      },
      {
        title: "Historial de Rentales",
        description: "Consulta todos los arriendos del cliente. Usa el filtro para ver solo los que están en curso, atrasados o ya devueltos."
      },
      {
        title: "Crear Nuevo Arriendo",
        description: "El botón '+ Nuevo Arriendo' permite registrar una nueva renta para este cliente. Solo funciona si el cliente está activo (no bloqueado)."
      }
    ]
  },
  rentalDetail: {
    title: "Detalles del Arriendo",
    steps: [
      {
        title: "Información General",
        description: "Se muestra la información del arriendo: cliente, fechas, costo total y estado actual (En Curso, Atrasado o Devuelto)."
      },
      {
        title: "Herramientas Arrendadas",
        description: "Visualiza la lista completa de herramientas incluidas en este arriendo con sus precios unitarios."
      },
      {
        title: "Realizar Devolución",
        description: "Si el arriendo aún está activo, puedes hacer clic en 'Devolver arriendo' para registrar la devolución de las herramientas."
      },
      {
        title: "Volver al Listado",
        description: "Usa el botón 'Volver' en la parte superior para regresar al listado anterior."
      }
    ]
  }
};
