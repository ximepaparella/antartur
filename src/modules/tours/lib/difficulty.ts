const DIFFICULTY_MAP: Record<string, "Baja" | "Media" | "Alta"> = {
  baja: "Baja",
  bajo: "Baja",
  media: "Media",
  medio: "Media",
  alta: "Alta",
  dificil: "Alta",
  difícil: "Alta",
};

export function normalizeDifficultyInput(value?: string | null): "Baja" | "Media" | "Alta" | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return DIFFICULTY_MAP[normalized];
}

export function normalizeDifficultyForForm(value?: string | null): string {
  return normalizeDifficultyInput(value) || "";
}
