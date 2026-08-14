import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds: number, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiredRef = useRef(false);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    expiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) {
      if (ref.current) clearInterval(ref.current);
      return;
    }
    ref.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(ref.current!);
          setRunning(false);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [running, onExpire]);

  const elapsed = initialSeconds - seconds;

  return { seconds, elapsed, running, start, pause, reset };
}
