import React, { useState } from 'react';
import AssignTenantAdmin from './AssignTenantAdmin';
import './AssignTenantAdmin.css';

const ParentComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const tenants = [
    { id: 'tenant1', name: 'Acme Corporation' },
    { id: 'tenant2', name: 'Globex Industries' },
    { id: 'tenant3', name: 'Initech LLC' },
  ];

  const handleAssign = async (tenantId: string, email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Assigned ${email} to tenant ${tenantId}`);
    setIsLoading(false);
  };

  return (
    <div className="page-container">
      <AssignTenantAdmin 
        tenants={tenants} 
        onAssign={handleAssign}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ParentComponent;