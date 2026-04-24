
# Calcula Sueldo Líquido

Aplicación web moderna para calcular el sueldo líquido de trabajadores en Chile. Desarrollada con React y Tailwind CSS, permite ingresar datos laborales y obtener una liquidación detallada con todos los descuentos legales vigentes.

## 🌟 Características

- **Diseño moderno** con Tailwind CSS v3
  - Gradientes púrpura/índigo
  - Efectos glassmorphism
  - Animaciones y transiciones suaves
  - Totalmente responsive
  
- **Cálculo preciso** vía API
  - Integración con backend actualizado
  - Todos los descuentos legales (AFP, Salud, Impuestos)
  - Gratificación automática (activada por defecto)
  - Asignación familiar según tramos vigentes

- **Indicadores actualizados**
  - Sueldo mínimo, UF, UTM
  - Consulta dinámica en tiempo real
  - Formato de período MM-YYYY

- **Robustez y confiabilidad**
  - Error Boundary para manejo de errores
  - Protección contra Google Translate
  - Optimización con React useMemo
  - Compatible con todos los navegadores modernos

- **Footer profesional**
  - Información del desarrollador
  - Enlaces a GitHub, email, APIs
  - Especialidades destacadas

## 🚀 Demo

**Producción:** [https://victorcabrera.cl/apps/calcula-sueldo-liquido/](https://victorcabrera.cl/apps/calcula-sueldo-liquido/)

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/visteck/calcula-sueldo-liquido.git
cd calcula-sueldo-liquido

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev
```

Accede a `http://localhost:5173/apps/calcula-sueldo-liquido/`

## 🔧 Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_KEY=tu-api-key-aqui
```

### Ruta de despliegue

La aplicación está configurada para desplegarse en `/apps/calcula-sueldo-liquido/`. 

Para cambiar la ruta, edita `vite.config.js`:

```javascript
export default defineConfig({
  base: '/tu-ruta-personalizada/'
})
```

## 🏗️ Build y Despliegue

```bash
# Generar build de producción
npm run build

# Los archivos estarán en dist/
```

### Despliegue en cPanel

1. Ejecuta `npm run build`
2. Sube el contenido de `dist/` a `public_html/apps/calcula-sueldo-liquido/`
3. Asegúrate de que los archivos `.htaccess` permitan SPAs

Estructura después del despliegue:
```
public_html/apps/calcula-sueldo-liquido/
├── index.html
└── assets/
    ├── index-[hash].css
    └── index-[hash].js
```

## 📁 Estructura del Proyecto

```
calcula-sueldo-liquido/
├── src/
│   ├── components/
│   │   ├── CalculadoraSueldo.jsx  # Componente principal
│   │   └── ErrorBoundary.jsx      # Manejo de errores
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css                   # Tailwind directives
│   └── App.css
├── public/
│   └── favicon.ico
├── dist/                           # Build de producción (generado)
├── tailwind.config.js              # Configuración Tailwind
├── postcss.config.js               # PostCSS para Tailwind
├── vite.config.js                  # Configuración Vite
└── package.json
```

## 🔌 APIs Utilizadas

### API Cálculo de Sueldo Líquido
- **Endpoint:** `https://victorcabrera.cl/apis/liquida-sueldo/calcular`
- **Método:** POST
- **Headers:** `x-api-key: [tu-api-key]`
- **Documentación:** [Ver docs](https://victorcabrera.cl/apis/liquida-sueldo/docs/)

### API Indicadores Previsionales
- **Endpoint:** `https://victorcabrera.cl/apis/indicadores-previsionales/indicadores/`
- **Método:** GET
- **Documentación:** [Ver docs](https://victorcabrera.cl/apis/indicadores-previsionales/)

## 🛠️ Stack Tecnológico

- **React** 19.1.1
- **Tailwind CSS** 3.x
- **Vite** 7.2.2
- **PostCSS** + Autoprefixer
- **ESLint** para linting

## 🎨 Personalización

### Colores

Los colores principales están definidos con gradientes de Tailwind. Para cambiar el esquema de colores, busca en `CalculadoraSueldo.jsx`:

```javascript
// Ejemplo de gradiente actual
className="bg-gradient-to-r from-purple-600 to-indigo-600"
```

### Footer

Edita la información del desarrollador en la sección del footer del componente `CalculadoraSueldo.jsx`.

## 🐛 Solución de Problemas

### Error en Chrome con extensiones

Si ves errores de `insertBefore` en Chrome:
- La app tiene Error Boundary integrado
- Desactiva Google Translate automático
- Prueba en modo incógnito
- Usa Firefox o Edge como alternativa

### Build no funciona

```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Changelog

### v2.0.0 (Abril 2026)
- ✅ Migración completa de Bootstrap a Tailwind CSS v3
- ✅ Diseño moderno con glassmorphism y gradientes
- ✅ Error Boundary para manejo robusto de errores
- ✅ Protección contra Google Translate
- ✅ Optimización de renderizado con useMemo
- ✅ Footer profesional con información del desarrollador
- ✅ Gratificación activada por defecto
- ✅ Título cambiado a "Calcula Sueldo Líquido"
- ✅ Ruta actualizada a `/apps/calcula-sueldo-liquido/`

### v1.0.0 (2025)
- Versión inicial con Bootstrap
- Integración básica con APIs

## 👨‍💻 Autor

**Víctor Cabrera**
- Ingeniero Fullstack • Especialista en ERPs
- +15 años de experiencia en soluciones empresariales
- 🌐 [victorcabrera.cl](https://victorcabrera.cl)
- 📧 [vicabrera@gmail.com](mailto:vicabrera@gmail.com)
- 💻 [github.com/visteck](https://github.com/visteck)

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y personales.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

**¿Dudas o sugerencias?** Abre un [issue](https://github.com/visteck/calcula-sueldo-liquido/issues) o contáctame directamente.

