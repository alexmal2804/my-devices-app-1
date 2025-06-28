import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { fetchDevices } from '../features/devicesSlice'
import { selectEmployee } from '../features/authSlice'
import { Employee, Device } from '../types'
import EmployeeInfo from '../components/EmployeeInfo'
import DeviceCard from '../components/DeviceCard'
import DocumentUploadModal from '../components/DocumentUploadModal'
import { Grid, Typography, Box, Button } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'

const SBER_GREEN = '#21A038'
const SBER_ACCENT = '#00C95F'

const Dashboard = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const employee = useSelector(selectEmployee) as Employee | null
  const devices = useSelector((state: any) => state.devices.devices) as Device[]
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  useEffect(() => {
    if (employee) {
      dispatch(fetchDevices(employee.id))
    }
  }, [dispatch, employee])

  const handleBackToLogin = () => {
    history.push('/')
  }

  return (
    <div>
      {/* Заголовок с кнопкой "Назад" */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          {employee
            ? 'Прикреплённое оборудование сотрудника'
            : 'Режим загрузки документов'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToLogin}
          sx={{
            borderColor: SBER_GREEN,
            color: SBER_GREEN,
            '&:hover': {
              borderColor: SBER_ACCENT,
              color: SBER_ACCENT,
              bgcolor: '#f0fff4',
            },
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 3,
            fontSize: '0.95rem',
          }}
        >
          Назад
        </Button>
      </Box>

      {/* Информационная панель о RAG */}
      <Box
        sx={{
          bgcolor: '#f0fff4',
          border: `1px solid ${SBER_GREEN}`,
          borderRadius: 2,
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ fontSize: '24px' }}>🤖</Box>
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: SBER_GREEN }}
          >
            AI-помощник с RAG готов к работе
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Загрузите документы (DOCX, TXT, CSV, XLSX), чтобы AI давал более
            точные ответы на основе ваших данных
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setUploadModalOpen(true)}
          sx={{
            borderColor: SBER_GREEN,
            color: SBER_GREEN,
            '&:hover': {
              borderColor: SBER_ACCENT,
              color: SBER_ACCENT,
              bgcolor: '#f0fff4',
            },
          }}
        >
          Загрузить
        </Button>
      </Box>

      {employee && <EmployeeInfo employee={employee} />}
      <Grid
        container
        spacing={0}
        rowSpacing={1.25}
        justifyContent="center"
        alignItems="stretch"
        sx={{
          width: '100%',
          m: 0,
          flexWrap: 'nowrap',
          overflowX: 'visible',
        }}
      >
        {devices.map((device: Device, idx: number) => {
          return (
            <Grid
              container
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                m: 0,
              }}
              key={device.id}
            >
              <DeviceCard device={device} />
            </Grid>
          )
        })}
      </Grid>

      {/* Модальное окно загрузки документов */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  )
}

export default Dashboard
