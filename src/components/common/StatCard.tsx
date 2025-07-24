import { ReactNode } from "react";

type StatCardProps = {
  value: string | number;
  label: string;
  icon: ReactNode;
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
};

export const StatCard = ({
  value,
  label,
  icon,
  bgColor = "bg-white",
  textColor = "text-gray-700",
  iconBgColor = "bg-gray-100",
}: StatCardProps) => {
  return (
    <div className={`relative ${bgColor} rounded-lg overflow-hidden shadow-lg`}>
      <div className="absolute top-0 right-0 mt-4 mr-4">
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div className="p-6">
        <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};


{/*
    
import { StatCard } from "./StatCard";
import { stats } from "./data"; // ou autre source

<StatCard
  value={stats.activeUsers}
  label="Active Users"
  bgColor="bg-emerald-700"
  textColor="text-white"
  iconBgColor="bg-emerald-600/50"
  icon={
    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  }
/> 
    USE OF IT
    <StatCard
  value={stats.companies}
  label="Companies"
  iconBgColor="bg-orange-100"
  icon={
    <svg className="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  }
/>

<StatCard
  value={`${stats.tasksPending}+`}
  label="Tasks Pending"
  iconBgColor="bg-amber-100"
  icon={
    <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  }
/> */}
