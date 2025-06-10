import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEmployeeData } from '../features/authSlice';
import { fetchDevices } from '../features/devicesSlice';
import { TextField, Button, Card, CardContent, Typography, Paper, Box, Grid } from '@mui/material';
import { Employee, Device } from '../types';
import { Global } from '@emotion/react';

const DeviceForm = () => {
    const [employeeId, setEmployeeId] = useState('');
    const dispatch = useDispatch();
    const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result: any = await dispatch<any>(fetchEmployeeData(employeeId));
        if (result.payload) {
            setEmployeeInfo(result.payload);
            const devicesResult: any = await dispatch<any>(fetchDevices(result.payload.id));
            if (devicesResult.payload) {
                setDevices(devicesResult.payload);
            } else {
                setDevices([]);
            }
        } else {
            setEmployeeInfo(null);
            setDevices([]);
        }
    };

    return (
        <>
            <Global styles={{
                html: { height: '100%' },
                body: { height: '100%', overflow: 'hidden', margin: 0, padding: 0 },
                '#root': { height: '100%' }
            }} />
            <Box
                minHeight="100vh"
                height="100vh"
                width="100vw"
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
                    overflow: 'hidden',
                    m: 0,
                    p: 0
                }}
            >
                <Paper elevation={6} sx={{ p: 4, minWidth: 350, maxWidth: 500, width: '100%', borderRadius: 4 }}>
                    <form onSubmit={handleLogin}>
                        <Typography variant="subtitle1" gutterBottom align="center">
                            Введите табельный номер
                        </Typography>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                label="Табельный номер"
                                variant="outlined"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                required
                                fullWidth
                            />
                            <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 100, fontWeight: 700 }}>
                                Войти
                            </Button>
                        </Box>
                    </form>
                    {employeeInfo && (
                        <Card sx={{ mt: 3, background: '#f1f5f9', borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} color="primary.main" mb={1}>
                                    Информация о сотруднике
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={6}><Typography>Табельный номер: <b>{employeeInfo.tn}</b></Typography></Grid>
                                    <Grid item xs={12} sm={6}><Typography>Подразделение: <b>{employeeInfo.division}</b></Typography></Grid>
                                    <Grid item xs={12} sm={6}><Typography>Должность: <b>{employeeInfo.position}</b></Typography></Grid>
                                    <Grid item xs={12} sm={6}><Typography>ФИО: <b>{employeeInfo.fio}</b></Typography></Grid>
                                    <Grid item xs={12}><Typography>Размещение: <b>{employeeInfo.location}</b></Typography></Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}
                    {devices.length > 0 && (
                        <Box mt={3}>
                            <Typography variant="h6" fontWeight={600} color="primary.main" mb={1}>
                                Прикреплённое оборудование
                            </Typography>
                            <Grid container spacing={2}>
                                {devices.map((device) => (
                                    <Grid item xs={12} sm={6} key={device.serialNumber}>
                                        <Card sx={{ background: '#fff', borderRadius: 3, boxShadow: 2 }}>
                                            <CardContent>
                                                <Typography fontWeight={600} color="primary.main">{device.nomenclature}</Typography>
                                                <Typography>Модель: <b>{device.model}</b></Typography>
                                                <Typography>Серийный номер: <b>{device.serialNumber}</b></Typography>
                                                <Typography>Дата поступления: <b>{device.dateOfReceipt}</b></Typography>
                                                <Typography>Статус: <b>{device.status}</b></Typography>
                                                <Typography>КТС: <b>{device.ctc}</b></Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Paper>
            </Box>
        </>
    );
};

export default DeviceForm;