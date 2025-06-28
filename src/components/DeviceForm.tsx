import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { fetchEmployeeData, logout } from '../features/authSlice'
import { fetchDevices, clearDevices } from '../features/devicesSlice'
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Box,
  Grid,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import { Global } from '@emotion/react'
import { Device } from '../types'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material'
import AIAssistant from './AIAssistant'

const SBER_GREEN = '#21A038'
const SBER_LIGHT = '#F4F7F6'
const SBER_ACCENT = '#00C95F'

const DeviceForm = () => {
  const [employeeId, setEmployeeId] = useState('')
  const dispatch = useDispatch()
  const history = useHistory()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [page, setPage] = useState(1)
  const [openModal, setOpenModal] = useState(false)

  // Используем данные из redux вместо локального состояния
  const auth = useSelector((state: any) => state.auth)
  const devicesState = useSelector((state: any) => state.devices)

  const employee = auth.employee // исправлено: employee вместо employeeInfo
  const devices = devicesState.devices

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const isSm = useMediaQuery(theme.breakpoints.only('sm'))
  const isMd = useMediaQuery(theme.breakpoints.only('md'))
  const isLg = useMediaQuery(theme.breakpoints.only('lg'))
  // const isXl = useMediaQuery(theme.breakpoints.only('xl')); // Удалите эту строку, если не используется

  // Вычисляем максимальную длину model и ширину карточки
  const maxModelWidth = useMemo(() => {
    if (!devices.length) return 220
    // Создаем временный элемент для измерения ширины текста
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return 220
    context.font = '700 0.95rem Roboto, Arial, sans-serif'
    let max = 0
    devices.forEach((d: Device) => {
      const width = context.measureText(d.model).width
      if (width > max) max = width
    })
    // Добавляем запас под подпись "Модель:" и отступы
    return Math.ceil(max + 60 + 32) // 60px под "Модель:", 32px под паддинги
  }, [devices])

  // 1. Оптимальное количество карточек на странице и адаптивная сетка
  const getItemsPerPage = () => {
    // Учитываем ширину карточки, интервал и ширину контейнера
    const CARD_MARGIN = 20 // 10px слева и справа
    const CARD_WIDTH = maxModelWidth + CARD_MARGIN
    const containerWidth =
      window.innerWidth *
      (isXs ? 0.98 : isSm ? 0.9 : isMd ? 0.7 : isLg ? 0.7 : 0.7)
    // Минимум 1 карточка, максимум сколько влезет по ширине
    return Math.max(1, Math.floor(containerWidth / CARD_WIDTH))
  }
  const itemsPerPage = getItemsPerPage()
  const pageCount = Math.ceil(devices.length / itemsPerPage)
  const paginatedDevices = devices.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result: any = await dispatch<any>(fetchEmployeeData(employeeId))
    if (result.payload) {
      const devicesResult: any = await dispatch<any>(
        fetchDevices(result.payload.id)
      )
      if (devicesResult.payload) {
        // устройства найдены
      } else {
        // нет устройств
      }
    } else {
      // сотрудник не найден
    }
  }

  const handleLogout = () => {
    setEmployeeId('')
    setPage(1)
    setOpenModal(false)
    dispatch(logout?.() || { type: 'auth/logout' })
    dispatch(clearDevices()) // очищаем устройства при выходе
  }

  const handleUploadMode = () => {
    // Переход в Dashboard без логина для режима загрузки документов
    history.push('/dashboard')
  }

  const handlePageChange = (_: any, value: number) => setPage(value)
  const handleCardClick = (device: Device) => {
    setSelectedDevice(device)
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedDevice(null)
  }

  return (
    <>
      <Global
        styles={{
          html: { height: '100%' },
          body: {
            height: '100%',
            overflow: 'hidden',
            margin: 0,
            padding: 0,
            background: SBER_LIGHT,
          },
          '#root': { height: '100%' },
        }}
      />
      <Box
        minHeight="100vh"
        width="100vw"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        sx={{
          background: SBER_LIGHT,
          py: { xs: 1, sm: 2 },
          minHeight: '100vh',
        }}
      >
        {/* Верхний градиентный блок с заголовком */}
        <Box
          width="100%"
          sx={{
            background: 'linear-gradient(90deg, #21A038 0%, #6EDC8C 100%)',
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Typography
            align="center"
            fontWeight={700}
            sx={{
              color: '#fff',
              letterSpacing: 1,
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: '2.2rem',
              lineHeight: 1,
              width: '100%',
            }}
          >
            Моё ИТ-оборудование
          </Typography>
        </Box>
        {/* Основное содержимое страницы */}
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            minWidth: { xs: 320, sm: 350, md: 400 },
            maxWidth: { xs: 600, md: 900 },
            width: { xs: '98%', sm: '90%', md: '70%' },
            borderRadius: 4,
            background: '#fff',
            boxShadow: '0 8px 32px 0 rgba(33,160,56,0.10)',
            m: { xs: 1, sm: 2, md: 3 },
            mt: { xs: 0, sm: 1, md: 1 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <form onSubmit={employee ? undefined : handleLogin}>
            <Box
              display="flex"
              gap={1}
              mb={1}
              justifyContent="center"
              alignItems="center"
            >
              <TextField
                label="Табельный номер"
                variant="outlined"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                fullWidth={false}
                inputProps={{
                  maxLength: 20,
                  style: {
                    width: 180,
                    height: 36,
                    padding: '6px 8px',
                    fontSize: '0.95rem',
                  },
                }}
                InputLabelProps={{ sx: { top: '-6px' } }}
                sx={{
                  minWidth: 140,
                  maxWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    height: 36,
                    fontSize: '0.95rem',
                    '& fieldset': { borderColor: SBER_GREEN },
                    '&:hover fieldset': { borderColor: SBER_ACCENT },
                    '&.Mui-focused fieldset': { borderColor: SBER_ACCENT },
                  },
                }}
                placeholder="Табельный номер"
                disabled={!!employee}
              />
              <Button
                type={employee ? 'button' : 'submit'}
                variant={employee ? 'outlined' : 'contained'}
                onClick={employee ? handleLogout : undefined}
                sx={
                  employee
                    ? {
                        minWidth: 80,
                        height: 36,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        background: '#fff',
                        color: SBER_GREEN,
                        border: `2.5px solid ${SBER_GREEN}`,
                        '&:hover': {
                          background: '#f4fff6',
                          border: `2.5px solid ${SBER_ACCENT}`,
                          color: SBER_ACCENT,
                        },
                        p: 0,
                      }
                    : {
                        minWidth: 80,
                        height: 36,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        background: SBER_GREEN,
                        '&:hover': { background: SBER_ACCENT },
                        p: 0,
                      }
                }
              >
                {employee ? 'Выйти' : 'Войти'}
              </Button>
            </Box>
          </form>

          {/* Кнопка "Режим загрузки" */}
          {!employee && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadMode}
                sx={{
                  minWidth: 200,
                  height: 44,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: SBER_GREEN,
                  borderColor: SBER_GREEN,
                  border: `2px solid ${SBER_GREEN}`,
                  borderRadius: 3,
                  '&:hover': {
                    background: '#f0fff4',
                    borderColor: SBER_ACCENT,
                    color: SBER_ACCENT,
                    border: `2px solid ${SBER_ACCENT}`,
                  },
                }}
              >
                📚 Режим загрузки документов
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 300, mx: 'auto' }}
              >
                Перейти в режим загрузки документов для RAG без привязки к
                сотруднику
              </Typography>
            </Box>
          )}
          {employee && (
            <Card
              sx={{
                mt: 3,
                background: SBER_LIGHT,
                borderRadius: 3,
                border: `1.5px solid ${SBER_GREEN}`,
                width: '100%',
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  px: '10%',
                  py: 2,
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: SBER_GREEN }}
                  mb={1}
                >
                  Информация о сотруднике
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                  <Box minWidth={200}>
                    <Typography>
                      Табельный номер: <b>{employee.tn}</b>
                    </Typography>
                  </Box>
                  <Box minWidth={200}>
                    <Typography>
                      Подразделение: <b>{employee.division}</b>
                    </Typography>
                  </Box>
                  <Box minWidth={200}>
                    <Typography>
                      Должность: <b>{employee.position}</b>
                    </Typography>
                  </Box>
                  <Box minWidth={200}>
                    <Typography>
                      ФИО: <b>{employee.fio}</b>
                    </Typography>
                  </Box>
                  <Box minWidth={200}>
                    <Typography>
                      Размещение: <b>{employee.location}</b>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          )}
          {devices.length > 0 && (
            <Box
              mt={3}
              sx={{
                width: {
                  xs: '100%',
                  sm: '100%',
                  md: '98%',
                  lg: '96%',
                  xl: '90%',
                }, // Сделать шире на больших экранах
                maxWidth: 1600, // Ограничить максимальную ширину
                px: { xs: 1, sm: 3, md: 6 },
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
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
                {paginatedDevices.map((device: Device, idx: number) => {
                  // Определяем, является ли устройство "проблемным"
                  const isProblem =
                    device.status !== 'исправен' ||
                    parseInt(device.ctc, 10) < 20
                  return (
                    <Box
                      key={device.id}
                      display="flex"
                      justifyContent="center"
                      alignItems="stretch"
                      m={0}
                      width="100%"
                    >
                      <Box
                        sx={{
                          width: Math.min(maxModelWidth, 200),
                          minWidth: 140,
                          height: 140,
                          display: 'flex',
                          mt: '8px',
                          mb: '8px',
                          ml: '8px',
                          mr: '3px',
                          background: '#fff',
                          borderRadius: 3,
                          border: `1.5px solid ${
                            isProblem ? '#d32f2f' : SBER_GREEN
                          }`,
                          boxShadow: 2,
                          overflow: 'visible',
                          flexShrink: 0,
                        }}
                      >
                        <Card
                          onClick={() => handleCardClick(device)}
                          sx={{
                            background: 'transparent',
                            borderRadius: 3,
                            boxShadow: 'none',
                            border: 'none',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'stretch',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: 6, background: '#f4fff6' },
                          }}
                        >
                          <CardContent
                            sx={{
                              flexGrow: 1,
                              p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.2, // Было 0.5, стало 0.2 — уменьшить вертикальный интервал между элементами
                              overflow: 'visible',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              fontWeight={600}
                              sx={{
                                color: isProblem ? '#d32f2f' : SBER_GREEN,
                                fontSize: '1rem',
                              }}
                            >
                              {device.nomenclature === 'Настольный'
                                ? 'Настольный ПК'
                                : device.nomenclature}
                            </Typography>
                            <Typography sx={{ fontSize: '0.95rem' }}>
                              Модель:
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                width: 'fit-content',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {device.model}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                  )
                })}
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
      {/* Модальное окно для подробной информации о девайсе */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: 420,
            minWidth: 320,
            position: 'relative',
            overflow: 'visible',
          },
        }}
      >
        <DialogTitle
          sx={{
            color:
              selectedDevice &&
              (selectedDevice.status !== 'исправен' ||
                parseInt(selectedDevice.ctc, 10) < 20)
                ? '#d32f2f'
                : SBER_GREEN,
            fontWeight: 700,
            fontSize: '1.3rem',
          }}
        >
          {selectedDevice?.nomenclature === 'Настольный'
            ? 'Настольный ПК'
            : selectedDevice?.nomenclature || 'Оборудование'}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ p: 3, position: 'relative', minHeight: 220 }}
        >
          {selectedDevice && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>
                Модель: <b>{selectedDevice.model}</b>
              </Typography>
              <Typography>
                Серийный номер: <b>{selectedDevice.serialNumber}</b>
              </Typography>
              <Typography>
                Дата поступления:{' '}
                <b>
                  {selectedDevice.dateReceipt
                    ? (() => {
                        const d = new Date(selectedDevice.dateReceipt as string)
                        if (!isNaN(d.getTime())) {
                          const day = String(d.getDate()).padStart(2, '0')
                          const month = String(d.getMonth() + 1).padStart(
                            2,
                            '0'
                          )
                          const year = d.getFullYear()
                          return `${day}.${month}.${year}`
                        }
                        return ''
                      })()
                    : ''}
                </b>
              </Typography>
              <Typography
                sx={{
                  color:
                    selectedDevice.status !== 'исправен'
                      ? '#d32f2f'
                      : undefined,
                }}
              >
                Статус: <b>{selectedDevice.status}</b>
              </Typography>
              <Typography
                sx={{
                  color:
                    parseInt(selectedDevice.ctc, 10) < 20
                      ? '#d32f2f'
                      : undefined,
                }}
              >
                Коэффициент технического состояния: <b>{selectedDevice.ctc}</b>
              </Typography>
            </Box>
          )}
          {/* Кнопка AI-помощник в правом нижнем углу модального окна */}
          {selectedDevice && employee && (
            <Box
              sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}
            >
              <AIAssistant
                employee={employee}
                device={selectedDevice}
                buttonLabel="AI-помощник"
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Оставляем только один пагинатор внизу страницы */}
      {pageCount > 1 && devices.length > itemsPerPage && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'transparent',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 2,
            pb: 2,
          }}
        >
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            siblingCount={0}
            boundaryCount={1}
            size="small"
          />
        </Box>
      )}
    </>
  )
}

export default DeviceForm
