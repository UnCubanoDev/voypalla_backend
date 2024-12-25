# API de Sistema de Transporte

## Descripción

API backend desarrollada con Strapi para gestionar un sistema de transporte tipo ride-hailing. El sistema permite la gestión de viajes, conductores, propuestas y notificaciones en tiempo real.

### Características Principales

- Sistema de propuestas de viaje
- Geolocalización de conductores y viajes cercanos
- Notificaciones push con Firebase
- Sistema de comisiones variables según horario
- Billetera virtual para conductores
- Sistema de reseñas bidireccional
- Gestión de estados de viaje

## Requisitos Previos

- Node.js >= 14
- PostgreSQL >= 12
- Cuenta de Firebase (para notificaciones push)

## Configuración

1. Clonar el repositorio

```bash
git clone <url-repositorio>
cd <nombre-proyecto>
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno
   Crear archivo `.env` con:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
JWT_SECRET=tu_jwt_secret
ADMIN_JWT_SECRET=tu_admin_jwt_secret
```

4. Configurar Firebase

- Crear proyecto en Firebase Console
- Descargar serviceAccountKey.json
- Colocar en `src/api/notification/path/to/serviceAccountKey.json`

Referencias en el código:

- typescript:src/api/notification/services/notification.ts
- startLine: 8
- endLine: 11

5. Iniciar base de datos

```bash
npm run strapi database:create
npm run strapi database:migrate
```

## Ejecución

### Desarrollo

```bash
npm run develop
```

### Producción

```bash
npm run build
npm run start
```

## Estructura del Proyecto

### Principales Módulos

- **Viajes**: Gestión de solicitudes y estados de viaje
- **Conductores**: Gestión de conductores y vehículos
- **Propuestas**: Gestión de propuestas de viaje
- **Notificaciones**: Servicio de notificaciones push
- **Comisiones**: Gestión de comisiones para conductores
- **Billetera**: Gestión de billetera virtual para conductores
- **Reseñas**: Gestión de reseñas de usuarios

## API Endpoints

Los principales endpoints están disponibles en:

- `/api/trips`: Gestión de viajes
- `/api/drivers`: Gestión de conductores
- `/api/proposals`: Gestión de propuestas
- `/api/driver-reviews`: Reseñas de conductores
- `/api/user-reviews`: Reseñas de usuarios

## Contribución

1. Fork el repositorio
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia de Software Propietario

Copyright (c) 2024

### TÉRMINOS Y CONDICIONES DE USO

1. **PROPIEDAD INTELECTUAL**
   Todo el código fuente, documentación y materiales relacionados (el "Software") están protegidos por derechos de autor y son propiedad exclusiva del desarrollador. Todos los derechos están reservados.

2. **RESTRICCIONES DE USO**
   Queda estrictamente prohibido:

   - Usar, copiar, modificar o distribuir el Software sin el consentimiento expreso por escrito del desarrollador.
   - Realizar ingeniería inversa, descompilar o desensamblar el Software.
   - Usar el Software para crear trabajos derivados.
   - Sublicenciar o transferir los derechos del Software.

3. **CONSENTIMIENTO REQUERIDO**
   Para cualquier uso del Software, se requiere obtener un consentimiento explícito por escrito del desarrollador.

4. **CONTACTO PARA PERMISOS**
   Para solicitar permisos de uso, contactar a:
   uncubanodev@gmail.com

5. **VIOLACIONES**
   Cualquier uso no autorizado del Software constituirá una violación inmediata de esta licencia y estará sujeto a acciones legales.

© 2024 Todos los derechos reservados.
