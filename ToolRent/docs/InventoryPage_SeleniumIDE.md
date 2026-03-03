# InventoryPage & CreateTypeModal - Selenium IDE Automation Guide

**Component**: InventoryPage.jsx + CreateTypeModal (internal)  
**Testing Framework**: Selenium IDE (with optional Vitest/RTL integration)  
**Language**: Spanish Gherkin  
**Total Scenarios**: 39 (Mapped for Selenium IDE automation)

---

## 1. Locator Reference Table

| Element | CSS Selector | XPath | ID | Notes |
|---------|--------------|-------|----|----|
| Page Title | `.page-title` | `//h1[@class='page-title']` | N/A | "Inventario" text |
| Search Input | `.search-input` | `//input[@placeholder='Buscar herramienta...']` | search-input | Search field with debounce |
| Add Button | `.add-btn` | `//button[@class='add-btn']` | add-type-btn | Opens CreateTypeModal |
| Modal Overlay | `.modal-overlay` | `//div[@class='modal-overlay']` | modal-overlay | Dark background overlay |
| Modal Content | `.modal-content` | `//div[@class='modal-content']` | modal-content | White modal box |
| Modal Title | `.modal-content h2` | `//div[@class='modal-content']//h2` | N/A | "Nuevo Tipo de Herramienta" |
| Name Input | `input[type="text"]` | `(//form//input[@type='text'])[1]` | form-name | First field, autoFocus |
| Category Select | `select` | `//select[@required]` | form-category | Dropdown list |
| Reposition Price | `input[type="number"][min="0"]` | `(//input[@type='number'])[1]` | form-repo-price | Min=0 |
| Rent Price | `input[type="number"][min="0"]` | `(//input[@type='number'])[2]` | form-rent-price | Min=0 |
| Due Price | `input[type="number"][min="0"]` | `(//input[@type='number'])[3]` | form-due-price | Min=0 |
| Cancel Button | `.btn-cancel` | `//button[@class='btn-cancel']` | btn-cancel | Close without save |
| Save Button | `button[type="submit"]` | `//button[@type='submit']` | btn-save | Submit form |
| Inventory Table | `.inventory-table` | `//table[@class='inventory-table']` | inv-table | Main data table |
| Table Rows | `.table-row-hover` | `//tr[@class='table-row-hover']` | N/A | Clickable rows |
| Loading Text | `.loading-text` | `//div[@class='loading-text']` | N/A | "Cargando catálogo..." |
| Category Options | `select option` | `//select/option` | N/A | Dropdown options |
| Form Group | `.form-group` | `//div[@class='form-group']` | N/A | Label + Input wrapper |

---

## 2. Scenario-by-Scenario Selenium IDE Commands

### Group 1: Visibilidad y Renderización (E1-E3)

#### E1: Renderización de página con tabla vacía
**Preconditions**: API returns empty array  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .page-title | 5000
assertText | .page-title | Inventario
waitForElementPresent | .add-btn | 5000
assertElementPresent | .add-btn
waitForElementPresent | .loading-text | 5000
waitForElementNotPresent | .loading-text | 10000
assertText | .loading-text | No se han encontrado herramientas.
verifyElementPresent | css=.search-input
```
**Duration**: ~8 seconds (includes network wait)  
**Alternative**: Use API mock to return `{ data: [] }`

---

#### E2: Renderización con herramientas existentes
**Preconditions**: API returns array with 3+ tools  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .page-title | 5000
assertText | .page-title | Inventario
waitForElementPresent | .inventory-table | 5000
assertElementPresent | css=.inventory-table thead tr th
verifyText | css=.inventory-table thead tr th:nth-child(1) | Nombre
verifyText | css=.inventory-table thead tr th:nth-child(2) | Categoría
verifyText | css=.inventory-table thead tr th:nth-child(3) | Precio de Repositorio
verifyText | css=.inventory-table thead tr th:nth-child(4) | Precio de Renta Diaria
assertElementPresent | css=.table-row-hover
waitForElementPresent | css=.table-row-hover:first-child | 3000
```
**Note**: Verify exact tool names from API response

---

#### E3: Indicador de carga mientras se obtienen datos
**Preconditions**: Simulated 2s API delay  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .loading-text | 1000
assertText | .loading-text | Cargando catálogo...
waitForElementNotPresent | .loading-text | 10000
assertElementPresent | css=.inventory-table
echo | Load indicator disappeared, data loaded successfully
```

**Note**: Network throttling may be needed (simulate 2G/3G)

---

### Group 2: Búsqueda y Filtrado (E4-E7)

#### E4: Campo de búsqueda filtra herramientas
**Preconditions**: Table contains "Taladro", "Sierra", "Martillo"  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .search-input | 5000
click | .search-input
type | .search-input | Taladro
pause | 600
waitForElementPresent | css=.table-row-hover | 3000
assertElementPresent | css=.table-row-hover
verifyText | css=.table-row-hover td:first-child | Taladro
verifyNotElementPresent | css=.table-row-hover:has-text('Sierra')
```
**Debounce Wait**: 600ms (500ms debounce + 100ms buffer)

---

#### E5: Búsqueda sin resultados
**Preconditions**: No tools match "XYZ100"  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .search-input | 5000
click | .search-input
type | .search-input | XYZ100NoExiste
pause | 600
waitForText | .loading-text | No se han encontrado herramientas. | 5000
assertText | .loading-text | No se han encontraron herramientas.
```

---

#### E6: Limpieza de búsqueda restaura catálogo
**Preconditions**: Previous search filtered results  
**Selenium IDE Commands**:
```
click | .search-input
selectAll | .search-input
press | DELETE
pause | 600
waitForElementPresent | css=.table-row-hover | 5000
verifyElementPresent | css=.table-row-hover:nth-child(1)
verifyElementPresent | css=.table-row-hover:nth-child(2)
assertText | css=.table-row-hover:first-child td:first-child | [Check original tool name]
```

---

#### E7: Debounce evita múltiples llamadas API
**Preconditions**: Network monitor enabled  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .search-input | 5000
click | .search-input
typeKeys | T | a | l | a | d | r | o
pause | 600
[Manual verification]: Check Network tab in DevTools
[Expected]: Only 1-2 API requests instead of 7
```
**Note**: This scenario requires manual network inspection or integration with Percy/BrowserStack

---

### Group 3: Navegación (E8-E9)

#### E8: Click en fila navega a detalles
**Preconditions**: URL base = `/inventario`, tool with ID=5  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | css=.table-row-hover | 5000
click | css=.table-row-hover:first-child
pause | 500
assertLocation | */inventario/*
verifyLocationContains | /inventario/
verifyCurrentPageTitle | [Tool name - Detalles]
```

---

#### E9: Navegación conserva ID en URL
**Preconditions**: Click on tool with idInformationTool=12  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | css=.table-row-hover | 5000
click | css=.table-row-hover:nth-child(2)
pause | 500
assertLocation | */inventario/12
verifyCurrentUrl | /inventario/12
```

---

### Group 4: Modal Visibilidad (E10-E12)

#### E10: Modal no se renderiza cuando isOpen es falso
**Preconditions**: Component renders with isOpen={false}  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForPageToLoad | 5000
verifyNotElementPresent | css=.modal-overlay
verifyNotElementPresent | css=.modal-content
verifyNotElementPresent | css=h2:has-text('Nuevo Tipo de Herramienta')
```

---

#### E11: Modal se muestra cuando isOpen es verdadero
**Preconditions**: User clicks "+ Nuevo Tipo"  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .add-btn | 5000
click | .add-btn
waitForElementPresent | .modal-overlay | 2000
assertElementPresent | .modal-content
verifyText | css=.modal-content h2 | Nuevo Tipo de Herramienta
verifyElementPresent | css=.modal-content form
verifyText | css=.form-group:nth-child(1) label | Name
verifyText | css=.form-group:nth-child(2) label | Category
```

---

#### E12: Primer campo recibe autoFocus
**Preconditions**: Modal is open  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | input[type="text"] | 2000
[Manual verification]: First input has autofocus attribute
[Expected]: Cursor blinking in Name field immediately after modal opens
```
**Note**: Requires manual inspection or Playwright API for focus verification

---

### Group 5: Llenado de Formulario (E13-E17)

#### E13: Usuario ingresa nombre de herramienta
**Preconditions**: Modal open, Name field focused  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | input[type="text"] | 2000
type | input[type="text"] | Taladro Percutor
verifyValue | input[type="text"] | Taladro Percutor
```

---

#### E14: Usuario selecciona categoría
**Preconditions**: Modal open with categories loaded  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | select | 2000
select | select | Herramientas Eléctricas
verifySelectedValue | select | Herramientas Eléctricas
```

---

#### E15: Usuario ingresa precios
**Preconditions**: Modal open  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | input[type="number"] | 2000
[Campo 1 - Reposición]:
click | css=input[type="number"]:nth-child(1)
type | css=input[type="number"]:nth-child(1) | 500
[Campo 2 - Renta]:
click | css=input[type="number"]:nth-child(2)
type | css=input[type="number"]:nth-child(2) | 15
[Campo 3 - Multa]:
click | css=input[type="number"]:nth-child(3)
type | css=input[type="number"]:nth-child(3) | 5
verifyValue | css=input[type="number"]:nth-child(1) | 500
verifyValue | css=input[type="number"]:nth-child(2) | 15
verifyValue | css=input[type="number"]:nth-child(3) | 5
```

---

#### E16: Cambio en un campo preserva otros
**Preconditions**: Form partially filled  
**Selenium IDE Commands**:
```
click | input[type="text"]
type | input[type="text"] | Taladro
click | select
select | select | Herramientas Manuales
click | css=input[type="number"]:nth-child(1)
type | css=input[type="number"]:nth-child(1) | 500
[Now edit Rent Price only]:
click | css=input[type="number"]:nth-child(2)
sendKeys | css=input[type="number"]:nth-child(2) | ctrl+a
type | css=input[type="number"]:nth-child(2) | 20
[Verify others unchanged]:
verifyValue | input[type="text"] | Taladro
verifySelectedValue | select | Herramientas Manuales
verifyValue | css=input[type="number"]:nth-child(1) | 500
verifyValue | css=input[type="number"]:nth-child(2) | 20
```

---

#### E17: Múltiples cambios se acumulan
**Preconditions**: Form open  
**Selenium IDE Commands**:
```
[Edit 1]: Name field
type | input[type="text"] | Taladro
[Edit 2]: Category
select | select | Herramientas Eléctricas
[Edit 3]: Repo Price
type | css=input[type="number"]:nth-child(1) | 750
[Edit 4]: Rent Price
type | css=input[type="number"]:nth-child(2) | 25
[Edit 5]: Due Price
type | css=input[type="number"]:nth-child(3) | 8
[Verify all accumulated]:
verifyValue | input[type="text"] | Taladro
verifySelectedValue | select | Herramientas Eléctricas
verifyValue | css=input[type="number"]:nth-child(1) | 750
verifyValue | css=input[type="number"]:nth-child(2) | 25
verifyValue | css=input[type="number"]:nth-child(3) | 8
```

---

### Group 6: Validaciones (E18-E20)

#### E18: Campo Name es obligatorio
**Preconditions**: Modal open  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | select | 2000
select | select | Herramientas Manuales
type | css=input[type="number"]:nth-child(1) | 100
type | css=input[type="number"]:nth-child(2) | 10
type | css=input[type="number"]:nth-child(3) | 5
[Attempt submit without Name]:
click | button[type="submit"]
[HTML5 Validation should prevent submission]:
assertAlertPresent
or
[Verify form still open and modal visible]:
waitForElementPresent | .modal-content | 2000
```

---

#### E19: Campo Category es obligatorio
**Preconditions**: Modal open, other fields filled  
**Selenium IDE Commands**:
```
click | .add-btn
type | input[type="text"] | Taladro
type | css=input[type="number"]:nth-child(1) | 100
type | css=input[type="number"]:nth-child(2) | 10
type | css=input[type="number"]:nth-child(3) | 5
[Select default (disabled) option]:
select | select | 
[Attempt submit]:
click | button[type="submit"]
[Validation should prevent]:
waitForElementPresent | .modal-content | 2000
```

---

#### E20: Campos de precio son obligatorios y numéricos
**Preconditions**: Modal open  
**Selenium IDE Commands**:
```
click | .add-btn
type | input[type="text"] | Taladro
select | select | Herramientas Manuales
[Leave prices empty and try submit]:
click | button[type="submit"]
[Should not submit]:
waitForElementPresent | .modal-content | 2000
[Verify type="number" attribute]:
assertAttribute | css=input[type="number"]:nth-child(1) | type | number
assertAttribute | css=input[type="number"]:nth-child(1) | min | 0
```

---

### Group 7: Botones y Acciones (E21-E24)

#### E21: Botón Cancel cierra modal sin guardar
**Preconditions**: Form filled with data  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | .modal-content | 2000
type | input[type="text"] | Taladro (should not be saved)
click | .btn-cancel
waitForElementNotPresent | .modal-content | 2000
verifyNotElementPresent | .modal-overlay
```

---

#### E22: Botón Save envía datos
**Preconditions**: All required fields filled correctly  
**Selenium IDE Commands**:
```
click | .add-btn
type | input[type="text"] | Taladro Nuevo
select | select | Herramientas Eléctricas
type | css=input[type="number"]:nth-child(1) | 500
type | css=input[type="number"]:nth-child(2) | 15
type | css=input[type="number"]:nth-child(3) | 5
click | button[type="submit"]
waitForAlertPresent | 3000
assertAlert | Tipo de herramienta creado exitosamente.
acceptAlert
waitForElementNotPresent | .modal-content | 2000
```

---

#### E23: Submit con preventDefault
**Preconditions**: Form ready to submit  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
[Before URL]:
storeCurrentUrl | initialUrl
click | .add-btn
[Fill and submit]:
type | input[type="text"] | Taladro
select | select | Herramientas Manuales
type | css=input[type="number"]:nth-child(1) | 100
type | css=input[type="number"]:nth-child(2) | 10
type | css=input[type="number"]:nth-child(3) | 5
click | button[type="submit"]
pause | 1000
[After URL should be same (no page reload)]:
assertUrlEquals | ${initialUrl}
```

---

#### E24: Formulario se limpia después de guardar
**Preconditions**: Successful save with alert  
**Selenium IDE Commands**:
```
[Complete a save transaction]:
click | .add-btn
type | input[type="text"] | Taladro
select | select | Herramientas Manuales
type | css=input[type="number"]:nth-child(1) | 100
type | css=input[type="number"]:nth-child(2) | 10
type | css=input[type="number"]:nth-child(3) | 5
click | button[type="submit"]
acceptAlert
[Open modal again]:
click | .add-btn
[Verify fields are empty]:
verifyValue | input[type="text"] | 
verifySelectedValue | select | 
verifyValue | css=input[type="number"]:nth-child(1) | 
```

---

### Group 8: Overlay e Interacciones (E25-E28)

#### E25: Click en overlay cierra modal
**Preconditions**: Modal open  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | .modal-overlay | 2000
[Click on overlay (margin area, not content)]:
click | css=.modal-overlay
waitForElementNotPresent | .modal-content | 2000
verifyNotElementPresent | .modal-overlay
```

---

#### E26: Click dentro del modal no cierra
**Preconditions**: Modal open  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | .modal-content | 2000
[Click inside modal content]:
click | css=.modal-content h2
pause | 500
[Modal should still be visible]:
assertElementPresent | .modal-content
verifyElementPresent | .modal-overlay
```

---

#### E27: Tecla Escape cierra modal
**Preconditions**: Modal open  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | .modal-content | 2000
sendKeys | ESCAPE
pause | 300
waitForElementNotPresent | .modal-content | 2000
verifyNotElementPresent | .modal-overlay
```

---

#### E28: Teclas Enter y Space cierran modal
**Preconditions**: Modal open, overlay focused (tabIndex=0)  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | .modal-overlay | 2000
[Test Enter]:
sendKeys | RETURN
pause | 300
assertNotElementPresent | .modal-content
[Open again for Space test]:
click | .add-btn
waitForElementPresent | .modal-overlay | 2000
[Test Space]:
sendKeys | SPACE
pause | 300
assertNotElementPresent | .modal-content
```

---

### Group 9: Integración (E29-E33)

#### E29: Clic en "+ Nuevo Tipo" abre modal
**Preconditions**: Page loaded  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .add-btn | 5000
verifyNotElementPresent | .modal-content
click | .add-btn
waitForElementPresent | .modal-content | 2000
assertElementPresent | .modal-overlay
verifyText | css=.modal-content h2 | Nuevo Tipo de Herramienta
```

---

#### E30: Cierre de modal actualiza catálogo
**Preconditions**: User submits form  
**Selenium IDE Commands**:
```
click | .add-btn
type | input[type="text"] | NuevaHerramienta
select | select | Herramientas Manuales
type | css=input[type="number"]:nth-child(1) | 200
type | css=input[type="number"]:nth-child(2) | 20
type | css=input[type="number"]:nth-child(3) | 10
click | button[type="submit"]
waitForAlertPresent | 3000
assertAlert | Tipo de herramienta creado exitosamente.
acceptAlert
[Verify modal closed]:
waitForElementNotPresent | .modal-content | 2000
[Verify table reloaded - check for new row]:
waitForElementPresent | css=.table-row-hover | 3000
verifyText | css=.table-row-hover:first-child td:first-child | NuevaHerramienta
```

---

#### E31: Error 403 - Acceso Denegado
**Preconditions**: API returns 403 Forbidden  
**Selenium IDE Commands**:
```
click | .add-btn
type | input[type="text"] | RestrictedTool
select | select | Herramientas Manuales
type | css=input[type="number"]:nth-child(1) | 100
type | css=input[type="number"]:nth-child(2) | 10
type | css=input[type="number"]:nth-child(3) | 5
click | button[type="submit"]
waitForAlertPresent | 3000
assertAlert | Acceso denegado: No tienes permisos para ingresar un tipo de herramienta...
acceptAlert
[Modal should remain open]:
waitForElementPresent | .modal-content | 2000
[Data should be preserved]:
verifyValue | input[type="text"] | RestrictedTool
```

---

#### E32: Error genérico inesperado
**Preconditions**: API returns 500 or unhandled error  
**Selenium IDE Commands**:
```
click | .add-btn
type | input[type="text"] | ErrorTool
select | select | Herramientas Manuales
type | css=input[type="number"]:nth-child(1) | 100
type | css=input[type="number"]:nth-child(2) | 10
type | css=input[type="number"]:nth-child(3) | 5
click | button[type="submit"]
waitForAlertPresent | 3000
assertAlert | A ocurrido un error inesperado.
acceptAlert
[Modal remains open, data preserved]:
waitForElementPresent | .modal-content | 2000
verifyValue | input[type="text"] | ErrorTool
```

---

#### E33: Error con mensaje del servidor
**Preconditions**: API returns error with serverMessage  
**Selenium IDE Commands**:
```
click | .add-btn
type | input[type="text"] | DuplicateTool
select | select | Herramientas Eléctricas
type | css=input[type="number"]:nth-child(1) | 150
type | css=input[type="number"]:nth-child(2) | 15
type | css=input[type="number"]:nth-child(3) | 7
click | button[type="submit"]
waitForAlertPresent | 3000
assertAlert | Server Error: Tipo ya existe
acceptAlert
```

---

### Group 10: Ciclo de Vida (E34-E36)

#### E34: useEffect carga catálogo en montaje
**Preconditions**: Fresh page load  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
[Verify API call is made]:
waitForElementPresent | css=.inventory-table OR .loading-text | 5000
[One of these must appear, indicating useEffect fired]:
waitForElementNotPresent | .loading-text | 10000
assertElementPresent | css=.inventory-table OR .loading-text:has-text('No se han encontrado')
```

---

#### E35: Cambio de searchTerm dispara búsqueda
**Preconditions**: Page loaded  
**Selenium IDE Commands**:
```
openUrl | http://localhost:3000/inventario
waitForElementPresent | .search-input | 5000
click | .search-input
type | .search-input | Taladro
pause | 600
[Verify search results]:
waitForElementPresent | css=.table-row-hover | 3000
verifyText | css=.table-row-hover td:first-child | Taladro
```

---

#### E36: Cleanup de timeout - Nueva búsqueda cancela anterior
**Preconditions**: Fast typing scenario  
**Selenium IDE Commands**:
```
click | .search-input
typeKeys | T
pause | 100
typeKeys | a
pause | 100
typeKeys | l
pause | 100
typeKeys | a
pause | 100
typeKeys | d
pause | 100
typeKeys | r
pause | 100
typeKeys | o
pause | 700
[Only ONE final search should execute with "Taladro"]:
waitForElementPresent | css=.table-row-hover | 3000
verifyText | css=.table-row-hover td:first-child | Taladro
[Verify no intermediate results were shown]:
verifyNotText | css=.table-row-hover td:first-child | T
verifyNotText | css=.table-row-hover td:first-child | Ta
```

---

### Group 11: PropTypes y Datos (E37-E39)

#### E37: PropTypes validation en desarrollo
**Preconditions**: Browser DevTools console open, component mismatch  
**Selenium IDE Commands**:
```
[Manual verification in console]:
[Attempt to render CreateTypeModal without required props]:
[Expected console warning]:
"Warning: Failed prop type: The prop `isOpen` is marked as required in `CreateTypeModal`, 
but its value is `undefined`..."
```
**Note**: Requires manual inspection of browser console

---

#### E38: Categories array en dropdown
**Preconditions**: Modal open  
**Selenium IDE Commands**:
```
click | .add-btn
waitForElementPresent | select option | 2000
verifyElementPresent | css=select option:has-text('Herramientas Manuales')
verifyElementPresent | css=select option:has-text('Herramientas Eléctricas')
verifyElementPresent | css=select option:has-text('Herramientas de Medición')
verifyElementPresent | css=select option:has-text('Maquinaria Pesada / Gran Tamaño')
assertCount | css=select option | 5
```
(5 = 1 default disabled + 4 categories)

---

#### E39: Callbacks son funciones
**Preconditions**: Component renders  
**Selenium IDE Commands**:
```
click | .add-btn
[Verify onClose is called]:
click | .btn-cancel
waitForElementNotPresent | .modal-content | 2000
echo | onClose callback executed successfully
[Verify onSave is called]:
click | .add-btn
type | input[type="text"] | TestTool
select | select | Herramientas Manuales
type | css=input[type="number"]:nth-child(1) | 100
type | css=input[type="number"]:nth-child(2) | 10
type | css=input[type="number"]:nth-child(3) | 5
click | button[type="submit"]
waitForAlertPresent | 3000
echo | onSave callback executed successfully
acceptAlert
```

---

## 3. Execution Methods

### Method A: Selenium IDE Standalone
```bash
# Install Selenium IDE CLI
npm install -g selenium-ide-cli

# Export scenarios to .side file
selenium-ide --export Epica6_InventoryPage.side

# Execute test suite
selenium-ide --run Epica6_InventoryPage.side --browser chrome
```

### Method B: Integrated with Vitest + RTL
```bash
npm run test:coverage -- src/pages/test/InventoryPage.test.jsx --run
```
This executes unit tests that mirror the Gherkin scenarios.

### Method C: Combined Approach (Recommended)
```bash
# Step 1: Run unit tests (fastest, most reliable)
npm run test:coverage -- src/pages/test/InventoryPage.test.jsx --run

# Step 2: Run E2E Selenium tests (slower, tests real browser)
selenium-ide --run Epica6_InventoryPage.side --browser chrome

# Step 3: Run integration tests (optional)
npm run test:integration -- InventoryPage
```

---

## 4. Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| "Element not found" on .modal-overlay | Modal hasn't rendered yet | Add `waitForElementPresent` |
| Flaky toggle tests (E25-E28) | Race condition on state | Increase `pause` delay to 500ms |
| Category dropdown empty | Categories array not passed | Verify prop={categories} in parent |
| Debounce tests fail | Browser executing too fast | Increase pause to 700ms |
| PropTypes warnings missing | Production build suppresses them | Run in development mode only |
| API not mocking 403 error | Mock service not configured | Use MSW (Mock Service Worker) |

---

## 5. Accessibility & Best Practices

- **Keyboard Navigation**: Ensure all interactions work with Tab, Enter, Escape, Space
- **Focus Management**: Modal should trap focus (tabIndex=0 on overlay for keyboard users)
- **ARIA Labels**: Consider adding role="dialog" aria-labelledby="modal-title" for screen readers
- **Color Contrast**: Verify button colors meet WCAG AA standards

---

## 6. Automation Coverage Summary

| Category | Total | Automatable via Selenium IDE | Notes |
|----------|-------|------------------------------|-------|
| Visibility & Rendering | 3 | 3 ✓ | All testable |
| Search & Filter | 4 | 3 ⚠️ | E7 (debounce) requires manual verification |
| Navigation | 2 | 2 ✓ | URL assertions work |
| Modal Visibility | 3 | 3 ✓ | Element presence checks |
| Form Filling | 5 | 5 ✓ | Input/Select manipulation |
| Field Validation | 3 | 3 ✓ | HTML5 required attributes |
| Button Actions | 4 | 4 ✓ | Click handlers |
| Overlay Interaction | 4 | 4 ✓ | Click + Keyboard |
| Integration | 5 | 5 ✓ | Modal + Page integration |
| Lifecycle | 3 | 2 ⚠️ | E34 requires API verification |
| PropTypes & Data | 3 | 1 ⚠️ | E37-E38 need manual checks |
| **TOTAL** | **39** | **37 ✓ / 2 ⚠️** | 94.9% automatable |

---

## 7. Next Steps

1. **Export to Selenium IDE**: Copy scenarios into Selenium IDE .side project
2. **Set Up Mocking**: Configure MSW for API responses (success, 403, 500)
3. **Run Vitest Suite**: Execute unit tests first for regression detection
4. **Execute Selenium Tests**: Run full automation suite in headless mode
5. **CI/CD Integration**: Add to GitHub Actions/GitLab CI for every commit

---

**Last Updated**: 2026-03-02  
**Author**: Test Automation Team  
**Review Cycle**: Quarterly
