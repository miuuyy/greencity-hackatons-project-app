import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'authToken';

function isSecureStoreAvailable(): boolean {
	try {
		return typeof (SecureStore as any)?.getItemAsync === 'function' && typeof (SecureStore as any)?.setItemAsync === 'function';
	} catch {
		return false;
	}
}

export const storage = {
	async setToken(token: string) {
		if (Platform.OS === 'web') {
			try {
				localStorage.setItem(KEY, token);
			} catch (e) {
				console.error('Local storage is unavailable:', e);
			}
			return;
		}

		if (isSecureStoreAvailable()) {
			await SecureStore.setItemAsync(KEY, token);
		} else {
			// Fallback to AsyncStorage on native if SecureStore is not available
			await AsyncStorage.setItem(KEY, token);
		}
	},

	async getToken() {
		if (Platform.OS === 'web') {
			try {
				return localStorage.getItem(KEY);
			} catch (e) {
				console.error('Local storage is unavailable:', e);
				return null;
			}
		}

		if (isSecureStoreAvailable()) {
			return await SecureStore.getItemAsync(KEY);
		} else {
			return await AsyncStorage.getItem(KEY);
		}
	},

	async deleteToken() {
		if (Platform.OS === 'web') {
			try {
				localStorage.removeItem(KEY);
			} catch (e) {
				console.error('Local storage is unavailable:', e);
			}
			return;
		}

		if (isSecureStoreAvailable()) {
			await SecureStore.deleteItemAsync(KEY);
		} else {
			await AsyncStorage.removeItem(KEY);
		}
	},
};
