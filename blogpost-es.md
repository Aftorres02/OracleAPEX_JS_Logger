# Oracle APEX JS Logger: Logging Simple para Aplicaciones en Producción

Oracle APES JS Logger, nace de la necesida para tener un log de en Javascript con dos importantes funcinalidades; Controlar la cantidad de logs que son mostradas en consola, dependiendo del caso y el debug que se este haciendo.
Y la otra importante es tener log a nivel de producción, donde los errores no se reportan directamente y eso dificulta el debug.



## El Problema: JavaScript Invisible

**Cliente (JavaScript)** — Fallos silenciosos, sin rastro cuando algo falla

Esto crea una experiencia de depuración ineficiente:
- Un usuario reporta un problema, pero no puedes reproducirlo
- Ves el error en DevTools, pero los usuarios en producción no lo tienen abierto
- No hay auditoría de acciones del usuario
- No hay métricas de rendimiento para operaciones lentas
- Datos sensibles podrían registrarse accidentalmente

## Caracteristicas principales

- Configuración de *colores* para la consola.
- **logger.logServer**, para hacer log in la base de datos usando PLSQL logger
- Enmascaramiento automático de datos, para campos sensibles
- **Medición de tiempo** para encontrar cuellos de botella
- **Modulos** para saber de donde fue lanzado el console.log
- **Configuración de acuerdo al entorno** DEV, UAT, PROD


## Como Iniciar:

### Paso 1: Cargar los archivos

Carga los archivos a tu aplicación APEX:

```html
#WORKSPACE_FILES#js/logger-config.js
#WORKSPACE_FILES#js/logger.js
```

### Paso 2: Usabilidad

```javascript
// Uso básico
namespace.logger.log('Aplicación iniciada', 'AppMain');

// Con datos
namespace.logger.log('Acción del usuario', 'UI', {
  accion: 'click_boton',
  paginaId: apex.env.APP_PAGE_ID
});

// Para eventos en producción
namespace.logger.logServer('Pago procesado', 'Pagos', {
  ordenId: 'ORD-123',
  monto: 99.99
});
```


## Ejemplos avanzados

### 1. Tres Niveles de Log con Colores

El logger proporciona tres niveles de log que automáticamente se muestran en diferentes colores:

**Información (Azul)**
```javascript
namespace.logger.log('Usuario inició sesión', 'Auth', { userId: 123 });
```

**Advertencia (Naranja)**
```javascript
namespace.logger.warning('API lenta', 'Red', { tiempoRespuesta: 3500 });
```

**Error (Rojo)**
```javascript
namespace.logger.error('Validación fallida', 'Formulario', { campo: 'email' });
```

### 2. Enmascaramiento Automático de Datos

La seguridad está integrada. Los campos sensibles se enmascaran automáticamente:

```javascript
namespace.logger.log('Intento de inicio de sesión', 'Auth', {
  usuario: 'john.doe',
  contrasena: 'secret123',  // Automáticamente se convierte en: ***MASKED***
  token: 'abc123'           // Automáticamente se convierte en: ***MASKED***
});
```

### 3. Medición de Rendimiento

Mide cuánto tardan las operaciones:

```javascript
// Iniciar medición
namespace.logger.timeStart('carga-pagina');

// ... realizar trabajo ...

// Detener y registrar tiempo transcurrido
var tiempo = namespace.logger.timeStop('carga-pagina', 'Rendimiento');
// Salida: "carga-pagina completada en 125.43ms"
```

### 4. Loggers con Alcance Modular

Crea un logger para tu módulo con contexto persistente, esto es util cuando se construyan otras librerias de JS y deseas integrarlo en ello:

```javascript
// Crear un logger de módulo
var logger = namespace.logger.createModuleLogger('ModuloPagos');

// Establecer contexto que aplica a todos los logs de este módulo
logger.setExtra({ version: '2.0', caracteristica: 'checkout' });

// Ahora todos los logs automáticamente incluyen el contexto
logger.log('Procesando pago', { monto: 99.99 });
logger.error('Pago fallido', { razon: 'fondos_insuficientes' });

// Limpiar contexto cuando termines
logger.clearExtra();
```

### 5. Logging en Consola vs Servidor

Dos modos de logging para diferentes necesidades:

**Solo consola** (desarrollo)
```javascript
namespace.logger.log('Info de depuración', 'MiModulo', { data: 'valor' });
```

**Consola + Base de Datos** (producción)
```javascript
namespace.logger.logServer('Evento importante', 'Negocio', { 
  ordenId: 'ORD-123',
  accion: 'pedido_enviado' 
});
```

### 6. Configuración por Entorno

Configura una vez, comportate diferente por entorno:

```javascript
// Desarrollo: salida de consola detallada
var devConfig = namespace.loggerConfig.getEnvConfig('development');
namespace.loggerConfig.configure(devConfig);

// Producción: solo errores, con logging al servidor
var prodConfig = namespace.loggerConfig.getEnvConfig('production');
namespace.loggerConfig.configure(prodConfig);
```
 

## Configuración

Si bien existen varios parametros para la configuración el mas util podriamos indicar el apagado o asginacion de acuerdo al entorno.

Para apagarlo tenemos dos formas, poner el level en OFF o a traves de un metodo.

```javascript
namespace.loggerConfig.configure({
  level: 'OFF',  // OFF | ERROR | WARNING | INFORMATION
});

//reset the level according the main configuration
namespace.loggerConfig.resetLevel();

```

## Configuración para Producción

Para almacenar logs en tu base de datos, crea un proceso APEX llamado `JS_LOGGER`:

```sql
declare
  l_level        varchar2(50)   := apex_application.g_x01;
  l_text         varchar2(4000) := apex_application.g_x02;
  l_module       varchar2(100)  := apex_application.g_x03;
  l_extra_json   clob           := apex_application.g_x04;
  l_timestamp    varchar2(50)   := apex_application.g_x05;
  l_user         varchar2(100)  := apex_application.g_x06;
  l_page_id      number         := apex_application.g_x07;
  l_session      number         := apex_application.g_x08;
  
begin

  
  -- Call logger package to insert log entry
  logger.log(
      p_text    => l_text
    , p_scope   => l_module
    , p_extra   => l_extra_json
    --, p_params  => null
   -- p_timestamp   => to_timestamp_tz(l_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.FF3TZR'),
   -- p_user        => l_user,
   -- p_page_id     => l_page_id,
   -- p_session     => l_session
  );
  
  -- Return success response
  apex_json.open_object;
  apex_json.write('success', true);
  apex_json.close_object;

exception
  when others then
    apex_json.open_object;
    apex_json.write('success', false);
    apex_json.write('error_msg', sqlerrm);
    apex_json.close_object;
end;
```


## Aprende Más

- **Ejemplos:** 5 ejemplos enfocados cubriendo todas las características
- **Demo:** Implementación completa de un módulo de pagos
- **GitHub:** Código fuente completo y documentación