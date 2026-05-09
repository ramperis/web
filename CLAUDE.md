# Instrucciones del proyecto — Ram Peris

## Cuando se elimine una página de evento

1. Añadir una redirección en `vercel.json`:
```json
{
  "source": "/agenda/slug-del-evento-eliminado",
  "destination": "/agenda",
  "permanent": true
}
```
2. Eliminar el archivo HTML del evento
3. Eliminar el evento del listado en agenda.html
4. Eliminar el evento de la sección "Próximas fechas" en index.html

Hacer siempre los cuatro pasos juntos, nunca eliminar el archivo sin añadir la redirección.

## Cuando se cree una página de evento nueva

1. Crear el archivo HTML del evento en `/agenda/nombre-evento/index.html`
2. Añadir el evento al listado en agenda.html
3. Añadir el evento a la sección "Próximas fechas" en index.html

Hacer siempre los tres pasos juntos.

## Cuando se cree un post del blog

El usuario pasará el contenido del post en texto plano con este formato:
- Primera línea: título SEO
- Segunda línea: metadatos (URL, categoría, tiempo de lectura)
- El resto: cuerpo del artículo con secciones separadas por títulos

Al recibir un post, Claude Code debe:
1. Crear `/blog/slug-del-post/index.html` basado en `/blog/plantilla-post/index.html`
2. Sustituir el título, categoría, fecha, tiempo de lectura y cuerpo del artículo
3. Generar el TOC del sidebar automáticamente a partir de los H2 del contenido
4. Añadir placeholders de imagen `<figure class="post-img">` entre secciones (una imagen cada 2-3 secciones aproximadamente)
5. Añadir la tarjeta del post en `/blog/index.html` con título, categoría, tiempo de lectura y extracto (primeras 2 líneas del cuerpo)
6. El slug de la URL se genera desde el título: minúsculas, sin acentos, espacios sustituidos por guiones

## Imágenes del blog

Las imágenes van en `/img/blog/` con nombres descriptivos en formato SEO (minúsculas, guiones, keywords relevantes). El usuario las deja en `C:\Users\errea\Desktop\Web\img\blog\` y Claude Code las copia al proyecto con el nombre correcto.

Convención de nombres: `bano-sonido-[descripcion-breve].jpg`

Cuando el usuario diga "ya tienes las imágenes del post":
1. Leer cada imagen visualmente para entender qué muestra
2. Copiar a `/img/blog/` con nombre SEO descriptivo
3. Sustituir los placeholders `<figure class="post-img">` por `<img src="/img/blog/nombre.jpg" alt="...">` con ALT optimizado
4. La imagen del encabezado va en el `<div class="post-header-img">`

## Cuando se elimine un post del blog

1. Añadir redirección en `vercel.json`: `"source": "/blog/slug-eliminado"` → `"destination": "/blog"`
2. Eliminar la carpeta `/blog/slug-eliminado/`
3. Eliminar la tarjeta del post en `/blog/index.html`

Hacer siempre los tres pasos juntos.

## Formato de un evento

- Título del evento
- Fecha (formato: DD de mes de YYYY)
- Hora
- Tipo de sesión (Baño de sonido, Breathwork, Masaje vibracional, Círculo de hombres)
- Lugar (nombre del espacio · ciudad)
- Link de reserva o botón de contacto por WhatsApp
