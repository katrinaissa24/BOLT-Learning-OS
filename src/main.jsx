import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'
import { loadYT } from './components/lesson/VideoPlayer'

// The single-file preview build has no real URLs, so it routes in memory.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)

// Warm up the YouTube player API in the background so lesson videos start instantly.
const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500))
idle(() => { loadYT(15000).catch(() => {}) })
