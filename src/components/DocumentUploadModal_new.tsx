import React, { useState, useCallback, useEffect } from 'react'
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Paper,
  Chip,
  Alert,
  Divider,
} from '@mui/material'
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDocuments,
  uploadDocument,
  removeDocument,
  clearError,
  resetUpload,
  selectDocuments,
  selectDocumentsLoading,
  selectDocumentsUploading,
  selectDocumentsError,
  selectUploadProgress,
} from '../features/documentsSlice'

const SBER_GREEN = '#21A038'
const SBER_LIGHT = '#F4F7F6'
const SBER_ACCENT = '#00C95F'

interface DocumentUploadModalProps {
  open: boolean
  onClose: () => void
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch()
  const documents = useSelector(selectDocuments)
  const loading = useSelector(selectDocumentsLoading)
  const uploading = useSelector(selectDocumentsUploading)
  const error = useSelector(selectDocumentsError)
  const uploadProgress = useSelector(selectUploadProgress)

  const [dragActive, setDragActive] = useState(false)

  // Загрузка документов при открытии модального окна
  useEffect(() => {
    if (open) {
      dispatch(fetchDocuments() as any)
    }
  }, [open, dispatch])

  // Обработчик загрузки файлов
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        '.pdf',
        '.docx',
        '.xlsx',
        '.csv',
        '.txt',
      ]

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

        if (
          supportedTypes.includes(file.type) ||
          supportedTypes.includes(fileExtension)
        ) {
          try {
            await dispatch(uploadDocument(file) as any)
            // После успешной загрузки обновляем список
            dispatch(fetchDocuments() as any)
          } catch (err) {
            console.error('Ошибка загрузки файла:', err)
          }
        } else {
          console.warn('Неподдерживаемый тип файла:', file.name)
        }
      }
    },
    [dispatch]
  )

  // Обработчики drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files)
      }
    },
    [handleFileUpload]
  )

  // Обработчик выбора файлов через input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files)
    }
  }

  // Удаление документа
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await dispatch(removeDocument(documentId) as any)
    } catch (err) {
      console.error('Ошибка удаления документа:', err)
    }
  }

  // Очистка ошибок при закрытии
  const handleClose = () => {
    dispatch(clearError())
    dispatch(resetUpload())
    onClose()
  }

  // Получение иконки для типа файла
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('docx')) return '📝'
    if (fileType.includes('sheet') || fileType.includes('xlsx')) return '📊'
    if (fileType.includes('csv')) return '📈'
    if (fileType.includes('text') || fileType.includes('txt')) return '📃'
    return '📄'
  }

  // Форматирование размера файла
  const formatFileSize = (filename: string) => {
    // Заглушка для размера файла
    return '~'
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '80%', md: '70%', lg: '60%' },
          maxWidth: '800px',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Заголовок */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: SBER_GREEN,
            color: 'white',
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Управление документами для RAG
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Основное содержимое */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* Зона загрузки */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              border: `2px dashed ${dragActive ? SBER_ACCENT : '#ccc'}`,
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: dragActive ? '#f0fff4' : SBER_LIGHT,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: SBER_GREEN,
                bgcolor: '#f0fff4',
              },
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: SBER_GREEN, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: SBER_GREEN }}>
              Перетащите файлы сюда или нажмите для выбора
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Поддерживаемые форматы: PDF, DOCX, XLSX, CSV, TXT
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Максимальный размер файла: 10 МБ
            </Typography>

            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </Paper>

          {/* Прогресс загрузки */}
          {uploading && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Обработка документа с RAG... {uploadProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: SBER_GREEN,
                  },
                }}
              />
            </Box>
          )}

          {/* Ошибки */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => dispatch(clearError())}
            >
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Список загруженных документов */}
          <Typography variant="h6" sx={{ mb: 2, color: SBER_GREEN }}>
            Загруженные документы ({documents.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          ) : documents.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: SBER_LIGHT }}>
              <DescriptionIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography color="text.secondary">
                Документы еще не загружены
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Загрузите документы для улучшения ответов AI с помощью RAG
              </Typography>
            </Paper>
          ) : (
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'white',
                    '&:hover': {
                      bgcolor: '#f9f9f9',
                    },
                  }}
                >
                  <Box sx={{ mr: 2, fontSize: '24px' }}>
                    {getFileTypeIcon(doc.file_type)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doc.filename}
                        </Typography>
                        <Chip
                          label={
                            doc.file_type.split('/').pop()?.toUpperCase() ||
                            doc.file_type
                          }
                          size="small"
                          sx={{
                            bgcolor: SBER_LIGHT,
                            color: SBER_GREEN,
                            fontSize: '0.75rem',
                          }}
                        />
                        <Chip
                          label="RAG готов"
                          size="small"
                          sx={{
                            bgcolor: SBER_GREEN,
                            color: 'white',
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Загружен:{' '}
                        {new Date(doc.upload_date).toLocaleDateString('ru-RU')}{' '}
                        • Размер: {formatFileSize(doc.filename)} • Чанков:{' '}
                        {doc.chunks_count || 0}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteDocument(doc.id)}
                      sx={{
                        color: '#d32f2f',
                        '&:hover': {
                          bgcolor: '#ffebee',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Нижняя панель */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: SBER_LIGHT,
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Документы будут использоваться для улучшения ответов AI через RAG
            LangChain
          </Typography>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: SBER_GREEN,
              '&:hover': {
                bgcolor: SBER_ACCENT,
              },
            }}
          >
            Готово
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default DocumentUploadModal
