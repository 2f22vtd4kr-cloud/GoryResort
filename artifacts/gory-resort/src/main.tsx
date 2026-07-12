import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import App from './App';

import './index.css';

// Force synchronous first render so the hero is in the DOM by the time
// DOMContentLoaded fires. Without this, React 19's concurrent scheduler
// defers the commit and screenshots / slow devices see the :empty loading state.
const root = createRoot(document.getElementById('root')!);
flushSync(() => {
  root.render(<App />);
});
