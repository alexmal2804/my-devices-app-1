import React from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { useHistory } from 'react-router-dom'
import { Home as HomeIcon } from '@mui/icons-material'

const NotFound = () => {
  const history = useHistory()

  const handleGoHome = () => {
    history.push('/')
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        background:
          'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 50%, #F5F5F5 100%)',
      }}
    >
      {/* Иконка приложения */}
      <Box
        sx={{
          width: 120,
          height: 120,
          backgroundImage: 'url(/icon.svg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          mb: 3,
          opacity: 0.8,
        }}
      />

      <Typography
        variant="h1"
        sx={{
          fontSize: '4rem',
          fontWeight: 700,
          color: '#37474F',
          mb: 1,
        }}
      >
        404
      </Typography>

      <Typography
        variant="h5"
        sx={{
          color: '#546E7A',
          mb: 2,
          fontWeight: 500,
        }}
      >
        Страница не найдена
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: '#666',
          mb: 4,
          maxWidth: 400,
        }}
      >
        К сожалению, запрашиваемая страница не существует или была перемещена.
      </Typography>

      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={handleGoHome}
        sx={{
          backgroundColor: '#4A934A',
          color: 'white',
          '&:hover': {
            backgroundColor: '#2E7D2E',
          },
          fontWeight: 600,
          px: 4,
          py: 1.5,
          borderRadius: 3,
          fontSize: '1rem',
          textTransform: 'none',
        }}
      >
        На главную
      </Button>
    </Container>
  )
}

export default NotFound
