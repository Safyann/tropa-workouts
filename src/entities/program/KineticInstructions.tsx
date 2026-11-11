import { useEffect, useState } from 'react';
import { loadKineticCues, type KineticExerciseId } from './kinetic';
import { InstructionList, type InstructionListProps } from './InstructionList';

export function KineticInstructions({
  id,
  ...listProps
}: InstructionListProps & { id: KineticExerciseId }) {
  const [cues, setCues] = useState<readonly string[] | null>();
  useEffect(() => {
    let active = true;
    loadKineticCues(id).then(
      (result) => {
        if (active) setCues(result);
      },
      () => {
        if (active) setCues(null);
      },
    );
    return () => {
      active = false;
    };
  }, [id]);

  if (cues === undefined) return <p role="status">Загружаем инструкцию…</p>;
  if (!cues?.length) return <p role="status">Инструкция сейчас недоступна.</p>;
  return <InstructionList cues={cues} {...listProps} />;
}
