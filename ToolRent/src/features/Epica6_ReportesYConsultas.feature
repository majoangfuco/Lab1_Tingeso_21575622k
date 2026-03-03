# language: es
Característica: Épica 6 - Reportes y Consultas del Sistema ToolRent
  Como administrador del sistema ToolRent
  Necesito generar reportes y consultas para visualizar información clave de préstamos,
  clientes y herramientas con el fin de supervisar el correcto funcionamiento de la tienda

  # ============================================================================
  # HU008: Listar Préstamos Activos
  # ============================================================================
  Escenario: E1-HU008 Visualización de préstamos vigentes sin atrasos
    Dado que el sistema contiene préstamos activos cuya fecha pactada no ha vencido
    Cuando el administrador accede a la sección "Reportes" > "Préstamos Activos"
    Entonces se debe mostrar un listado con columnas: Cliente, Herramienta, Fecha Devolución, Estado
    Y los préstamos vigentes deben mostrar estado "Vigente" con fondo verde

  Escenario: E2-HU008 Identificación visual de préstamos atrasados con resaltado en rojo
    Dado que existen préstamos cuya fecha pactada de devolución ya ha vencido
    Cuando el administrador consulta el listado de "Préstamos Activos"
    Entonces los registros atrasados deben mostrarse resaltados en color rojo
    Y el estado debe figurar como "Atrasado" con cálculo de días transcurridos

  Escenario: E3-HU008 Actualización automática del listado sin recargar la página
    Dado que existe un listado de préstamos activos visualizado en tiempo real
    Cuando un empleado registra un nuevo préstamo desde la sección "Nuevo Arriendo"
    Y el administrador hace clic en el botón "Actualizar" o espera 30 segundos
    Entonces el nuevo registro debe aparecer automáticamente en la tabla de préstamos activos

  Escenario: E4-HU008 Acceso restringido a usuarios sin permisos de administrador
    Dado que un usuario tiene rol "Cliente" o "Empleado"
    Cuando intenta acceder directamente a la URL "Reportes/PrestamoActivos"
    Entonces el sistema debe redirigir a la página de inicio
    Y mostrar el mensaje de alerta "Acceso Denegado: Solo administradores pueden acceder a reportes"

  # ============================================================================
  # HU009: Filtrar Reportes por Rango de Fechas
  # ============================================================================
  Escenario: E1-HU009 Filtrado exitoso de préstamos por período específico
    Dado que el administrador está en el reporte "Préstamos Activos"
    Cuando selecciona "01/03/2026" como fecha inicio y "31/03/2026" como fecha fin
    Y hace clic en el botón "Filtrar"
    Entonces el sistema debe mostrar solo los préstamos iniciados en marzo 2026
    Y ocultar registros de otros meses

  Escenario: E2-HU009 Validación de rango lógico de fechas con mensaje de error
    Dado que el administrador intenta filtrar un reporte
    Cuando ingresa una "Fecha Fin" (15/03/2026) que es anterior a "Fecha Inicio" (20/03/2026)
    Y presiona el botón "Filtrar"
    Entonces el sistema debe mostrar el mensaje de error: "Error: Rango de fechas inválido"
    Y mantener los datos sin filtrar

  Escenario: E3-HU009 Mensaje informativo cuando no hay registros en el rango seleccionado
    Dado que el administrador selecciona un rango de fechas
    Cuando se ejecuta el filtro y no existe actividad en ese período
    Entonces el sistema debe mostrar el mensaje: "No se encontraron registros para el período 15/01/2023 - 20/01/2023"
    Y mantener visible la opción de "Limpiar filtro"

  # ============================================================================
  # HU010: Ranking de Herramientas Más Prestadas
  # ============================================================================
  Escenario: E1-HU010 Orden descendente del ranking de herramientas
    Dado que el sistema contiene histórico de múltiples préstamos
    Cuando el administrador accede a "Reportes" > "Ranking de Herramientas"
    Entonces debe visualizarse un listado ordenado de mayor a menor por cantidad de préstamos
    Y la herramienta más solicitada debe aparecer en la primera posición

  Escenario: E2-HU010 Visualización de contadores de préstamos por herramienta
    Dado el listado de ranking de herramientas
    Cuando se visualiza cada registro
    Entonces cada herramienta debe mostrar: Nombre, Categoría, Total Préstamos
    Y el formato debe ser "Taladro Bosch (Herramientas Eléctricas): 45 préstamos"

  Escenario: E3-HU010 Filtrado de ranking por categoría específica
    Dado que el administrador está visualizando el ranking completo
    Cuando selecciona el filtro "Categoría = Herramientas Manuales"
    Entonces el sistema debe reordenar el top mostrando solo herramientas de esa categoría
    Y el contador debe recalcular basado únicamente en préstamos de ese grupo

  # ============================================================================
  # HU011: Listado de Clientes con Atrasos
  # ============================================================================
  Escenario: E1-HU011 Listado de clientes morosos con rentas pendientes
    Dado que existen clientes con herramientas no devueltas pasada la fecha pactada
    Cuando el administrador accede a "Reportes" > "Clientes con Atrasos"
    Entonces debe mostrarse un listado con: Nombre Cliente, Herramienta, Días de Atraso, Monto Multa
    Y solo aparecerán clientes que incumplen las reglas de negocio de devolución

  Escenario: E2-HU011 Cálculo automático de días de retraso por cliente
    Dado un cliente en el reporte de atrasos
    Cuando se visualiza su detalle
    Entonces el sistema debe mostrar: "María González - Taladro - 5 días de atraso - Multa: $50"
    Y el cálculo debe ser: (Fecha Actual - Fecha Pactada Devolución)

  Escenario: E3-HU011 Acceso directo al historial de deudas del cliente
    Dado el listado de clientes con atrasos
    Cuando el administrador hace clic en el nombre del cliente
    Entonces debe abrirse una modal o vista con: Datos de contacto, Historial de atrasos previos, Multas pendientes totales

  # ============================================================================
  # HU012: Herramientas en Estado "En Reparación"
  # ============================================================================
  Escenario: E1-HU012 Filtro por estado de mantenimiento "En Reparación"
    Dado que el administrador está en la vista "Inventario"
    Cuando selecciona el dropdown de estado y elige "En Reparación"
    Entonces el sistema debe mostrar únicamente las herramientas retiradas por daños leves
    Y ocultará las herramientas con estado "Disponible", "Rentada" o "Dada de Baja"

  Escenario: E2-HU012 Visualización del motivo y observación de reparación
    Dado el listado de herramientas en mantenimiento
    Cuando se hace clic en una herramienta específica
    Entonces se debe mostrar: Código, Nombre, Motivo de Baja, Observación del Empleado
    Y ejemplo: "Sierra - Código HE012 - Motivo: Daño en cuchilla - Observación: Reparar filo"

  Escenario: E3-HU012 Cambio de estado de "En Reparación" a "Disponible"
    Dado que una herramienta está en estado "En Reparación"
    Cuando el administrador selecciona la herramienta y hace clic en "Marcar como Reparada"
    Entonces el estado debe cambiar a "Disponible"
    Y la herramienta debe desaparecer del reporte de reparación y volver al stock de préstamos

  # ============================================================================
  # HU013: Kardex - Historial de Movimientos por Herramienta
  # ============================================================================
  Escenario: E1-HU013 Trazabilidad cronológica de préstamos y devoluciones
    Dado que el administrador selecciona una herramienta específica: "Sierra de Banco"
    Cuando accede a "Reportes" > "Kardex" > "Sierra de Banco"
    Entonces el sistema debe mostrar cronológicamente todos los movimientos de tipo "Préstamo" y "Devolución"
    Y el formato debe incluir: Fecha, Tipo Movimiento, Cliente, Observación

  Escenario: E2-HU013 Identificación del empleado o administrador responsable del movimiento
    Dado un registro en el historial de la herramienta
    Cuando se visualiza el movimiento
    Entonces se debe mostrar: "03/03/2026 - Préstamo - Cliente: Juan Pérez - Registrado por: Admin López"
    Y en caso de devolución: "05/03/2026 - Devolución - Estado: Bueno - Registrado por: Emp. García"

  Escenario: E3-HU013 Balance de stock resultante después de cada movimiento
    Dado el historial de une herramienta en el Kardex
    Cuando se visualiza cada fila del movimiento
    Entonces debe mostrar el "Stock Resultante" post-operación
    Y ejemplo: "Préstamo: Stock Anterior 10 → Stock Resultante 9"

  # ============================================================================
  # HU014: Vista de Impresión y Exportación de Reportes
  # ============================================================================
  Escenario: E1-HU014 Vista de impresión limpia sin elementos de navegación
    Dado que el administrador tiene un reporte generado en pantalla
    Cuando hace clic en el botón "Imprimir" o presiona Ctrl+P
    Entonces se abre una ventana de previsualización con formato optimizado
    Y no deben aparecer: menús laterales, botones de navegación, ni elementos de interfaz innecesarios

  Escenario: E2-HU014 Inclusión de encabezados y metadatos en el reporte impreso
    Dado el documento de impresión generado
    Cuando se previsualiza antes de imprimir
    Entonces debe incluir: Título del reporte, Fecha de generación, Usuario solicitante, Período filtrado
    Y ejemplo: "REPORTE DE PRÉSTAMOS ACTIVOS - Generado: 02/03/2026 - Por: Admin López - Período: 01/03/2026 al 02/03/2026"

  Escenario: E3-HU014 Exportación exitosa a formato PDF con estructura intacta
    Dado un reporte visualizado en pantalla con datos de préstamos activos
    Cuando el administrador selecciona "Exportar como PDF"
    Entonces el navegador debe descargar un archivo PDF con nombre: "Reportes_PrestamoActivos_02032026.pdf"
    Y la estructura de columnas y datos debe mantenerse idéntica al formato pantalla
