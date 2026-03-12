import { useState } from 'react';
import AssignTenantAdmin from './AssignTenantAdmin';
import './AssignTenantAdmin.css';

const ParentComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

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
        onAssign={handleAssign}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ParentComponent;