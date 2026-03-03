# language: es
Característica: InventoryPage - Gestión de Inventario de Herramientas
  Como administrador del sistema
  Necesito gestionar el catálogo de herramientas disponibles para alquiler
  Con el fin de mantener actualizado el inventario y crear nuevos tipos de herramientas

  # ============================================================================
  # Visibilidad y Renderización de la Página
  # ============================================================================
  Escenario: E1-Inventory Renderización de la página de inventario con tabla vacía
    Dado que la base de datos no contiene herramientas registradas
    Cuando se carga la página de inventario
    Entonces se debe mostrar el título "Inventario"
    Y se debe mostrar un mensaje "No se han encontrado herramientas."
    Y se debe mostrar el botón "+ Nuevo Tipo" para crear categorías

  Escenario: E2-Inventory Renderización de la página con herramientas existentes
    Dado que el sistema contiene herramientas: Taladro ($100, $10), Sierra ($80, $8), Martillo ($60, $6)
    Cuando se carga la página de inventario
    Entonces se debe mostrar una tabla con columnas: Nombre, Categoría, Precio Repositorio, Precio Renta Diaria
    Y se deben listar todas las herramientas con sus precios formateados en moneda

  Escenario: E3-Inventory Indicador de carga mientras se obtienen datos del servidor
    Dado que el servicio tarda 2 segundos en responder con las herramientas
    Cuando se carga la página
    Entonces se debe mostrar "Cargando catálogo..." mientras se obtienen los datos
    Y una vez completado, se debe mostrar la tabla con las herramientas

  # ============================================================================
  # Búsqueda y Filtrado de Herramientas
  # ============================================================================
  Escenario: E4-Inventory Campo de búsqueda filtra herramientas en tiempo real
    Dado que se han cargado 10 herramientas en el catálogo
    Cuando el usuario ingresa "Taladro" en el campo de búsqueda
    Y espera 500ms (debounce)
    Entonces se debe mostrar solo las herramientas que contienen "Taladro" en el nombre
    Y se debe ocultar el resto de las herramientas

  Escenario: E5-Inventory Búsqueda sin resultados muestra mensaje informativo
    Dado que se han cargado herramientas en el catálogo
    Cuando el usuario busca "XYZ100NoExiste"
    Y el servidor no encuentra coincidencias
    Entonces se debe mostrar el mensaje "No se han encontrado herramientas."
    Y la tabla debe estar vacía

  Escenario: E6-Inventory Limpieza de búsqueda restaura todo el catálogo
    Dado que se aplicó una búsqueda anterior que filtró las herramientas
    Cuando el usuario borra el campo de búsqueda y lo deja vacío
    Entonces se debe mostrar el catálogo completo nuevamente

  Escenario: E7-Inventory Debounce evita múltiples llamadas API durante escritura rápida
    Dado que el usuario comienza a escribir "Taladro"
    Cuando escribe caracteres rápidamente: T-a-l-a-d-r-o
    Entonces se deben realizar máximo 2 llamadas API (en lugar de 7)
    Y las llamadas deben ocurrir con 500ms entre ellas

  # ============================================================================
  # Navegación hacia Detalles de Herramienta
  # ============================================================================
  Escenario: E8-Inventory Click en fila de herramienta navega a detalles
    Dado que se muestra la tabla de inventario con herramientas
    Cuando el usuario hace clic en una fila (ej: Taladro con ID=5)
    Entonces el sistema debe navegar a la URL "/inventario/5"
    Y se debe cargar la página de detalles de esa herramienta

  Escenario: E9-Inventory Navegación conserva ID de herramienta en la URL
    Dado que se hace clic en la herramienta "Sierra" con idInformationTool=12
    Cuando se navega a la página de detalles
    Entonces la URL debe ser "/inventario/12"
    Y el ID debe ser accesible para cargar datos específicos del producto

  # ============================================================================
  # Modal de Creación de Nuevo Tipo de Herramienta - Visibilidad
  # ============================================================================
  Escenario: E10-CreateTypeModal Modal no se renderiza cuando isOpen es falso
    Dado que isOpen={false}
    Cuando se renderiza CreateTypeModal
    Entonces el componente debe retornar null
    Y no debe haber elementos DOM del modal en la página

  Escenario: E11-CreateTypeModal Modal se muestra cuando isOpen es verdadero
    Dado que isOpen={true}
    Cuando se renderiza CreateTypeModal
    Entonces se debe mostrar el modal con título "Nuevo Tipo de Herramienta"
    Y se debe mostrar un formulario con 5 campos de entrada
    Y se debe mostrar un overlay gris oscuro detrás del modal

  Escenario: E12-CreateTypeModal Primera clave de entrada recibe autoFocus
    Dado que el modal se abre
    Cuando se renderiza el componente
    Entonces el campo "Name" debe tener autoFocus={true}
    Y el cursor debe posicionarse automáticamente en ese campo

  # ============================================================================
  # Modal de Creación - Llenado de Formulario
  # ============================================================================
  Escenario: E13-CreateTypeModal Usuario ingresa nombre de herramienta
    Dado que el modal está abierto
    Cuando el usuario escribe "Taladro Percutor" en el campo Name
    Entonces el estado formData debe actualizar: nameTool="Taladro Percutor"
    Y el campo debe mostrar el texto ingresado

  Escenario: E14-CreateTypeModal Usuario selecciona categoría del dropdown
    Dado que el modal está abierto
    Y existen 4 opciones de categoría
    Cuando el usuario selecciona "Herramientas Eléctricas"
    Entonces el estado formData debe actualizar: categoryTool="Herramientas Eléctricas"
    Y el dropdown debe mostrar la selección

  Escenario: E15-CreateTypeModal Usuario ingresa precios en campos numéricos
    Dado que el modal está abierto
    Cuando el usuario ingresa: Precio Reposición=$500, Precio Renta=$15, Precio Multa=$5
    Entonces el estado formData debe actualizar todos los campos de precio
    Y los valores deben ser guardados como números

  Escenario: E16-CreateTypeModal Cambio en un campo preserva otros campos
    Dado que el usuario ingresó: nombre="Taladro", categoría="Eléctricas", precio reposición=$500
    Cuando el usuario edita el campo de "Precio Renta Diaria" a $20
    Entonces los campos de nombre y categoría deben permanecer sin cambios
    Y solo "Precio Renta Diaria" debe actualizarse a $20

  Escenario: E17-CreateTypeModal Múltiples cambios se acumulan en formData
    Dado que el usuario realiza 5 ediciones diferentes en el formulario
    Cuando completa cada edición
    Entonces todos los cambios deben acumularse en el estado formData
    Y cada campo debe reflejar su último valor ingresado

  # ============================================================================
  # Modal - Validaciones de Campos
  # ============================================================================
  Escenario: E18-CreateTypeModal Campo Name es obligatorio
    Dado que el modal está abierto
    Cuando el usuario intenta enviar el formulario sin ingresar Name
    Entonces el navegador debe mostrar validación de HTML5 "required"
    Y el formulario no debe ser enviado

  Escenario: E19-CreateTypeModal Campo Category es obligatorio
    Dado que el modal está abierto
    Cuando el usuario intenta enviar sin seleccionar categoría
    Entonces el sistema debe validar que categoría es requerida
    Y mostrar "--seleccione--" como placeholder deshabilitado

  Escenario: E20-CreateTypeModal Campos de precio son obligatorios y numéricos
    Dado que el usuario intenta enviar el formulario
    Cuando deja alguno de los 3 campos de precio vacío o con valores no numéricos
    Entonces el sistema debe rechazar el envío con validación required
    Y los campos deben tener type="number" con min="0"

  # ============================================================================
  # Modal - Acciones de Botones
  # ============================================================================
  Escenario: E21-CreateTypeModal Botón Cancel cierra modal sin guardar
    Dado que el usuario completó el formulario pero no quiere guardar
    Cuando hace clic en el botón "Cancel"
    Entonces debe ejecutarse onClose()
    Y el modal debe cerrarse sin llamar a onSave()
    Y los datos no deben ser guardados en la base de datos

  Escenario: E22-CreateTypeModal Botón Save envía datos y ejecuta onSave
    Dado que el usuario completó todos los campos requeridos correctamente
    Cuando hace clic en el botón "Save"
    Entonces debe ejecutarse onSave() con los datos del formulario
    Y el modal debe cerrarse
    Y se debe limpiar el formulario para el siguiente uso

  Escenario: E23-CreateTypeModal Submit con preventDefault evita recarga de página
    Dado que el formulario está listo para enviarse
    Cuando el usuario presiona Enter o hace clic en Save
    Entonces debe ejecutarse e.preventDefault()
    Entonces la página no debe recargarse
    Y solo los cambios de estado deben ocurrir

  Escenario: E24-CreateTypeModal Formulario se limpia después de guardar exitosamente
    Dado que el usuario guardó un nuevo tipo de herramienta
    Cuando cierra el modal y lo abre nuevamente
    Entonces todos los campos del formulario deben estar vacíos
    Y el estado formData debe ser reiniciado a valores por defecto

  # ============================================================================
  # Modal - Interacción con Overlay y Teclado
  # ============================================================================
  Escenario: E25-CreateTypeModal Click en overlay cierra el modal
    Dado que el modal está abierto
    Cuando el usuario hace clic en el área gris oscuro (overlay) fuera del contenido
    Entonces debe ejecutarse onClose()
    Y el modal debe desaparecer

  Escenario: E26-CreateTypeModal Click dentro del modal no cierra la ventana
    Dado que el modal está abierto
    Cuando el usuario hace clic dentro del contenido blanco del modal
    Entonces el evento no debe propagarse al overlay
    Y el modal debe permanecer abierto
    Y stopPropagation debe prevenir el cierre accidental

  Escenario: E27-CreateTypeModal Tecla Escape cierra el modal (evento global)
    Dado que el modal está abierto
    Cuando el usuario presiona la tecla "Escape"
    Entonces debe ejecutarse onClose()
    Y el modal debe cerrarse inmediatamente

  Escenario: E28-CreateTypeModal Teclas Enter y Space cierran el modal desde overlay
    Dado que el usuario está enfocado en el overlay (tabIndex=0)
    Cuando presiona Enter o Space
    Entonces debe ejecutarse onClose()
    Y el modal debe cerrarse

  # ============================================================================
  # Integración: InventoryPage con CreateTypeModal
  # ============================================================================
  Escenario: E29-Integration Clic en "+ Nuevo Tipo" abre CreateTypeModal
    Dado que se muestra la página de inventario
    Cuando el usuario hace clic en el botón "+ Nuevo Tipo"
    Entonces isTypeModalOpen debe cambiar a true
    Y CreateTypeModal debe renderizarse con isOpen={true}

  Escenario: E30-Integration Cierre de modal desde handleSaveType actualiza catálogo
    Dado que el usuario completó el formulario en el modal
    Y los datos se enviaron exitosamente al servidor
    Cuando handleSaveType se ejecuta
    Entonces debe cerrarse el modal (setIsTypeModalOpen(false))
    Y debe recargarse el catálogo (fetchCatalog())
    Y debe mostrarse alerta de éxito

  Escenario: E31-Integration Manejo de error 403 en creación de tipo
    Dado que el usuario intenta crear un tipo de herramienta
    Y el servidor responde con error 403 (Acceso Denegado)
    Cuando handleSaveType captura el error
    Entonces debe mostrar mensaje: "Acceso denegado: No tienes permisos..."
    Y el modal debe permanecer abierto
    Y los datos no deben ser perdidos

  Escenario: E32-Integration Manejo de error genérico en creación de tipo
    Dado que el usuario intenta crear un tipo
    Y ocurre un error inesperado (no 403)
    Cuando handleSaveType captura el error
    Entonces debe mostrar una alerta genérica: "A ocurrido un error inesperado."
    Y los datos del formulario deben conservarse

  Escenario: E33-Integration Error con mensaje del servidor se muestra al usuario
    Dado que el servidor retorna un error con serverMessage="Tipo ya existe"
    Cuando handleSaveType maneja la respuesta
    Entonces debe mostrar alerta: "Server Error: Tipo ya existe"
    Y el usuario debe saber exactamente qué salió mal

  # ============================================================================
  # Ciclo de Vida y Efectos
  # ============================================================================
  Escenario: E34-Lifecycle useEffect inicial carga el catálogo en montaje
    Dado que InventoryPage acaba de montarse en el DOM
    Cuando el useEffect con dependencia vacía [] se ejecuta
    Entonces debe llamarse a fetchCatalog()
    Y debe realizarse una petición al servidor para obtener las herramientas

  Escenario: E35-Lifecycle Cambio de searchTerm dispara búsqueda con debounce
    Dado que el usuario escribe "Taladro" en el campo de búsqueda
    Cuando setSearchTerm actualiza el estado
    Entonces debe esperarse 500ms
    Y luego debe llamarse fetchCatalog("Taladro")
    Y el servidor debe filtrar herramientas por ese término

  Escenario: E36-Lifecycle Cleanup de timeout previene búsqueda innecesaria
    Dado que el usuario está escribiendo rápidamente en la búsqueda
    Cuando escribe antes de que se complete el timeout de 500ms
    Entonces debe cancelarse el timeout anterior
    Y debe iniciarse uno nuevo
    Y solo la última búsqueda debe ejecutarse

  # ============================================================================
  # Propiedades y Datos
  # ============================================================================
  Escenario: E37-Props CreateTypeModal validación de PropTypes requeridos
    Dado que se intenta renderizar CreateTypeModal
    Cuando se proporcionan props inválidas (isOpen sin especificar o no booleano)
    Entonces PropTypes debe detectar la violación en desarrollo
    Y se debe mostrar advertencia en la consola

  Escenario: E38-Props Categories array se pasa correctamente al dropdown
    Dado que categories=["Manuales", "Eléctricas", "Medición", "Pesada"]
    Cuando se renderiza CreateTypeModal
    Entonces todos los valores de categories deben aparecer como opciones en el select
    Y el array debe ser iterado correctamente con map()

  Escenario: E39-Props Callbacks onClose, onSave, onSubmit son funciones
    Dado que se usan funciones callback en CreateTypeModal
    Cuando se ejecutan eventos (clic, submit, tecla)
    Entonces cada callback debe ser invocado con los argumentos correctos
    Y deben ser funciones de tipo PropTypes.func.isRequired
