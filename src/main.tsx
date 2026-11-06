import { createRoot } from 'react-dom/client';
import { Application } from './app/Application';
import './styles/global.css';

if (
  import.meta.env.PROD &&
  import.meta.env.VITE_DISABLE_OFFLINE !== '1' &&
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    // Offline capability is best-effort; ignore registration failures.
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(<Application />);
