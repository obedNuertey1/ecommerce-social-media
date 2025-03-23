import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleAuthProvider } from './contexts/GoogleAuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter >
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
