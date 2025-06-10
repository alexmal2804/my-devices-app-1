import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Device } from '../types';

interface DeviceCardProps {
    device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
    return (
        <Card variant="outlined" sx={{ m: 2, borderRadius: 3, boxShadow: 3, background: '#f8fafc' }}>
            <CardContent>
                <Typography variant="h6" component="div" color="primary" fontWeight={700} mb={1}>
                    {device.nomenclature}
                </Typography>
                <Typography color="text.secondary">Модель: <b>{device.model}</b></Typography>
                <Typography color="text.secondary">Серийный номер: <b>{device.serialNumber}</b></Typography>
                <Typography color="text.secondary">Дата поступления: <b>{device.dateOfReceipt}</b></Typography>
                <Typography color="text.secondary">Статус: <b>{device.status}</b></Typography>
                <Typography color="text.secondary">КТС: <b>{device.ctc}</b></Typography>
            </CardContent>
        </Card>
    );
};

export default DeviceCard;