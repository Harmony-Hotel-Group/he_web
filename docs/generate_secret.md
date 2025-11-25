# Generate Secret Tool / Herramienta de Generación de Secretos

[English](#english) | [Español](#español)

---

<a id="english"></a>
## 🇬🇧 English

### Overview
The `generate_secret.js` tool is a utility script designed to create a secure, random 32-byte hex string. This string is intended to be used as the `CACHE_PRIVATE_KEY` environment variable, which secures the administrative cache control API endpoints.

### Usage

1.  **Run the script**:
    Execute the following command in your terminal from the project root:
    ```bash
    node tools/generate_secret.js
    ```

2.  **Copy the output**:
    The script will output a formatted line like this:
    ```env
    CACHE_PRIVATE_KEY=a1b2c3d4e5f6...
    ```

3.  **Update Environment**:
    Copy the entire line and paste it into your `.env` file (and `.env.production` if applicable).

### Why is this needed?
The `/api/admin/cache` endpoint allows powerful actions like flushing the entire server cache. To prevent unauthorized access, the API requires an `Authorization` header with a Bearer token that matches the `CACHE_PRIVATE_KEY` set on the server. This tool ensures you use a cryptographically strong secret.

---

<a id="español"></a>
## 🇪🇸 Español

### Descripción General
La herramienta `generate_secret.js` es un script de utilidad diseñado para crear una cadena hexadecimal aleatoria y segura de 32 bytes. Esta cadena está destinada a ser utilizada como la variable de entorno `CACHE_PRIVATE_KEY`, la cual asegura los endpoints administrativos de control de caché.

### Uso

1.  **Ejecutar el script**:
    Ejecute el siguiente comando en su terminal desde la raíz del proyecto:
    ```bash
    node tools/generate_secret.js
    ```

2.  **Copiar el resultado**:
    El script mostrará una línea formateada como esta:
    ```env
    CACHE_PRIVATE_KEY=a1b2c3d4e5f6...
    ```

3.  **Actualizar el Entorno**:
    Copie la línea completa y péguela en su archivo `.env` (y `.env.production` si corresponde).

### ¿Por qué es necesario esto?
El endpoint `/api/admin/cache` permite acciones poderosas como vaciar toda la caché del servidor. Para prevenir el acceso no autorizado, la API requiere un encabezado `Authorization` con un token Bearer que coincida con la `CACHE_PRIVATE_KEY` configurada en el servidor. Esta herramienta asegura que utilice un secreto criptográficamente fuerte.
