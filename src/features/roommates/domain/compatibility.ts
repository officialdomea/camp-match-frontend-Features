import type { CompatibilityResult, RoommatePreferences } from "@/types/roommate";

function sameArea(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function budgetOverlap(a: RoommatePreferences, b: RoommatePreferences) {
  return Math.max(0, Math.min(a.budgetMax, b.budgetMax) - Math.max(a.budgetMin, b.budgetMin));
}

function scoreBetween(min: number, max: number, value: number) {
  if (max <= min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function calculateCompatibility(
  current: RoommatePreferences,
  candidate: RoommatePreferences,
): CompatibilityResult {
  let score = 0;
  const matchedPreferences: string[] = [];
  const differences: string[] = [];

  if (sameArea(current.preferredArea, candidate.preferredArea)) {
    score += 18;
    matchedPreferences.push(`Both prefer ${current.preferredArea || "the same area"}`);
  } else if (current.preferredArea && candidate.preferredArea) {
    differences.push("Preferred areas differ");
  }

  if (
    current.livingPreference === "find-roommate" &&
    candidate.livingPreference === "find-roommate"
  ) {
    score += 12;
    matchedPreferences.push("Both want to find a roommate");
  } else if (
    current.livingPreference === "live-alone" ||
    candidate.livingPreference === "live-alone"
  ) {
    differences.push("One person is oriented toward living alone");
  }

  const sharedAccommodation = current.accommodationTypes.filter((type) =>
    candidate.accommodationTypes.includes(type),
  );
  if (sharedAccommodation.length > 0) {
    score += 16;
    matchedPreferences.push(`Shared accommodation types: ${sharedAccommodation.join(", ")}`);
  } else {
    differences.push("Accommodation preferences do not overlap");
  }

  const overlap = budgetOverlap(current, candidate);
  if (overlap > 0) {
    score += 14;
    matchedPreferences.push("Budget ranges overlap");
  } else {
    const currentRange = current.budgetMax - current.budgetMin || 1;
    const candidateRange = candidate.budgetMax - candidate.budgetMin || 1;
    const closeness =
      100 -
      Math.min(
        100,
        (Math.abs(current.budgetMin - candidate.budgetMin) /
          Math.max(currentRange, candidateRange)) *
          100,
      );
    score += Math.round(closeness * 0.14);
    differences.push("Budget ranges are not closely aligned");
  }

  const studyWeight = current.studyHabits === candidate.studyHabits ? 12 : 4;
  score += studyWeight;
  if (current.studyHabits === candidate.studyHabits) {
    matchedPreferences.push(`Study habits align: ${current.studyHabits}`);
  } else {
    differences.push("Study habits are different");
  }

  if (current.sleepSchedule === candidate.sleepSchedule) {
    score += 10;
    matchedPreferences.push(`Sleep schedule matches: ${current.sleepSchedule}`);
  } else {
    differences.push("Sleep schedule differs");
  }

  if (current.noisePreference === candidate.noisePreference) {
    score += 10;
    matchedPreferences.push(`Noise preference matches: ${current.noisePreference}`);
  } else {
    differences.push("Noise tolerance differs");
  }

  if (current.cleanlinessPreference === candidate.cleanlinessPreference) {
    score += 10;
    matchedPreferences.push(`Cleanliness expectations match`);
  } else {
    differences.push("Cleanliness preference differs");
  }

  if (current.socialPreference === candidate.socialPreference) {
    score += 8;
    matchedPreferences.push(`Social style matches: ${current.socialPreference}`);
  } else {
    differences.push("Social preferences differ");
  }

  const lifestyleOverlap = current.lifestylePreferences.filter((item) =>
    candidate.lifestylePreferences.includes(item),
  );
  if (lifestyleOverlap.length > 0) {
    score += Math.min(12, lifestyleOverlap.length * 4);
    matchedPreferences.push(`Shared lifestyle cues: ${lifestyleOverlap.join(", ")}`);
  }

  const scoreCap = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: scoreCap,
    matchedPreferences: matchedPreferences.slice(0, 6),
    differences: differences.slice(0, 4),
    summary:
      scoreCap >= 80
        ? "Strong roommate fit with aligned routines and expectations."
        : scoreCap >= 60
          ? "Good potential fit with a few lifestyle differences to discuss."
          : scoreCap >= 40
            ? "Some compatibility, but routines may need coordination."
            : "Low compatibility based on current roommate preferences.",
  };
}

export function buildCompatibleCandidates(
  current: RoommatePreferences,
  candidates: RoommatePreferences[],
): Array<RoommatePreferences & { compatibility: CompatibilityResult }> {
  return candidates
    .filter((candidate) => candidate.studentId !== current.studentId)
    .map((candidate) => ({
      ...candidate,
      compatibility: calculateCompatibility(current, candidate),
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}

export function computeBudgetCompatibilityScore(
  current: RoommatePreferences,
  candidate: RoommatePreferences,
) {
  const min = Math.max(current.budgetMin, candidate.budgetMin);
  const max = Math.min(current.budgetMax, candidate.budgetMax);
  if (max < min) return 0;
  const total = Math.max(
    1,
    current.budgetMax - current.budgetMin + candidate.budgetMax - candidate.budgetMin,
  );
  return Math.round((Math.max(0, max - min) / total) * 100);
}

export function normalizeArea(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePreferenceValues(value: string) {
  return value.trim();
}

export function confidenceBand(score: number) {
  return score >= 80
    ? "Strong match"
    : score >= 60
      ? "Good match"
      : score >= 40
        ? "Possible match"
        : "Low match";
}

export function summarizeCompatibility(score: number) {
  if (score >= 80) return "Highly compatible";
  if (score >= 60) return "Compatible";
  if (score >= 40) return "Some overlap";
  return "Limited fit";
}

export function scoreFromRange(value: number, min: number, max: number) {
  return Math.round(scoreBetween(min, max, value));
}
