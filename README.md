
# Calcula sueldo líquido

Aplicación web para calcular el sueldo líquido de un trabajador en Chile, desarrollada con React y Bootstrap. Permite ingresar datos laborales y obtener una liquidación detallada, integrando indicadores económicos y cálculo vía API.

## Cambios recientes
- El resultado muestra el tramo de asignación familiar (campo `tramoAsignacionFamiliar` del backend) en vez del número de cargas familiares.
- El botón de calcular está centrado y muestra un spinner de carga.

## Características
- Formulario interactivo con campos relevantes para el cálculo de sueldo líquido.
- Integración con API externa para cálculo preciso y actualizado.
- Consulta dinámica de indicadores previsionales.
- Resultados detallados: haberes, descuentos, tramo de asignación familiar, y otros datos.
- Spinner de carga y validaciones de campos.
- Responsive y diseño moderno con Bootstrap.
- Preparada para despliegue en subcarpetas (ej: cPanel).

## Instalación y uso local
1. Clona el repositorio o descarga los archivos.
2. Instala dependencias:
	```sh
	npm install
	```
3. Ejecuta en modo desarrollo:
	```sh
	npm run dev
	```
4. Accede a `http://localhost:5173` (o el puerto indicado).

## Despliegue en producción (ejemplo cPanel)
1. Ejecuta la build:
	```sh
	npm run build
	```
2. Sube el contenido de la carpeta `dist/` a tu subcarpeta en el hosting.
3. Asegúrate de que el archivo `.htaccess` permita el enrutamiento SPA.
4. El favicon y los assets se referencian automáticamente según la configuración de `vite.config.js`.

## Personalización del favicon
El favicon se encuentra en `public/favicon.ico`. Puedes reemplazarlo por uno propio relacionado con sueldos o finanzas. El sistema puede generar un favicon básico si lo necesitas.

## Estructura principal
- `src/components/CalculadoraSueldo.jsx`: Componente principal del formulario y resultados.
- `src/App.jsx`, `src/main.jsx`: Entradas de la app.
- `public/`: Archivos estáticos (favicon, etc).
- `vite.config.js`: Configuración de rutas/base para despliegue.

## API utilizada
- **Cálculo sueldo líquido:**
  - Endpoint: `https://victorcabrera.cl/apis/liquida-sueldo/calcular`
  - Requiere header `x-api-key`.

- **Indicadores previsionales:**
  - Endpoint: `https://victorcabrera.cl/apis/indicadores-previsionales/indicadores/`


## Créditos
Desarrollado por Victor Cabrera.

---
¿Dudas o sugerencias? Abre un issue o contacta al autor.
