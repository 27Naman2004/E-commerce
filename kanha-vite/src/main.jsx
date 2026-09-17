import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <CartProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ style: { background: '#E91E63', color: '#FFF0F5' } }} />
      </CartProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
