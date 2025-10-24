# API REST - Laboratorio 8 - IC8057

API REST desarrollada con Node.js, Express y Supabase que implementa autenticación, autorización, validaciones y manejo de errores siguiendo las mejores prácticas de la industria.

## Características

- Autenticación: API Key para endpoints públicos
- Autorización: JWT con roles (admin, editor, viewer)
- Base de Datos: Supabase (PostgreSQL en la nube)
- Content Negotiation: Respuestas en JSON y XML
- Validaciones: Validación completa de datos de entrada
- Manejo de Errores: Middleware centralizado con formato estándar
- Códigos HTTP: Implementación correcta de códigos de estado
- Documentación: Colección completa de Postman

## Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Supabase** - Base de datos PostgreSQL en la nube
- **JWT** - JSON Web Tokens para autenticación
- **dotenv** - Manejo de variables de entorno
- **xml-js** - Conversión JSON a XML

## Estructura del Proyecto

```
node-rest-api/
├── app.js                      # Archivo principal
├── package.json                # Configuración del proyecto
├── .env                        # Variables de entorno
├── controllers/
│   ├── authController.js       # Lógica de autenticación
│   └── productsController.js   # Lógica de productos
├── routes/
│   ├── auth.js                 # Rutas de autenticación
│   └── products.js             # Rutas de productos
├── middlewares/
│   ├── authMiddleware.js       # Middleware de autenticación
│   └── errorMiddleware.js      # Middleware de manejo de errores
├── models/
│   └── supabaseClient.js       # Cliente de Supabase
├── utils/
│   └── xmlConverter.js         # Utilidad para conversión XML
└── docs/
    ├── README.md               # Guía de uso de Postman
    ├── *.postman_collection.json
    └── *.postman_environment.json
```

## Instalación y Configuración

### 1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd node-rest-api
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:

```env
PORT=3000
API_KEY=tu-api-key-de-supabase
JWT_SECRET=tu-jwt-secret-super-seguro
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key
```

### 4. **Configurar base de datos en Supabase**

Ejecutar estos scripts SQL en tu proyecto de Supabase:

```sql
-- Tabla de usuarios
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  username VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_username_key UNIQUE (username),
  CONSTRAINT usuarios_role_check CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- Tabla de productos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  sku VARCHAR NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  stock BIGINT NOT NULL,
  category VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_sku_key UNIQUE (sku)
);

-- Datos de prueba para usuarios
INSERT INTO public.usuarios (username, password, role) VALUES 
  ('admin', 'admin123', 'admin'),
  ('editor', 'editor123', 'editor'),
  ('viewer', 'viewer123', 'viewer');

-- Datos de prueba para productos
INSERT INTO public.products (name, sku, price, stock, category) VALUES 
  ('Laptop Gaming', 'LAP-GAM-001', 1200, 15, 'Electronics'),
  ('Mouse Inalambrico', 'MOU-WIR-001', 25.5, 100, 'Accessories'),
  ('Teclado Mecanico', 'KEY-MEC-001', 89.99, 30, 'Accessories');
```

### 5. **Ejecutar la aplicación**

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Iniciar sesión | API Key |

### Productos - Públicos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/products` | Listar productos | API Key |
| GET | `/products/:id` | Obtener producto por ID | API Key |

### Productos - Protegidos

| Método | Endpoint | Descripción | Roles Permitidos |
|--------|----------|-------------|------------------|
| POST | `/products` | Crear producto | editor, admin |
| PUT | `/products/:id` | Actualizar producto | editor, admin |
| DELETE | `/products/:id` | Eliminar producto | admin |

## Pruebas con Postman

1. **Importar la colección** desde `docs/Laboratorio-8-API-REST.postman_collection.json`
2. **Importar el environment** desde `docs/Laboratorio-8-Environment.postman_environment.json`
3. **Ejecutar las pruebas** siguiendo la guía en `docs/README.md`

### **Headers Requeridos:**

**Para endpoints públicos:**
```
x-api-key: tu-api-key
```

**Para endpoints protegidos:**
```
Authorization: Bearer jwt-token-obtenido-del-login
```

**Para negociación de contenido:**
```
Accept: application/json  # Para JSON (default)
Accept: application/xml   # Para XML
```

## Códigos de Estado HTTP

| Código | Descripción | Casos de Uso |
|--------|-------------|--------------|
| 200 | OK | Consultas exitosas |
| 201 | Created | Recurso creado |
| 204 | No Content | Recurso eliminado |
| 401 | Unauthorized | API Key/JWT faltante o inválido |
| 403 | Forbidden | Permisos insuficientes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | SKU duplicado |
| 422 | Unprocessable Entity | Errores de validación |
| 500 | Internal Server Error | Errores del servidor |

## Formato de Respuestas

### **Respuesta Exitosa:**
```json
{
  "data": { "producto": "..." },
  "pagination": { "page": 1, "limit": 10 }
}
```

### **Respuesta de Error:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found",
    "details": {},
    "timestamp": "2025-10-03T04:30:00.000Z",
    "path": "/products/999"
  }
}
```
