
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Temporarily removing StrictMode to test for double-effect issues
createRoot(document.getElementById("root")!).render(<App />);
