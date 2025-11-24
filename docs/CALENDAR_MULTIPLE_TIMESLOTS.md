# Soporte de Múltiples Horarios en Calendar

## Resumen

El componente `Calendar` ahora soporta tours con múltiples horarios disponibles en el mismo día (como el caso de `canal-beagle-catamaran` que tiene horarios AM y PM).

## Funcionamiento Actual

El componente **agrupa automáticamente** las disponibilidades por fecha cuando encuentra múltiples entradas para la misma fecha en el JSON. Esto significa que:

- ✅ **Es compatible con la estructura actual** del JSON (múltiples objetos con la misma fecha)
- ✅ **Muestra radio buttons** cuando hay múltiples horarios disponibles
- ✅ **Muestra el horario directamente** cuando hay un solo horario

## Estructura JSON Actual (Compatible)

La estructura actual funciona correctamente:

```json
{
  "booking": {
    "availability": [
      {
        "date": "2025-11-17",
        "available": 60,
        "timeSlot": { "start": "8:30 am", "end": "12:30 pm" }
      },
      {
        "date": "2025-11-17",
        "available": 60,
        "timeSlot": { "start": "3:30 pm", "end": "6:30 pm" }
      }
    ]
  }
}
```

## Sugerencia: Estructura JSON Mejorada (Opcional)

Para mejorar la organización y facilitar el mantenimiento futuro, se podría usar una estructura agrupada:

```json
{
  "booking": {
    "availability": [
      {
        "date": "2025-11-17",
        "timeSlots": [
          {
            "start": "8:30 am",
            "end": "12:30 pm",
            "available": 60
          },
          {
            "start": "3:30 pm",
            "end": "6:30 pm",
            "available": 60
          }
        ]
      }
    ]
  }
}
```

**Ventajas de la estructura mejorada:**
- ✅ Más organizada y fácil de leer
- ✅ Evita duplicación de fechas
- ✅ Más fácil de mantener
- ✅ Mejor para validación

**Nota:** El componente Calendar actual **NO requiere** este cambio, ya que agrupa automáticamente. Esta sería una mejora opcional para el futuro.

## Comportamiento del Componente

1. **Al seleccionar una fecha:**
   - Si hay múltiples horarios → Muestra radio buttons para seleccionar
   - Si hay un solo horario → Muestra el horario directamente

2. **Los radio buttons muestran:**
   - Horario (ej: "8:30 am – 12:30 pm")
   - Disponibilidad (ej: "(60 disponibles)")

3. **El botón "Reservar" se habilita** solo cuando hay un horario seleccionado

4. **El tooltip en el calendario** indica si hay múltiples horarios: "60 Disponibles (2 horarios)"

## Ejemplo Visual

Cuando seleccionas una fecha con múltiples horarios:

```
26 noviembre, 2025

Seleccioná el horario:
○ 8:30 am – 12:30 pm (60 disponibles)
● 3:30 pm – 6:30 pm (60 disponibles)

[Reservar]
```

Cuando hay un solo horario:

```
26 noviembre, 2025
8:30 am – 12:30 pm

[Reservar]
```

