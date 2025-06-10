import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Device } from '../types';

interface DeviceCardProps {
    device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
    return (
        <Card variant="outlined" style={{ margin: '16px' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {device.nomenclature}
                </Typography>
                <Typography color="text.secondary">
                    Модель: {device.model}
                </Typography>
                <Typography color="text.secondary">
                    Серийный номер: {device.serialNumber}
                </Typography>
                <Typography color="text.secondary">
                    Дата поступления: {device.dateOfReceipt}
                </Typography>
                <Typography color="text.secondary">
                    Статус: {device.status}
                </Typography>
                <Typography color="text.secondary">
                    КТС: {device.ctc}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default DeviceCard;