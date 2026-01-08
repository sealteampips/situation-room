import { MoonPhaseData, MoonPhaseName } from "@/types";

const LUNAR_CYCLE = 29.53058867; // Average lunar cycle in days
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime(); // Reference new moon

export function getMoonPhase(date: Date = new Date()): MoonPhaseData {
  const daysSinceNewMoon = getDaysSinceNewMoon(date);
  const phase = getPhaseFromAge(daysSinceNewMoon);
  const illumination = getIllumination(daysSinceNewMoon);
  const nextPhases = getNextPhases(date);

  return {
    phase,
    illumination,
    age: daysSinceNewMoon,
    nextPhases,
  };
}

function getDaysSinceNewMoon(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
}

function getPhaseFromAge(age: number): MoonPhaseName {
  const normalized = age / LUNAR_CYCLE;

  if (normalized < 0.0625) return "New Moon";
  if (normalized < 0.1875) return "Waxing Crescent";
  if (normalized < 0.3125) return "First Quarter";
  if (normalized < 0.4375) return "Waxing Gibbous";
  if (normalized < 0.5625) return "Full Moon";
  if (normalized < 0.6875) return "Waning Gibbous";
  if (normalized < 0.8125) return "Last Quarter";
  if (normalized < 0.9375) return "Waning Crescent";
  return "New Moon";
}

function getIllumination(age: number): number {
  // Illumination follows a cosine curve
  const normalized = age / LUNAR_CYCLE;
  const illumination = (1 - Math.cos(2 * Math.PI * normalized)) / 2;
  return Math.round(illumination * 100);
}

function getNextPhases(date: Date): MoonPhaseData["nextPhases"] {
  const currentAge = getDaysSinceNewMoon(date);
  const now = date.getTime();
  const msPerDay = 24 * 60 * 60 * 1000;

  // Calculate days until each phase
  const phaseTargets = {
    newMoon: 0,
    firstQuarter: LUNAR_CYCLE * 0.25,
    fullMoon: LUNAR_CYCLE * 0.5,
    lastQuarter: LUNAR_CYCLE * 0.75,
  };

  const getNextPhaseDate = (targetAge: number): Date => {
    let daysUntil = targetAge - currentAge;
    if (daysUntil <= 0) {
      daysUntil += LUNAR_CYCLE;
    }
    return new Date(now + daysUntil * msPerDay);
  };

  return {
    newMoon: getNextPhaseDate(phaseTargets.newMoon),
    firstQuarter: getNextPhaseDate(phaseTargets.firstQuarter),
    fullMoon: getNextPhaseDate(phaseTargets.fullMoon),
    lastQuarter: getNextPhaseDate(phaseTargets.lastQuarter),
  };
}

export function getMoonEmoji(phase: MoonPhaseName): string {
  const emojis: Record<MoonPhaseName, string> = {
    "New Moon": "🌑",
    "Waxing Crescent": "🌒",
    "First Quarter": "🌓",
    "Waxing Gibbous": "🌔",
    "Full Moon": "🌕",
    "Waning Gibbous": "🌖",
    "Last Quarter": "🌗",
    "Waning Crescent": "🌘",
  };
  return emojis[phase];
}

export function formatPhaseDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
