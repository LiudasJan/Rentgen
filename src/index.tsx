import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { GlobalContextMenuProvider } from './components/context-menu';
import { store } from './store';

import './styles/index.css';

// Suppress ResizeObserver loop error (harmless, caused by Monaco Editor's automaticLayout)
window.addEventListener('error', (e) => {
  if (
    e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    e.message === 'ResizeObserver loop limit exceeded'
  ) {
    e.stopImmediatePropagation();
  }
});

const root = createRoot(document.body);
root.render(
  <Provider store={store}>
    <GlobalContextMenuProvider>
      <App />
    </GlobalContextMenuProvider>
  </Provider>,
);
