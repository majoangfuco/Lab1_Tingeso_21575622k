# language: es
Característica: EditClientModal - Modal de Edición de Clientes
  Como administrador del sistema ToolRent
  Necesito editar la información de clientes existentes
  Para mantener los datos actualizados y precisos en el sistema

  # ============================================================================
  # Visibilidad y Renderización del Modal
  # ============================================================================
  Escenario: E1 Modal no se renderiza cuando isOpen es falso
    Dado que el componente EditClientModal tiene isOpen={false}
    Cuando se renderiza el componente
    Entonces el modal no debe estar visible en el DOM
    Y no debe haber elemento con clase "modal-overlay"

  Escenario: E2 Modal se muestra cuando isOpen es verdadero
    Dado que el componente EditClientModal tiene isOpen={true}
    Cuando se renderiza el componente
    Entonces debe aparecer el modal con clase "modal-overlay"
    Y debe mostrarse el título "Editar Cliente"

  # ============================================================================
  # Precarga de Datos del Cliente
  # ============================================================================
  Escenario: E3 Formulario se precarga con datos del cliente
    Dado que clientData contiene { rut: "12345678-9", clientName: "Juan Pérez", mail: "juan@example.com", phone: "912345678" }
    Cuando el modal se abre con isOpen={true}
    Entonces el campo "Nombre" debe mostrar el valor "Juan Pérez"
    Y el campo "Email" debe mostrar el valor "juan@example.com"
    Y el campo "Teléfono" debe mostrar el valor "912345678"

  Escenario: E4 Formulario se actualiza cuando clientData cambia
    Dado que el modal está abierto mostrando datos: { clientName: "María García" }
    Cuando la prop clientData cambia a { clientName: "María García Actualizado" }
    Entonces el campo "Nombre" debe actualizar automáticamente a "María García Actualizado"
    Y el cambio debe sincronizarse sin necesidad de recargar

  Escenario: E5 Modal maneja clientData nulo correctamente
    Dado que clientData es null
    Cuando el modal se abre con isOpen={true}
    Entonces los campos de texto deben estar vacíos
    Y el formulario debe ser funcional

  # ============================================================================
  # Edición de Campos del Formulario
  # ============================================================================
  Escenario: E6 Usuario puede editar el campo "Nombre"
    Dado que el modal está abierto con un cliente precargado
    Cuando el usuario hace clic en el campo "Nombre"
    Y borra el contenido actual y escribe "Carlos López"
    Entonces el campo debe actualizar a "Carlos López"
    Y el valor en formData local debe cambiar

  Escenario: E7 Usuario puede editar el campo "Email"
    Dado que el modal está abierto con clientData que contiene mail: "viejo@example.com"
    Cuando el usuario modifica el email a "nuevo@example.com"
    Entonces el campo "Email" debe mostrar "nuevo@example.com"
    Y el cambio debe reflejarse en el estado local

  Escenario: E8 Usuario puede editar el campo "Teléfono" (campo opcional)
    Dado que el modal está abierto
    Cuando el usuario hace clic en el campo "Teléfono"
    Y escribe el número "987654321"
    Entonces el campo debe mostrar "987654321"
    Y el campo debe permitir dejar en blanco sin error

  # ============================================================================
  # Validaciones de Campos
  # ============================================================================
  Escenario: E9 Campo "Nombre" es obligatorio
    Dado que el modal está abierto con un nombre cargado
    Cuando el usuario borra el contenido del campo "Nombre"
    Y intenta hacer submit del formulario
    Entonces el navegador debe mostrar validación "Este campo es obligatorio"
    Y el formulario debe bloquear el envío

  Escenario: E10 Campo "Email" es obligatorio
    Dado que el modal está abierto
    Cuando el usuario borra el contenido del campo "Email"
    Y intenta hacer submit del formulario
    Entonces el navegador debe mostrar validación "Este campo es obligatorio"
    Y el formulario no debe enviarse

  Escenario: E11 Campo "Teléfono" es opcional
    Dado que el modal está abierto
    Cuando el usuario deja en blanco el campo "Teléfono"
    Y hace clic en "Guardar"
    Entonces el formulario debe enviarse sin error
    Y el valor de phone puede ser vacío en onSave

  # ============================================================================
  # Acciones de Botones
  # ============================================================================
  Escenario: E12 Botón "Cancelar" cierra el modal
    Dado que el modal está abierto
    Y el usuario ha realizado cambios en los campos
    Cuando hace clic en el botón "Cancelar"
    Entonces debe ejecutarse la función onClose
    Y el modal debe cerrarse sin guardar los cambios

  Escenario: E13 Botón "Guardar" envía datos del cliente actualizado
    Dado que el modal está abierto con datos iniciales
    Cuando el usuario modifica el nombre a "Pedro González"
    Y hace clic en el botón "Guardar"
    Entonces debe ejecutarse onSave({ ...clientData, clientName: "Pedro González" })
    Y el objeto enviado debe contener todos los campos del formulario

  Escenario: E14 Botón "Guardar" previene recarga de página
    Dado que el modal está abierto
    Cuando el usuario hace clic en "Guardar"
    Entonces el evento submit debe llamar preventDefault()
    Y la página no debe recargar

  # ============================================================================
  # Integridad de Datos
  # ============================================================================
  Escenario: E15 Cambios en un campo no afectan otros campos
    Dado que el modal está abierto con { clientName: "Ana", mail: "ana@example.com", phone: "555" }
    Cuando el usuario modifica solo el nombre a "Anita"
    Entonces el objeto formData debe ser { clientName: "Anita", mail: "ana@example.com", phone: "555" }
    Y el spread operator (...formData) debe preservar los otros campos

  Escenario: E16 Múltiples cambios en una sesión se acumulan correctamente
    Dado que el modal está abierto
    Cuando el usuario modifica nombre a "Juan"
    Y luego modifica email a "juan@nuevo.com"
    Y luego modifica teléfono a "654123789"
    Entonces el formData debe contener los tres cambios
    Y onSave debe recibir todos los cambios acumulados

  # ============================================================================
  # PropTypes y Validación de Props
  # ============================================================================
  Escenario: E17 Componente rechaza prop isOpen no booleana
    Dado que se intenta renderizar EditClientModal con isOpen="true"
    Entonces la consola debe mostrar advertencia de PropTypes
    Y el componente debe fallar en validación de tipos

  Escenario: E18 Componente requiere función onClose
    Dado que se intenta renderizar sin prop onClose
    Entonces la consola debe mostrar advertencia "onClose is required"
    Y el componente debe no funcionar correctamente

  Escenario: E19 Componente requiere función onSave
    Dado que se intenta renderizar sin prop onSave
    Entonces la consola debe mostrar advertencia "onSave is required"
    Y el botón "Guardar" no debe funcionar

  Escenario: E20 clientData con shape incorrecto genera advertencia
    Dado que clientData es { id: 1, nombre: "Test" } (nombre de campo incorrecto)
    Cuando se renderiza el componente
    Entonces la consola puede mostrar advertencia de PropTypes
    Y el componente debe intentar usar los datos disponibles
