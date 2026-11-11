export interface InstructionListProps {
  ordered?: boolean;
  className?: string;
}

export function InstructionList({
  cues,
  ordered,
  className,
}: InstructionListProps & { cues: readonly string[] }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List className={className}>
      {cues.map((cue, index) => (
        <li key={index}>{cue}</li>
      ))}
    </List>
  );
}
