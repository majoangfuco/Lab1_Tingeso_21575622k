# Historias de Usuario - ToolRent (Adaptadas a Funcionalidad Existente)
**Versión: 1.0 - 2 Marzo 2026**  
**Estado: Listas para Automatización con Selenium IDE**

---

## 📋 Mapeo de Funcionalidades Existentes

### ✅ Funcionalidades Implementadas
- ✅ Crear nuevo préstamo (arriendo)
- ✅ Seleccionar cliente activo
- ✅ Seleccionar herramientas disponibles (stock > 0, estado = disponible)
- ✅ Definir fechas de inicio y término del préstamo
- ✅ Límite máximo de 5 préstamos activos por cliente
- ✅ Bloqueo de préstamos para clientes inactivos (clientStatus = false)
- ✅ Devolución de préstamos
- ✅ Registrar estado de herramientas al devolver (Buen Estado, Mantenimiento, Dañada/Perdida)
- ✅ Registrar cargos extra en devolución
- ✅ Ver histórico de préstamos filtrado (Todos, En Curso, Atrasados, Devueltos)
- ✅ Pago de deudas del cliente
- ✅ Movimientos en Kardex (automático en crear/devolver arriendo)

### ⚠️ Funcionalidades Limitadas (Parciales)
- ⚠️ Cálculo automático de multas: Se ingresa manualmente en campo "Cargos Extra"
- ⚠️ Cambio de estado cliente a "Restringido": No hay automatización visible
- ⚠️ Validación de fecha de devolución anterior: Depende del backend
- ⚠️ Prevención de duplicidad de herramienta por cliente: No documentada

### ❌ Funcionalidades No Implementadas
- ❌ Edición o cancelación de préstamo ya registrado
- ❌ Devolución parcial de herramientas
- ❌ Configuración de tarifa de multa por día de atraso

---

## 🎯 HU001: Registro de Nuevo Préstamo

**Como** empleado del sistema  
**Quiero** registrar un nuevo préstamo asociando un cliente y herramientas  
**Para** controlar la salida de inventario y las fechas de retorno

### Criterios de Aceptación (Adaptados)

#### ✅ Escenario 1: Registro exitoso de préstamo
```gherkin
Dado que el empleado está autenticado en el sistema
Y navega a la página de Cliente "Juan Pérez" (estado ACTIVO)
Y la herramienta "Taladro" tiene stock disponible (stock >= 1)
Cuando el empleado hace clic en "+ Nuevo Arriendo"
Y selecciona: 
  - Tipo: "Taladro"
  - Unidad: "TAD-001"
  - Fecha Inicio: [Hoy a las 08:00]
  - Fecha Término: [Hoy + 7 días a las 18:00]
Y hace clic en "Confirmar Arriendo"
Entonces el sistema muestra: "¡Arriendo creado!"
Y el stock de "Taladro" disminuye en 1 unidad
Y aparece el nuevo préstamo en el histórico con estado "En Curso"
```

**Pasos Selenium IDE:**
```
1. Login como empleado
2. Navegar a: http://localhost:5173/clients
3. Click en cliente "Juan Pérez"
4. Click en botón "+ Nuevo Arriendo"
5. Select dropdown "Tipo de Herramienta" = "Taladro"
6. Select dropdown "Unidad Disponible" = "TAD-001 - Disponible"
7. Input "Fecha Inicio" = [TODAY 08:00]
8. Input "Fecha Término" = [TODAY+7D 18:00]
9. Click "+ Agregar al Arriendo"
10. Verify: Cart contains "Taladro (TAD-001)"
11. Click "Confirmar Arriendo"
12. Verify: Alert text = "¡Arriendo creado!"
13. Close alert
14. Verify: Table contains entry con estado "En Curso"
```

---

#### ✅ Escenario 2: Intento con cliente bloqueado
```gherkin
Dado que el cliente está en estado BLOQUEADO (clientStatus = false)
Cuando el empleado intenta registrar un nuevo préstamo
Entonces el botón "+ Nuevo Arriendo" está deshabilitado
Y se muestra tooltip: "Cliente bloqueado"
```

**Pasos Selenium IDE:**
```
1. Login como empleado
2. Navegar a cliente con clientStatus = BLOQUEADO
3. Verify: Button "+ Nuevo Arriendo" has [disabled] attribute
4. Hover sobre botón
5. Verify: Tooltip/title contiene "bloqueado"
```

---

#### ✅ Escenario 3: Movimiento automático en Kardex
```gherkin
Dado que se procesa un préstamo exitoso
Cuando la transacción finaliza
Entonces se genera automáticamente un registro en Kardex
Y el tipo de movimiento es "Préstamo"
Y incluye referencia al ID de arriendo, cliente y herramientas
```

**Pasos Selenium IDE:**
```
1. Seguir pasos de Escenario 1 hasta crear arriendo
2. Navegar a: http://localhost:5173/kardex
3. Filtrar por cliente "Juan Pérez"
4. Verify: Existe movimiento con tipo = "Préstamo"
5. Verify: Movimiento contiene referencia a herramienta "Taladro"
6. Verify: rentalId coincide con ID del préstamo creado
```

---

#### ⚠️ Escenario 4: Validación de fechas (Backend)
```gherkin
Dado que el empleado intenta crear un préstamo
Cuando la fecha de término es anterior a la fecha de inicio
Entonces el sistema muestra error: "Fecha de término debe ser posterior a inicio"
```

**Pasos Selenium IDE:**
```
1. Click "+ Nuevo Arriendo"
2. Input "Fecha Inicio" = [TODAY 18:00]
3. Input "Fecha Término" = [TODAY 08:00]  // Anterior
4. Click "+ Agregar al Arriendo"
5. Verify: Error message OR form validation error appears
```

---

## 🎯 HU002: Validación de Disponibilidad de Herramientas

**Como** empleado del sistema  
**Quiero** que el sistema valide la disponibilidad de herramientas  
**Para** evitar sobregiros en el stock físico

### Criterios de Aceptación (Adaptados)

#### ✅ Escenario 1: Validación de stock en cero
```gherkin
Dado que la herramienta "Sierra Circular" tiene stock actual = 0
Cuando el empleado intenta seleccionar esa herramienta
Entonces el dropdown "Unidad Disponible" muestra:
  "-- Selecciona Unidad --" (sin opciones reales)
Y se visualiza: "Sin unidades disponibles"
```

**Pasos Selenium IDE:**
```
1. Click "+ Nuevo Arriendo"
2. Select "Tipo de Herramienta" = "Sierra Circular"
3. Verify: Dropdown "Unidad Disponible" is empty
4. Verify: Message "Sin unidades disponibles" is visible
5. Verify: Button "+ Agregar al Arriendo" is [disabled]
```

---

#### ✅ Escenario 2: Herramienta con estado "A Mantención" no aparece
```gherkin
Dado que una herramienta existe pero toolStatus = 2 (A Mantención)
Cuando el empleado selecciona ese tipo
Entonces la unidad NO aparece en dropdown de unidades disponibles
```

**Pasos Selenium IDE:**
```
1. Click "+ Nuevo Arriendo"
2. Select "Tipo" = "Herramienta con toolStatus=2"
3. Verify: Dropdown "Unidad Disponible" no contiene esta unidad
```

---

#### ✅ Escenario 3: Última unidad disponible
```gherkin
Dado que la herramienta tiene stock = 1 y una unidad disponible
Cuando el empleado la selecciona y confirma el arriendo
Entonces el stock disminuye a 0
Y en la siguiente sesión, el dropdown muestra "Sin unidades disponibles"
```

**Pasos Selenium IDE:**
```
1. Get nombre herramienta con stock = 1
2. Create arriendo con esta herramienta
3. Logout
4. Login como otro empleado
5. Abrir nuevo arriendo
6. Select mismo tipo
7. Verify: Dropdown vacío O "Sin unidades disponibles"
```

---

#### ⚠️ Escenario 4: Prevención de duplicidad (No Implementado)
```gherkin
Dado que el cliente "Diego Torres" ya tiene "Martillo" en préstamo activo
Cuando intenta registrar otro préstamo del mismo "Martillo"
Entonces el sistema emite alerta: "Ya seleccionaste un 'Martillo'. Solo una por tipo."
```

**Pasos Selenium IDE:**
```
1. Verificar que existe rentals activos de cliente con herramienta X
2. Click "+ Nuevo Arriendo"
3. Intentar seleccionar misma herramienta (tipo)
4. Verify: Alert message OR button disabled
```

---

## 🎯 HU003: Bloqueo de Préstamos a Clientes Ineligibles

**Como** empleado del sistema  
**Quiero** bloquear préstamos a clientes con problemas pendientes  
**Para** asegurar regularización de deudas antes de nuevos préstamos

### Criterios de Aceptación (Adaptados)

#### ✅ Escenario 1: Bloqueo por 5 préstamos activos
```gherkin
Dado que el cliente "Diego Torres" tiene 5 préstamos activos (rentalStatus = 0)
Cuando el empleado intenta registrar un sexto préstamo
Entonces el sistema muestra alert: "LIMITE ALCANZADO: Este cliente ya tiene 5 prestamos activos"
Y el modal se cierra sin crear el arriendo
```

**Pasos Selenium IDE:**
```
1. Navegar a cliente con 5 rentals activos
2. Click "+ Nuevo Arriendo"
3. Select herramienta y fechas
4. Click "Confirmar Arriendo"
5. Verify: Alert contiene "LIMITE ALCANZADO"
6. Verify: No se crea nuevo arriendo
```

---

#### ✅ Escenario 2: Botón deshabilitado para cliente bloqueado
```gherkin
Dado que un cliente tiene clientStatus = false (BLOQUEADO)
Cuando se visualiza en la página de detalle
Entonces el botón "+ Nuevo Arriendo" está [disabled]
Y el badge muestra "BLOQUEADO"
```

**Pasos Selenium IDE:**
```
1. Navegar a cliente con clientStatus = false
2. Verify: Button "+ Nuevo Arriendo" tiene atributo [disabled]
3. Verify: Badge o etiqueta muestra "BLOQUEADO"
```

---

#### ⚠️ Escenario 3: Bloqueo por préstamos vencidos (Backend Check)
```gherkin
Dado que el cliente tiene un préstamo con rentalStatus = 1 (ATRASADO)
Cuando intenta crear un nuevo préstamo
Entonces el sistema verifica estado y puede aplicar bloqueo
```

**Pasos Selenium IDE:**
```
1. Navegar a cliente con rentals vencidos (rentalStatus = 1)
2. Attempt Click "+ Nuevo Arriendo"
3. Verify: Button disabled OR Alert aparece
```

---

#### ⚠️ Escenario 4: Desbloqueo tras pago
```gherkin
Dado que un cliente estaba bloqueado (clientStatus = false)
Cuando se registra un pago y admin actualiza clientStatus = true
Entonces el sistema permite crear un nuevo préstamo inmediatamente
```

**Pasos Selenium IDE:**
```
1. Cliente con clientStatus = false
2. Admin realiza pago (endpoint /pay)
3. Admin actualiza cliente a activo
4. Login empleado
5. Navegar al cliente
6. Verify: Button "+ Nuevo Arriendo" está [enabled]
```

---

## 🎯 HU004: Registro de Devolución de Herramientas

**Como** empleado del sistema  
**Quiero** registrar la devolución de herramientas  
**Para** reintegrarlas al stock y cerrar el ciclo del préstamo

### Criterios de Aceptación (Adaptados)

#### ✅ Escenario 1: Devolución exitosa
```gherkin
Dado que existe un préstamo activo (rentalStatus = 0)
Y todas las herramientas están en "Buen Estado"
Cuando el empleado registra la devolución sin cargos extra
Y hace click "Devolver Arriendo"
Entonces el sistema muestra: "Arriendo devuelto exitosamente!"
Y el préstamo cambia a rentalStatus = 2 (DEVUELTO)
Y el stock de cada herramienta aumenta en 1
```

**Pasos Selenium IDE:**
```
1. Navegar a histórico de rentals
2. Filtrar por "En Curso"
3. Click en un rental activo
4. Click "Devolver Arriendo"
5. Para cada herramienta: Select "✅ Buen Estado"
6. Input "Cargos Extra" = 0
7. Click "Confirmar Devolución"
8. Confirm dialog
9. Verify: Alert contiene "Arriendo devuelto exitosamente"
10. Verify: Rental status cambia a "Devuelto"
```

---

#### ✅ Escenario 2: Registro de herramienta dañada
```gherkin
Dado que se devuelve una herramienta en mal estado
Cuando el empleado selecciona "🔧 A Mantención" o "❌ Dañada/Perdida"
Entonces el estado de la herramienta cambia en el inventario
Y se registra en Kardex como "Baja" o "A Reparación"
```

**Pasos Selenium IDE:**
```
1. Click "Devolver Arriendo" en rental activo
2. Para una herramienta: Select "❌ Dañada/Perdida"
3. Para otra: Select "🔧 A Mantención"
4. Click "Confirmar Devolución"
5. Confirm
6. Navegar a Kardex
7. Verify: Existen movimientos registrando el estado de herramientas
```

---

#### ✅ Escenario 3: Registro de cargos extra
```gherkin
Dado que se devuelve un préstamo con daños que requieren reparación
Cuando el empleado ingresa cargos extra: $5000
Y confirma la devolución
Entonces se visualiza: "Monto a cobrar por devolucion: $5000"
```

**Pasos Selenium IDE:**
```
1. Click "Devolver Arriendo"
2. Select estado de herramientas
3. Input "Cargos Extra" = 5000
4. Click "Confirmar Devolución"
5. Confirm
6. Verify: Alert contiene "$5000"
```

---

#### ✅ Escenario 4: Actualización automática en Kardex
```gherkin
Dado que se procesa una devolución
Cuando se confirma
Entonces se genera movimiento en Kardex con tipo "Devolución"
```

**Pasos Selenium IDE:**
```
1. Completar devolución de rental
2. Navegar a Kardex
3. Filtrar por rental ID
4. Verify: Movimiento con tipo "Devolución" existe
```

---

## 🎯 HU005: Cálculo Automático de Multas (Limitado)

**Como** administrador del sistema  
**Quiero** que se calculen automáticamente multas por atraso  
**Para** estandarizar cobros

### Criterios de Aceptación (Adaptados)

#### ⚠️ Escenario 1: Ingreso manual de multa en devolución
```gherkin
Dado que un cliente devuelve herramienta CON ATRASO
Cuando el empleado registra la devolución
Entonces puede ingresar el campo "Cargos Extra" con el monto de la multa
Y este monto se suma al total a cobrar
```

**Pasos Selenium IDE:**
```
1. Click "Devolver Arriendo" en rental vencido
2. Input "Cargos Extra" = [Monto de multa calculado manualmente]
3. Click "Confirmar"
4. Verify: Alert muestra monto total a cobrar
```

---

#### ✅ Escenario 2: Devolución sin multa (a tiempo)
```gherkin
Dado que se devuelve ANTES o EN la fecha pactada
Cuando el empleado registra con "Cargos Extra" = 0
Entonces "Multa calculada" = $0
```

**Pasos Selenium IDE:**
```
1. Rental con fecha término = HOY
2. Devolución registrada HOY
3. Input "Cargos Extra" = 0
4. Click "Confirmar"
5. Verify: Alert muestra "Monto a cobrar: $0"
```

---

#### ⚠️ Escenario 3: Cambio de estado a "Restringido" (No Automático)
```gherkin
Dado que se registra multa por atraso
Cuando la devolución se guarda SIN pago inmediato
Entonces [MANUAL] el admin debe cambiar clientStatus a "Restringido"
```

**Pasos Selenium IDE:**
```
1. Registrar devolución con cargos extra (multa)
2. Admin navega a cliente
3. Click "Editar Cliente"
4. Select "Estado" = "Restringido"
5. Click "Guardar"
6. Verify: Status cambia en vista
```

---

## 🎯 HU006: Registrar Estado Físico de Herramienta al Devolver

**Como** empleado del sistema  
**Quiero** registrar el estado físico de herramientas devueltas  
**Para** gestionar reparaciones y ajustes de inventario

### Criterios de Aceptación (Adaptados)

#### ✅ Escenario 1: Estados disponibles en devolución
```gherkin
Cuando el empleado registra una devolución
Entonces visualiza opciones para CADA herramienta:
  - ✅ Buen Estado (toolStatus = 0)
  - 🔧 A Mantención (toolStatus = 2)
  - ❌ Dañada/Perdida (toolStatus = 3)
```

**Pasos Selenium IDE:**
```
1. Click "Devolver Arriendo" en rental con N herramientas
2. Para cada herramienta: Verify dropdown tiene opciones:
   - "✅ Buen Estado"
   - "🔧 A Mantención"
   - "❌ Dañada/Perdida"
3. Seleccionar diferentes estados
4. Click "Confirmar"
```

---

#### ✅ Escenario 2: Herramienta dañada = Baja de inventario
```gherkin
Dado que selecciona "❌ Dañada/Perdida" para una herramienta
Cuando confirma la devolución
Entonces el stock total de esa herramienta disminuye permanentemente
Y su estado pasa a toolStatus = 3
```

**Pasos Selenium IDE:**
```
1. Get stock inicial de herramienta X
2. Devolver rental seleccionando "❌ Dañada/Perdida"
3. Navegar a inventario
4. Verify: Stock de herramienta X disminuyó en 1
5. Verify: Estado = "Dañada/Perdida" o "No disponible"
```

---

#### ✅ Escenario 3: Herramienta a mantención
```gherkin
Dado que selecciona "🔧 A Mantención"
Cuando confirma
Entonces la herramienta NO vuelve al stock disponible inmediatamente
Y su estado es toolStatus = 2 (no aparece en nuevos arriendos)
```

**Pasos Selenium IDE:**
```
1. Devolver con "🔧 A Mantención"
2. Abrir nuevo arriendo
3. Select tipo de herramienta
4. Verify: Unidad devuelta NO aparece en dropdown
5. Navegar a inventario
6. Verify: Estado = "A Mantención"
```

---

## 🎯 HU007: Límite de 5 Préstamos Simultáneos por Cliente

**Como** administrador del sistema  
**Quiero** limitar a 5 los préstamos activos por cliente  
**Para** mitigar riesgo de pérdida de herramientas

### Criterios de Aceptación (Adaptados)

#### ✅ Escenario 1: Bloqueo en límite máximo
```gherkin
Dado que el cliente tiene 5 préstamos activos (rentalStatus = 0)
Cuando intenta crear un sexto
Entonces el sistema muestra alert:
  "LIMITE ALCANZADO: Este cliente ya tiene 5 prestamos activos"
```

**Pasos Selenium IDE:**
```
1. Navegar a cliente con rentalStatus=0 count = 5
2. Click "+ Nuevo Arriendo"
3. Select herramienta y fechas
4. Click "Confirmar Arriendo"
5. Wait 2s
6. Verify: Alert message contiene "LIMITE ALCANZADO"
7. Click OK en alert
8. Verify: No se crea nuevo arriendo (histórico sigue en 5)
```

---

#### ✅ Escenario 2: Préstamo permitido bajo límite
```gherkin
Dado que el cliente tiene 4 préstamos activos
Cuando registra un nuevo préstamo
Entonces se procesa normalmente
```

**Pasos Selenium IDE:**
```
1. Cliente con rentals activos = 4
2. Click "+ Nuevo Arriendo"
3. Select herramienta y fechas
4. Click "Confirmar Arriendo"
5. Verify: Alert = "¡Arriendo creado!"
6. Verify: Histórico muestra 5 rentals
```

---

#### ✅ Escenario 3: Liberación de cupo tras devolución
```gherkin
Dado que el cliente tenía 5 (límite)
Cuando devuelve exitosamente una herramienta
Entonces ahora tiene 4 activos
Y puede inmediatamente crear un nuevo préstamo
```

**Pasos Selenium IDE:**
```
1. Cliente con 5 rentals activos
2. Click en uno de los rentals
3. Click "Devolver Arriendo"
4. Confirm devolucion
5. Wait 1s
6. Verify: Histórico muestra 4 activos, 1 devuelto
7. Click "+ Nuevo Arriendo"
8. Select herramienta y fechas
9. Click "Confirmar"
10. Verify: Alert = "¡Arriendo creado!"
```

---

#### ✅ Escenario 4: Inmutabilidad del préstamo
```gherkin
Dado que un préstamo ha sido guardado
Cuando el empleado intenta modificar dates o herramientas
Entonces [NO APLICA] El sistema no permite edición - 
  Se debe devolver y crear uno nuevo
```

**Pasos Selenium IDE:**
```
1. Verificar que NO existe botón "Editar Arriendo"
2. Visualizar rental en detalle
3. Verify: Solo opciones "Devolver Arriendo" o "Volver"
4. Confirm: No existe form para editar valores
```

---

## 📊 Matriz de Automatización Selenium IDE

| HU | Escenario | Estatus | Complejidad | Comentario |
|---|---|---|---|---|
| HU001 | 1. Crear préstamo | ✅ | Media | Login + Navegación + Select + Input + Verificación |
| HU001 | 2. Cliente bloqueado | ✅ | Baja | Solo verificar atributo disabled |
| HU001 | 3. Kardex | ✅ | Alta | Requiere navegar a módulo Kardex |
| HU001 | 4. Validación fechas | ⚠️ | Media | Depende de validación frontend |
| HU002 | 1. Stock cero | ✅ | Baja | Verificar opciones vacías |
| HU002 | 2. Herramienta en mantención | ✅ | Media | Requiere setup previo de datos |
| HU002 | 3. Última unidad | ✅ | Alta | Requiere múltiples sesiones |
| HU002 | 4. Duplicidad | ⚠️ | Media | No documentada completamente |
| HU003 | 1. Límite 5 | ✅ | Media | Alert + Verificación count |
| HU003 | 2. Botón disabled | ✅ | Baja | Verificar atributo |
| HU003 | 3. Vencidos | ⚠️ | Media | Requiere setup de datos vencidos |
| HU003 | 4. Desbloqueo | ✅ | Alta | Requiere endpoint de pago |
| HU004 | 1. Devolución | ✅ | Media | Select + Input + Verify |
| HU004 | 2. Kardex | ✅ | Alta | Navegación + Filtros |
| HU004 | 3. Cargos extra | ✅ | Baja | Input + Verify alert |
| HU004 | 4. Movimiento Kardex | ✅ | Alta | Kardex verification |
| HU005 | 1. Multa manual | ✅ | Baja | El cálculo es manual by design |
| HU005 | 2. Sin multa | ✅ | Baja | Input = 0 |
| HU005 | 3. Estado Restringido | ⚠️ | Media | Requiere manual admin action |
| HU006 | 1. Estados disponibles | ✅ | Baja | Verificar 3 opciones |
| HU006 | 2. Baja permanente | ✅ | Media | Stock verification |
| HU006 | 3. Mantención | ✅ | Media | Inventory verification |
| HU007 | 1. Bloqueo 5 | ✅ | Media | Alert + count |
| HU007 | 2. Bajo límite | ✅ | Baja | Crear sin error |
| HU007 | 3. Liberación | ✅ | Media | Devolución + Create |
| HU007 | 4. Inmutabilidad | ✅ | Baja | Verificar no existe edición |

---

## 🚀 Guía de Ejecución en Selenium IDE

### Prerequisitos
```
1. Selenium IDE (Chrome/Firefox extension) instalado
2. Proyecto ToolRent corriendo en http://localhost:5173
3. Backend disponible en puerto configurado
4. Usuario de prueba "empleado" con credenciales válidas
```

### Crear una Suite de Tests
```
1. Abrir Selenium IDE
2. Create a New Project: "ToolRent_Automation"
3. Base URL: http://localhost:5173
4. Para cada escenario:
   - Create a new Test
   - Copiar pasos del formato: "Pasos Selenium IDE"
   - Ejecutar/Grabar interacciones
   - Validar con Commands: verifyText, verifyAttribute, verifyVisible, etc.
5. Guardar como: HU00X_Escenario_Y.side
```

### Comandos Selenium IDE Recomendados
```javascript
// Navigation
- open: /clients
- open: /kardex
- open: /rental/${rentalId}

// Interaction
- click: id/xpath del elemento
- select: id/xpath, value
- type: id/xpath, text
- sendKeys: id/xpath, key (e.g., ENTER)

// Verification
- verifyText: id/xpath, expected text
- verifyAttribute: id/xpath@attribute, value
- verifyVisible: id/xpath
- verifyEnabled: id/xpath (button not [disabled])
- verifySelectOptions: id/xpath (contains expected options)
- assertAlert: expected message
- waitForElementPresent: id/xpath, timeout

// Conditional
- if: ${variable}
- storeText: id/xpath, variable
- storeAttribute: id/xpath@disabled, variable
```

### Ejemplo: Test HU001 Escenario 1
```
Test Name: HU001_S1_CreateRentalSuccess

1. open: http://localhost:5173/login
2. type: id=email, empleado@test.com
3. type: id=password, password123
4. click: id=loginBtn
5. waitForElementPresent: //h1[contains(text(),'Clients')], 5000

6. Click client "Juan Pérez"
7. click: //button[contains(text(),'+ Nuevo Arriendo')]

8. waitForElementPresent: //select[contains(@class,'form-group')], 3000
9. select: //select[@label='Tipo de Herramienta'], Taladro
10. waitForElementPresent: //option[contains(text(),'TAD-001')], 2000
11. select: //select[@label='Unidad Disponible'], TAD-001

12. type: //input[@type='datetime-local'][1], 2026-03-02T08:00
13. type: //input[@type='datetime-local'][2], 2026-03-09T18:00

14. click: //button[contains(text(),'+ Agregar al Arriendo')]

15. verifyText: //div[@class='cart'], TAD-001

16. click: //button[contains(text(),'Confirmar Arriendo')]

17. waitForAlert: 3000
18. assertAlert: ¡Arriendo creado!

19. click: OK (alert gets dismissed automatically most times)

20. verifyElementPresent: //tr[contains(.,'En Curso')], 2000
```

### Ejecución
```
- Ejecutar un test: Click play button
- Ejecutar toda la suite: Click play button en nivel de carpeta
- Exportar resultados: File > Export > Results
- Ver logs: Click en cada comando para ver output
```

---

## 📝 Notas Importantes

1. **Datos de Prueba**: Se recomienda crear fixtures de datos iniciales
   - Cliente activo "Juan Pérez" 
   - Cliente bloqueado "Pedro García"
   - Herramienta "Taladro" con stock >= 2
   - Herramienta "Sierra" con stock = 0

2. **Limpieza entre Tests**: Algunas pruebas deben ejecutarse en orden:
   - Crear préstamo → Devolver préstamo
   - Cliente con 5 activos → Devolución → Crear nuevo

3. **Timeouts**: Ajusta según velocidad de tu ambiente
   - Frontend modals: 2-3 segundos
   - API calls: 5 segundos
   - Kardex carga: 3 segundos

4. **Excel/CSV**: Puedes parametrizar tests con datos variables:
   - Store different client RUTs
   - Store different tool types
   - Execute samme test con múltiples datasets

5. **CI/CD**: Exporta resultados JSON para integrar en pipelines
   ```
   selenium-ide -c suites/*.side --output-format json
   ```

---

## ✅ Checklist de Validación

- [ ] Todos los pasos de Selenium son específicos (incluyen selectores)
- [ ] Cada escenario tiene assert/verify al final
- [ ] Los datos de prueba son realistas y consistentes
- [ ] Los timeouts están ajustados para tu ambiente
- [ ] Los messages esperados coinciden con el código actual
- [ ] Las HU adaptadas reflejan funcionalidad real del sistema
- [ ] Se documentaron limitaciones y funcionalidades no implementadas

---

**Última actualización**: 2 Marzo 2026  
**Versión**: 1.0 - Adaptada a código actual  
**Autor**: GitHub Copilot para ToolRent Team
