import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Employee } from '../types';

interface EmployeeInfoProps {
    employee: Employee;
}

const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ employee }) => {
    if (!employee) {
        return <Typography>Нет информации о сотруднике.</Typography>;
    }
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    Информация о сотруднике
                </Typography>
                <Typography variant="body2">
                    <strong>Табельный номер:</strong> {employee.tn}
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
                    <strong>Размещение:</strong> {employee.location}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default EmployeeInfo;