# Mapeo de Historias de Usuario - Épica 6 para Automatización en Selenium IDE
# ToolRent - Sistema de Alquiler de Herramientas
# Formato: Gherkin → Comandos Selenium IDE

## Referencia de Elementos (Locators) Esperados en ToolRent Frontend

### URLs Base
- Dashboard Admin: /dashboard
- Reportes: /reportes
- Préstamos Activos: /reportes/prestamos-activos
- Ranking Herramientas: /reportes/ranking-herramientas
- Clientes con Atrasos: /reportes/clientes-atrasos
- Inventario: /inventario
- Kardex: /reportes/kardex

### Selectores Comunes (Ajustar según implementación real)
| Elemento | Selector Probable |
|----------|---|
| Menú Reportes | button:contains("Reportes") o a[href*="/reportes"] |
| Botón Filtrar | button:contains("Filtrar") o #btn-filtrar |
| Botón Actualizar | button:contains("Actualizar") o #btn-refresh |
| Campo Fecha Inicio | input[type="date"][id*="fecha-inicio"] |
| Campo Fecha Fin | input[type="date"][id*="fecha-fin"] |
| Tabla de Datos | table.reportes-table o .data-grid |
| Fila de Resultado | tr[data-status*="vigente"] o tr[data-status*="atrasado"] |
| Dropdown Estado | select[name="estado"] |
| Botón Imprimir | button:contains("Imprimir") |
| Botón Exportar PDF | button:contains("Exportar") |
| Mensaje Alerta | div.alert o .error-message |

---

## HU008: Listar Préstamos Activos

### Escenario E1 - Visualización de préstamos vigentes
```gherkin
Escenario: E1-HU008 Visualización de préstamos vigentes sin atrasos
  Dado que el sistema contiene préstamos activos cuya fecha pactada no ha vencido
  Cuando el administrador accede a la sección "Reportes" > "Préstamos Activos"
  Entonces se debe mostrar un listado con columnas: Cliente, Herramienta, Fecha Devolución, Estado
  Y los préstamos vigentes deben mostrar estado "Vigente" con fondo verde
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: waitForElementPresent | Target: table.reportes-table | Value: 
3. Command: assertElementPresent | Target: th:contains("Cliente") | Value: 
4. Command: assertElementPresent | Target: th:contains("Herramienta") | Value: 
5. Command: assertElementPresent | Target: th:contains("Fecha Devolución") | Value: 
6. Command: assertElementPresent | Target: th:contains("Estado") | Value: 
7. Command: assertText | Target: tr:nth-child(1) td:contains("Vigente") | Value: Vigente
8. Command: assertAttribute | Target: tr:nth-child(1) | Value: class | Expected: *vigente* (verde)
```

### Escenario E2 - Préstamos atrasados resaltados en rojo
```gherkin
Escenario: E2-HU008 Identificación visual de préstamos atrasados con resaltado en rojo
  Dado que existen préstamos cuya fecha pactada de devolución ya ha vencido
  Cuando el administrador consulta el listado de "Préstamos Activos"
  Entonces los registros atrasados deben mostrarse resaltados en color rojo
  Y el estado debe figurar como "Atrasado" con cálculo de días transcurridos
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: waitForElementPresent | Target: tr[data-status="atrasado"] | Value: 
3. Command: assertAttribute | Target: tr[data-status="atrasado"] | Value: class | Expected: *rojo* o *danger*
4. Command: assertText | Target: tr[data-status="atrasado"] td.estado | Value: Atrasado
5. Command: assertText | Target: tr[data-status="atrasado"] td.dias | Value: /\d+ días/ (expresión regular)
```

### Escenario E3 - Actualización automática
```gherkin
Escenario: E3-HU008 Actualización automática del listado sin recargar la página
  Dado que existe un listado de préstamos activos visualizado en tiempo real
  Cuando un empleado registra un nuevo préstamo desde la sección "Nuevo Arriendo"
  Y el administrador hace clic en el botón "Actualizar" o espera 30 segundos
  Entonces el nuevo registro debe aparecer automáticamente en la tabla de préstamos activos
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: storeElementCount | Target: table.reportes-table tbody tr | Value: initial_count
3. Command: click | Target: button:contains("Actualizar") o #btn-refresh | Value: 
4. Command: waitForElementPresent | Target: table.reportes-table tbody tr | Value: 3000
5. Command: storeElementCount | Target: table.reportes-table tbody tr | Value: final_count
6. Command: assertNotEquals | Target: ${initial_count} | Value: ${final_count}
```

### Escenario E4 - Control de acceso restringido
```gherkin
Escenario: E4-HU008 Acceso restringido a usuarios sin permisos de administrador
  Dado que un usuario tiene rol "Cliente" o "Empleado"
  Cuando intenta acceder directamente a la URL "Reportes/PrestamoActivos"
  Entonces el sistema debe redirigir a la página de inicio
  Y mostrar el mensaje de alerta "Acceso Denegado: Solo administradores pueden acceder a reportes"
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: waitForElementPresent | Target: div.alert | Value: 3000
3. Command: assertText | Target: div.alert | Value: *Acceso Denegado* (contiene)
4. Command: assertLocation | Target: */inicio* o */ (puede ser redirigido) | Value: regex
```

---

## HU009: Filtrar Reportes por Rango de Fechas

### Escenario E1 - Filtrado por período
```gherkin
Escenario: E1-HU009 Filtrado exitoso de préstamos por período específico
  Dado que el administrador está en el reporte "Préstamos Activos"
  Cuando selecciona "01/03/2026" como fecha inicio y "31/03/2026" como fecha fin
  Y hace clic en el botón "Filtrar"
  Entonces el sistema debe mostrar solo los préstamos iniciados en marzo 2026
  Y ocultar registros de otros meses
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: click | Target: input[id*="fecha-inicio"] | Value: 
3. Command: type | Target: input[id*="fecha-inicio"] | Value: 01/03/2026
4. Command: click | Target: input[id*="fecha-fin"] | Value: 
5. Command: type | Target: input[id*="fecha-fin"] | Value: 31/03/2026
6. Command: click | Target: button:contains("Filtrar") | Value: 
7. Command: waitForElementPresent | Target: table.reportes-table | Value: 2000
8. Command: assertNotElementPresent | Target: tr[data-date*="02/2026"] | Value: 
9. Command: assertElementPresent | Target: tr[data-date*="03/2026"] | Value: 
```

### Escenario E2 - Validación de rango inválido
```gherkin
Escenario: E2-HU009 Validación de rango lógico de fechas con mensaje de error
  Dado que el administrador intenta filtrar un reporte
  Cuando ingresa una "Fecha Fin" (15/03/2026) que es anterior a "Fecha Inicio" (20/03/2026)
  Y presiona el botón "Filtrar"
  Entonces el sistema debe mostrar el mensaje de error: "Error: Rango de fechas inválido"
  Y mantener los datos sin filtrar
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: click | Target: input[id*="fecha-inicio"] | Value: 
3. Command: type | Target: input[id*="fecha-inicio"] | Value: 20/03/2026
4. Command: click | Target: input[id*="fecha-fin"] | Value: 
5. Command: type | Target: input[id*="fecha-fin"] | Value: 15/03/2026
6. Command: click | Target: button:contains("Filtrar") | Value: 
7. Command: waitForElementPresent | Target: div.alert.error | Value: 2000
8. Command: assertText | Target: div.alert.error | Value: *Rango de fechas inválido*
```

### Escenario E3 - Sin resultados en el rango
```gherkin
Escenario: E3-HU009 Mensaje informativo cuando no hay registros en el rango seleccionado
  Dado que el administrador selecciona un rango de fechas
  Cuando se ejecuta el filtro y no existe actividad en ese período
  Entonces el sistema debe mostrar el mensaje: "No se encontraron registros para el período..."
  Y mantener visible la opción de "Limpiar filtro"
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: click | Target: input[id*="fecha-inicio"] | Value: 
3. Command: type | Target: input[id*="fecha-inicio"] | Value: 01/01/2020
4. Command: click | Target: input[id*="fecha-fin"] | Value: 
5. Command: type | Target: input[id*="fecha-fin"] | Value: 31/01/2020
6. Command: click | Target: button:contains("Filtrar") | Value: 
7. Command: waitForElementPresent | Target: div.no-results | Value: 2000
8. Command: assertText | Target: div.no-results | Value: *No se encontraron registros*
9. Command: assertElementPresent | Target: button:contains("Limpiar filtro") | Value: 
```

---

## HU010: Ranking de Herramientas Más Prestadas

### Escenario E1 - Orden descendente
```gherkin
Escenario: E1-HU010 Orden descendente del ranking de herramientas
  Dado que el sistema contiene histórico de múltiples préstamos
  Cuando el administrador accede a "Reportes" > "Ranking de Herramientas"
  Entonces debe visualizarse un listado ordenado de mayor a menor por cantidad de préstamos
  Y la herramienta más solicitada debe aparecer en la primera posición
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/ranking-herramientas | Value: 
2. Command: waitForElementPresent | Target: table.ranking-table | Value: 2000
3. Command: storeText | Target: tr:nth-child(1) td.cantidad | Value: cantidad1
4. Command: storeText | Target: tr:nth-child(2) td.cantidad | Value: cantidad2
5. Command: assertEvaluate | Target: parseInt('${cantidad1}') >= parseInt('${cantidad2}') | Value: true
```

### Escenario E2 - Contador de préstamos
```gherkin
Escenario: E2-HU010 Visualización de contadores de préstamos por herramienta
  Dado el listado de ranking de herramientas
  Cuando se visualiza cada registro
  Entonces cada herramienta debe mostrar: Nombre, Categoría, Total Préstamos
  Y el formato debe ser "Taladro Bosch (Herramientas Eléctricas): 45 préstamos"
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/ranking-herramientas | Value: 
2. Command: waitForElementPresent | Target: table.ranking-table | Value: 2000
3. Command: assertText | Target: tr:nth-child(1) td.nombre | Value: /.*\(.*\):\s*\d+\s*préstamos/
4. Command: assertElementPresent | Target: td.categoria:contains("Herramientas") | Value: 
5. Command: assertElementPresent | Target: td.cantidad | Value: 
```

### Escenario E3 - Filtrado por categoría
```gherkin
Escenario: E3-HU010 Filtrado de ranking por categoría específica
  Dado que el administrador está visualizando el ranking completo
  Cuando selecciona el filtro "Categoría = Herramientas Manuales"
  Entonces el sistema debe reordenar el top mostrando solo herramientas de esa categoría
  Y el contador debe recalcular basado únicamente en préstamos de ese grupo
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/ranking-herramientas | Value: 
2. Command: click | Target: select[name="categoria"] | Value: 
3. Command: selectByLabel | Target: select[name="categoria"] | Value: Herramientas Manuales
4. Command: click | Target: button:contains("Filtrar") | Value: 
5. Command: waitForElementPresent | Target: table.ranking-table | Value: 2000
6. Command: assertNotElementPresent | Target: td.categoria:contains("Eléctricas") | Value: 
7. Command: assertElementPresent | Target: td.categoria:contains("Manuales") | Value: 
```

---

## HU011: Listado de Clientes con Atrasos

### Escenario E1 - Listado de morosos
```gherkin
Escenario: E1-HU011 Listado de clientes morosos con rentas pendientes
  Dado que existen clientes con herramientas no devueltas pasada la fecha pactada
  Cuando el administrador accede a "Reportes" > "Clientes con Atrasos"
  Entonces debe mostrarse un listado con: Nombre Cliente, Herramienta, Días de Atraso, Monto Multa
  Y solo aparecerán clientes que incumplen las reglas de negocio de devolución
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/clientes-atrasos | Value: 
2. Command: waitForElementPresent | Target: table.atrasos-table | Value: 2000
3. Command: assertElementPresent | Target: th:contains("Cliente") | Value: 
4. Command: assertElementPresent | Target: th:contains("Herramienta") | Value: 
5. Command: assertElementPresent | Target: th:contains("Días de Atraso") | Value: 
6. Command: assertElementPresent | Target: th:contains("Monto Multa") | Value: 
7. Command: assertText | Target: tr:nth-child(1) td.dias | Value: /^\d+\s*días?$/
8. Command: assertText | Target: tr:nth-child(1) td.multa | Value: /^\$?\d+(\.\d{2})?$/
```

### Escenario E2 - Cálculo de días de atraso
```gherkin
Escenario: E2-HU011 Cálculo automático de días de retraso por cliente
  Dado un cliente en el reporte de atrasos
  Cuando se visualiza su detalle
  Entonces el sistema debe mostrar: "María González - Taladro - 5 días de atraso - Multa: $50"
  Y el cálculo debe ser: (Fecha Actual - Fecha Pactada Devolución)
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/clientes-atrasos | Value: 
2. Command: waitForElementPresent | Target: table.atrasos-table | Value: 2000
3. Command: click | Target: tr:nth-child(1) | Value: 
4. Command: waitForElementPresent | Target: div.detalle-modal | Value: 2000
5. Command: assertText | Target: div.detalle-modal | Value: *días de atraso*
6. Command: assertAttribute | Target: tr:nth-child(1) | Value: data-dias | Expected: /\d+/
```

### Escenario E3 - Acceso al historial del cliente
```gherkin
Escenario: E3-HU011 Acceso directo al historial de deudas del cliente
  Dado el listado de clientes con atrasos
  Cuando el administrador hace clic en el nombre del cliente
  Entonces debe abrirse una modal o vista con: Datos de contacto, Historial de atrasos previos, Multas pendientes totales
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/clientes-atrasos | Value: 
2. Command: waitForElementPresent | Target: table.atrasos-table | Value: 2000
3. Command: click | Target: tr:nth-child(1) a.cliente-nombre | Value: 
4. Command: waitForElementPresent | Target: div.cliente-detalle o div.modal-content | Value: 2000
5. Command: assertElementPresent | Target: div.datos-contacto | Value: 
6. Command: assertElementPresent | Target: div.historial-atrasos | Value: 
7. Command: assertElementPresent | Target: div.multas-totales | Value: 
```

---

## HU012: Herramientas en Reparación

### Escenario E1 - Filtro por estado
```gherkin
Escenario: E1-HU012 Filtro por estado de mantenimiento "En Reparación"
  Dado que el administrador está en la vista "Inventario"
  Cuando selecciona el dropdown de estado y elige "En Reparación"
  Entonces el sistema debe mostrar únicamente las herramientas retiradas por daños leves
  Y ocultará las herramientas con estado "Disponible", "Rentada" o "Dada de Baja"
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /inventario | Value: 
2. Command: click | Target: select[name="estado"] | Value: 
3. Command: selectByLabel | Target: select[name="estado"] | Value: En Reparación
4. Command: waitForElementPresent | Target: table.inventario-table | Value: 2000
5. Command: assertNotElementPresent | Target: tr[data-estado="disponible"] | Value: 
6. Command: assertNotElementPresent | Target: tr[data-estado="rentada"] | Value: 
7. Command: assertElementPresent | Target: tr[data-estado="reparacion"] | Value: 
```

### Escenario E2 - Visualización de motivo de reparación
```gherkin
Escenario: E2-HU012 Visualización del motivo y observación de reparación
  Dado el listado de herramientas en mantenimiento
  Cuando se hace clic en una herramienta específica
  Entonces se debe mostrar: Código, Nombre, Motivo de Baja, Observación del Empleado
  Y ejemplo: "Sierra - Código HE012 - Motivo: Daño en cuchilla - Observación: Reparar filo"
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /inventario | Value: 
2. Command: click | Target: select[name="estado"] | Value: 
3. Command: selectByLabel | Target: select[name="estado"] | Value: En Reparación
4. Command: waitForElementPresent | Target: table.inventario-table | Value: 2000
5. Command: click | Target: tr:nth-child(1) | Value: 
6. Command: waitForElementPresent | Target: div.detalle-herramienta | Value: 2000
7. Command: assertElementPresent | Target: span.codigo | Value: 
8. Command: assertElementPresent | Target: span.motivo | Value: 
9. Command: assertElementPresent | Target: span.observacion | Value: 
```

### Escenario E3 - Cambio de estado a Disponible
```gherkin
Escenario: E3-HU012 Cambio de estado de "En Reparación" a "Disponible"
  Dado que una herramienta está en estado "En Reparación"
  Cuando el administrador selecciona la herramienta y hace clic en "Marcar como Reparada"
  Entonces el estado debe cambiar a "Disponible"
  Y la herramienta debe desaparecer del reporte de reparación y volver al stock de préstamos
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /inventario | Value: 
2. Command: click | Target: select[name="estado"] | Value: 
3. Command: selectByLabel | Target: select[name="estado"] | Value: En Reparación
4. Command: waitForElementPresent | Target: table.inventario-table | Value: 2000
5. Command: storeElementCount | Target: table.inventario-table tbody tr | Value: antes_count
6. Command: click | Target: tr:nth-child(1) button:contains("Marcar como Reparada") | Value: 
7. Command: click | Target: button[class*="confirmar"] | Value: 
8. Command: waitForElementPresent | Target: table.inventario-table | Value: 2000
9. Command: storeElementCount | Target: table.inventario-table tbody tr | Value: despues_count
10. Command: assertNotEquals | Target: ${antes_count} | Value: ${despues_count}
```

---

## HU013: Kardex - Historial de Movimientos

### Escenario E1 - Trazabilidad de movimientos
```gherkin
Escenario: E1-HU013 Trazabilidad cronológica de préstamos y devoluciones
  Dado que el administrador selecciona una herramienta específica: "Sierra de Banco"
  Cuando accede a "Reportes" > "Kardex" > "Sierra de Banco"
  Entonces el sistema debe mostrar cronológicamente todos los movimientos de tipo "Préstamo" y "Devolución"
  Y el formato debe incluir: Fecha, Tipo Movimiento, Cliente, Observación
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/kardex | Value: 
2. Command: waitForElementPresent | Target: select[name="herramienta"] | Value: 
3. Command: selectByLabel | Target: select[name="herramienta"] | Value: Sierra de Banco
4. Command: click | Target: button:contains("Consultar") | Value: 
5. Command: waitForElementPresent | Target: table.kardex-table | Value: 2000
6. Command: assertElementPresent | Target: th:contains("Fecha") | Value: 
7. Command: assertElementPresent | Target: th:contains("Tipo Movimiento") | Value: 
8. Command: assertElementPresent | Target: th:contains("Cliente") | Value: 
9. Command: assertText | Target: tr:nth-child(1) td.tipo | Value: /Préstamo|Devolución/
```

### Escenario E2 - Responsable del movimiento
```gherkin
Escenario: E2-HU013 Identificación del empleado o administrador responsable del movimiento
  Dado un registro en el historial de la herramienta
  Cuando se visualiza el movimiento
  Entonces se debe mostrar: "03/03/2026 - Préstamo - Cliente: Juan Pérez - Registrado por: Admin López"
  Y en caso de devolución: "05/03/2026 - Devolución - Estado: Bueno - Registrado por: Emp. García"
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/kardex | Value: 
2. Command: selectByLabel | Target: select[name="herramienta"] | Value: Sierra de Banco
3. Command: click | Target: button:contains("Consultar") | Value: 
4. Command: waitForElementPresent | Target: table.kardex-table | Value: 2000
5. Command: assertText | Target: tr:nth-child(1) td.responsable | Value: /.*López|.*García|.*\w+/
6. Command: assertText | Target: tr:nth-child(1) | Value: *Registrado por*
```

### Escenario E3 - Balance de stock
```gherkin
Escenario: E3-HU013 Balance de stock resultante después de cada movimiento
  Dado el historial de una herramienta en el Kardex
  Cuando se visualiza cada fila del movimiento
  Entonces debe mostrar el "Stock Resultante" post-operación
  Y ejemplo: "Préstamo: Stock Anterior 10 → Stock Resultante 9"
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/kardex | Value: 
2. Command: selectByLabel | Target: select[name="herramienta"] | Value: Sierra de Banco
3. Command: click | Target: button:contains("Consultar") | Value: 
4. Command: waitForElementPresent | Target: table.kardex-table | Value: 2000
5. Command: assertElementPresent | Target: th:contains("Stock Anterior") | Value: 
6. Command: assertElementPresent | Target: th:contains("Stock Resultante") | Value: 
7. Command: assertText | Target: tr:nth-child(1) td.stock-resultante | Value: /\d+/
```

---

## HU014: Vista de Impresión y Exportación

### Escenario E1 - Vista de impresión limpia
```gherkin
Escenario: E1-HU014 Vista de impresión limpia sin elementos de navegación
  Dado que el administrador tiene un reporte generado en pantalla
  Cuando hace clic en el botón "Imprimir" o presiona Ctrl+P
  Entonces se abre una ventana de previsualización con formato optimizado
  Y no deben aparecer: menús laterales, botones de navegación, ni elementos de interfaz innecesarios
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: waitForElementPresent | Target: table.reportes-table | Value: 2000
3. Command: click | Target: button:contains("Imprimir") | Value: 
4. Command: waitForElementPresent | Target: @iframe-print | Value: 2000
5. Command: selectFrame | Target: @iframe-print | Value: 
6. Command: assertNotElementPresent | Target: nav.sidebar o nav.navbar | Value: 
7. Command: assertNotElementPresent | Target: button.btn-back o button.btn-home | Value: 
8. Command: selectFrame | Target: relative=parent | Value: 
```

### Escenario E2 - Encabezados de reporte en impresión
```gherkin
Escenario: E2-HU014 Inclusión de encabezados y metadatos en el reporte impreso
  Dado el documento de impresión generado
  Cuando se previsualiza antes de imprimir
  Entonces debe incluir: Título del reporte, Fecha de generación, Usuario solicitante, Período filtrado
  Y ejemplo: "REPORTE DE PRÉSTAMOS ACTIVOS - Generado: 02/03/2026 - Por: Admin López..."
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: click | Target: button:contains("Imprimir") | Value: 
3. Command: waitForElementPresent | Target: div.print-container | Value: 2000
4. Command: selectFrame | Target: @iframe-print | Value: 
5. Command: assertText | Target: h1.titulo-reporte | Value: *REPORTE DE PRÉSTAMOS ACTIVOS*
6. Command: assertText | Target: p.fecha-generacion | Value: /Generado:\s*\d{2}\/\d{2}\/\d{4}/
7. Command: assertText | Target: p.usuario | Value: *Por:*
8. Command: selectFrame | Target: relative=parent | Value: 
```

### Escenario E3 - Exportación a PDF
```gherkin
Escenario: E3-HU014 Exportación exitosa a formato PDF con estructura intacta
  Dado un reporte visualizado en pantalla con datos de préstamos activos
  Cuando el administrador selecciona "Exportar como PDF"
  Entonces el navegador debe descargar un archivo PDF con nombre: "Reportes_PrestamoActivos_02032026.pdf"
  Y la estructura de columnas y datos debe mantenerse idéntica al formato pantalla
```

**Mapeo a Selenium IDE:**
```
1. Command: open | Target: /reportes/prestamos-activos | Value: 
2. Command: waitForElementPresent | Target: table.reportes-table | Value: 2000
3. Command: click | Target: button:contains("Exportar") | Value: 
4. Command: waitForElementPresent | Target: select[name="formato"] | Value: 1000
5. Command: selectByLabel | Target: select[name="formato"] | Value: PDF
6. Command: click | Target: button:contains("Descargar") | Value: 
7. Command: pause | Target: 2000 | Value: (esperar descarga)
8. Command: assertFileExists | Target: /downloads/*Reportes_PrestamoActivos*.pdf | Value: 
```

---

## Guía de Automatización en Selenium IDE

### Configuración Previa
1. **Instalar Selenium IDE** en Chrome/Firefox
2. **Crear un nuevo proyecto** con el nombre: "ToolRent_Epica6_Reportes"
3. **Base URL**: http://localhost:5173 (o la URL de producción)
4. **Timeout global**: 5000ms

### Estructura de Archivos
```
tests/
├── E1_HU008_PreslamosVigentes.side
├── E2_HU008_PreslamosAtrasados.side
├── E3_HU008_ActualizacionAutomatica.side
├── E4_HU008_ControlAcceso.side
├── E1_HU009_FiltradoPeriodo.side
├── E2_HU009_ValidacionRangoInvalido.side
├── E3_HU009_SinResultados.side
├── E1_HU010_OrdenRanking.side
├── E2_HU010_ContadorPrestamos.side
├── E3_HU010_FiltroCategoria.side
├── E1_HU011_ListadoMorosos.side
├── E2_HU011_CalculoDias.side
├── E3_HU011_HistorialCliente.side
├── E1_HU012_FiltroReparacion.side
├── E2_HU012_MotivoReparacion.side
├── E3_HU012_CambioEstado.side
├── E1_HU013_TrazabilidadMovimientos.side
├── E2_HU013_ResponsableMovimiento.side
├── E3_HU013_BalanceStock.side
├── E1_HU014_VistaImpresion.side
├── E2_HU014_Encabezados.side
├── E3_HU014_ExportacionPDF.side
└── README_Automatizacion.md
```

### Ejecución de Pruebas
```bash
# Ejecutar todos los tests
npx selenium-side-runner -c "chromedriver --no-sandbox" tests/*.side

# Ejecutar test específico
npx selenium-side-runner -c "chromedriver --no-sandbox" tests/E1_HU008_PreslamosVigentes.side

# Modo headless
npx selenium-side-runner --headless tests/*.side
```

### Buenas Prácticas
- ✅ Usar `waitForElementPresent` antes de cualquier asserción
- ✅ Incluir `pause` entre acciones si es necesario (retrasos de red)
- ✅ Verificar elementos únicos usando `data-testid` o `id`
- ✅ Usar expresiones regulares para valores dinámicos (fechas, números)
- ✅ Mantener tests independientes (sin dependencias entre ellos)
- ✅ Documentar cada paso con comentarios

### Troubleshooting
| Problema | Solución |
|----------|----------|
| Timeouts frecuentes | Aumentar timeout a 10000ms o revisar selectores |
| Elemento no encontrado | Inspeccionar HTML en DevTools, usar XPath si es necesario |
| PDF no descarga | Configurar Chrome para descargar automáticamente |
| Fechas dinámicas | Usar variables `${now}` o JavaScript para fechas |

