import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices } from '../features/devicesSlice';
import { selectEmployee } from '../features/authSlice';
import { Employee, Device } from '../types';
import EmployeeInfo from '../components/EmployeeInfo';
import DeviceCard from '../components/DeviceCard';
import { Grid, Typography } from '@mui/material';

const Dashboard = () => {
    const dispatch = useDispatch();
    const employee = useSelector(selectEmployee) as Employee | null;
    const devices = useSelector((state: any) => state.devices.devices) as Device[];

    useEffect(() => {
        if (employee) {
            dispatch(fetchDevices(employee.id));
        }
    }, [dispatch, employee]);

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Прикреплённое оборудование сотрудника
            </Typography>
            {employee && <EmployeeInfo employee={employee} />}
            <Grid
                container
                spacing={0}
                rowSpacing={1.25}
                justifyContent="center"
                alignItems="stretch"
                sx={{
                    width: '100%',
                    m: 0,
                    flexWrap: 'nowrap',
                    overflowX: 'visible',
                }}
            >
                {devices.map((device: Device, idx: number) => {
                    return (
                        <Grid
                            container
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'stretch',
                                m: 0,
                            }}
                            key={device.id}
                        >
                            <DeviceCard device={device} />
                        </Grid>
                    );
                })}
            </Grid>
        </div>
    );
};

export default Dashboard;