import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.tsx'
import './index.css'

// Ensure Buffer is available for browser PDF generation
if (!window.Buffer) {
  window.Buffer = Buffer
}

createRoot(document.getElementById("root")!).render(<App />);
