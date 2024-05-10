import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="881405882792-2qdplc4mcfdmvdkuf82ctmfsac4iqisg.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
    
  </React.StrictMode>,
);

