import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPermissions } from '@/api/permissions';
import { use } from 'react';

const PermissionsContext = createContext(undefined);

export const PermissionsProvider = ({ children }) => {
  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: getAllPermissions,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });
  useEffect(() => {
    if (error) {
      console.error('Error fetching permissions:', error);
    }
  }, [error]);

  const totalPendingPermissions = permissions.filter(
    (permission) => permission.status === 'pending'
  ).length;

  return (
    <PermissionsContext.Provider value={{ permissions, isLoading, error, totalPendingPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};