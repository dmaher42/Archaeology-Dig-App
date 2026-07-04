import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/print.css'
import './styles/report-phase.css'
import './styles/modal.css'
import './styles/museum-export.css'
import './styles/bureau-texture.css'
import './styles/bureau-case-file-status.css'
import './styles/antiquities-bureau-theme.css'
import './styles/basecamp-checklist.css'
import './styles/photo-corners.css'
import './styles/lab-phase.css'
import './styles/main-canvas.css'
import './styles/lost-site-expedition.css'
import './styles/decorative-desk-props.css'
import './styles/main-menu-polish.css'
import './styles/compact-mission-plan.css'
import './styles/survey-action-panel.css'
import './styles/emergency-excavation-console.css'
import './styles/training-certification.css'
import './styles/dev-tools.css'
import './styles/dig-phase.css'
import './styles/journey-prop-palette-drawer.css'
import './styles/mummification-quest.css'
import './styles/naidoc-exploration.css'
import App from './App.jsx'

// A service worker installed by a previous production-build preview keeps
// serving its cached copy of the app on this origin, hiding dev changes.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister())
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
