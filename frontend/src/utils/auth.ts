export const getAuthToken = () => {
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

export const getAuthHeaders = (isFormData: boolean = false) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Unauthorized access. Please log in.');
    }

    if (isFormData) {
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};
