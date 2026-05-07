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

## Formato de un evento

- Título del evento
- Fecha (formato: DD de mes de YYYY)
- Hora
- Tipo de sesión (Baño de sonido, Breathwork, Masaje vibracional, Círculo de hombres)
- Lugar (nombre del espacio · ciudad)
- Link de reserva o botón de contacto por WhatsApp
