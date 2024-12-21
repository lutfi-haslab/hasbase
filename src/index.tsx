import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

addEventListener('load', () =>
  ReactDOM.createRoot(document.getElementById('app')!).render(<App />)
);
