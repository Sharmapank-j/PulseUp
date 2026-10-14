import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Radar from './pages/Radar.tsx'
import Plan from './pages/Plan.tsx'
import Research from './pages/Research.tsx'
import Mentors from './pages/Mentors.tsx'
import Agents from './pages/Agents.tsx'
import Nmr from './pages/Nmr.tsx'
import Credits from './pages/Credits.tsx'
import { PulseStoreProvider } from './store/PulseStore.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PulseStoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/radar" element={<Radar />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/research" element={<Research />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/nmr" element={<Nmr />} />
            <Route path="/credits" element={<Credits />} />
          </Route>
        </Routes>
      </HashRouter>
    </PulseStoreProvider>
  </StrictMode>,
)
