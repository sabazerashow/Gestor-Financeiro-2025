
import React from 'react';

interface DashboardCardProps {
    title: string;
    children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full">
            {/* The actual content is passed as children and is expected to handle its own padding */}
            {children}
        </div>
    );
};

export default DashboardCard;