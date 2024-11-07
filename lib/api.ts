import axios, { AxiosRequestConfig } from 'axios';

export async function fetchAPI(endpoint: string, options: AxiosRequestConfig = {}) {
    console.log('fetchAPI', endpoint);
    const defaultOptions: AxiosRequestConfig = {
        url: `/api/${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
            'X-App-Origin': process.env.NEXT_PUBLIC_BASE_URL,
            ...(process.env.NEXT_PUBLIC_CSRF_TOKEN && {
                'X-CSRF-Token': process.env.NEXT_PUBLIC_CSRF_TOKEN
            })
        },
        withCredentials: true,
        ...options,
    };

    try {
        const response = await axios(defaultOptions);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`API request failed: ${error.response.statusText}`);
        } else {
            throw new Error('API request failed');
        }
    }
}