Realiza una auditoría técnica completa del proyecto y elimina la causa raíz de TODOS los avisos y advertencias de compilación y empaquetado. No ocultes avisos, no los ignores y no apliques soluciones temporales. Corrige el origen real de cada uno.

Objetivos:

1. Referencias a fonts.css y material.css
- Localiza todas las referencias a:
  - ./fonts/fonts.css
  - ./fonts/material.css
- Determina si realmente son necesarias.
- Si no se utilizan, elimina completamente todas las referencias.
- Si sí son necesarias, crea correctamente los archivos o modifica la estructura para que existan durante el proceso de build.
- El resultado debe ser que Vite no muestre ningún aviso relacionado con estos archivos.

2. Dependencias duplicadas
- Audita package.json, package-lock.json y todas las dependencias transitivas.
- Elimina referencias duplicadas.
- Evita instalaciones redundantes.
- Comprueba que React y React DOM sólo existan una vez cuando sea posible.
- Elimina cualquier duplicidad innecesaria.

3. Chunks demasiado grandes
- Analiza el tamaño del bundle.
- Divide automáticamente los módulos mediante lazy loading, dynamic import() y manualChunks cuando proceda.
- No cambies el comportamiento del programa.
- Reduce el tamaño del bundle principal manteniendo exactamente la misma funcionalidad.

4. DeprecationWarning
- Identifica exactamente qué dependencia provoca el warning.
- Actualiza dicha dependencia si existe una versión compatible.
- Si el problema proviene de la configuración del proyecto, corrígela.
- Si el warning pertenece exclusivamente a una dependencia externa sin solución posible actualmente, documenta claramente el motivo.

5. Limpieza general
- Elimina imports muertos.
- Elimina archivos sin uso.
- Elimina recursos huérfanos.
- Corrige referencias obsoletas.
- Elimina configuraciones antiguas que ya no se utilicen.

6. Validación final
Al finalizar:
- Ejecuta nuevamente la compilación completa.
- Comprueba que el proyecto siga funcionando exactamente igual.
- Verifica que no se haya roto ninguna funcionalidad.
- Reduce al mínimo posible el número de advertencias de compilación.
- No aceptes una solución que simplemente silencie avisos; cada advertencia debe quedar resuelta desde su causa siempre que sea técnicamente posible.