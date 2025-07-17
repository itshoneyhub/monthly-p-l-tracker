import React, { useEffect, useState, useCallback } from 'react';
import '../styles/Alert.css';

const Alert = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false); // Start as invisible for animation

  const handleClose = useCallback(() => {
    setVisible(false);
    // Allow time for fade-out animation before unmounting
    setTimeout(() => {
      onClose();
    }, 300); // Match CSS transition duration
  }, [onClose]);

  useEffect(() => {
    // Show alert with a slight delay to trigger fade-in animation
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 50);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [handleClose]);

  return (
    <div className={`alert alert-${type} ${visible ? 'visible' : ''}`}>
      <span className="alert-message">{message}</span>
      <button onClick={handleClose} className="alert-close-btn">
        &times;
      </button>
    </div>
  );
};

export default Alert;