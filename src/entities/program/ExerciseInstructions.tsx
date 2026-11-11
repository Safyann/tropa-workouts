import { useEffect, useState } from 'react';
import { loadKineticCues, type KineticExerciseId } from './kinetic';

interface ListProps {
  ordered?: boolean;
  className?: string;
}

export function ExerciseInstructions({
  source,
  ...listProps
}: ListProps & { source: readonly string[] | KineticExerciseId }) {
  if (typeof source === 'string') {
    return <KineticInstructions key={source} id={source} {...listProps} />;
  }
  return <InstructionList cues={source} {...listProps} />;
}

function KineticInstructions({ id, ...listProps }: ListProps & { id: KineticExerciseId }) {
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

function InstructionList({ cues, ordered, className }: ListProps & { cues: readonly string[] }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List className={className}>
      {cues.map((cue, index) => (
        <li key={index}>{cue}</li>
      ))}
    </List>
  );
}
