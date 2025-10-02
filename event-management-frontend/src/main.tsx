import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// @ts-expect-error AppRouter is a JSX component, but TypeScript doesn't know that because it's a .jsx file.
import AppRouter from './router/AppRouter';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
