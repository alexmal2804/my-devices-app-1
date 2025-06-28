import React, { useEffect } from 'react'
import { createTables, checkDatabaseStatus } from '../services/supabaseClient'

// Компонент для инициализации RAG системы
export const RAGInitializer: React.FC = () => {
  useEffect(() => {
    const initializeRAG = async () => {
      try {
        console.log('🔍 Проверка состояния базы данных...')
        const status = await checkDatabaseStatus()

        if (status.documentsTableExists && status.chunksTableExists) {
          console.log('✅ RAG система готова к работе')
        } else {
          console.warn('⚠️ Таблицы базы данных не найдены:')
          if (!status.documentsTableExists) {
            console.warn('❌ Таблица documents не существует')
          }
          if (!status.chunksTableExists) {
            console.warn('❌ Таблица document_chunks не существует')
          }
          console.info('📋 Выполните SQL-скрипт из файла supabase_tables.sql')
          console.info('🔗 Инструкция: SUPABASE_SETUP.md или QUICK_FIX.md')
        }

        // Попытка создать таблицы (может не сработать без прав администратора)
        await createTables()
      } catch (error) {
        console.warn('⚠️ Не удалось инициализировать RAG систему:', error)
        console.info(
          '📋 Создайте таблицы вручную в Supabase (см. supabase_tables.sql)'
        )
      }
    }

    initializeRAG()
  }, [])

  // Этот компонент ничего не рендерит
  return null
}
