import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')  // Пример алиаса
        }
    },
    server: {
        open: true,  // Авто-открытие браузера
        port: 3000,   // Фиксированный порт
        host: true,  // Доступ по сети
        strictPort: true,
        watch: {
            usePolling: true  // Для Docker/WSL2
        }
    }
})