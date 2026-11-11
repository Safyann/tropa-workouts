import { useState, type ChangeEvent } from 'react';
import type { Progress } from '../../entities/progress';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';

export function BackupSettings({
  progress,
  restore,
}: {
  progress: Progress;
  restore: (contents: string) => string;
}) {
  const [status, setStatus] = useState('');

  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tropa-history.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    try {
      setStatus(restore(await file.text()));
    } catch {
      setStatus('Не удалось прочитать файл.');
    }
  }

  return (
    <section className={ui.panel} aria-labelledby="backup-heading">
      <h2 id="backup-heading">Резервная копия</h2>
      <p className={ui.hint}>Скачай историю и настройки, чтобы перенести их в другой браузер.</p>
      <div className={styles.dataActions}>
        <button className={ui.secondary} type="button" onClick={download}>
          Скачать копию
        </button>
        <label className={styles.backupInput}>
          Восстановить из файла
          <input type="file" accept=".json,application/json" onChange={importFile} />
        </label>
      </div>
      <p className={styles.backupStatus} role="status">
        {status}
      </p>
    </section>
  );
}
