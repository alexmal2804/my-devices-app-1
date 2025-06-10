import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEmployeeData } from '../features/authSlice';
import { fetchDevices } from '../features/devicesSlice';
import { TextField, Button, Card, CardContent, Typography, Paper, Box, Grid } from '@mui/material';
import { Global } from '@emotion/react';
import { Employee, Device } from '../types';

const SBER_GREEN = '#21A038';
const SBER_LIGHT = '#F4F7F6';
const SBER_ACCENT = '#00C95F';

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
                body: { height: '100%', overflow: 'hidden', margin: 0, padding: 0, background: SBER_LIGHT },
                '#root': { height: '100%' }
            }} />
            <Box minHeight="100vh" height="100vh" width="100vw" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(135deg, #E9F7EF 0%, #F4F7F6 100%)', overflow: 'hidden', m: 0, p: 0 }}>
                <Paper elevation={8} sx={{ p: 4, minWidth: 350, maxWidth: 500, width: '100%', borderRadius: 4, background: '#fff', boxShadow: '0 8px 32px 0 rgba(33,160,56,0.10)' }}>
                    <form onSubmit={handleLogin}>
                        <Typography variant="subtitle1" gutterBottom align="center" sx={{ color: '#222' }}>
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: SBER_GREEN },
                                        '&:hover fieldset': { borderColor: SBER_ACCENT },
                                        '&.Mui-focused fieldset': { borderColor: SBER_ACCENT },
                                    },
                                }}
                            />
                            <Button type="submit" variant="contained" sx={{ minWidth: 100, fontWeight: 700, background: SBER_GREEN, '&:hover': { background: SBER_ACCENT } }}>
                                Войти
                            </Button>
                        </Box>
                    </form>
                    {employeeInfo && (
                        <Card sx={{ mt: 3, background: SBER_LIGHT, borderRadius: 3, border: `1.5px solid ${SBER_GREEN}` }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} sx={{ color: SBER_GREEN }} mb={1}>
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
                            <Typography variant="h6" fontWeight={600} sx={{ color: SBER_GREEN }} mb={1}>
                                Прикреплённое оборудование
                            </Typography>
                            <Grid container spacing={2}>
                                {devices.map((device) => (
                                    <Grid item xs={12} sm={6} key={device.serialNumber}>
                                        <Card sx={{ background: '#fff', borderRadius: 3, boxShadow: 2, border: `1.5px solid ${SBER_GREEN}` }}>
                                            <CardContent>
                                                <Typography fontWeight={600} sx={{ color: SBER_GREEN }}>{device.nomenclature}</Typography>
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