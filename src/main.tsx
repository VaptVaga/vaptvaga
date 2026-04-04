import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Lf23Z8sAAAAAPAc1Dk9rru0fW0iJFG668elSUMU'}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleReCaptchaProvider>
    </QueryClientProvider>
  </StrictMode>,
)
