// Centralized API service to connect React frontend with FastAPI backend

import axios from 'axios';
import { API_PATHS, BASE_URL } from './apiPaths';

const API_BASE_URL = BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        Accept: "application/json",
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle errors globally
        if (error.response) {
            // Only redirect to login if the 401 error is NOT from the login endpoint itself
            if (error.response.status === 401 && error.config.url !== API_PATHS.AUTH.LOGIN) {
                // Redirect to login page
                window.location.href = "/login";
            } else if (error.response.status === 500) {
                console.error("Server error :( Please try again later.");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Please try again."); 
        }
        return Promise.reject(error);
    }
);

// Authentication APIs
export const login = (data) => api.post(API_PATHS.AUTH.LOGIN, data);
export const register = (data) => api.post(API_PATHS.AUTH.REGISTER, data);
export const getUserInfo = () => api.get(API_PATHS.AUTH.GET_USER_INFO);
export const uploadProfileImage = (data) => api.post(API_PATHS.IMAGE.UPLOAD_IMAGE, data);

// Expense APIs
export const fetchExpenses = () => api.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
export const addExpense = (data) => api.post(API_PATHS.EXPENSE.ADD_EXPENSE, data);
export const deleteExpense = (id) => api.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
export const downloadExpensesExcel = () => api.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, { responseType: 'blob' });

// Income APIs
export const fetchIncomes = () => api.get(API_PATHS.INCOME.GET_ALL_INCOME);
export const addIncome = (data) => api.post(API_PATHS.INCOME.ADD_INCOME, data);
export const deleteIncome = (id) => api.delete(API_PATHS.INCOME.DELETE_INCOME(id));
export const downloadIncomesExcel = () => api.get(API_PATHS.INCOME.DOWNLOAD_INCOME, { responseType: 'blob' });

// Dashboard APIs
export const fetchDashboardData = () => api.get(API_PATHS.DASHBOARD.GET_DATA);
