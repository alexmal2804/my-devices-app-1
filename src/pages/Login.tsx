import React from 'react';
import DeviceForm from '../components/DeviceForm';
import { Typography } from '@mui/material';

const Login: React.FC = () => {
    return (
        <div>
            <Typography variant="h4" align="center" fontWeight={700} mb={4} color="primary" sx={{ mt: 6 }}>
                Моё ИТ-оборудование
            </Typography>
            <DeviceForm />
        </div>
    );
};

export default Login;