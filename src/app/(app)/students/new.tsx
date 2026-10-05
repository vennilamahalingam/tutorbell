import { router } from 'expo-router';
import { Alert } from 'react-native';

import { useTutorZone } from '@/features/auth/profile';
import { defaultSchedulePick } from '@/features/students/components/schedule-fields';
import { StudentForm } from '@/features/students/components/student-form';
import { useCreateStudent } from '@/features/students/queries';
import { countries } from '@/lib/places';

/** 2h — Add student. */
export default function NewStudentScreen() {
  const tutorZone = useTutorZone();
  const create = useCreateStudent();

  return (
    <StudentForm
      title="New student"
      submitLabel="Save student"
      initialBasics={{ name: '', dial: countries[1], phone: '', city: null }}
      initialPick={defaultSchedulePick()}
      tutorZone={tutorZone}
      saving={create.isPending}
      onClose={() => router.back()}
      onSubmit={(row) =>
        create.mutate(row, {
          onSuccess: () => router.back(),
          onError: (e) => Alert.alert("Couldn't save", e.message),
        })
      }
    />
  );
}
