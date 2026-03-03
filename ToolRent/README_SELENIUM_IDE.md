# 🚀 Guía de Implementación - Automatización ToolRent con Selenium IDE

**Fecha**: 2 Marzo 2026  
**Versión**: 1.0  
**Status**: Listo para implementación

---

## 📋 Contenido del Paquete de Automatización

Este paquete incluye:

```
📦 ToolRent_Automation/
├── 📄 HISTORIAS_USUARIO_ADAPTADAS.md
│   └── Historias de usuario adaptadas a funcionalidad existente
│       - HU001: Registro de nuevo préstamo
│       - HU002: Validación de disponibilidad
│       - HU003: Bloqueo de préstamos
│       - HU004: Devolución de herramientas
│       - HU005: Cálculo de multas
│       - HU006: Estado físico de herramientas
│       - HU007: Límite de 5 préstamos
│
├── 📄 SELENIUM_IDE_TEST_CASES.md
│   └── Guía detallada con ejemplos de test cases
│       - Scripts en formato JSON
│       - Data fixtures configurables
│       - Best practices
│       - Troubleshooting
│
├── 🤖 toolrent-selenium-suite.side
│   └── Archivo importable directamente en Selenium IDE
│       - 8 test cases listos para ejecutar
│       - 7 suites organizadas por HU
│       - 1 suite completa con todos los tests
│
└── 📖 README.md (este archivo)
    └── Guía paso a paso de setup e implementación
```

---

## 🎯 Objetivos de Esta Automatización

✅ **Comprobable**: Cada test case tiene validaciones explícitas  
✅ **Mantenible**: Xpaths relativos y robusos  
✅ **Escalable**: Fácil agregar nuevos tests  
✅ **Documentado**: Paso a paso claro  
✅ **CI/CD Ready**: Exportable a JSON para pipelines  

---

## 📊 Tests Incluidos

| ID | Nombre | Prioridad | Estado |
|---|---|---|---|
| HU001-S1 | Crear Préstamo Exitoso | 🔴 CRÍTICA | ✅ Ready |
| HU001-S2 | Cliente Bloqueado | 🔴 CRÍTICA | ✅ Ready |
| HU002-S1 | Stock Cero | 🟠 ALTA | ✅ Ready |
| HU003-S1 | Límite 5 Préstamos | 🔴 CRÍTICA | ✅ Ready |
| HU004-S1 | Devolución Exitosa | 🔴 CRÍTICA | ✅ Ready |
| HU004-S3 | Cargos Extra | 🟠 ALTA | ✅ Ready |
| HU006-S1 | Estados Herramientas | 🟠 ALTA | ✅ Ready |
| HU007-S3 | Liberación de Cupo | 🟠 ALTA | ✅ Ready |

---

## 🔧 Instalación (5 minutos)

### Paso 1: Instalar Selenium IDE

**Para Chrome:**
```
1. Abrir: https://chrome.google.com/webstore
2. Buscar: "Selenium IDE"
3. Click: "Agregar a Chrome"
4. Confirmar: "Agregar extensión"
5. Verificar: Icono en toolbar superior derecha
```

**Para Firefox:**
```
1. Abrir: https://addons.mozilla.org
2. Buscar: "Selenium IDE"
3. Click: "Agregar a Firefox"
4. Confirmar instalación
5. Verificar: Icono en toolbar
```

### Paso 2: Verificar Instalación

```
1. Presionar F12 en navegador
2. Deberías ver icono de Selenium IDE
3. Click en icono
4. Debería abrirse panel lateral
5. Listo para crear/importar proyectos
```

### Paso 3: Lanzar ToolRent Localmente

```bash
# Terminal 1: Backend
cd /path/to/backend
npm install
npm run dev
# Escuchar si backend está en puerto 8080 o similar

# Terminal 2: Frontend
cd /home/maria-fuentes/Escritorio/Lab3_Tingeso_21575622k/Lab1_Tingeso_21575622k/ToolRent
npm install
npm run dev
# Deberías ver: http://localhost:5173
```

### Paso 4: Preparar Datos de Prueba

```javascript
// IMPORTANTE: Los tests requieren estos datos en BD

Clientes necesarios:
{
  "name": "Juan Pérez",
  "rut": "12345678-9",
  "status": "ACTIVO",
  "phone": "2123456789",
  "email": "juan@test.com"
}

{
  "name": "Pedro García",
  "rut": "98765432-1",
  "status": "BLOQUEADO",
  "phone": "2187654321",
  "email": "pedro@test.com"
}

{
  "name": "Diego Torres",
  "rut": "11111111-1",
  "status": "ACTIVO",
  "phone": "2111111111",
  "email": "diego@test.com"
  // IMPORTANTE: Este cliente DEBE tener exactamente 5 rentals activos
}

{
  "name": "Ana Silva",
  "rut": "22222222-2",
  "status": "ACTIVO",
  "phone": "2122222222",
  "email": "ana@test.com"
}

Herramientas necesarias:
{
  "code": "TAD-001",
  "name": "Taladro",
  "category": "Herramientas",
  "stock": 5,
  "status": 0,  // 0 = Disponible
  "price": 5000,
  "replacementValue": 50000
}

{
  "code": "SIE-001",
  "name": "Sierra Circular",
  "category": "Herramientas",
  "stock": 5,
  "status": 0,
  "price": 3000,
  "replacementValue": 30000
}

{
  "code": "MAR-001",
  "name": "Martillo",
  "category": "Herramientas Manuales",
  "stock": 0,  // Stock cero para test HU002-S1
  "status": 0,
  "price": 1000,
  "replacementValue": 10000
}

Usuario empleado:
{
  "email": "empleado@test.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```

---

## 🚀 Importar Tests en Selenium IDE (3 pasos)

### Opción A: Importar archivo completo (RECOMENDADO)

```
1. Abrir Selenium IDE
   └─ Click en icono en toolbar

2. Click en menú: File > Import Project
   └─ Se abre file picker

3. Seleccionar: toolrent-selenium-suite.side
   └─ Ubicación: /path/to/ToolRent/toolrent-selenium-suite.side

4. Automáticamente debería cargar:
   └─ Project: "ToolRent Automation Suite"
   └─ 8 tests individuales
   └─ 7 suites organizadas
   └─ 1 suite completa

5. Verificar que Base URL es: http://localhost:5173
   └─ Si no: Click Project > Settings > URL = http://localhost:5173
```

### Opción B: Crear manualmente (si necesitas aprender)

```
1. Abrir Selenium IDE
2. Click: Create a new project
3. Nombre: "ToolRent_Automation"
4. Base URL: http://localhost:5173
5. Click: Create
6. Para cada test:
   a. Click: Create new test
   b. Nombre: "HU001-S1: Crear Préstamo"
   c. Copy/paste comandos de SELENIUM_IDE_TEST_CASES.md
   d. Grabar/Reproducir para validar
```

---

## ▶️ Ejecutar Tests (Opción por Opción)

### Método 1: Ejecutar Test Individual

```
1. Click en test: "HU001-S1: Crear Préstamo Exitoso"
2. Click botón PLAY (▶️) en barra superior
3. Observar:
   - Chrome/Firefox abre ventana nueva
   - Pasos se ejecutan uno por uno
   - Cada paso aparece en lado izquierdo
   - Verificaciones aparecen en columna "status"
4. Esperar a que termine
   - ✅ = Test paso
   - ❌ = Test falló
5. Ver logs en bottom panel
```

### Método 2: Ejecutar Suite Completa

```
1. Expandir suite: "SUITE COMPLETA - Todos los Tests" (lado izquierdo)
2. Click botón PLAY (▶️)
3. Sistema ejecutará todos los tests en orden
4. Genera reporte al final con:
   - Total de tests: 8
   - Pasados: ✅
   - Fallidos: ❌
   - Duración total
5. Logs detallados para cada uno
```

### Método 3: Ejecutar en Headless (Para CI/CD)

```bash
# Instalar CLI de Selenium IDE
npm install -g selenium-ide

# Ejecutar sin UI (headless)
selenium-ide --extTest toolrent-selenium-suite.side --headless

# Exportar resultados a JSON
selenium-ide --extTest toolrent-selenium-suite.side --headless --output-format json > results.json

# Ver resultados
cat results.json
```

---

## 📊 Interpretar Resultados

### Panel de Ejecución

```
Columna "Command"     : Qué se ejecutó
Columna "Target"      : Elemento/selector usado
Columna "Value"       : Valor ingresado o esperado
Columna "Status"      : ✅ Success | ❌ Failed | ⏳ Running

Si una línea es roja (❌):
├─ Leer mensaje de error en panel inferior
├─ Verificar selector (F12 > Inspect Element)
├─ Aumentar timeout si es un timing issue
└─ Reportar en hoja de tracking
```

### Panel de Logs

```
Bottom panel muestra:
- Timestamp de cada comando
- Duration (cuánto tardó)
- Error messages si las hay
- Screenshots (si está habilitado)

Buscar "Failed" para encontrar punto de falla
```

---

## 🔍 Troubleshooting Rápido

### Error: "Element not found"
```
Causa: XPath incorrecto o elemento no existe
Solución:
1. Pausar test (click pause)
2. Abrir DevTools (F12) en ventana del test
3. Copiar XPath correcto del elemento
4. Editar comando en Selenium IDE
5. Rerun

Comando test:
- verifyElementPresent para chequear existencia antes
```

### Error: "Alert was not found"
```
Causa: Alert no apareció (timing issue)
Solución:
1. Elemento anterior puede ser lento
2. Aumentar timeout antes de waitForAlert:
   - Cambiar: waitForAlert | 3000
   - A:       waitForAlert | 5000
3. Agregar pause: pause | 1000 (antes de alert)
```

### Error: "Selector returned 0 elements"
```
Causa: Elemento no visible o CSS cambió
Solución:
1. Usar F12 > Elements > Ctrl+F para buscar
2. Copiar XPath: Right click > Copy XPath
3. Probar en console: $x("//tu/xpath").length
4. Si length = 0, selector está mal
5. Probar alternativas en elemento padre
```

### Error: "Select option not found"
```
Causa: Option con ese value/label no existe
Solución:
1. Ejecutar test hasta ese paso
2. F12 > Inspect el select
3. Ver opciones reales disponibles
4. Verificar que dato existe en BD
5. Para combobox cascading:
   - Puede que primero dropdown no esté poblado
   - Agregar waitForElement para poblar opciones
```

---

## 🔄 Ciclo de Trabajo: Crear Test Nuevo

```
1. PLANIFICAR
   ├─ Escribir pasos en HISTORIAS_USUARIO_ADAPTADAS.md
   ├─ Identificar selectores (F12)
   └─ Preparar datos de prueba

2. CREAR
   ├─ Abrir Selenium IDE
   ├─ Create new test
   ├─ Copiar/Grabar comandos
   └─ Salvar

3. EJECUTAR LOCAL
   ├─ Click play
   ├─ Observar y debuguear
   ├─ Ajustar xpaths si falla
   └─ Iterar hasta que pase

4. DOCUMENTAR
   ├─ Agregar comentarios en test
   ├─ Documentar xpaths frágiles
   ├─ Actualizar SELENIUM_IDE_TEST_CASES.md
   └─ Exportar .side actualizado

5. VERSIONAR
   ├─ Guardar nuevo .side
   ├─ Subir a GitHub
   └─ Documentar cambios en README
```

---

## 📈 Métricas y Reporting

### Generación de Reporte

```bash
# Ejecutar y generar JSON
selenium-ide --extTest toolrent-selenium-suite.side --output-format json > report.json

# Parsear para resumen
cat report.json | jq '.[] | {test: .name, passed: .passed, duration: .duration}'

# Ejemplo output:
{
  "test": "HU001-S1: Crear Préstamo",
  "passed": true,
  "duration": 15234
}
{
  "test": "HU003-S1: Límite 5",
  "passed": true,
  "duration": 12891
}
```

### Dashboard (Excel)

| Test | Status | Duration | Date | Notes |
|---|---|---|---|---|
| HU001-S1 | ✅ | 15.2s | 2026-03-02 | Exitoso |
| HU001-S2 | ✅ | 8.1s | 2026-03-02 | Exitoso |
| HU003-S1 | ⚠️ | 12.5s | 2026-03-02 | Timeout en alert |
| ... | ... | ... | ... | ... |

---

## 🔐 Buenas Prácticas de Seguridad

```
⚠️ IMPORTANTE:

1. Nunca commitear credenciales reales
   ├─ Usar variables de entorno
   └─ O datos de test en BD separada

2. Usar BD de TEST, no PROD
   ├─ Verificar siempre URL = localhost
   └─ Confirmar en settings que es test env

3. Limpiar datos después de tests
   ├─ Tests pueden dejar datos en BD
   ├─ Considerar reset/fixture antes/después
   └─ O usar transacciones que revierten

4. No ejecutar en máquina compartida
   └─ Especialmente tests con operaciones críticas

5. Logs y screenshots
   ├─ Pueden contener datos sensibles
   └─ No commitear con credenciales visibles
```

---

## 🚀 Próximos Pasos

### Fase 1: Setup Inicial (Hoy)
- [ ] Instalar Selenium IDE
- [ ] Importar archivo toolrent-selenium-suite.side
- [ ] Ejecutar tests localmente
- [ ] Documentar resultados

### Fase 2: Validación (Esta Semana)
- [ ] Ajustar xpaths según tu BD
- [ ] Agregar más tests según necesidad
- [ ] Crear documentación de datos fixtures
- [ ] Validar con QA team

### Fase 3: Integración CI/CD (Próxima Semana)
- [ ] Setup automated execution
- [ ] Integrar en GitHub Actions o Jenkins
- [ ] Configurar reporting automático
- [ ] Definir SLAs de ejecución

### Fase 4: Cobertura Completa (Mes)
- [ ] Tests para HU001-HU007 100%
- [ ] Agregar tests de error cases
- [ ] Performance tests
- [ ] Stress testing (carga)

---

## 📞 Soporte y Contacto

### Si algo no funciona:

1. **Verificar Prerequisites**
   ```
   □ ToolRent corriendo en localhost:5173
   □ Backend funcional
   □ Clientes de prueba existen en BD
   □ Selenium IDE instalado
   □ Chrome/Firefox actualizado
   ```

2. **Revisar Ficheros Incluidos**
   - HISTORIAS_USUARIO_ADAPTADAS.md (contexto)
   - SELENIUM_IDE_TEST_CASES.md (xpaths)
   - toolrent-selenium-suite.side (code)

3. **Debugging**
   - Ejecutar step by step (play/pause)
   - Inspeccionar elementos (F12)
   - Ver logs en panel inferior
   - Aumentar timeouts si es timing

4. **Reporte de Issues**
   - Incluir: Test name, screenshot, error message
   - Describir: Qué esperas vs qué pasó
   - Datos: Clientes/herramientas usados

---

## 📚 Recursos Adicionales

### Documentación
- [Selenium IDE Official Docs](https://www.selenium.dev/selenium-ide/)
- [XPath Cheatsheet](https://devhints.io/xpath)
- [Selenium IDE Commands Reference](https://www.selenium.dev/selenium-ide/docs/en/api/commands)

### Tutoriales
- Selenium IDE Basics: https://youtu.be/...
- XPath Tutorial: https://youtu.be/...
- CI/CD Integration: https://youtu.be/...

### Herramientas
- XPath Checker (Chrome ext): Para validar selectores
- Selenium IDE (Firefox/Chrome): Herramienta principal
- Visual Studio Code: Para editar .side (JSON)

---

## ✅ Checklist Final

Antes de comenzar:
- [ ] Selenium IDE instalado
- [ ] ToolRent corriendo localemente
- [ ] Datos de prueba en BD
- [ ] Archivo toolrent-selenium-suite.side disponible
- [ ] Este README leído completamente
- [ ] Abrir console (F12) para debugging

Después de ejecutar:
- [ ] Todos los tests pasaron (✅)
- [ ] Documentar resultados
- [ ] Si falló, revisar logs
- [ ] Reportar bugs encontrados
- [ ] Actualizar documentación de xpaths

---

## 🎉 ¡Listo para comenzar!

Próximo paso: **Abrir Selenium IDE y Click en File > Import Project**

Seleccionar: `toolrent-selenium-suite.side`

¡Happy Testing! 🚀

---

**Version**: 1.0  
**Last Updated**: 2 Marzo 2026  
**Maintainer**: GitHub Copilot para ToolRent Team
