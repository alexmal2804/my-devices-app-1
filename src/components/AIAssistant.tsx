import React, { useState } from 'react';
import { Fab, Modal, Box, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import AIChat from './AIChat';

interface AIAssistantProps {
  employee: any;
  device: any;
  buttonLabel?: string;
}

const style = {
  position: 'fixed' as const,
  bottom: 24,
  right: 24,
  zIndex: 1300,
};

const modalStyle = {
  position: 'absolute' as const,
  bottom: 40,
  right: 40,
  width: 400,
  height: '80vh', // Высота почти на весь экран
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3, // скругление как у чата (theme.spacing(3) = 24px)
  p: 0, // убираем внутренние отступы
  display: 'flex',
  flexDirection: 'column',
};

const SBER_GREEN = '#21A038';
const SBER_ACCENT = '#00C95F';

const AIAssistant: React.FC<AIAssistantProps> = ({ employee, device, buttonLabel }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        aria-label={buttonLabel || "AI-помощник"}
        sx={{
          ...style,
          bgcolor: SBER_GREEN,
          color: 'white',
          fontWeight: 700,
          boxShadow: 3,
          '&:hover': {
            bgcolor: SBER_ACCENT,
          },
        }}
        onClick={() => setOpen(true)}
        variant="extended"
      >
        <ChatIcon sx={{ mr: 1, color: 'white' }} />
        {buttonLabel || "AI-помощник"}
      </Fab>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              bgcolor: SBER_GREEN,
              color: 'white',
              px: 2,
              py: 1.2,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              fontWeight: 600,
              fontSize: '1.1rem',
              fontFamily: 'Roboto, Arial, sans-serif',
              minHeight: 48,
            }}
          >
            <Box sx={{ fontWeight: 600, fontSize: '1.1rem', fontFamily: 'Roboto, Arial, sans-serif', color: 'white' }}>
              {(device?.nomenclature === 'Настольный' || device?.nomenclature === 'Настольный ПК')
                ? 'Настольный ПК'
                : device?.nomenclature || 'AI-помощник'}
            </Box>
            <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box flex={1} minHeight={0} display="flex" flexDirection="column">
            <AIChat
              employee={employee}
              device={device}
              onClose={() => setOpen(false)}
              compactInput
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default AIAssistant;
