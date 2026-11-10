const INTRO_COMPLETION_KEY = "campmatch.intro-complete";

export function hasCompletedIntro() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(INTRO_COMPLETION_KEY) === "true";
  } catch {
    return false;
  }
}

export function markIntroCompleted() {
  try {
    window.localStorage.setItem(INTRO_COMPLETION_KEY, "true");
  } catch {
    // Continue to authentication when browser storage is unavailable.
  }
}
