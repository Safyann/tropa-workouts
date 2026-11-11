import { useEffect, useRef, useState } from 'react';

export function useAppUpdate(inWorkout: boolean) {
  const [offlineReady, setOfflineReady] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [requested, setRequested] = useState(false);
  const activating = useRef(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    const workers = navigator.serviceWorker;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    function checkWaiting() {
      if (!disposed && workers.controller && registration?.waiting) setWaiting(registration.waiting);
    }
    function watchInstall() {
      registration?.installing?.addEventListener('statechange', checkWaiting);
    }
    function reloadOnUpdate() {
      if (activating.current) window.location.reload();
      else setWaiting(null);
    }
    function checkForUpdate() {
      if (document.visibilityState === 'visible') void registration?.update().catch(() => {});
    }
    workers.addEventListener('controllerchange', reloadOnUpdate);
    document.addEventListener('visibilitychange', checkForUpdate);
    const interval = window.setInterval(checkForUpdate, 15 * 60 * 1000);
    workers.register('./sw.js').then(result => {
      if (disposed) return;
      registration = result;
      result.addEventListener('updatefound', watchInstall);
      watchInstall();
      checkWaiting();
      return workers.ready;
    }).then(result => {
      if (result && !disposed) setOfflineReady(true);
    }).catch(() => {});
    return () => {
      disposed = true;
      registration?.removeEventListener('updatefound', watchInstall);
      workers.removeEventListener('controllerchange', reloadOnUpdate);
      document.removeEventListener('visibilitychange', checkForUpdate);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (requested && waiting && !inWorkout && !activating.current) {
      activating.current = true;
      waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
    }
  }, [requested, waiting, inWorkout]);

  return { offlineReady, updateAvailable: !!waiting, requested, requestUpdate: () => setRequested(true) };
}
