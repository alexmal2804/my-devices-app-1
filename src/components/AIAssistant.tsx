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
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 2,
};

const AIAssistant: React.FC<AIAssistantProps> = ({ employee, device, buttonLabel }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        color="primary"
        aria-label={buttonLabel || "AI-помощник"}
        sx={style}
        onClick={() => setOpen(true)}
        variant="extended"
      >
        <ChatIcon sx={{ mr: 1 }} />
        {buttonLabel || "AI-помощник"}
      </Fab>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box fontWeight="bold">AI-помощник</Box>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <AIChat
            employee={employee}
            device={device}
            onClose={() => setOpen(false)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default AIAssistant;
