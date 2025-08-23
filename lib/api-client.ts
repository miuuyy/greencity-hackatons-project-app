import axios from 'axios';
import { storage } from './storage';

// The backend server URL. This is read from an environment variable.
// Make sure you have a .env file in the root of your project with this variable.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Log the API URL once to help debug connectivity issues on device/simulator
if (__DEV__) {
	// eslint-disable-next-line no-console
	console.log('[API] Base URL:', API_URL);
}

const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	// Prevent infinite pending requests when the server is unreachable
	timeout: 15000,
});

apiClient.interceptors.request.use(
	async (config) => {
		const token = await storage.getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		// Normalize network errors to have a consistent message
		if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
			// eslint-disable-next-line no-console
			console.error('[API] Network error or timeout connecting to', API_URL);
		}
		return Promise.reject(error);
	}
);

export default apiClient;
