import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  DocumentMetadata,
  getAllDocuments,
  deleteDocument,
} from '../services/supabaseClient'
import { processAndSaveDocument } from '../services/ragService'

// Интерфейс состояния документов
export interface DocumentsState {
  documents: DocumentMetadata[]
  uploading: boolean
  loading: boolean
  error: string | null
  uploadProgress: number
}

const initialState: DocumentsState = {
  documents: [],
  uploading: false,
  loading: false,
  error: null,
  uploadProgress: 0,
}

// Асинхронные thunk'и
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async () => {
    return await getAllDocuments()
  }
)

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (file: File, { dispatch }) => {
    try {
      // Используем RAG сервис для обработки и сохранения документа
      await processAndSaveDocument(file, (progress) => {
        dispatch(setUploadProgress(progress))
      })

      // Возвращаем базовую информацию о файле
      return {
        id: Date.now().toString(), // Временный ID
        filename: file.name,
        file_type: file.type || file.name.split('.').pop()?.toLowerCase() || '',
        upload_date: new Date().toISOString(),
        chunks_count: 0,
      } as DocumentMetadata
    } catch (error) {
      throw error
    }
  }
)

export const removeDocument = createAsyncThunk(
  'documents/removeDocument',
  async (documentId: string) => {
    await deleteDocument(documentId)
    return documentId
  }
)

// Slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetUpload: (state) => {
      state.uploading = false
      state.uploadProgress = 0
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false
        state.documents = action.payload
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Ошибка загрузки документов'
      })
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.uploading = true
        state.error = null
        state.uploadProgress = 0
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploading = false
        state.uploadProgress = 100
        state.documents.unshift(action.payload)
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false
        state.uploadProgress = 0
        state.error = action.error.message || 'Ошибка загрузки документа'
      })
      // Remove document
      .addCase(removeDocument.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeDocument.fulfilled, (state, action) => {
        state.loading = false
        state.documents = state.documents.filter(
          (doc) => doc.id !== action.payload
        )
      })
      .addCase(removeDocument.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Ошибка удаления документа'
      })
  },
})

export const { setUploadProgress, clearError, resetUpload } =
  documentsSlice.actions

// Селекторы
export const selectDocuments = (state: { documents: DocumentsState }) =>
  state.documents.documents
export const selectDocumentsLoading = (state: { documents: DocumentsState }) =>
  state.documents.loading
export const selectDocumentsUploading = (state: {
  documents: DocumentsState
}) => state.documents.uploading
export const selectDocumentsError = (state: { documents: DocumentsState }) =>
  state.documents.error
export const selectUploadProgress = (state: { documents: DocumentsState }) =>
  state.documents.uploadProgress

export default documentsSlice.reducer
