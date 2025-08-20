import React from 'react';

export const addNotification = (notification: any) => {
  console.warn('Notifications Mock: addNotification called', notification);
  alert(`Notification: <span class="math-inline">\{notification\.title\}\\n</span>{notification.description || ''}\nType: ${notification.variant || 'info'}`);
};

export const notificationsReducer = (state: any, action: any) => {
  console.warn('Notifications Mock: notificationsReducer called', action);
  return state;
};

export const connectNotification = (Component: React.ComponentType) => {
  console.warn('Notifications Mock: connectNotification HOC applied');
  const WrappedComponent: React.FC<any> = (props) => {
    return <Component {...props} />;
  };
  return WrappedComponent;
};
