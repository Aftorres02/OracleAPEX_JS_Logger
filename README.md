# Logger JavaScript Library

Una librería de logging en JavaScript que simula la funcionalidad de Logger Oracle, diseñada para integración con Oracle APEX.

## 📁 Estructura de Archivos

```
logger_js/
├── logger.js          - Clase principal Logger
├── logger-config.js   - Configuración y constantes
├── logger-utils.js    - Utilidades (timing, formateo, APEX)
├── logger-example.js  - Ejemplos de uso
└── README.md          - Esta documentación
```

## 🚀 Instalación

### 1. Incluir en APEX
Agregar los archivos JavaScript en el orden correcto:

```html
<!-- En Page Designer > JavaScript > File URLs -->
#APP_FILES#logger_js/logger-config.js
#APP_FILES#logger_js/logger-utils.js
#APP_FILES#logger_js/logger.js
#APP_FILES#logger_js/logger-example.js
```

### 2. Verificar Dependencias
- jQuery (incluido en APEX)
- APEX JavaScript APIs
- Browser moderno (ES6+)

## ⚙️ Configuración

### Configuración Básica
```javascript
// Configuración por defecto
namespace.logger.configure({
  level: 'INFO',           // Nivel de logging
  enableConsole: true,     // Mostrar en consola
  enableServer: true,      // Enviar al servidor
  enableBuffer: true,      // Usar buffer
  bufferSize: 100,         // Tamaño del buffer
  flushInterval: 30000,    // Intervalo de envío (ms)
  retryCount: 1            // Intentos de reenvío
});
```

### Configuración por Ambiente
```javascript
// Desarrollo
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.logger.configure(devConfig);

// Producción
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.logger.configure(prodConfig);
```

## 📝 Uso Básico

### Logging Simple
```javascript
// Método principal (equivalente a logger.log en PL/SQL)
namespace.logger.log('Mensaje de log', 'scope_name');

// Métodos específicos por nivel
namespace.logger.error('Error crítico', 'error_scope');
namespace.logger.warning('Advertencia', 'warning_scope');
namespace.logger.info('Información', 'info_scope');
namespace.logger.debug('Debug info', 'debug_scope');
```

### Logging con Datos Adicionales
```javascript
namespace.logger.info('Usuario autenticado', 'authentication', {
  user_id: 123,
  timestamp: new Date().toISOString(),
  ip_address: '192.168.1.1'
});
```

### Logging con Nivel Personalizado
```javascript
namespace.logger.log('Mensaje personalizado', 'scope', extraData, 'ERROR');
```

## ⏱️ Funciones de Timing

### Timing Básico
```javascript
// Iniciar timing
namespace.logger.timeStart('operation_name');

// ... código de la operación ...

// Detener timing y loggear resultado
namespace.logger.timeStop('operation_name', 'performance_scope');
```

### Timing Múltiple
```javascript
namespace.logger.timeStart('data_loading');
namespace.logger.timeStart('ui_rendering');

// ... operaciones ...

namespace.logger.timeStop('data_loading', 'performance');
namespace.logger.timeStop('ui_rendering', 'performance');
```

## 🎯 Gestión de Contexto

### Push/Pop Context
```javascript
// Establecer contexto
namespace.loggerUtils.pushContext('ticket_creation', {
  user_id: 123,
  project_id: 456
});

// ... operaciones en contexto ...

// Remover contexto
var context = namespace.loggerUtils.popContext();
```

### Contexto Automático
```javascript
// El contexto se mantiene automáticamente
namespace.logger.info('Operación en contexto');
```

## 🔧 Configuración Avanzada

### Cambio Dinámico de Nivel
```javascript
// Cambiar nivel en runtime
namespace.logger.setLevel('DEBUG');

// Verificar nivel actual
var currentLevel = namespace.logger.getLevel();
```

### Configuración Completa
```javascript
namespace.logger.configure({
  level: 'WARNING',
  enableConsole: false,
  enableServer: true,
  bufferSize: 500,
  flushInterval: 60000
});
```

## 🌐 Integración con APEX

### Variables de Contexto APEX
```javascript
namespace.logger.info('Página cargada', 'page_rendering', {
  page_id: apex.env.APP_PAGE_ID,
  user: apex.env.APP_USER,
  session: apex.env.APP_SESSION,
  app: apex.env.APP_ID
});
```

### Dynamic Actions
```javascript
// Función para usar en Dynamic Actions
window.logUserAction = function(action, details) {
  namespace.logger.info(`User action: ${action}`, 'dynamic_action', {
    action: action,
    details: details,
    page: apex.env.APP_PAGE_ID
  });
};
```

### Proceso de Servidor
```javascript
// El logger envía automáticamente a:
// apex.env.APP_IMAGES_URL + 'logger_process.sql'

// Con los siguientes parámetros:
// x01: level, x02: text, x03: scope, x04: extra (JSON)
// x05: timestamp, x06: user, x07: page, x08: session
```

## 📊 Niveles de Logging

### Jerarquía de Niveles
```
OFF: 0           - No logging
PERMANENT: 1     - Logs permanentes
ERROR: 2         - Errores
WARNING: 4       - Advertencias
INFORMATION: 8   - Información
DEBUG: 16        - Debug
TIMING: 32       - Timing
SYS_CONTEXT: 64  - Contexto del sistema
APEX: 128        - APEX específico
```

### Control de Niveles
```javascript
// Solo ERROR y WARNING
namespace.logger.setLevel('WARNING');

// Solo ERROR
namespace.logger.setLevel('ERROR');

// Todo (incluyendo DEBUG)
namespace.logger.setLevel('DEBUG');
```

## 🔄 Gestión del Buffer

### Control Manual del Buffer
```javascript
// Forzar envío inmediato
namespace.logger.flush();

// Limpiar buffer
namespace.logger.clearBuffer();

// Ver tamaño del buffer
var bufferSize = namespace.logger.getBufferSize();
```

### Configuración del Buffer
```javascript
namespace.logger.configure({
  bufferSize: 200,        // Enviar cuando llegue a 200
  flushInterval: 60000    // O cada 60 segundos
});
```

## 🛠️ Utilidades Adicionales

### Formateo de Timestamps
```javascript
var formatted = namespace.loggerUtils.formatTimestamp(
  new Date(), 
  'HH:mm:ss'
);
```

### Información del Navegador
```javascript
var browserInfo = namespace.loggerUtils.getBrowserInfo();
var perfInfo = namespace.loggerUtils.getPerformanceInfo();
```

### Sanitización de Mensajes
```javascript
var safeMessage = namespace.loggerUtils.sanitizeMessage(
  '<script>alert("xss")</script>'
);
```

## 📋 Ejemplos de Uso

### Ejemplo 1: Aplicación Web
```javascript
// Configuración inicial
namespace.logger.configure({
  level: 'INFO',
  enableConsole: true,
  enableServer: true
});

// Logging de eventos
namespace.logger.info('Aplicación iniciada', 'app_startup');
namespace.logger.timeStart('page_load');

// ... carga de página ...

namespace.logger.timeStop('page_load', 'performance');
namespace.logger.info('Página cargada exitosamente', 'page_ready');
```

### Ejemplo 2: Manejo de Errores
```javascript
try {
  // Operación que puede fallar
  var result = riskyOperation();
  namespace.logger.info('Operación exitosa', 'business_logic', result);
} catch (error) {
  namespace.logger.error('Operación falló', 'business_logic', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}
```

### Ejemplo 3: Monitoreo de Performance
```javascript
namespace.logger.timeStart('user_workflow');

// ... flujo de trabajo del usuario ...

namespace.logger.timeStop('user_workflow', 'user_experience');
namespace.logger.info('Workflow completado', 'user_experience');
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Logs no aparecen en consola
```javascript
// Verificar configuración
console.log(namespace.logger.getConfig());

// Verificar nivel
console.log(namespace.logger.getLevel());
```

#### 2. Logs no se envían al servidor
```javascript
// Verificar configuración del servidor
namespace.logger.configure({
  enableServer: true,
  enableBuffer: true
});

// Forzar envío
namespace.logger.flush();
```

#### 3. Error de APEX no disponible
```javascript
// Verificar que APEX esté disponible
if (typeof apex !== 'undefined' && apex.env) {
  namespace.logger.info('APEX disponible', 'initialization');
} else {
  console.warn('APEX no disponible');
}
```

## 📚 Referencias

### Funciones Principales
- `namespace.logger.log(text, scope, extra, level)` - Logging principal
- `namespace.logger.setLevel(level)` - Cambiar nivel
- `namespace.logger.configure(options)` - Configurar logger
- `namespace.logger.timeStart(unit)` - Iniciar timing
- `namespace.logger.timeStop(unit, scope)` - Detener timing

### Configuración
- `namespace.loggerConfig.getEnvConfig(env)` - Configuración por ambiente
- `namespace.loggerConfig.getLogLevels()` - Niveles disponibles
- `namespace.loggerConfig.isValidLevel(level)` - Validar nivel

### Utilidades
- `namespace.loggerUtils.getApexContext(keys)` - Contexto APEX
- `namespace.loggerUtils.pushContext(scope, context)` - Establecer contexto
- `namespace.loggerUtils.formatTimestamp(timestamp, format)` - Formatear timestamp

## 🤝 Contribución

Para contribuir al desarrollo de esta librería:

1. Mantener el patrón de código existente
2. Usar indentación de 2 espacios
3. Funciones internas con prefijo `_`
4. Documentar todas las funciones públicas
5. Seguir el patrón de namespace establecido

## 📄 Licencia

Esta librería sigue el mismo patrón de licencia que Logger Oracle (MIT License).
