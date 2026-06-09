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
4. Añadir placeholders de imagen `<figure class="post-img">` entre secciones (una imagen cada 2-3 secciones aproximadamente). Cuando se sustituya el placeholder por una imagen real, añadir siempre `<figcaption>` con una descripción breve que incluya keywords relevantes.
5. Añadir la tarjeta del post en `/blog/index.html` con título, categoría, tiempo de lectura y extracto (primeras 2 líneas del cuerpo)
6. El slug de la URL se genera desde el título: minúsculas, sin acentos, espacios sustituidos por guiones

## Título de tarjeta = H1 del post

El `card-title` en `/blog/index.html` debe ser siempre idéntico al `<h1 class="post-title">` del post. Cuando se cree o edite un post, verificar que ambos coinciden.

## Imagen de tarjeta = imagen principal del post

La imagen de la tarjeta en `/blog/index.html` debe ser siempre la misma que la imagen principal (`post-header-img`) del post. Cuando se cambie la imagen principal de un post, actualizar también la tarjeta en el índice. Cuando se cree un post nuevo, usar la misma imagen en ambos sitios.

## Imágenes del blog

Las imágenes van en `/img/blog/` con nombres descriptivos en formato SEO (minúsculas, guiones, keywords relevantes). El usuario las deja en `C:\Users\errea\Desktop\Web\img\blog\` y Claude Code las copia al proyecto con el nombre correcto.

Convención de nombres: `bano-sonido-[descripcion-breve].jpg`

Cuando el usuario diga "ya tienes las imágenes del post":
1. Leer cada imagen visualmente para entender qué muestra
2. Copiar a `/img/blog/` con nombre SEO descriptivo
3. Sustituir los placeholders `<figure class="post-img">` por `<img src="/img/blog/nombre.jpg" alt="...">` con ALT optimizado
4. La imagen del encabezado va en el `<div class="post-header-img">`

## Formato de listas en posts del blog

Cuando un post incluya bloques de elementos enumerables del mismo tipo (tipos, clases, técnicas, categorías, fases, instrumentos, etc.), numerarlos visualmente dentro de su subsección. Usar `<ol><li>` o prefijo numérico en el `<h3>` según el contexto. Esto aplica tanto al crear posts nuevos como al revisar posts existentes.

## Enlaces internos en posts del blog

Los enlaces van siempre en el texto del párrafo, nunca dentro de un título (H1, H2, H3). Si un título menciona un término enlazable, el enlace va en el cuerpo del párrafo siguiente.

Un post nunca puede tener dos enlaces hacia la misma URL. Si al redactar o revisar un post aparece una URL duplicada, se elimina el enlace que esté más abajo en el contenido y se conserva el primero.

Al crear un post, pensar activamente en qué páginas del sitio son relevantes para el tema y añadir enlaces internos naturales. Ejemplos: un post sobre cuencos tibetanos enlaza a `/masaje-vibracional`; un post sobre breathwork enlaza a `/breathwork`; un post sobre sonoterapia enlaza a `/bano-sonido`.

## Enlaces a páginas de servicios y sobre-mi

Cada post debe enlazar de forma natural a al menos una página de servicio (`/bano-sonido`, `/breathwork`, `/masaje-vibracional`, `/circulos-hombres`) o a `/sobre-mi`, **dentro del cuerpo del artículo**, lo más arriba posible (idealmente en el primer tercio del texto).

Reglas:
- **Anchor text siempre distinto**: nunca repetir el mismo texto de enlace para la misma URL en distintos posts. Para `/bano-sonido` usar variaciones como "baño de sonido", "viaje sonoro", "baño con cuencos", "sesión de sonoterapia", "experiencia de sonido"... Para `/sobre-mi` usar "facilitador de breathwork", "facilitador de terapia de sonido", "sonoterapeuta", "facilitador de bienestar".
- El enlace al servicio debe estar en el cuerpo, no solo al final. Un cierre tipo "Si quieres explorar..." es opcional y no debe repetirse igual en todos los posts.
- Si el cuerpo ya enlaza al servicio relevante en un punto natural, el párrafo de cierre puede simplificarse o eliminarse.

## Cuando se elimine un post del blog

1. Añadir redirección en `vercel.json`: `"source": "/blog/slug-eliminado"` → `"destination": "/blog"`
2. Eliminar la carpeta `/blog/slug-eliminado/`
3. Eliminar la tarjeta del post en `/blog/index.html`

Hacer siempre los tres pasos juntos.

## Artículos de afiliación con productos

### Reglas generales para artículos con enlaces de afiliado

En cualquier artículo del blog que contenga enlaces de afiliado (`rel="sponsored"`):

- **No incluir bloque "Sobre el autor"** — se omite completamente.
- **Disclaimer obligatorio** — añadir siempre esta línea al final del contenido del artículo, justo antes del cierre de `</article>`, en cursiva:

```html
<p><em>Artículo con enlaces de afiliado. Si compras a través de ellos recibo una pequeña comisión sin coste adicional para ti.</em></p>
```

- **Formato de enlace de afiliado Amazon** — siempre con esta estructura exacta:

```html
<a href="https://www.amazon.es/dp/ASIN?tag=ramperis-21" target="_blank" rel="noopener noreferrer sponsored">Ver en Amazon</a>
```

Tag de afiliado Amazon España: `ramperis-21`. Usar `rel="noopener noreferrer sponsored"` — sin `nofollow`.

### Estructura del artículo de afiliación

Todo artículo de compra/comparativa sigue esta estructura:
1. Intro — el problema real del comprador
2. Antes de comprar: X verdades — honestidad sobre el mercado
3. Cómo elegir: criterios — condensado + enlace al artículo pilar informacional
4. Tabla comparativa — todos los modelos de un vistazo
5. Análisis modelo por modelo — organizados por nivel/precio
6. Detección de calidad baja — sección de protección al comprador
7. Dónde comprar — Amazon vs Thomann vs directo
8. Accesorios — solo los imprescindibles
9. FAQ (6-8 preguntas reales)
10. Cierre + CTA — enlace a sesión en vivo si aplica

### Schema JSON-LD para artículos de afiliación

Usar tipo `Article` (no `BlogPosting`) — es más adecuado para contenido comercial/comparativo.

### Interlinking entre artículos de afiliación y pilares

Cada artículo de compra debe enlazar al artículo pilar informacional correspondiente. El pilar informacional debe enlazar al artículo de compra con anchor natural: "si quieres comprar uno, aquí tienes los mejores [producto] según nivel".

### Reglas de contenido

- Honestidad sobre las limitaciones de cada producto — credibilidad > comisión
- Mencionar el artesano/opción ideal aunque no tenga enlace de afiliado
- Verificar cada ASIN en Amazon antes de incluirlo
- Precio aproximado, nunca exacto (cambia con frecuencia)
- Máximo 6-7 productos por artículo

## Cuando se añada un producto de Amazon en un post

Usar cajas hardcodeadas con las clases CSS de `amazon-box.js`. Añadir en el `<head>` del post (antes de `</head>`) para que el script inyecte los estilos:

```html
<script src="/js/amazon-box.js" defer></script>
```

Estructura de cada caja dentro del `.post-content` (copiar SVGs de las variables `AMAZON_SVG` y `arrowSvg` en `/js/amazon-box.js`):

```html
<a class="amazon-box" href="https://www.amazon.es/dp/ASIN?tag=ramperis-21" target="_blank" rel="noopener noreferrer sponsored">
  <div class="amazon-box-inner">
    <div class="amazon-box-img"><img src="URL_IMAGEN" alt="TÍTULO" loading="lazy"></div>
    <div class="amazon-box-body">
      <div class="amazon-box-badge">[SVG Amazon]<span>· Recomendado</span></div>
      <p class="amazon-box-title">TÍTULO</p>
      <p style="font-size:13px;color:#6b5a3e;margin:4px 0 0;line-height:1.4;">DESCRIPCIÓN BREVE</p>
      <div class="amazon-box-footer">
        <span class="amazon-box-price">~XXX€<span class="amazon-box-price-sub">en Amazon</span></span>
        <span class="amazon-box-btn">Ver en Amazon [SVG flecha]</span>
      </div>
    </div>
  </div>
</a>
```

- Sin disclaimer por caja — el disclaimer del post va al final del `<article>`
- El `<span class="amazon-box-price">` se omite si no hay precio disponible

## Gestión de contexto — crítico

- Para crear un post nuevo: leer SOLO `blog/_plantilla.html`. No leer otros archivos HTML del blog salvo `blog/index.html` para añadir la tarjeta.
- Para editar un post específico: leer SOLO ese archivo. No leer el resto del proyecto.
- No hacer glob de `blog/*.html` ni `blog/**/*.html` salvo que se pida explícitamente.
- El contenido del artículo lo proporciona el usuario directamente en el mensaje o indica el archivo MD concreto. Leer solo ese archivo.
- Nunca leer todos los archivos del proyecto para buscar enlaces internos — el usuario indica explícitamente qué actualizar.

## Formato de un evento

- Título del evento
- Fecha (formato: DD de mes de YYYY)
- Hora
- Tipo de sesión (Baño de sonido, Breathwork, Masaje vibracional, Círculo de hombres)
- Lugar (nombre del espacio · ciudad)
- Link de reserva o botón de contacto por WhatsApp
