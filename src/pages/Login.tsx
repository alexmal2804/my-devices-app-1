import React from 'react';
import DeviceForm from '../components/DeviceForm';
import { Typography, Box } from '@mui/material';

const SBER_GREEN = '#21A038';
const SBER_ACCENT = '#00C95F';

const Login: React.FC = () => {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%" mt={0}>
            <Box
                sx={{
                    width: '100vw',
                    minHeight: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(90deg, #21A038 0%, #B6F5C1 100%)',
                    borderRadius: 0,
                    boxShadow: '0 4px 24px 0 rgba(33,160,56,0.10)',
                    mb: 4,
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    fontWeight={800}
                    sx={{
                        color: '#fff',
                        letterSpacing: 1,
                        fontFamily: 'Roboto, Arial, sans-serif',
                        textShadow: '0 2px 8px rgba(33,160,56,0.18)',
                        px: 4,
                        py: 2,
                    }}
                >
                    Моё ИТ-оборудование
                </Typography>
            </Box>
            <DeviceForm />
        </Box>
    );
};

export default Login;