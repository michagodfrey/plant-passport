import { useState, useEffect, useCallback } from 'react';

export interface UseDebounceSearchOptions {
    delay?: number;
    minLength?: number;
}

export function useDebouncedSearch<T>(
    searchFunction: (query: string) => Promise<T[]>,
    options: UseDebounceSearchOptions = {}
) {
    const { delay = 300, minLength = 1 } = options;

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(
        async (searchQuery: string) => {
            if (searchQuery.length < minLength) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const searchResults = await searchFunction(searchQuery);
                setResults(searchResults);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Search failed');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        [searchFunction, minLength]
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            search(query);
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [query, delay, search]);

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        clearResults: () => setResults([]),
        clearError: () => setError(null),
    };
}
