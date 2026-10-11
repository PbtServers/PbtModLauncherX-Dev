# Publicar noticias desde GitHub, también desde el móvil

El launcher combina las noticias habituales de sus releases con las noticias de este archivo:

[Editar pbtmodlauncherx-news.json](https://github.com/PbtServers/PbtModLauncherX-Dev/edit/master/news/pbtmodlauncherx-news.json)

La lista inicial está vacía. No hay ningún anuncio de ejemplo activado. Una vez distribuido el launcher con este sistema, los siguientes anuncios solo requieren commits del JSON y sus imágenes en la rama **master**; no necesitan recompilar ni crear una release.

## Pasos

1. Abre el repositorio desde el navegador móvil. Selecciona **master**, entra en `news/pbtmodlauncherx-news.json` y pulsa el lápiz de edición. Si la aplicación móvil no ofrece edición o subida, utiliza el navegador y, si hace falta, su modo de escritorio.
2. Comprueba en [GitHub Releases](https://github.com/PbtServers/PbtModLauncherX-Dev/releases) que la versión existe y está publicada. Un tag sin release, un borrador o una versión inventada no sirven. `1.0.7` y `v1.0.7` son equivalentes.
3. Añade un objeto dentro de `news`. Separa los objetos con comas, sin coma después del último. Utiliza un `id` único; varias noticias pueden pertenecer a la misma versión.
4. Escribe título y descripción reales y aprobados, sin HTML. Añade los textos bajo `translations.es-ES`, `translations.ca` y `translations.en`. El idioma cambia en el launcher sin volver a descargar el JSON. Si falta la traducción seleccionada, se utiliza inglés y después español. Marcas y versiones se conservan tal como las escribas.
5. Para subir una portada, abre `news/images/`, pulsa **Add file → Upload files**, selecciona la imagen del móvil y guarda el commit en **master**. Utiliza PNG, JPG/JPEG o WebP; se recomienda **1280 × 720**, proporción **16:9**, menos de **8 MiB**. Nombres con letras, números, guiones o guiones bajos, sin espacios. No subas SVG.
6. Indica `"image": "news/images/mi-anuncio.png"`. Se admiten subcarpetas dentro de `news/images/`. También puedes usar una URL HTTPS pública terminada en `.png`, `.jpg`, `.jpeg` o `.webp`; el servidor externo debe permitir lectura desde el launcher (CORS), servir el formato correcto y no redirigir a otra URL. No se permiten HTTP, credenciales, direcciones IP, servicios locales ni rutas fuera de `news/images/`.
7. Pon `enabled` en `true` para publicar o en `false` para desactivar. `featured: true` muestra una etiqueta de destacada sin desordenar las fechas. `publishedAt` es la fecha real del anuncio en ISO 8601, con zona horaria; por ejemplo, `AAAA-MM-DDTHH:mm:ssZ`. Una fecha futura permanece oculta hasta llegar ese momento.
8. Para modificar una noticia, edita el mismo objeto conservando su `id`. Para eliminarla, borra su objeto y ajusta las comas. Las portadas se vuelven a comprobar tras una actualización correcta del feed y respetan la caché HTTP del servidor. Si cambias una imagen y quieres evitar la caché del CDN, utiliza un nombre nuevo de archivo y actualiza su ruta en el JSON.
9. Revisa la vista de cambios. Puedes pegar el JSON en un validador JSON de tu confianza; el contenido es público. Debe usar comillas dobles, sin comentarios ni comas finales. Mantén `schemaVersion: 1`. Con el repositorio local, las pruebas de `customLauncherNews.test.ts` validan el lector; `node -e "JSON.parse(require('fs').readFileSync('news/pbtmodlauncherx-news.json','utf8')); console.log('JSON válido')"` comprueba la sintaxis del archivo.
10. Pulsa **Commit changes**, escribe un mensaje descriptivo y guarda en **master**. No modifiques releases, tags ni workflows para publicar un anuncio. Espera la propagación de GitHub/CDN; el launcher comprueba cambios al abrir la pantalla de noticias, aproximadamente cada **10 minutos** mientras esté abierta, o al pulsar **Actualizar** en la pestaña PbtModLauncherX.

## Ejemplo completo, exclusivamente ilustrativo

No copies una fecha, anuncio o afirmación sin aprobar su contenido. Sustituye la fecha por la fecha real de publicación y sube primero tu imagen. Este ejemplo no se incluye en el feed activo:

```json
{
  "schemaVersion": 1,
  "news": [
    {
      "id": "pbt-107-comunidad",
      "version": "1.0.7",
      "publishedAt": "2026-10-11T18:00:00Z",
      "enabled": true,
      "featured": true,
      "image": "news/images/mi-anuncio-v1_0_7.png",
      "translations": {
        "es-ES": {
          "title": "PbtModLauncherX: un espacio para nuestra comunidad",
          "description": "Consulta la publicación oficial de PbtModLauncherX 1.0.7 y comparte tu experiencia con la comunidad."
        },
        "ca": {
          "title": "PbtModLauncherX: un espai per a la nostra comunitat",
          "description": "Consulta la publicació oficial de PbtModLauncherX 1.0.7 i comparteix la teva experiència amb la comunitat."
        },
        "en": {
          "title": "PbtModLauncherX: a space for our community",
          "description": "Read the official PbtModLauncherX 1.0.7 release and share your experience with the community."
        }
      }
    }
  ]
}
```

## Límites y funcionamiento sin conexión

- Máximo 50 entradas, 256 KiB de JSON, 32 traducciones por entrada, 200 caracteres de título y 2000 de descripción. `id`: hasta 80 letras, números, guiones o guiones bajos; versión semántica de hasta 64 caracteres. `enabled` debe ser booleano; `featured` es booleano opcional. Se ignoran entradas inválidas y duplicadas.
- El JSON remoto es la única configuración editorial de noticias personalizadas. Las releases publicadas de GitHub son la fuente de verdad para su asociación y enlace. Se consultan hasta 500 releases, paginadas de 100 en 100, con un tiempo máximo de ocho segundos. Las noticias habituales siguen mostrando sus cinco releases más recientes.
- Se muestra un máximo inicial de ocho noticias. **Ver noticias anteriores** amplía el carrusel para acceder a las restantes. Una noticia personalizada no elimina la noticia habitual de la misma versión.
- La caché del feed y la verificación de releases tienen una validez máxima de **24 horas** para noticias personalizadas. Las comprobaciones normales reutilizan el feed durante diez minutos. Actualizar fuerza una petición; las peticiones simultáneas se agrupan.
- Un error temporal usa la caché válida; sin caché se omiten las noticias personalizadas. Un `404` o `410` confirmado, un JSON malformado, un esquema incompatible o una lista vacía retiran las entradas anteriores. No se muestran alertas de error por el feed opcional.
- Si falla una imagen, la noticia conserva sus textos y muestra el logo incluido en el launcher. Las imágenes se cargan al entrar en la zona visible, sin ejecutar HTML, scripts ni SVG remoto. El fallo se registra solo en diagnóstico.
- No se utilizan tokens privados de GitHub, API Keys, Qwen3, Ollama ni PbtAdmin.

El feed remoto empezará a estar disponible cuando este archivo se guarde en GitHub. Mientras no exista, el launcher mantiene sus noticias habituales. La primera instalación de esta funcionalidad sí requiere distribuir una compilación que la incluya; los anuncios posteriores ya son independientes de las versiones del launcher.
