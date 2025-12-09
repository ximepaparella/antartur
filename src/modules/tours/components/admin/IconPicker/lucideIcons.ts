// Lista de iconos Lucide más comunes para tours
// Organizados por categoría para facilitar la búsqueda

export const LUCIDE_ICONS = [
  // Tiempo y duración
  { name: "clock", label: "Reloj" },
  { name: "timer", label: "Temporizador" },
  { name: "calendar", label: "Calendario" },
  { name: "calendar-days", label: "Calendario días" },
  { name: "hourglass", label: "Reloj de arena" },
  
  // Actividades y deportes
  { name: "mountain", label: "Montaña" },
  { name: "mountain-snow", label: "Montaña nevada" },
  { name: "trees", label: "Árboles" },
  { name: "tree-pine", label: "Pino" },
  { name: "tent", label: "Carpa" },
  { name: "compass", label: "Brújula" },
  { name: "map", label: "Mapa" },
  { name: "map-pin", label: "Pin de mapa" },
  { name: "navigation", label: "Navegación" },
  { name: "footprints", label: "Huellas" },
  { name: "bike", label: "Bicicleta" },
  { name: "car", label: "Auto" },
  { name: "bus", label: "Bus" },
  { name: "ship", label: "Barco" },
  { name: "sailboat", label: "Velero" },
  { name: "plane", label: "Avión" },
  
  // Naturaleza y clima
  { name: "sun", label: "Sol" },
  { name: "cloud", label: "Nube" },
  { name: "cloud-sun", label: "Nube con sol" },
  { name: "snowflake", label: "Copo de nieve" },
  { name: "thermometer", label: "Termómetro" },
  { name: "wind", label: "Viento" },
  { name: "waves", label: "Olas" },
  { name: "droplets", label: "Gotas" },
  { name: "flame", label: "Llama" },
  { name: "leaf", label: "Hoja" },
  { name: "flower", label: "Flor" },
  { name: "bird", label: "Pájaro" },
  { name: "fish", label: "Pez" },
  { name: "dog", label: "Perro" },
  
  // Personas y grupos
  { name: "user", label: "Usuario" },
  { name: "users", label: "Usuarios" },
  { name: "user-check", label: "Usuario verificado" },
  { name: "baby", label: "Bebé" },
  { name: "accessibility", label: "Accesibilidad" },
  { name: "heart", label: "Corazón" },
  { name: "heart-handshake", label: "Acuerdo" },
  
  // Dificultad y nivel
  { name: "gauge", label: "Medidor" },
  { name: "activity", label: "Actividad" },
  { name: "trending-up", label: "Tendencia arriba" },
  { name: "trending-down", label: "Tendencia abajo" },
  { name: "bar-chart", label: "Gráfico barras" },
  { name: "signal", label: "Señal" },
  { name: "zap", label: "Rayo" },
  { name: "battery-full", label: "Batería llena" },
  
  // Comida y bebida
  { name: "utensils", label: "Cubiertos" },
  { name: "coffee", label: "Café" },
  { name: "wine", label: "Vino" },
  { name: "beer", label: "Cerveza" },
  { name: "sandwich", label: "Sandwich" },
  { name: "apple", label: "Manzana" },
  
  // Equipamiento
  { name: "camera", label: "Cámara" },
  { name: "backpack", label: "Mochila" },
  { name: "glasses", label: "Lentes" },
  { name: "umbrella", label: "Paraguas" },
  { name: "flashlight", label: "Linterna" },
  { name: "binoculars", label: "Binoculares" },
  { name: "shirt", label: "Remera" },
  { name: "boot", label: "Bota" },
  
  // Información y comunicación
  { name: "info", label: "Info" },
  { name: "alert-circle", label: "Alerta" },
  { name: "alert-triangle", label: "Advertencia" },
  { name: "check-circle", label: "Check" },
  { name: "x-circle", label: "X" },
  { name: "help-circle", label: "Ayuda" },
  { name: "message-circle", label: "Mensaje" },
  { name: "phone", label: "Teléfono" },
  { name: "mail", label: "Email" },
  { name: "globe", label: "Globo" },
  
  // Dinero y pagos
  { name: "dollar-sign", label: "Dólar" },
  { name: "credit-card", label: "Tarjeta" },
  { name: "wallet", label: "Billetera" },
  { name: "receipt", label: "Recibo" },
  { name: "tag", label: "Etiqueta" },
  { name: "percent", label: "Porcentaje" },
  
  // Seguridad
  { name: "shield", label: "Escudo" },
  { name: "shield-check", label: "Escudo check" },
  { name: "lock", label: "Candado" },
  { name: "key", label: "Llave" },
  { name: "life-buoy", label: "Salvavidas" },
  { name: "first-aid", label: "Primeros auxilios" },
  
  // Otros
  { name: "star", label: "Estrella" },
  { name: "award", label: "Premio" },
  { name: "trophy", label: "Trofeo" },
  { name: "medal", label: "Medalla" },
  { name: "gift", label: "Regalo" },
  { name: "sparkles", label: "Destellos" },
  { name: "flag", label: "Bandera" },
  { name: "bookmark", label: "Marcador" },
  { name: "home", label: "Casa" },
  { name: "building", label: "Edificio" },
  { name: "landmark", label: "Monumento" },
  { name: "parking", label: "Estacionamiento" },
] as const;

export type LucideIconName = typeof LUCIDE_ICONS[number]["name"];

