import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEmployeeData } from '../features/authSlice';
import { fetchDevices } from '../features/devicesSlice';
import { Employee, Device } from '../types';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

const DeviceForm = () => {
    const [employeeId, setEmployeeId] = useState('');
    const dispatch = useDispatch();
    const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Получаем данные сотрудника
        const result: any = await dispatch<any>(fetchEmployeeData(employeeId));
        if (result.payload) {
            setEmployeeInfo(result.payload);
            // Получаем устройства
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
        <div>
            <form onSubmit={handleLogin}>
                <TextField
                    label="Employee ID"
                    variant="outlined"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                />
                <Button type="submit" variant="contained" color="primary">
                    Login
                </Button>
            </form>
            {employeeInfo && (
                <Card>
                    <CardContent>
                        <Typography variant="h5">Информация о сотруднике</Typography>
                        <Typography>Табельный номер: {employeeInfo.tn}</Typography>
                        <Typography>Division: {employeeInfo.division}</Typography>
                        <Typography>Position: {employeeInfo.position}</Typography>
                        <Typography>FIO: {employeeInfo.fio}</Typography>
                        <Typography>Размещение: {employeeInfo.location}</Typography>
                    </CardContent>
                </Card>
            )}
            {devices.length > 0 && (
                <div>
                    <Typography variant="h5">Прикреплённые устройства</Typography>
                    {devices.map((device) => (
                        <Card key={device.serialNumber}>
                            <CardContent>
                                <Typography>Тип устройства: {device.nomenclature}</Typography>
                                <Typography>Модель: {device.model}</Typography>
                                <Typography>Серийный номер: {device.serialNumber}</Typography>
                                <Typography>Дата поступления: {device.dateOfReceipt}</Typography>
                                <Typography>Статус: {device.status}</Typography>
                                <Typography>КТС: {device.ctc}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeviceForm;