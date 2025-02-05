import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

const useApi = (endpoint, options = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const optionsRef = useRef(options);
    const endpointRef = useRef(endpoint);

    useEffect(() => {
        optionsRef.current = options;
        endpointRef.current = endpoint;
    }, [options, endpoint]);

    useEffect(() => {
        const controller = new AbortController();
        const token = Cookies.get('token');

        const fetchData = async () => {
            try {
                const response = await fetch(`${serverUrl}${endpointRef.current}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...optionsRef.current.headers
                    },
                    signal: controller.signal,
                    ...optionsRef.current
                });
                if (!response.ok) throw new Error(response.statusText);
                const json = await response.json();
                setData(json);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => {
            controller.abort();
        };
    }, [endpointRef.current, optionsRef.current]);

    return { data, error, loading };
};

export default useApi;