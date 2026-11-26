import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CatalogoProvider } from './catalogo.jsx'
import './layout.css'
import './styles.css'
import './overrides.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CatalogoProvider>
      <App />
    </CatalogoProvider>
  </React.StrictMode>
)
