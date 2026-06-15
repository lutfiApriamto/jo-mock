import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactLenis } from 'lenis/react'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from '@/context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ReactLenis>
  </StrictMode>,
)
