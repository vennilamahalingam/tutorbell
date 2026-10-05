import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { StudentFields } from '@/features/students/components/student-fields';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';

/** 2k — Step 2: add the first student. */
export default function FirstStudentStep() {
  const { draft, update } = useOnboarding();
  const tutorZone = draft.tutorCity.tz;
  const [showErrors, setShowErrors] = useState(false);

  const valid = draft.studentName.trim().length > 0 && !!draft.studentCity;

  function next() {
    if (!valid) return setShowErrors(true);
    router.push('/schedule');
  }

  return (
    <OnboardingStep
      step={2}
      title="Add your first student"
      body="Just the basics. You can add the rest later."
      footer={
        <View className="flex-row gap-3">
          <Button
            label="Back"
            variant="secondary"
            onPress={() => router.back()}
            className="w-[120px]"
          />
          <Button label="Next" onPress={next} className="flex-1" />
        </View>
      }
    >
      <StudentFields
        value={{
          name: draft.studentName,
          dial: draft.dial,
          phone: draft.phone,
          city: draft.studentCity,
        }}
        onChange={(v) =>
          update({ studentName: v.name, dial: v.dial, phone: v.phone, studentCity: v.city })
        }
        tutorZone={tutorZone}
        cityLabel="Where do they live?"
        showErrors={showErrors}
      />
    </OnboardingStep>
  );
}
