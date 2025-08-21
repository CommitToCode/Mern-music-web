import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ✅ Set global BASE_URL once
const BASE_URL = "https://mern-music-web.onrender.com"; // change only here

// ✅ Override fetch globally (before rendering App)
const originalFetch = window.fetch;
window.fetch = (url, options) => {
  if (typeof url === "string" && url.startsWith("http://localhost:3005")) {
    url = url.replace("http://localhost:3005", BASE_URL);
  }
  return originalFetch(url, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
