# Sistema de Gestión de Inventario INVENLINK 24-7
```
👨‍💻 Desarrollador: Franco Catania Dev
🔗 LinkedIn: www.linkedin.com/in/franco-catania-698183283
🐙 GitHub: github.com/FranCa26
📞 Contacto: +54 9 381 3920095 (Argentina)
```
## Descripcion general

Un sistema completo para la gestión de inventario, ventas y entradas de productos, con funcionalidades de impresión de facturas, gestión de roles y autenticación de usuarios, construido con React, Node.js y Express.

## Características

- **Gestión de Productos**: Agregar, editar, visualizar y buscar productos en el inventario.
- **Control de Ventas**: Registrar ventas, seleccionar productos, calcular totales y generar comprobantes.
- **Gestión de Entradas**: Registrar entradas de productos al inventario con detalles de proveedores.
- **Autenticación de Usuarios**: Sistema de login seguro con roles y permisos.
- **Interfaz Responsiva**: Diseño adaptable a dispositivos móviles y de escritorio.
- **Modo Oscuro**: Soporte para tema claro y oscuro para mejorar la experiencia del usuario.

## Tecnologías Utilizadas

### Frontend
- **React**: Biblioteca para construir interfaces de usuario
- **React Router**: Navegación entre componentes
- **Tailwind CSS**: Framework de CSS para el diseño
- **Lucide React**: Iconos modernos y personalizables
- **Framer Motion**: Animaciones
- **Vite**: Herramienta de construcción
- **Lucide React**: Iconos modernos y personalizables

## Backend
- **Node.js**: Entorno de ejecución para JavaScript
- **Express**: Framework para aplicaciones web
- **MySQL**: Base de datos relacional para almacenamiento
- **JWT**: Autenticación basada en tokens
- **bcrypt**: Hash de contraseñas
- **CORS**: Habilitación de CORS
- **dotenv**: Gestión de variables de entorno
- **morgan**: Registro de solicitudes HTTP

## Estructura del Proyecto

```
sistema-inventario/
├── cliente/             # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── paginas/     # Páginas principales
│   │   └── App.jsx      # Componente principal
│   └── package.json     # Dependencias del frontend
│
└── api/                 # Backend Express
    ├── config/          # Conexion a la BDD
    ├── controls/        # Controladores, logica del programa
    ├── modelos/         # Modelos, entidades
    ├── middleware/      # Middleware personalizado
    ├── rutas/           # Definición de rutas API
    └── server.js        # Punto de entrada del servidor
```

## Variables de entorno

- **archivo .env**: 
\`\`\`
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=inventario
   JWT_SECRET=tu_clave_secreta_jwt
\`\`\`

## Configuracion de la BDD, se encuentra en la carpeta database que esta en la raiz. se llama Inventario.Sql

## Módulos Principales

### 1. Gestión de Productos

- **Listado de Productos**: Visualización de todos los productos con filtros y búsqueda.
- **Detalle de Producto**: Vista detallada de información de un producto específico.
- **Agregar Producto**: Formulario para registrar nuevos productos en el inventario.
- **Actualizar Producto**: Edición de información de productos existentes.

### 2. Gestión de Ventas

- **Listado de Ventas**: Historial de ventas realizadas con filtros por fecha y cliente.
- **Nueva Venta**: Interfaz para registrar ventas, seleccionar productos y calcular totales.
- **Detalle de Venta**: Vista detallada de una venta específica con sus productos.

### 3. Gestión de Entradas

- **Listado de Entradas**: Registro de todas las entradas de productos al inventario.
- **Nueva Entrada**: Interfaz para registrar entradas de productos con detalles del proveedor.
- **Detalle de Entrada**: Vista detallada de una entrada específica.

### 4. Autenticación

- **Login**: Sistema de autenticación seguro con JWT.
- **Control de Acceso**: Restricción de funcionalidades según el rol del usuario.

## API Endpoints

### Autenticación
- `POST /api/auth/login`: Iniciar sesión
- `POST /api/auth/register`: Registrar nuevo usuario (solo administradores)
- `GET /api/auth/verificar`: Verificar token de autenticación

### Productos
- `GET /api/productos`: Obtener todos los productos
- `GET /api/productos/:Cod_Producto`: Obtener producto por código
- `POST /api/productos`: Agregar nuevo producto
- `PUT /api/productos/:Cod_Producto`: Actualizar producto existente
- `PUT /api/productos/:Cod_Producto/stock`: Actualizar stock de un producto

### Ventas
- `GET /api/ventas`: Obtener todas las ventas
- `GET /api/ventas/:Id_Venta`: Obtener venta por ID
- `POST /api/ventas`: Crear nueva venta
- `GET /api/ventas/resumen`: Obtener resumen de ventas para dashboard
- `GET /api/ventas/producto/:Cod_Producto`: Obtener ventas por código de producto

### Entradas
- `GET /api/entradas`: Obtener todas las entradas
- `GET /api/entradas/:Id_Entrada`: Obtener entrada por ID
- `POST /api/entradas`: Crear nueva entrada
- `GET /api/entradas/resumen/dashboard`: Obtener resumen de entradas para dashboard

## Licencia

Este proyecto está licenciado bajo la licencia **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

Esto significa que puedes ver, compartir y modificar el código **siempre que**:

- Des crédito al autor original: **Franco Mauricio Catania**.
- **No utilices este código con fines comerciales**.
- Incluyas un enlace a esta licencia:  
  [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

  Para más detalles, consulta el archivo [LICENSE](LICENSE).

## Contacto
```
👨‍💻 Desarrollador: Franco Catania Dev
🔗 LinkedIn: www.linkedin.com/in/franco-catania-698183283
🐙 GitHub: github.com/FranCa26
📞 Contacto: +54 9 381 3920095 (Argentina)
```
¡Esperamos que esta documentación te haya sido útil! Si te gusta el proyecto, no olvides dejar una estrella ⭐ en GitHub.
