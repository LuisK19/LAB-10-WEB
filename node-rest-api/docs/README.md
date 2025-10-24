# Guía de Pruebas con Postman - Laboratorio 8

## Configuración Inicial

### 1. **Importar la Colección en Postman**

1. Abre Postman
2. Haz clic en **"Import"** (esquina superior izquierda)
3. Selecciona **"Upload Files"**
4. Navega a la carpeta `docs/` y selecciona:
   - `Laboratorio-8-API-REST.postman_collection.json`
   - `Laboratorio-8-Environment.postman_environment.json`
5. Haz clic en **"Import"**

### 2. **Configurar el Environment**

1. En Postman, selecciona el environment **"Laboratorio 8 - Environment"** en el dropdown de la esquina superior derecha
2. Verifica que las variables estén configuradas:
   - `base_url`: `http://localhost:3000`
   - `api_key`: Tu clave API de Supabase
   - `jwt_token`: (Se llenará automáticamente al hacer login)

### 3. **Iniciar el Servidor**

Antes de hacer las pruebas, asegúrate de que tu servidor esté corriendo:

```bash
npm start
```

El servidor debe mostrar: `Server Listening on PORT: 3000`

## Estructura de la Colección

### 1. Authentication
- **Login - Success**: Login exitoso con credenciales válidas
- **Login - Invalid Credentials**: Prueba con credenciales incorrectas (401)
- **Login - Missing API Key**: Prueba sin API Key (401)
- **Login - Validation Error**: Prueba con datos vacíos (422)

### 2. Products - Public (API Key)
- **Get All Products - JSON**: Lista de productos en formato JSON
- **Get All Products - XML**: Lista de productos en formato XML
- **Get Product by ID - Success**: Obtener producto específico
- **Get Product by ID - Not Found**: Producto inexistente (404)
- **Get Products - Missing API Key**: Sin API Key (401)

### 3. Products - Protected (JWT)
- **Create Product - Success**: Crear producto como editor
- **Create Product - SKU Conflict**: SKU duplicado (409)
- **Create Product - Validation Error**: Datos inválidos (422)
- **Create Product - Unauthorized**: Sin token JWT (401)
- **Update Product - Success**: Actualizar producto como editor
- **Delete Product - Success**: Eliminar producto como admin (204)
- **Delete Product - Forbidden**: Editor intentando eliminar (403)

## Cómo Ejecutar las Pruebas

### **Opción 1: Pruebas Individuales**
1. Selecciona cualquier request de la colección
2. Haz clic en **"Send"**
3. Revisa la respuesta y los tests automáticos en la pestaña **"Test Results"**

### **Opción 2: Ejecutar toda la Colección**
1. Haz clic derecho en la colección **"Laboratorio 8 - API REST"**
2. Selecciona **"Run collection"**
3. Haz clic en **"Run Laboratorio 8 - API REST"**
4. Observa los resultados de todos los tests

## Tests Automáticos Incluidos

Cada request incluye tests automáticos que verifican:

- **Códigos de estado HTTP** correctos (200, 201, 401, 403, 404, 409, 422)
- **Estructura de respuesta** (propiedades requeridas)
- **Manejo de errores** (formato estándar de error)
- **Negociación de contenido** (JSON vs XML)
- **Autenticación y autorización** (API Key y JWT)
- **Validaciones** (datos requeridos, formatos)

## Datos de Prueba

### **Usuarios Disponibles:**
```json
{
  "admin": { "password": "admin123", "role": "admin" },
  "editor": { "password": "editor123", "role": "editor" },
  "viewer": { "password": "viewer123", "role": "viewer" }
}
```

### **Productos Existentes:**
- **ID**: `da341620-a4ca-4dc6-a382-b7b53bd6d37c` (Laptop Gaming)
- **ID**: `64ae9672-b8fe-45c2-922a-de091b6d8708` (Mouse Inalambrico)
- **ID**: `568249b3-0235-4c0d-9f37-beb0b5aca789` (Teclado Mecanico)

## Casos de Prueba Cubiertos

### **Códigos HTTP Implementados:**
- **200**: Éxito en consultas
- **201**: Recurso creado exitosamente
- **204**: Recurso eliminado exitosamente
- **400**: Bad Request (automático por Express)
- **401**: No autorizado (API Key/JWT faltante o inválido)
- **403**: Prohibido (permisos insuficientes)
- **404**: No encontrado
- **409**: Conflicto (SKU duplicado)
- **422**: Error de validación
- **500**: Error interno del servidor

### **Funcionalidades Probadas:**
- **Seguridad**: API Key + JWT + Roles
- **Content Negotiation**: JSON y XML
- **Validaciones**: Campos requeridos, tipos de datos
- **Manejo de Errores**: Formato estándar con timestamp y path
- **Paginación**: Parámetros page y limit
- **CRUD Completo**: Create, Read, Update, Delete

## Verificación de Resultados

Después de ejecutar todas las pruebas, deberías ver:

- **Verde**: Todos los tests pasaron
- **Rojo**: Si hay errores, revisa los logs del servidor
