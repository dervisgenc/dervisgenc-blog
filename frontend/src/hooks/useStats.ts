import { useState, useEffect } from 'react';
import axios from 'axios';
import { StatsResponse, DetailedStatsResponse, PostDetailedResponse } from '@/types';
import { getAuthHeaders } from '@/utils/auth';

export const useStats = (startDate?: string, endDate?: string) => {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = getAuthHeaders(); // This might throw an error
                let url = 'https://blog.dervisgenc.com/api/admin/stats/detailed';
                if (startDate && endDate) {
                    url += `?start_date=${startDate}&end_date=${endDate}`;
                }
                const response = await axios.get<StatsResponse>(url, { headers });
                setStats(response.data);
                setError(null);
            } catch (err) {
                if (err instanceof Error && err.message.includes('Unauthorized')) {
                    setError('Unauthorized access. Please log in.');
                } else if (axios.isAxiosError(err) && err.response?.status === 401) {
                    setError('Unauthorized access. Please log in.');
                } else {
                    setError('Failed to fetch statistics');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [startDate, endDate]);

    return { stats, loading, error };
};

export const usePostStats = (postId: number) => {
    const [stats, setStats] = useState<PostDetailedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPostStats = async () => {
            try {
                const headers = getAuthHeaders();
                const response = await axios.get<PostDetailedResponse>(
                    `https://blog.dervisgenc.com/api/admin/posts/stats/${postId}`,
                    { headers }
                );
                setStats(response.data);
                setError(null);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    setError('Unauthorized access. Please log in.');
                } else {
                    setError('Failed to fetch post statistics');
                }
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPostStats();
        }
    }, [postId]);

    return { stats, loading, error };
};

export const useDetailedStats = () => {
    const [stats, setStats] = useState<DetailedStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = getAuthHeaders();
                const response = await axios.get<DetailedStatsResponse>(
                    'https://blog.dervisgenc.com/api/admin/posts/detailed-stats',
                    { headers }
                );
                setStats(response.data);
                setError(null);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    setError('Unauthorized access. Please log in.');
                } else {
                    setError('Failed to fetch statistics');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};
