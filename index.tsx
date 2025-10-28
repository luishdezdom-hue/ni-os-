
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: The import path for `App.tsx` was incorrect, causing a module resolution error. The path is corrected from './App' to './App.tsx' to ensure the file is correctly imported.
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);