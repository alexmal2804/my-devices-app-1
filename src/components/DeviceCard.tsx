import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface DeviceCardProps {
    nomenclature: string;
    model: string;
    serialNumber: string;
    dateOfReceipt: string;
    status: string;
    ctc: string;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ nomenclature, model, serialNumber, dateOfReceipt, status, ctc }) => {
    return (
        <Card variant="outlined" style={{ margin: '16px' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {nomenclature}
                </Typography>
                <Typography color="text.secondary">
                    Model: {model}
                </Typography>
                <Typography color="text.secondary">
                    Serial Number: {serialNumber}
                </Typography>
                <Typography color="text.secondary">
                    Date of Receipt: {dateOfReceipt}
                </Typography>
                <Typography color="text.secondary">
                    Status: {status}
                </Typography>
                <Typography color="text.secondary">
                    CTC: {ctc}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default DeviceCard;