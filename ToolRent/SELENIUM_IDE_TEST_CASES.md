# 🤖 Suite de Tests Automatizados - ToolRent
**Guía de Implementación con Selenium IDE**  
**Versión: 1.0 - 2 Marzo 2026**

---

## 📋 Tabla de Contenidos
1. Setup inicial
2. Ejemplos de tests principales (Selenium IDE format)
3. Data fixtures configurables
4. Best practices
5. Troubleshooting

---

## 🔧 Setup Inicial

### Instalación de Selenium IDE
```bash
# Chrome
https://chrome.google.com/webstore -> Buscar "Selenium IDE"

# Firefox
https://addons.mozilla.org/firefox/ -> Buscar "Selenium IDE"

# Confirmación
Presionar F12 en navegador > Verificar icono de Selenium IDE en toolbar
```

### Configuración Base del Proyecto
```json
{
  "name": "ToolRent_AutomationSuite",
  "baseUrl": "http://localhost:5173",
  "timeout": 3000
}
```

---

## 📝 Test Case 1: HU001-S1 - Crear Préstamo Exitoso

### Datos Requeridos
```
Cliente: Juan Pérez (ID: 1, Estado: ACTIVO)
Herramienta: Taladro (Tipo ID: 5, Stock: >= 1)
Unidad: TAD-001 (Status: 0 - Disponible)
Fecha Inicio: 2026-03-02 08:00
Fecha Término: 2026-03-09 18:00
```

### Script Selenium IDE (Formato JSON)
```json
{
  "id": "HU001-S1-CreateRental",
  "name": "HU001-S1: Crear Préstamo Exitoso",
  "tests": [
    {
      "id": "test-1",
      "name": "Login como Empleado",
      "commands": [
        {
          "command": "open",
          "target": "http://localhost:5173/login",
          "value": ""
        },
        {
          "command": "click",
          "target": "id=email-input",
          "value": ""
        },
        {
          "command": "type",
          "target": "id=email-input",
          "value": "empleado@test.com"
        },
        {
          "command": "type",
          "target": "id=password-input",
          "value": "password123"
        },
        {
          "command": "click",
          "target": "//button[contains(text(),'Ingresar') or contains(text(),'Login')]",
          "value": ""
        },
        {
          "command": "waitForElement",
          "target": "//h1[contains(text(),'Clientes')]",
          "value": "5000"
        },
        {
          "command": "verifyElementPresent",
          "target": "//h1[contains(text(),'Clientes')]",
          "value": ""
        }
      ]
    },
    {
      "id": "test-2",
      "name": "Navegar a Cliente Juan Pérez",
      "commands": [
        {
          "command": "click",
          "target": "//tr[contains(.,'Juan Pérez')]//td[1]/a",
          "value": ""
        },
        {
          "command": "waitForElement",
          "target": "//h2[contains(text(),'Juan Pérez')]",
          "value": "3000"
        },
        {
          "command": "verifyText",
          "target": "//span[contains(@class,'status-badge')]",
          "value": "ACTIVO"
        }
      ]
    },
    {
      "id": "test-3",
      "name": "Abrir Modal de Nuevo Arriendo",
      "commands": [
        {
          "command": "click",
          "target": "//button[contains(text(),'+ Nuevo Arriendo')]",
          "value": ""
        },
        {
          "command": "waitForElement",
          "target": "//h2[contains(text(),'Nuevo Arriendo')]",
          "value": "2000"
        },
        {
          "command": "verifyText",
          "target": "//p[contains(text(),'Cliente:')]",
          "value": "Juan Pérez"
        }
      ]
    },
    {
      "id": "test-4",
      "name": "Seleccionar Tipo de Herramienta",
      "commands": [
        {
          "command": "click",
          "target": "//select[.//option[contains(text(),'Tipo de Herramienta')]]",
          "value": ""
        },
        {
          "command": "select",
          "target": "//label[contains(text(),'Tipo de Herramienta')]/../select",
          "value": "label=Taladro (Herramientas)"
        },
        {
          "command": "waitForElement",
          "target": "//label[contains(text(),'Unidad Disponible')]/../select//option[contains(text(),'TAD')]",
          "value": "2000"
        }
      ]
    },
    {
      "id": "test-5",
      "name": "Seleccionar Unidad",
      "commands": [
        {
          "command": "select",
          "target": "//label[contains(text(),'Unidad Disponible')]/../select",
          "value": "label=TAD-001 - Disponible"
        },
        {
          "command": "verifySelectedValue",
          "target": "//label[contains(text(),'Unidad Disponible')]/../select",
          "value": ""
        }
      ]
    },
    {
      "id": "test-6",
      "name": "Ingresar Fechas",
      "commands": [
        {
          "command": "click",
          "target": "//label[contains(text(),'Fecha Inicio')]/../input",
          "value": ""
        },
        {
          "command": "type",
          "target": "//label[contains(text(),'Fecha Inicio')]/../input",
          "value": "03022026"
        },
        {
          "command": "type",
          "target": "//label[contains(text(),'Fecha Inicio')]/../input",
          "value": "0800a"
        },
        {
          "command": "click",
          "target": "//label[contains(text(),'Fecha Término')]/../input",
          "value": ""
        },
        {
          "command": "type",
          "target": "//label[contains(text(),'Fecha Término')]/../input",
          "value": "03092026"
        },
        {
          "command": "type",
          "target": "//label[contains(text(),'Fecha Término')]/../input",
          "value": "0600p"
        }
      ]
    },
    {
      "id": "test-7",
      "name": "Agregar Herramienta al Carrito",
      "commands": [
        {
          "command": "click",
          "target": "//button[contains(text(),'+ Agregar al Arriendo')]",
          "value": ""
        },
        {
          "command": "waitForElement",
          "target": "//div[contains(@class,'cart')]//tr[contains(.,'TAD-001')]",
          "value": "2000"
        },
        {
          "command": "verifyElementPresent",
          "target": "//div[contains(@class,'cart')]//tr[contains(.,'TAD-001')]",
          "value": ""
        }
      ]
    },
    {
      "id": "test-8",
      "name": "Confirmar Arriendo",
      "commands": [
        {
          "command": "click",
          "target": "//button[contains(text(),'Confirmar Arriendo')]",
          "value": ""
        },
        {
          "command": "waitForAlert",
          "target": "",
          "value": "3000"
        },
        {
          "command": "assertAlert",
          "target": "",
          "value": "¡Arriendo creado!"
        }
      ]
    },
    {
      "id": "test-9",
      "name": "Verificar Nuevo Arriendo en Histórico",
      "commands": [
        {
          "command": "waitForElement",
          "target": "//h2[contains(text(),'Juan Pérez')]",
          "value": "2000"
        },
        {
          "command": "click",
          "target": "//select[contains(@class,'filter-select')]",
          "value": ""
        },
        {
          "command": "select",
          "target": "//select[contains(@class,'filter-select')]",
          "value": "label=En Curso"
        },
        {
          "command": "waitForElement",
          "target": "//tr[contains(.,'Taladro')]//td[contains(.,'En Curso')]",
          "value": "2000"
        },
        {
          "command": "verifyElementPresent",
          "target": "//tr[contains(.,'Taladro')]//td[contains(.,'En Curso')]",
          "value": ""
        }
      ]
    }
  ]
}
```

### Validaciones Key
✅ Login exitoso  
✅ Cliente activo visualizado  
✅ Modal abierto correctamente  
✅ Opciones de herramienta disponibles  
✅ Unidad seleccionada  
✅ Fechas ingresadas  
✅ Carrito contiene herramienta  
✅ Alert de confirmación  
✅ Arriendo visible en histórico con estado "En Curso"

---

## 📝 Test Case 2: HU003-S1 - Bloqueo por 5 Préstamos Activos

### Datos Requeridos
```
Cliente: Diego Torres (ID: 3, Estado: ACTIVO, Rentals Activos: 5)
Herramientas: Disponibles
Objetivo: Intentar crear 6to arriendo → Debe fallar
```

### Script (Formato resumido)
```
1. Login como empleado
2. Navigate: http://localhost:5173/clients/3
3. Wait for client detail page
4. Verify: Histórico muestra 5 rentals con estado "En Curso"
5. Click: "+ Nuevo Arriendo"
6. Select: Tipo de herramienta
7. Select: Unidad disponible
8. Click: "+ Agregar al Arriendo"
9. Click: "Confirmar Arriendo"
10. WaitForAlert: 3000
11. AssertAlert contains: "LIMITE ALCANZADO"
12. Verify: Histórico sigue con 5 rentals (no 6)
```

### Xpaths Relevantes
```xpath
// Verificar count de prefixRentals activos
//tr[contains(@class,'rental-row')]//td[contains(text(),'En Curso')] 
// Count should be 5

// Button para nuevo arriendo
//button[contains(text(),'+ Nuevo Arriendo')]

// Alert (nativo del browser)
// assertAlert verifica automáticamente
```

---

## 📝 Test Case 3: HU004-S1 - Devolución Exitosa

### Datos Requeridos
```
Rental ID: Activo con 2+ herramientas
Tools: TAD-001 (Buen Estado), SIE-002 (A Mantención)
Extra Charge: $0
Status esperado: "Devuelto"
```

### Script (Formato resumido)
```
1. Login
2. Navigate a rental activo
3. Click: "Devolver Arriendo"
4. For each tool:
   - Tool 1: Select "✅ Buen Estado"
   - Tool 2: Select "🔧 A Mantención"
5. Input: Cargos Extra = 0
6. Click: "Confirmar Devolución"
7. Confirm dialog (window.confirm)
8. WaitForAlert: 3000
9. AssertAlert contains: "Arriendo devuelto exitosamente"
10. Verify: Rental status = "Devuelto"
```

### Xpaths Relevantes
```xpath
// Modal de devolución
//div[contains(@class,'modal')]//h2[contains(text(),'Devolver')]

// Selectores de estado por herramienta
//div[@class='tool-item-row'][contains(.,'TAD-001')]//select

// Botón confirmar
//button[contains(text(),'Confirmar Devolución')]

// Cargos extra
//input[@class='input-money']
```

---

## 📊 Data Fixtures (Configurables)

### JSON de Datos de Prueba
```json
{
  "users": {
    "empleado": {
      "email": "empleado@test.com",
      "password": "password123",
      "role": "EMPLOYEE"
    },
    "admin": {
      "email": "admin@test.com",
      "password": "admin123",
      "role": "ADMIN"
    }
  },
  "clients": {
    "active": {
      "name": "Juan Pérez",
      "rut": "12345678-9",
      "status": "ACTIVO",
      "debt": 0
    },
    "blocked": {
      "name": "Pedro García",
      "rut": "98765432-1",
      "status": "BLOQUEADO",
      "debt": 50000
    },
    "atLimit": {
      "name": "Diego Torres",
      "rut": "11111111-1",
      "status": "ACTIVO",
      "activeRentals": 5
    }
  },
  "tools": {
    "available": [
      {
        "code": "TAD-001",
        "name": "Taladro",
        "type": "Herramientas",
        "stock": 5,
        "status": 0,
        "price": 5000
      }
    ],
    "noStock": {
      "code": "SIE-001",
      "name": "Sierra Circular",
      "stock": 0,
      "status": 0
    },
    "underMaintenance": {
      "code": "MAR-001",
      "name": "Martillo",
      "stock": 2,
      "status": 2
    }
  }
}
```

---

## 🎯 Test Case 4: HU002-S1 - Validación Stock Cero

### Objetivo
Cuando seleccionas herramienta con stock = 0, el dropdown debe estar vacío

### Script
```
1. Click "+ Nuevo Arriendo"
2. Select: "Tipo" = "Sierra Circular" (stock=0)
3. WaitForElement: 2000
4. Verify: Dropdown "Unidad Disponible" es empty
5. Verify: Text "Sin unidades disponibles" visible
6. Verify: Button "+ Agregar al Arriendo" está [disabled]
```

### Validaciones
```xpath
// Dropdown vacío (sin options excepto placeholder)
//select[contains(@class,'available-units')]//option[not(@value='')]

// Mensaje de no disponibilidad
//div[contains(text(),'Sin unidades disponibles')]

// Button deshabilitado
//button[contains(text(),'+ Agregar al Arriendo')][@disabled]
```

---

## 🎯 Test Case 5: HU005-S1 - Multa por Atraso (Manual)

### Objetivo
Registrar devolución vencida con ingreso manual de multa

### Script
```
1. Navigate a rental CON rentalStatus = 1 (ATRASADO)
2. Click: "Devolver Arriendo"
3. Select: Estado herramienta = "✅ Buen Estado"
4. Input: Cargos Extra = 15000 (multa manual)
5. Click: "Confirmar Devolución"
6. AssertAlert contains: "Monto a cobrar por devolucion: $15000"
```

### Notas
⚠️ El sistema NO calcula multa automáticamente  
⚠️ El empleado debe ingresar el monto manualmente  
⚠️ Backend suma este monto al total a cobrar

---

## 🎯 Test Case 6: HU006-S1 - Estados de Herramientas

### Objetivo
Verificar los 3 estados disponibles en devolución

### Script
```
1. Click "Devolver Arriendo"
2. Para cada herramienta: Verify select options:
   a) ✅ Buen Estado (value=0)
   b) 🔧 A Mantención (value=2)
   c) ❌ Dañada/Perdida (value=3)
3. Select diferentes valores para cada tool
4. Click "Confirmar"
5. Navigate a Inventario
6. Verify: Estados actualizado en stock
```

### Xpaths
```xpath
// Options en select
//select[@class='status-select']//option

// Verificar option exists
//option[contains(text(),'Buen Estado')]
//option[contains(text(),'Mantención')]
//option[contains(text(),'Dañada')]
```

---

## 🎯 Test Case 7: HU007-S3 - Liberación de Cupo

### Objetivo
Cliente con 5 activos → Devuelve 1 → Puede crear 1 nuevo

### Script (Flujo completo)
```
Test 1: Verificar estado inicial (5 activos)
1. Navigate a cliente Diego Torres
2. Filter: "En Curso"
3. Count rows = 5
4. Verify: Button "+ Nuevo Arriendo" está [disabled] o alert on click

Test 2: Devolver 1 arriendo
5. Click en primer rental de la lista
6. Click "Devolver Arriendo"
7. Confirm all tools = "✅ Buen Estado"
8. Click "Confirmar"
9. Wait 2s

Test 3: Verificar nuevo cupo disponible
10. Navigate back a cliente
11. Filter: "En Curso"
12. Count rows = 4
13. Click "+ Nuevo Arriendo"
14. Select herramienta y fechas
15. Click "Confirmar Arriendo"
16. AssertAlert: "¡Arriendo creado!"
17. Verify: Count = 5 again
```

---

## 💡 Best Practices

### 1. Selectores Robustos
```
❌ Evitar:
- //button[1] (posición frágil)
- id="btn123" (puede cambiar)

✅ Usar:
- //button[contains(text(),'Nuevo Arriendo')]
- //label[contains(text(),'Tipo de Herramienta')]/../select
- //div[contains(@class,'modal')]//button
```

### 2. Esperas Explícitas
```javascript
// Mal
setTimeout(() => { /* acción */ }, 1000);

// Bien
waitForElement('xpath', 3000);
waitForElementPresent('xpath', 5000);
waitForElementVisible('xpath', 2000);
```

### 3. Manejo de Alerts
```
// Esperar y confirmar
waitForAlert: 3000
assertAlert: "Mensaje esperado"
// El sistema automáticamente presiona OK después

// Para confirmaciones (window.confirm)
// Selenium IDE presiona OK por defecto
// Para presionar Cancel, usar: chooseCancel
```

### 4. Limpieza de Estado
```
// Después de cada test que crea datos
// Considerar test cleanup (no es automático)
// Pueden dejar datos para tests posteriores
// Plan: Ordenar tests por dependencia
```

### 5. Paralelización
```
// No ejecutar en paralelo
// Estos tests comparten datos (clientes, herramientas)
// Ejecutar secuencialmente es más seguro
```

---

## 🔧 Troubleshooting

### Problema: "Element not found"
```
Solución 1: Aumentar timeout
- Cambiar waitForElement timeout a 5000ms
- Verificar que la página está completamente cargada

Solución 2: Verificar selector
- Abrir DevTools (F12)
- Copiar XPath: Right click > Copy XPath
- Probar en console: $x("//tu/xpath")

Solución 3: Esperar elemento antecesor
- La página puede estar en loading state
- Esperar a que desaparezca spinner/modal
```

### Problema: "Alert not found"
```
Solución:
- Verificar que el comando previo fue ejecutado
- Algunos alerts son asincronos (después de API call)
- Aumentar timeout antes de waitForAlert
- Agregar comando: pause (500ms) antes

Ejemplo:
pause | 500
waitForAlert | 3000
assertAlert | Mensaje
```

### Problema: "Select option not found"
```
Solución:
- Inspeccionar con F12 el valor actual del select
- Puede que necesites cargar herramientas primero
- Algunos dropdowns son dependientes (cascading)
- Verificar que el tipo fue cargado antes de cambiar unidad

Ejemplo correcto:
Select tipo = "Taladro"  
waitForElement (opciones de unidad aparezcan)
Select unidad = "TAD-001"
```

### Problema: Test pasa pero datos no persisten
```
Solución:
- Backend podría tener lógica de rollback (transacciones)
- Las herramientas pueden estar en una BD de test
- Verificar que estás usando ambiente de QA/Test
- No usar ambiente PROD

Validar:
1. URLs contienen "localhost" o servidor de test
2. Base de datos es copia (no prod)
3. Datos se crean en endpoint /create-fixture
```

---

## 📊 Mapeo de Selectores Dinámicos

Estos selectores pueden cambiar según versión del código

```javascript
const SELECTORS = {
  buttons: {
    newRental: "//button[contains(text(),'+ Nuevo Arriendo')]",
    confirmRental: "//button[contains(text(),'Confirmar')]",
    addTool: "//button[contains(text(),'+ Agregar')]",
    returnRental: "//button[contains(text(),'Devolver')]",
    back: "//button[contains(text(),'Volver')]"
  },
  
  selects: {
    toolType: "//label[contains(text(),'Tipo')]/../select",
    toolUnit: "//label[contains(text(),'Unidad')]/../select",
    toolStatus: "//select[@class='status-select']",
    filter: "//select[contains(@class,'filter')]"
  },
  
  inputs: {
    startDate: "//label[contains(text(),'Inicio')]/../input",
    endDate: "//label[contains(text(),'Término')]/../input",
    extraCharge: "//input[@class='input-money']"
  },
  
  texts: {
    clientName: "//h2[contains(@class,'client-name')]",
    rentalStatus: "//td[contains(@class,'status-cell')]",
    modalTitle: "//div[contains(@class,'modal')]//h2"
  }
};
```

---

## 🚀 Próximos Pasos

1. **Crear el proyecto en Selenium IDE**
   ```
   File > Create Project > ToolRent_Automation
   Base URL: http://localhost:5173
   ```

2. **Importar tests**
   ```
   File > Import > Seleccionar archivo JSON
   O copiar/pegar manualmente los comandos
   ```

3. **Ejecutar localemente**
   ```
   Click en play icon
   Observar ejecución paso a paso
   Review cada validación
   ```

4. **Exportar para CI/CD**
   ```
   File > Export > Formato de preferencia
   Guardar como: HU00X_EscenarioY.side
   ```

5. **Integración en Pipeline**
   ```bash
   npm run test:selenium
   # O manual:
   selenium-ide --headless *.side --output-format json
   ```

---

## 📞 Contacto y Support

- **Bugs encontrados**: Reportar con screenshot + logs
- **Selectores incorrectos**: Verificar y actualizar en este documento
- **Timeouts insuficientes**: Documentar y aumentar globalmente
- **Datos inconsistentes**: Usar fixtures JSON para reset

---

**Última actualización**: 2 Marzo 2026  
**Versión**: 1.0  
**Estado**: Listo para implementación
