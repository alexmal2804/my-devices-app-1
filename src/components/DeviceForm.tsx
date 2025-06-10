import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEmployeeData } from '../features/authSlice';
import { fetchDevices } from '../features/devicesSlice';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

const DeviceForm = () => {
    const [employeeId, setEmployeeId] = useState('');
    const dispatch = useDispatch();
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [devices, setDevices] = useState([]);

    const handleLogin = async (e) => {
        e.preventDefault();
        // Fetch employee data from Firebase
        const employeeData = await dispatch(fetchEmployeeData(employeeId));
        setEmployeeInfo(employeeData);
        
        // Fetch associated devices
        const deviceData = await dispatch(fetchDevices(employeeId));
        setDevices(deviceData);
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
                        <Typography variant="h5">Employee Information</Typography>
                        <Typography>TN: {employeeInfo.TN}</Typography>
                        <Typography>Division: {employeeInfo.division}</Typography>
                        <Typography>Position: {employeeInfo.position}</Typography>
                        <Typography>FIO: {employeeInfo.FIO}</Typography>
                        <Typography>Location: {employeeInfo.location}</Typography>
                    </CardContent>
                </Card>
            )}
            {devices.length > 0 && (
                <div>
                    <Typography variant="h5">Associated Devices</Typography>
                    {devices.map((device) => (
                        <Card key={device.serialNumber}>
                            <CardContent>
                                <Typography>Nomenclature: {device.nomenclature}</Typography>
                                <Typography>Model: {device.model}</Typography>
                                <Typography>Serial Number: {device.serialNumber}</Typography>
                                <Typography>Date of Receipt: {device.dateOfReceipt}</Typography>
                                <Typography>Status: {device.status}</Typography>
                                <Typography>CTC: {device.CTC}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeviceForm;