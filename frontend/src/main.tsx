import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-right" toastOptions={{
      style: {
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid #1e293b',
      }
    }} />
    <App />
  </StrictMode>,
)
