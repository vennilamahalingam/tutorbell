import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { cityFromZone, countries, type City, type Country } from '@/lib/places';
import { deviceZone } from '@/lib/time';

/** Draft data collected across the 3 onboarding steps; saved on "Go to Today". */
export type OnboardingDraft = {
  tutorCity: City;
  studentName: string;
  dial: Country;
  phone: string;
  studentCity: City | null;
};

type Ctx = {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    tutorCity: cityFromZone(deviceZone()),
    studentName: '',
    dial: countries[1], // +1 — most students are in the US/Canada; changes with the city
    phone: '',
    studentCity: null,
  }));
  return (
    <OnboardingContext.Provider value={{ draft, update: (p) => setDraft((d) => ({ ...d, ...p })) }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
