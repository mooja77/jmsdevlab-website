import { useEffect, useState } from 'react';

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const [pending, setPending] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();

      // Two-key sequences (g + letter)
      if (pending === 'g') {
        const combo = `g ${key}`;
        if (shortcuts[combo]) {
          e.preventDefault();
          shortcuts[combo]();
        }
        setPending('');
        return;
      }

      if (key === 'g') {
        setPending('g');
        setTimeout(() => setPending(''), 500); // Reset after 500ms
        return;
      }

      // Single-key shortcuts
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, pending]);
}

export function useShortcutOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '?' && !(e.target as HTMLElement).matches('input,textarea,select')) {
        e.preventDefault();
        setShow(s => !s);
      }
      if (e.key === 'Escape') setShow(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return { show, setShow };
}
