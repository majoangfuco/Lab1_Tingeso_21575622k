# ÉPICA 6: REPORTES Y CONSULTAS - HISTORIETAS ADAPTADAS A TOOLRENT
## Sistema de Alquiler de Herramientas | Versión 1.0

---

## 📋 RESUMEN EJECUTIVO

Se han adaptado **7 Historias de Usuario (HU)** de la Épica 6 al sistema ToolRent, cada una con **3-4 escenarios en formato Gherkin** evaluables automáticamente en Selenium IDE.

### Historias Incluidas:
1. **HU008** - Listar Préstamos Activos (4 escenarios)
2. **HU009** - Filtrar Reportes por Rango de Fechas (3 escenarios)
3. **HU010** - Ranking de Herramientas Más Prestadas (3 escenarios)
4. **HU011** - Listado de Clientes con Atrasos (3 escenarios)
5. **HU012** - Herramientas en Estado "En Reparación" (3 escenarios)
6. **HU013** - Kardex - Historial de Movimientos (3 escenarios)
7. **HU014** - Vista de Impresión y Exportación de Reportes (3 escenarios)

**Total: 22 Escenarios automatizables**

---

## 🎯 ADAPTACIONES REALIZADAS PARA TOOLRENT

### URLs y Rutas del Sistema
```
Dashboard: /dashboard
Reportes Base: /reportes
├── Préstamos Activos: /reportes/prestamos-activos
├── Ranking Herramientas: /reportes/ranking-herramientas
├── Clientes con Atrasos: /reportes/clientes-atrasos
├── Kardex: /reportes/kardex
└── Mantenimiento: /inventario (filtro estado)
```

### Elementos del Dominio ToolRent
- **Usuarios**: Cliente, Empleado, Administrador
- **Herramientas**: Nombre, Código, Categoría, Estado (Disponible, Rentada, En Reparación, Dada de Baja)
- **Préstamos/Arriendos**: Cliente, Herramienta, Fecha Inicio, Fecha Término, Estado (Vigente, Atrasado)
- **Multas**: Cálculo automático por días de retraso
- **Kardex**: Histórico de movimientos de cada herramienta

### Roles y Permisos
- **Administrador**: Acceso a todos los reportes
- **Empleado**: Acceso limitado (solo lectura)
- **Cliente**: Sin acceso a reportes

---

## 📊 DETALLES DE CADA HISTORIA

### **HU008 - Listar Préstamos Activos**
**Objetivo**: Que el administrador visualice en tiempo real qué herramientas están fuera de la tienda

**Elementos ToolRent**:
- Tabla con columnas: Cliente, Herramienta, Fecha Devolución, Estado
- Colores: Verde (Vigente), Rojo (Atrasado)
- Datos en tiempo real desde RentalService

**Escenarios**:
1. Visualización de préstamos vigentes (sin vencer)
2. Identificación visual de préstamos atrasados (color rojo)
3. Actualización automática al registrar nuevo arriendo
4. Control de acceso para usuarios no autorizados

**Servicios / APIs Necesarios**:
- `RentalService.getActiveRentals()`
- `RentalService.getRentalStatus(rentalId)` - Calcula estado (Vigente/Atrasado)

**Dependencias Funcionales**: HU002 (Registrar Arrendamiento), HU003 (Registrar Devolución)

---

### **HU009 - Filtrar Reportes por Rango de Fechas**
**Objetivo**: Analizar movimientos en períodos específicos (semanal, mensual, anual)

**Elementos ToolRent**:
- Campos de entrada de fecha (date picker)
- Botón "Filtrar"
- Validación de rango temporal
- Mensajes de error/vacío

**Escenarios**:
1. Filtrado exitoso por mes (01/03/2026 - 31/03/2026)
2. Validación de rango inválido (fecha fin < fecha inicio)
3. Mensaje informativo cuando no hay registros

**Servicios / APIs Necesarios**:
- Endpoint: `GET /rentals?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `RentalService.filterByDateRange(start, end)`

**Validaciones**:
- Fecha inicio ≤ Fecha fin
- Formato ISO 8601 (YYYY-MM-DD)
- Máximo de días permitido (ej. 1 año)

---

### **HU010 - Ranking de Herramientas Más Prestadas**
**Objetivo**: Identificar cuáles equipos tienen mayor demanda

**Elementos ToolRent**:
- Tabla ordenada descendente por cantidad de préstamos
- Columnas: Nombre Herramienta, Categoría, Total Préstamos
- Filtro por categoría
- Herramientas sin préstamos al final

**Escenarios**:
1. Orden descendente del ranking (más prestadas primero)
2. Visualización de contador exacto de préstamos
3. Filtrado por categoría (Herramientas Manuales, Eléctricas, etc.)

**Servicios / APIs Necesarios**:
- `InventoryService.getToolRanking()`
- `InventoryService.getToolRankingByCategory(category)`

**Cálculo**:
```
Ranking = COUNT(rental_id) WHERE state = 'Completada' 
ORDER BY COUNT DESC
```

**UI Widget Existente**: `ToolRankingWidget.jsx` (mejorar con filtros)

---

### **HU011 - Listado de Clientes con Atrasos**
**Objetivo**: Gestionar cobranzas y bloqueos de clientes morosos

**Elementos ToolRent**:
- Tabla con columnas: Cliente, Herramienta, Días Atraso, Monto Multa
- Link clickeable al perfil del cliente
- Cálculo automático de días transcurridos

**Escenarios**:
1. Listado de clientes morosos (filtra solo atrasos)
2. Cálculo de días de retraso (Fecha Actual - Fecha Pactada)
3. Acceso al detalle de contacto e historial de deudas

**Servicios / APIs Necesarios**:
- `RentalService.getOverdueRentals()`
- `ClientService.getOutstandingDebts(clientId)`
- Cálculo: `Math.ceil((Date.now() - rentalEndDate) / (1000 * 60 * 60 * 24))`

**Fórmula de Multa** (según HU004):
```
Multa Diaria = duePrice (campo en herramienta)
Multa Total = duePrice × días_atraso
```

---

### **HU012 - Herramientas en Estado "En Reparación"**
**Objetivo**: Supervisar herramientas en mantenimiento y bajas temporales

**Elementos ToolRent**:
- Filtro por estado en inventario: "En Reparación"
- Modal con: Código, Nombre, Motivo de Baja, Observación Empleado
- Botón "Marcar como Reparada" → cambia estado a "Disponible"
- Botón "Dar de Baja" → estado "Dada de Baja"

**Escenarios**:
1. Filtro por estado de mantenimiento
2. Visualización de motivo y observación de reparación
3. Cambio de estado de "En Reparación" a "Disponible"

**Servicios / APIs Necesarios**:
- `InventoryService.getToolsByStatus('repair')`
- `InventoryService.updateToolStatus(toolId, 'available')`
- `InventoryService.updateToolStatus(toolId, 'scrapped')`

**Estados Permitidos**:
- 0 = Disponible
- 1 = Rentada
- 2 = En Reparación
- 3 = Dada de Baja

**Relacionado con**: HU006 (Registrar Devolución con Daño)

---

### **HU013 - Kardex / Historial de Movimientos**
**Objetivo**: Auditar todas las entradas y salidas de un activo específico

**Elementos ToolRent**:
- Dropdown para seleccionar herramienta
- Tabla cronológica: Fecha, Tipo Movimiento, Cliente, Responsable, Stock Anterior, Stock Resultante
- Tipos de movimiento: Préstamo, Devolución, Entrada, Salida, Baja

**Escenarios**:
1. Trazabilidad de préstamos y devoluciones
2. Identificación del responsable (empleado/administrador)
3. Balance de stock resultante en cada movimiento

**Servicios / APIs Necesarios**:
- `KardexService.getMovementsByTool(toolId)`
- `KardexService.getMovementsByType(toolId, type)`

**Estructura de Movimiento**:
```javascript
{
  fecha: Date,
  tipo: 'Préstamo' | 'Devolución' | 'Entrada' | 'Salida' | 'Baja',
  cliente: String,
  responsable: String (user name),
  stockAnterior: Number,
  cantidad: Number,
  stockResultante: Number,
  observacion: String
}
```

**Página Existente**: KardexPage.jsx (ya implementada)

---

### **HU014 - Vista de Impresión y Exportación de Reportes**
**Objetivo**: Presentar informes físicos o guardarlos en PDF/CSV

**Elementos ToolRent**:
- Botón "Imprimir" → abre preview limpio (sin menús, solo datos)
- Botón "Exportar" → selecciona formato (PDF, CSV)
- Encabezado con: Título, Fecha, Usuario, Período
- Datos completos (no solo página visible)

**Escenarios**:
1. Vista de impresión limpia sin navegación
2. Inclusión de encabezados y metadatos
3. Exportación a PDF con estructura intacta

**Servicios / APIs Necesarios**:
- Función print nativa del navegador
- Librería: `jspdf` o `pdfkit` para generación PDF
- Librería: `papaparse` para exportar CSV

**Formato de Descarga**:
```
Reportes_PrestamoActivos_02032026.pdf
Reportes_RankingHerramientas_02032026.csv
```

**Metadata en Encabezado**:
```html
<h1>REPORTE DE PRÉSTAMOS ACTIVOS</h1>
<p>Generado: 02/03/2026</p>
<p>Por: Admin López</p>
<p>Período: 01/03/2026 al 02/03/2026</p>
```

---

## 🔧 TECNOLOGÍAS Y LIBRERÍAS SUGERIDAS

### Frontend (React)
```json
{
  "dependencies": {
    "react-table": "^8.x (para tablas de reportes)",
    "date-fns": "^2.x (manipulación de fechas)",
    "jspdf": "^2.x (generación PDF)",
    "html2pdf": "^0.10.x (convertir HTML a PDF)",
    "papaparse": "^5.x (export CSV)"
  }
}
```

### Backend (APIs Esperadas)
```
GET  /api/v1/rentals?status=active
GET  /api/v1/rentals?dateStart=YYYY-MM-DD&dateEnd=YYYY-MM-DD
GET  /api/v1/tools/ranking
GET  /api/v1/rentals/overdue
GET  /api/v1/inventory?state=2 (estado En Reparación)
GET  /api/v1/kardex/:toolId
POST /api/v1/tools/:toolId/state
```

---

## 📈 CRITERIOS DE ÉXITO

### Por Historia:
- **HU008**: Muestra préstamos vigentes/atrasados con colores diferenciados
- **HU009**: Filtra correctamente por rango y valida entrada
- **HU010**: Ranking ordenado descente con contador exacto
- **HU011**: Lista solo morosos con cálculo automático de días
- **HU012**: Cambia estado sin recargar página, persiste en BD
- **HU013**: Kardex completo, cronológico, con stock balance
- **HU014**: PDF descargable con estructura idéntica, CSV válido

### General:
✅ Todos los escenarios automatizables en Selenium IDE
✅ Cobertura de test ≥ 80%
✅ Timeouts< 5 segundos
✅ Validaciones de entrada
✅ Mensajes de error/éxito perceptibles

---

## 📝 ARCHIVOS ENTREGADOS

1. **Epica6_ReportesYConsultas.feature**
   - Formato Gherkin puro
   - 22 escenarios en total
   - Listo para Cucumber/BDD

2. **Epica6_MapeoSelenium_IDE.md**
   - Mapeo detallado de cada escenario
   - Comandos específicos de Selenium IDE
   - Selectores CSS/XPath propuestos
   - Guía de automatización

3. **Epica6_ResumeEjectuvo.md** (este archivo)
   - Resumen adaptado a ToolRent
   - Servicios/APIs necesarios
   - Estructura de datos
   - Tecnologías sugeridas

---

## 🚀 PRÓXIMOS PASOS

1. **Frontend**: Crear componentes de reporte en `/src/pages/ReportesPage/`
2. **Backend**: Implementar endpoints en `/api/rentals`, `/api/inventory`
3. **Testing**: Ejecutar tests Selenium IDE
4. **Integración**: Conectar componentes con servicios existentes (RentalService, etc.)
5. **Validación**: Verificar criterios de éxito

---

## 📞 NOTAS TÉCNICAS

- Todas las historias usan roles/permisos existentes en Keycloak
- Compatible con fecha actual (marzo 2026)
- Reutiliza servicios ya implementados (RentalService, ClientService, etc.)
- Soporta navegación entre páginas (paginación)
- Validación de campos obligatorios

---

**Versión**: 1.0  
**Fecha**: 02/03/2026  
**Estado**: Listo para Implementación
