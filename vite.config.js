import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // <--- ESTO ES LO QUE FALTA PARA EXPONERLO A LA RED LOCAL
    port: 5173  // Opcional, asegura el puerto
  }
})