/**
 * Utilidades para formateo y manipulación de fechas
 */

/**
 * Formatea una fecha a formato YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha en formato español legible
 * Ejemplo: "19 noviembre, 2025"
 */
export function formatDisplayDate(dateStr: string): string {
  // Validar formato YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${dateStr}`);
  }
  
  // Parsear como fecha local para evitar problemas de timezone
  const [y, m, d] = dateStr.split('-').map(Number);
  
  // Validar que los valores sean válidos
  if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new Error(`Invalid date values. Year: ${y}, Month: ${m}, Day: ${d}`);
  }
  
  const date = new Date(y, m - 1, d);
  
  // Validar que la fecha creada es válida
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

/**
 * Verifica si una fecha está deshabilitada (en el pasado)
 */
export function isDateDisabled(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Genera los días del calendario para un mes específico
 * Incluye días del mes anterior y siguiente para completar la grilla
 */
export function generateCalendarDays(
  year: number,
  month: number
): Array<{ date: Date; isCurrentMonth: boolean }> {
  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean }> = [];
  
  // Obtener días del mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convertir de Sunday-first (0-6) a Monday-first (0-6) donde Monday=0, Sunday=6
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

  // Días del mes anterior
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, lastDayOfPrevMonth - i);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Días del mes siguiente para completar la grilla (6 semanas * 7 días = 42)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  return calendarDays;
}

/**
 * Nombres de meses en español (mayúsculas)
 */
export const MONTH_NAMES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

/**
 * Nombres de días de la semana en español (abreviados)
 */
export const DAY_NAMES = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

