export const BASE_URL = "http://localhost:8000/api/v1";

export const API_PATHS = {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      GET_USER_INFO: "/auth/getUser",
    },
    DASHBOARD: {
      GET_DATA: "/dashboard",
    },
    INCOME: {
      ADD_INCOME: "/income/", 
      GET_ALL_INCOME: "/income/", 
      DELETE_INCOME: (incomeId) => `/income/${incomeId}`,
      DOWNLOAD_INCOME: "/income/download",
    },
    EXPENSE: {
      ADD_EXPENSE: "/expense/",
      GET_ALL_EXPENSE: "/expense/",
      DELETE_EXPENSE: (expenseId) => `/expense/${expenseId}`,
      DOWNLOAD_EXPENSE: "/expense/download",
    },
    IMAGE: {
      UPLOAD_IMAGE: "/auth/upload-image",
    },
  };
  