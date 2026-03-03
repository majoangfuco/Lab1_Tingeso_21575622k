# 📚 ÍNDICE - ÉPICA 6: REPORTES Y CONSULTAS
## Historia de Usuario Adaptadas para ToolRent - Formato Gherkin & Selenium IDE

---

## 📂 ESTRUCTURA DE ARCHIVOS ENTREGADOS

```
ToolRent/
├── src/
│   └── features/
│       └── Epica6_ReportesYConsultas.feature  ⭐ ARCHIVO PRINCIPAL
│
├── docs/
│   ├── Epica6_MapeoSelenium_IDE.md             📍 Guía de Automatización
│   ├── Epica6_ResumenEjecutivo.md              📋 Detalles Técnicos
│   └── INDEX_Epica6.md                         📖 Este archivo
│
└── tests/ (Futuro)
    └── selenium/ (Para Selenium IDE)
        ├── E1_HU008_PreslamosVigentes.side
        ├── E2_HU008_PreslamosAtrasados.side
        ├── ... (más tests)
```

---

## 📄 DESCRIPCIÓN DEL CONTENIDO

### 1️⃣ **Epica6_ReportesYConsultas.feature** ⭐ PRINCIPAL
**Ubicación**: `/src/features/Epica6_ReportesYConsultas.feature`

📍 **¿Qué es?**
- Especificación en formato **Gherkin** (Given-When-Then)
- Contiene todas las historias de usuario y escenarios
- Listo para integrar con Cucumber, BDD frameworks, o Selenium IDE

✅ **Contenido**:
- **7 Historias de Usuario** (HU008-HU014)
- **22 Escenarios** (3-4 por historia)
- **Lenguaje**: Español
- **Formato**: Gherkin estándar

📋 **Historias Incluidas**:
```
HU008 - Listar Préstamos Activos               [4 escenarios]
HU009 - Filtrar Reportes por Rango de Fechas  [3 escenarios]
HU010 - Ranking de Herramientas Prestadas      [3 escenarios]
HU011 - Listado de Clientes con Atrasos        [3 escenarios]
HU012 - Herramientas en "En Reparación"        [3 escenarios]
HU013 - Kardex / Historial de Movimientos      [3 escenarios]
HU014 - Impresión y Exportación de Reportes    [3 escenarios]
```

---

### 2️⃣ **Epica6_MapeoSelenium_IDE.md** 📍 GUÍA DE AUTOMATIZACIÓN
**Ubicación**: `/docs/Epica6_MapeoSelenium_IDE.md`

🎯 **¿Qué es?**
- Guía detallada para **automatizar cada escenario en Selenium IDE**
- Mapeo de escenarios Gherkin → Comandos Selenium
- Selectores CSS/XPath propuestos
- Configuración y troubleshooting

✅ **Secciones**:
1. **Referencia de Elementos (Locators)**
   - URLs esperadas
   - Selectores comunes
   - Tabla de elementos

2. **Mapeo por Historia** (HU008-HU014)
   - Escenario Gherkin
   - Comandos Selenium IDE paso a paso
   - Variables esperadas

3. **Guía de Ejecución**
   - Instalación de Selenium IDE
   - Estructura de tests
   - Comandos CLI para ejecutar
   - Buenas prácticas
   - Troubleshooting

📌 **Ejemplo de Mapeo**:
```gherkin
Escenario: E1-HU008 Visualización de préstamos vigentes
```
↓ Se convierte en:
```
1. open | /reportes/prestamos-activos
2. waitForElementPresent | table.reportes-table
3. assertElementPresent | th:contains("Cliente")
4. assertText | tr:nth-child(1) td.estado | Vigente
5. assertAttribute | tr:nth-child(1) | class | *vigente*
```

---

### 3️⃣ **Epica6_ResumenEjecutivo.md** 📋 DETALLES TÉCNICOS
**Ubicación**: `/docs/Epica6_ResumenEjecutivo.md`

💼 **¿Qué es?**
- Adaptación técnica de historias para **ToolRent específicamente**
- URLs, servicios, APIs y fórmulas
- Estructura de datos esperada
- Validaciones y reglas de negocio

✅ **Secciones**:

**A. RESUMEN EJECUTIVO**
- 7 historias, 22 escenarios
- Historias incluidas
- Adaptaciones realizadas

**B. DETALLES POR HISTORIA**
Cada HU incluye:
- 🎯 Objetivo
- 🔧 Elementos ToolRent (servicios, conexiones)
- 📍 Escenarios
- 📡 APIs/Servicios necesarios
- 🔗 Dependencias funcionales
- 📊 Fórmulas y cálculos

**C. EJEMPLOS ESPECÍFICOS**
```
HU008 - Asociado a RentalService.getActiveRentals()
HU010 - Usa InventoryService.getToolRanking()
HU011 - Calcula multa con fórmula: duePrice × días_atraso
HU013 - Ya implementado en: KardexPage.jsx
```

**D. TECNOLOGÍAS SUGERIDAS**
- Librerías: jspdf, papaparse, react-table, date-fns
- Endpoints esperados
- Estructura de datos

**E. CRITERIOS DE ÉXITO**
- Checklist por historia
- Criterios generales

---

## 🚀 CÓMO USAR ESTOS ARCHIVOS

### Opción 1: BDD con Cucumber
```bash
# Copiar feature file a proyecto Cucumber
cp src/features/Epica6_ReportesYConsultas.feature tests/features/

# Ejecutar tests
npm run test:cucumber -- tests/features/Epica6_ReportesYConsultas.feature
```

### Opción 2: Selenium IDE (Frontend Testing)
```bash
# 1. Instalar Selenium IDE en Chrome/Firefox
# 2. Importar proyecto desde guía Epica6_MapeoSelenium_IDE.md
# 3. Crear tests .side siguiendo los mapeos
# 4. Ejecutar tests
npx selenium-side-runner -c "chromedriver" tests/*.side
```

### Opción 3: Lectura para Implementación
1. 📖 Lee **Epica6_ResumenEjecutivo.md** para entender qué implementar
2. 📍 Usa **Epica6_MapeoSelenium_IDE.md** como referencia de selectores/URLs
3. 🔄 Implementa componentes en React conectando con servicios
4. ✅ Valida con Selenium IDE usando mappeos

---

## 📊 ESTADÍSTICAS

| Métrica | Valor |
|---------|-------|
| Historias de Usuario | 7 |
| Escenarios Totales | 22 |
| Escenarios Promedio/HU | 3.14 |
| Lenguaje | Español (Gherkin) |
| Formato | .feature + .md |
| Automatizables en Selenium IDE | 100% (22/22) |
| Nivel de Detalle | Alto (mapeos + selectores) |
| APIs Necesarias | ~20 endpoints |

---

## 🎯 VALIDACIÓN CRUZADA

Cada archivo valida información de los otros:

```
Epica6_ReportesYConsultas.feature
    ↓
    Describe escenarios en Gherkin
    
    ↓
    
Epica6_MapeoSelenium_IDE.md
    ↓
    Mapea cada escenario a comandos Selenium
    
    ↓
    
Epica6_ResumenEjecutivo.md
    ↓
    Explica servicios/APIs/datos para cada HU
```

**Consistencia**: Los 3 documentos hablan del mismo conjunto de historia (HU008-HU014)

---

## ✅ CHECKLIST DE USO

- [ ] Revisar Epica6_ReportesYConsultas.feature para entender requisitos
- [ ] Consultar Epica6_ResumenEjecutivo.md para detalles técnicos
- [ ] Implementar componentes React en `/src/pages/`
- [ ] Crear endpoints backend según especificación
- [ ] Usar Epica6_MapeoSelenium_IDE.md para crear tests de automatización
- [ ] Ejecutar tests Selenium IDE
- [ ] Verificar criterios de éxito
- [ ] (Opcional) Integrar con Cucumber/BDD para pruebas unitarias

---

## 🔗 REFERENCIAS INTERNAS

**Componentes Existentes Relacionados**:
- `KardexPage.jsx` - Implementa HU013 (parcialmente)
- `RentalService.js` - APIs para HU008, HU009, HU011
- `InventoryService.js` - APIs para HU010, HU012
- `KardexService.js` - APIs para HU013
- `ClientService.js` - APIs para HU011

**Historias Previas (Dependencias)**:
- HU002 - Registrar Arrendamiento (Épica 2)
- HU003 - Registrar Devolución (Épica 2)
- HU004 - Registrar Multa por Atraso (Épica 4)
- HU006 - Registrar Devolución con Daño (Épica 3)

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿En qué orden debo implementar las historias?**
R: Se sugiere: HU008 → HU009 → HU010 → HU011 → HU012 → HU013 → HU014

**P: ¿Todos los escenarios son automatizables?**
R: Sí, al 100%. Cada uno tiene su mapeo a Selenium IDE

**P: ¿Necesito todas las librerías sugeridas?**
R: No, depende de qué historias implementes primero

**P: ¿Los archivos están listos para producción?**
R: Los archivos de especificación sí. El código (implementación) está en "próximos pasos"

**P: ¿Puedo usar estos archivos con Cucumber?**
R: Sí, el .feature es estándar Gherkin

---

## 📈 PRÓXIMA FASE

Después de implementar las 7 historias propuestas, considera:

- **Épica 6B**: Gráficos y dashboards (charts)
- **Épica 6C**: Exportación a múltiples formatos (Excel, XML)
- **Épica 6D**: Reportes automáticos/programados
- **Épica 6E**: Análisis predictivo de demanda

---

## 📝 VERSIÓN Y CHANGELOG

**Versión Actual**: 1.0
**Fecha Entrega**: 02/03/2026
**Estado**: ✅ Listo para Implementación

**Cambios**:
- [v1.0] Entrega inicial con 7 HU y 22 escenarios

---

**Documentación preparada para ToolRent**  
**Sistema de Alquiler de Herramientas**  
**Épica 6: Reportes y Consultas**
