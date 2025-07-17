import React, { useState, useCallback } from 'react';
import Alert from '../components/Alert.jsx';
import { AlertContext } from './AlertContext.js';

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ message, type });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const contextValue = {
    showAlert,
    closeAlert,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alert && <Alert message={alert.message} type={alert.type} onClose={closeAlert} />}
    </AlertContext.Provider>
  );
};
