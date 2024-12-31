import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // 引入主组件

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
