import type { KineticExerciseId } from './kinetic';
import { InstructionList, type InstructionListProps } from './InstructionList';
import { KineticInstructions } from './KineticInstructions';

export function ExerciseInstructions({
  source,
  ...listProps
}: InstructionListProps & { source: readonly string[] | KineticExerciseId }) {
  if (typeof source === 'string') {
    return <KineticInstructions key={source} id={source} {...listProps} />;
  }
  return <InstructionList cues={source} {...listProps} />;
}
