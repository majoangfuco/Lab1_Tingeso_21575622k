# Mapeo EditClientModal - Escenarios Gherkin → Selenium IDE
## Componente: src/components/EditClientModal.jsx
## Versión: 1.0 | Fecha: 02/03/2026

---

## 📍 REFERENCIA DE ELEMENTOS (Locators)

### Estructura del Modal
| Elemento | Selector Probable | Notas |
|----------|---|---|
| Overlay del Modal | div.modal-overlay | Capa de fondo |
| Contenedor Modal | div.modal-content | Caja con los campos |
| Título | h2:contains("Editar Cliente") | Texto fijo |
| Campo Nombre | input[type="text"] (1er input) o label:contains("Nombre") + input | required |
| Campo Email | input[type="text"] (2do input) o label:contains("Email") + input | required |
| Campo Teléfono | input[type="text"] (3er input) o label:contains("Teléfono") + input | optional |
| Botón Cancelar | button:contains("Cancelar") o .btn-cancel | onclick=onClose |
| Botón Guardar | button:contains("Guardar") o .btn-save | type="submit" |
| Formulario | form | onSubmit handler |

### Props que Controlan Visibilidad
```javascript
isOpen = true   // Modal visible
isOpen = false  // Modal no renderizado (null return)
```

---

## ✅ MAPEOS DE ESCENARIOS A SELENIUM IDE

### **E1 - Modal no se renderiza cuando isOpen=false**
```gherkin
Escenario: E1 Modal no se renderiza cuando isOpen es falso
  Dado que el componente EditClientModal tiene isOpen={false}
  Cuando se renderiza el componente
  Entonces el modal no debe estar visible en el DOM
  Y no debe haber elemento con clase "modal-overlay"
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: /clientes (o página donde está el modal) | Value: 
2. Command: waitForElementPresent | Target: body | Value: 
3. Command: assertNotElementPresent | Target: div.modal-overlay | Value: 
```

---

### **E2 - Modal se muestra cuando isOpen=true**
```gherkin
Escenario: E2 Modal se muestra cuando isOpen es verdadero
  Dado que el componente EditClientModal tiene isOpen={true}
  Cuando se renderiza el componente
  Entonces debe aparecer el modal con clase "modal-overlay"
  Y debe mostrarse el título "Editar Cliente"
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (o página de prueba) | Value: 
2. Command: waitForElementPresent | Target: div.modal-overlay | Value: 2000
3. Command: assertElementPresent | Target: h2:contains("Editar Cliente") | Value: 
4. Command: assertVisible | Target: div.modal-content | Value: 
```

---

### **E3 - Formulario precargado con datos del cliente**
```gherkin
Escenario: E3 Formulario se precarga con datos del cliente
  Dado que clientData contiene { rut: "12345678-9", clientName: "Juan Pérez", mail: "juan@example.com", phone: "912345678" }
  Cuando el modal se abre con isOpen={true}
  Entonces el campo "Nombre" debe mostrar el valor "Juan Pérez"
  Y el campo "Email" debe mostrar el valor "juan@example.com"
  Y el campo "Teléfono" debe mostrar el valor "912345678"
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (componente con datos) | Value: 
2. Command: waitForElementPresent | Target: div.modal-overlay | Value: 2000
3. Command: assertValue | Target: label:contains("Nombre") + input | Value: Juan Pérez
4. Command: assertValue | Target: label:contains("Email") + input | Value: juan@example.com
5. Command: assertValue | Target: label:contains("Teléfono") + input | Value: 912345678
```

---

### **E4 - Modal se actualiza cuando clientData cambia**
```gherkin
Escenario: E4 Formulario se actualiza cuando clientData cambia
  Dado que el modal está abierto mostrando datos: { clientName: "María García" }
  Cuando la prop clientData cambia a { clientName: "María García Actualizado" }
  Entonces el campo "Nombre" debe actualizar automáticamente a "María García Actualizado"
  Y el cambio debe sincronizarse sin necesidad de recargar
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (componente con cambio de prop) | Value: 
2. Command: waitForElementPresent | Target: input[value*="María García"] | Value: 2000
3. Command: waitForValue | Target: label:contains("Nombre") + input | Value: María García Actualizado | Timeout: 3000
4. Command: assertValue | Target: label:contains("Nombre") + input | Value: María García Actualizado
```

---

### **E5 - Modal maneja clientData nulo**
```gherkin
Escenario: E5 Modal maneja clientData nulo correctamente
  Dado que clientData es null
  Cuando el modal se abre con isOpen={true}
  Entonces los campos de texto deben estar vacíos
  Y el formulario debe ser funcional
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (componente con clientData=null) | Value: 
2. Command: waitForElementPresent | Target: div.modal-overlay | Value: 2000
3. Command: assertValue | Target: label:contains("Nombre") + input | Value: 
4. Command: assertValue | Target: label:contains("Email") + input | Value: 
5. Command: assertValue | Target: label:contains("Teléfono") + input | Value: 
6. Command: assertElementPresent | Target: button:contains("Guardar") | Value: 
```

---

### **E6 - Usuario edita el campo "Nombre"**
```gherkin
Escenario: E6 Usuario puede editar el campo "Nombre"
  Dado que el modal está abierto con un cliente precargado
  Cuando el usuario hace clic en el campo "Nombre"
  Y borra el contenido actual y escribe "Carlos López"
  Entonces el campo debe actualizar a "Carlos López"
  Y el valor en formData local debe cambiar
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (componente abierto) | Value: 
2. Command: waitForElementPresent | Target: div.modal-overlay | Value: 2000
3. Command: click | Target: label:contains("Nombre") + input | Value: 
4. Command: triple-click | Target: label:contains("Nombre") + input | Value: (selecciona todo)
5. Command: type | Target: label:contains("Nombre") + input | Value: Carlos López
6. Command: assertValue | Target: label:contains("Nombre") + input | Value: Carlos López
```

---

### **E7 - Usuario edita el campo "Email"**
```gherkin
Escenario: E7 Usuario puede editar el campo "Email"
  Dado que el modal está abierto con clientData que contiene mail: "viejo@example.com"
  Cuando el usuario modifica el email a "nuevo@example.com"
  Entonces el campo "Email" debe mostrar "nuevo@example.com"
  Y el cambio debe reflejarse en el estado local
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / | Value: 
2. Command: click | Target: label:contains("Email") + input | Value: 
3. Command: triple-click | Target: label:contains("Email") + input | Value: 
4. Command: type | Target: label:contains("Email") + input | Value: nuevo@example.com
5. Command: assertValue | Target: label:contains("Email") + input | Value: nuevo@example.com
```

---

### **E8 - Usuario edita el campo "Teléfono" (opcional)**
```gherkin
Escenario: E8 Usuario puede editar el campo "Teléfono" (campo opcional)
  Dado que el modal está abierto
  Cuando el usuario hace clic en el campo "Teléfono"
  Y escribe el número "987654321"
  Entonces el campo debe mostrar "987654321"
  Y el campo debe permitir dejar en blanco sin error
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / | Value: 
2. Command: click | Target: label:contains("Teléfono") + input | Value: 
3. Command: type | Target: label:contains("Teléfono") + input | Value: 987654321
4. Command: assertValue | Target: label:contains("Teléfono") + input | Value: 987654321
```

---

### **E9 - Campo "Nombre" es obligatorio**
```gherkin
Escenario: E9 Campo "Nombre" es obligatorio
  Dado que el modal está abierto con un nombre cargado
  Cuando el usuario borra el contenido del campo "Nombre"
  Y intenta hacer submit del formulario
  Entonces el navegador debe mostrar validación "Este campo es obligatorio"
  Y el formulario debe bloquear el envío
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / | Value: 
2. Command: click | Target: label:contains("Nombre") + input | Value: 
3. Command: triple-click | Target: label:contains("Nombre") + input | Value: 
4. Command: typeKeys | Target: label:contains("Nombre") + input | Value: DELETE
5. Command: click | Target: button:contains("Guardar") | Value: 
6. Command: waitForElementPresent | Target: body:contains("obligatorio") o input:invalid | Value: 2000
```

---

### **E10 - Campo "Email" es obligatorio**
```gherkin
Escenario: E10 Campo "Email" es obligatorio
  Dado que el modal está abierto
  Cuando el usuario borra el contenido del campo "Email"
  Y intenta hacer submit del formulario
  Entonces el navegador debe mostrar validación "Este campo es obligatorio"
  Y el formulario no debe enviarse
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / | Value: 
2. Command: click | Target: label:contains("Email") + input | Value: 
3. Command: triple-click | Target: label:contains("Email") + input | Value: 
4. Command: typeKeys | Target: label:contains("Email") + input | Value: DELETE
5. Command: click | Target: button:contains("Guardar") | Value: 
6. Command: waitForElementPresent | Target: input[type="text"]:invalid | Value: 2000
```

---

### **E11 - Campo "Teléfono" es opcional**
```gherkin
Escenario: E11 Campo "Teléfono" es opcional
  Dado que el modal está abierto
  Cuando el usuario deja en blanco el campo "Teléfono"
  Y hace clic en "Guardar"
  Entonces el formulario debe enviarse sin error
  Y el valor de phone puede ser vacío en onSave
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (con campos nombre/email llenos, teléfono vacío) | Value: 
2. Command: click | Target: label:contains("Teléfono") + input | Value: 
3. Command: triple-click | Target: label:contains("Teléfono") + input | Value: 
4. Command: typeKeys | Target: label:contains("Teléfono") + input | Value: DELETE
5. Command: click | Target: button:contains("Guardar") | Value: 
6. Command: waitForElementNotPresent | Target: div.modal-overlay | Value: 2000 (modal se cierra si guardó)
```

---

### **E12 - Botón "Cancelar" cierra el modal**
```gherkin
Escenario: E12 Botón "Cancelar" cierra el modal
  Dado que el modal está abierto
  Y el usuario ha realizado cambios en los campos
  Cuando hace clic en el botón "Cancelar"
  Entonces debe ejecutarse la función onClose
  Y el modal debe cerrarse sin guardar los cambios
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / | Value: 
2. Command: waitForElementPresent | Target: div.modal-overlay | Value: 2000
3. Command: click | Target: label:contains("Nombre") + input | Value: 
4. Command: type | Target: label:contains("Nombre") + input | Value: Nombre Modificado
5. Command: click | Target: button:contains("Cancelar") | Value: 
6. Command: waitForElementNotPresent | Target: div.modal-overlay | Value: 2000
7. Command: pause | Target: 500 | Value: (verificar que no guardó)
```

---

### **E13 - Botón "Guardar" envía datos actualizado**
```gherkin
Escenario: E13 Botón "Guardar" envía datos del cliente actualizado
  Dado que el modal está abierto con datos iniciales
  Cuando el usuario modifica el nombre a "Pedro González"
  Y hace clic en el botón "Guardar"
  Entonces debe ejecutarse onSave({ ...clientData, clientName: "Pedro González" })
  Y el objeto enviado debe contener todos los campos del formulario
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (mock onSave si es posible) | Value: 
2. Command: click | Target: label:contains("Nombre") + input | Value: 
3. Command: triple-click | Target: label:contains("Nombre") + input | Value: 
4. Command: type | Target: label:contains("Nombre") + input | Value: Pedro González
5. Command: click | Target: button:contains("Guardar") | Value: 
6. Command: waitForElementNotPresent | Target: div.modal-overlay | Value: 2000
7. Command: assertConsoleLogContains | Target: onSave called with: Pedro González | Value: (si hay console.log)
```

---

### **E14 - Botón "Guardar" previene recarga de página**
```gherkin
Escenario: E14 Botón "Guardar" previene recarga de página
  Dado que el modal está abierto
  Cuando el usuario hace clic en "Guardar"
  Entonces el evento submit debe llamar preventDefault()
  Y la página no debe recargar
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / | Value: 
2. Command: storeLocation | Target: current_url | Value: 
3. Command: click | Target: button:contains("Guardar") | Value: 
4. Command: waitForElementNotPresent | Target: div.modal-overlay | Value: 2000
5. Command: storeLocation | Target: new_url | Value: 
6. Command: assertEqual | Target: ${current_url} | Value: ${new_url} (la URL no debe cambiar)
```

---

### **E15 - Cambios en un campo no afectan otros campos**
```gherkin
Escenario: E15 Cambios en un campo no afectan otros campos
  Dado que el modal está abierto con { clientName: "Ana", mail: "ana@example.com", phone: "555" }
  Cuando el usuario modifica solo el nombre a "Anita"
  Entonces el objeto formData debe ser { clientName: "Anita", mail: "ana@example.com", phone: "555" }
  Y el spread operator (...formData) debe preservar los otros campos
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / (con datos precargados) | Value: 
2. Command: assertValue | Target: label:contains("Email") + input | Value: ana@example.com
3. Command: assertValue | Target: label:contains("Teléfono") + input | Value: 555
4. Command: click | Target: label:contains("Nombre") + input | Value: 
5. Command: triple-click | Target: label:contains("Nombre") + input | Value: 
6. Command: type | Target: label:contains("Nombre") + input | Value: Anita
7. Command: assertValue | Target: label:contains("Email") + input | Value: ana@example.com (no cambió)
8. Command: assertValue | Target: label:contains("Teléfono") + input | Value: 555 (no cambió)
```

---

### **E16 - Múltiples cambios se acumulan correctamente**
```gherkin
Escenario: E16 Múltiples cambios en una sesión se acumulan correctamente
  Dado que el modal está abierto
  Cuando el usuario modifica nombre a "Juan"
  Y luego modifica email a "juan@nuevo.com"
  Y luego modifica teléfono a "654123789"
  Entonces el formData debe contener los tres cambios
  Y onSave debe recibir todos los cambios acumulados
```

**Mapeo Selenium IDE:**
```
1. Command: open | Target: / | Value: 
2. Command: click | Target: label:contains("Nombre") + input | Value: 
3. Command: triple-click | Target: label:contains("Nombre") + input | Value: 
4. Command: type | Target: label:contains("Nombre") + input | Value: Juan
5. Command: click | Target: label:contains("Email") + input | Value: 
6. Command: triple-click | Target: label:contains("Email") + input | Value: 
7. Command: type | Target: label:contains("Email") + input | Value: juan@nuevo.com
8. Command: click | Target: label:contains("Teléfono") + input | Value: 
9. Command: triple-click | Target: label:contains("Teléfono") + input | Value: 
10. Command: type | Target: label:contains("Teléfono") + input | Value: 654123789
11. Command: assertValue | Target: label:contains("Nombre") + input | Value: Juan
12. Command: assertValue | Target: label:contains("Email") + input | Value: juan@nuevo.com
13. Command: assertValue | Target: label:contains("Teléfono") + input | Value: 654123789
14. Command: click | Target: button:contains("Guardar") | Value: 
```

---

### **E17 - E20: PropTypes y Validación**
Estos escenarios requieren validación en DevTools (console warnings), no son automatizables en Selenium IDE de forma estándar.

**Alternativa**: Usar un linter ESLint o verificar en tests unitarios React:

```javascript
// Pseudo-código para testing con Vitest
describe('EditClientModal PropTypes', () => {
  it('E17: rechaza prop isOpen no booleana', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    render(<EditClientModal isOpen="true" ... />);
    expect(consoleSpy).toHaveBeenCalled();
  });
  
  it('E18: requiere función onClose', () => {
    expect(() => {
      render(<EditClientModal onClose={undefined} ... />);
    }).toThrow('onClose is required');
  });
});
```

---

## 📊 RESUMEN DE AUTOMATIZACIÓN

| Escenario | Tipo | Automatizable | Herramienta |
|-----------|------|---|---|
| E1-E2 | Visibilidad | ✅ Sí | Selenium IDE |
| E3-E8 | Edición de datos | ✅ Sí | Selenium IDE |
| E9-E11 | Validación de campos | ✅ Sí (parcial) | Selenium IDE + DevTools |
| E12-E16 | Comportamiento | ✅ Sí | Selenium IDE |
| E17-E20 | PropTypes | ❌ No / ✅ Parcial | Vitest / ESLint |

---

## 🚀 EJECUCIÓN

### Seleniumde IDE
```bash
# Crear test .side con estos mapeos
npx selenium-side-runner -c "chromedriver" EditClientModal.side
```

### Vitest (Unit Testing)
```bash
# Tests de lógica React
npm run test:coverage -- src/components/test/EditClientModal.test.jsx
```

### Combinado
```bash
# Ejecutar ambos
npm run test:coverage && npx selenium-side-runner tests/*.side
```

---

**Versión**: 1.0  
**Fecha**: 02/03/2026  
**Estado**: Listo para Automatización
