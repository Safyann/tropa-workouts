const onboardingStorageKey = 'tropa:onboarding:v1';

export function hasDismissedOnboarding(): boolean {
  try {
    return localStorage.getItem(onboardingStorageKey) === 'seen';
  } catch {
    return false;
  }
}

export function dismissOnboarding() {
  try {
    localStorage.setItem(onboardingStorageKey, 'seen');
  } catch {
    // При недоступном хранилище тур закрывается до перезагрузки страницы.
  }
}
