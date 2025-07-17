const IS_LOGGED_IN_KEY = 'isLoggedIn';

export const login = () => {
  localStorage.setItem(IS_LOGGED_IN_KEY, 'true');
  console.log('Auth: User logged in. localStorage.isLoggedIn:', localStorage.getItem(IS_LOGGED_IN_KEY));
  window.dispatchEvent(new Event('storage')); // Manually dispatch storage event
};

export const logout = () => {
  localStorage.removeItem(IS_LOGGED_IN_KEY);
  console.log('Auth: User logged out. localStorage.isLoggedIn:', localStorage.getItem(IS_LOGGED_IN_KEY));
  window.dispatchEvent(new Event('storage')); // Manually dispatch storage event
};

export const isLoggedIn = () => {
  const status = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
  console.log('Auth: isLoggedIn() called, returning:', status);
  return status;
};