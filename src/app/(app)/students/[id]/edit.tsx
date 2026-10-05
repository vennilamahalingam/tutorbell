import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { useSnackbar } from '@/components/ui/snackbar';
import { useTutorZone } from '@/features/auth/profile';
import { StudentForm, studentToForm } from '@/features/students/components/student-form';
import { useStudent, useUpdateStudent } from '@/features/students/queries';

/** Edit student / "Edit schedule" (same form as 2h). Future untouched classes are rebuilt. */
export default function EditStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student } = useStudent(id);
  const tutorZone = useTutorZone();
  const update = useUpdateStudent();
  const snackbar = useSnackbar();

  if (!student) return <View className="flex-1 bg-bg" />;
  const initial = studentToForm(student, tutorZone);

  return (
    <StudentForm
      key={student.id}
      title={`Edit ${student.name.split(' ')[0]}`}
      submitLabel="Save changes"
      initialBasics={initial.basics}
      initialPick={initial.pick}
      tutorZone={tutorZone}
      saving={update.isPending}
      footerNote="Schedule changes apply to upcoming classes. Classes you've moved, marked or reminded stay as they are."
      onClose={() => router.back()}
      onSubmit={(row) =>
        update.mutate(
          { id: student.id, patch: row },
          {
            onSuccess: () => {
              snackbar('Saved.');
              router.back();
            },
            onError: (e) => Alert.alert("Couldn't save", e.message),
          },
        )
      }
    />
  );
}
