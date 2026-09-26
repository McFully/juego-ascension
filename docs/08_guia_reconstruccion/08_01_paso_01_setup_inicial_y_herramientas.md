# PASO 01: SETUP INICIAL Y HERRAMIENTAS

## 1. INICIALIZACIÓN DEL PROYECTO
1. Crear el directorio del proyecto e inicializar el paquete:
   ```powershell
   mkdir "Ascension"
   cd "Ascension"
   npm init -y
   ```

2. Instalar dependencias de producción:
   ```powershell
   npm install react@18.3.1 react-dom@18.3.1 framer-motion@11.15.0 three@0.183.0
   ```

3. Instalar dependencias de desarrollo y empaquetado:
   ```powershell
   npm install -D electron@42.2.0 electron-builder@26.8.1 vite@6.0.5 @vitejs/plugin-react@4.3.4 tailwindcss@3.4.17 postcss@8.4.49 autoprefixer@10.4.20 vitest@4.1.8
   ```

4. Configurar `vite.config.js` con plugin React y base relativa (`./`).
5. Configurar `tailwind.config.js` y los estilos globales en `src/index.css`.
