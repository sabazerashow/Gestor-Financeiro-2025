
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DashboardCardProps {
    title: string;
    children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
};

export default DashboardCard;
