/**
 * Retrieves the authentication token from local storage and validates it
 */
export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') {
        return null; // Cannot access localStorage on server-side
    }
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return null;
        }
        return token;
    } catch {
        localStorage.removeItem('token');
        return null;
    }
};

/**
 * Returns headers with authentication token for API requests
 */
export const getAuthHeaders = (isFormData: boolean = false): Record<string, string> => {
    const token = getAuthToken();
    if (!token) {
        // Instead of throwing, return empty headers or handle appropriately
        // Throwing here might break server-side rendering or initial loads
        console.warn('Attempted to get auth headers without a valid token.');
        return {}; // Return empty headers, let the API call fail if auth is required
    }

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    // For FormData, 'Content-Type' is set automatically by the browser with the boundary

    return headers;
};

/**
 * Checks if the user is authenticated (client-side only)
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') {
        return false; // Assume not authenticated on server-side
    }
    return getAuthToken() !== null;
};
