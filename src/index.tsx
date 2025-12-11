import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store';

import './styles/index.css';


const root = createRoot(document.body);
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
