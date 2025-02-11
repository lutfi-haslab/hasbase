  // src/api/config.ts
  export const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8008';
  
  export const apiConfig = {
    baseURL: "http://localhost:8008",
    headers: {
      'Content-Type': 'application/json',
    },
  };