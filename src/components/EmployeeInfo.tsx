import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { Card, CardContent, Typography } from '@mui/material';

const EmployeeInfo: React.FC = () => {
    const employee = useSelector((state: RootState) => state.auth.employee);

    if (!employee) {
        return <Typography>No employee information available.</Typography>;
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    Employee Information
                </Typography>
                <Typography variant="body2">
                    <strong>TN:</strong> {employee.tn}
                </Typography>
                <Typography variant="body2">
                    <strong>Division:</strong> {employee.division}
                </Typography>
                <Typography variant="body2">
                    <strong>Position:</strong> {employee.position}
                </Typography>
                <Typography variant="body2">
                    <strong>FIO:</strong> {employee.fio}
                </Typography>
                <Typography variant="body2">
                    <strong>Location:</strong> {employee.location}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default EmployeeInfo;