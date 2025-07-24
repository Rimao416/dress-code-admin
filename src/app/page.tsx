"use client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import React from "react";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard Principal
          </h1>
          <p className="text-gray-600 mb-6">
            Bienvenue dans votre tableau de bord. Sélectionnez un élément dans la sidebar pour naviguer.
          </p>
     
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;