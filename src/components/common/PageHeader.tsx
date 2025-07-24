// components/PageHeader.tsx

import React from "react";

interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ breadcrumb, title, children }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center">
      <div className="flex items-center text-sm text-gray-500 mb-2">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            <span>{item}</span>
            {index < breadcrumb.length - 1 && <span className="mx-2">/</span>}
          </React.Fragment>
        ))}
      </div>
<div>
  {children}
</div>
      </div>
      <h1 className="text-lg font-medium">{title}</h1>
    </div>
  );
};

export default PageHeader;