import { useState } from 'react';
import type { Session, SessionChanges } from '../../entities/progress';
import { HistorySessionEditor } from './HistorySessionEditor';
import ui from '../../shared/ui/Common.module.css';
import styles from './History.module.css';

export function HistorySessionActions({
  session,
  save,
  remove,
  reopensStop,
}: {
  session: Session;
  save: (changes: SessionChanges) => string | undefined;
  remove: () => string | undefined;
  reopensStop: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string>();

  return (
    <div className={styles.sessionControls}>
      {editing ? (
        <HistorySessionEditor
          session={session}
          save={(changes) => {
            const error = save(changes);
            if (!error) {
              setEditing(false);
              setMessage('Изменения сохранены.');
            }
            return error;
          }}
          cancel={() => setEditing(false)}
        />
      ) : (
        <div className={styles.historyActions}>
          <button
            className={ui.secondary}
            type="button"
            onClick={() => {
              setMessage(undefined);
              setEditing(true);
            }}
          >
            Редактировать
          </button>
          <button
            className={ui.secondary}
            type="button"
            onClick={() => {
              const question = reopensStop
                ? 'Удалить занятие? Эта остановка снова станет доступна, а остальные результаты сохранятся.'
                : 'Удалить занятие из истории?';
              if (window.confirm(question)) setMessage(remove());
            }}
          >
            Удалить занятие
          </button>
        </div>
      )}
      {message && (
        <p role="status" className={ui.hint}>
          {message}
        </p>
      )}
    </div>
  );
}
