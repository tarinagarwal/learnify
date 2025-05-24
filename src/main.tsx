import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { Routes, Route } from 'react-router-dom';
import { PdfAnnotate } from './pages/PdfAnnotate';

// Inside your router setup
<Route path="/pdf-annotate/:pdfId" element={<PdfAnnotate />} />
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
