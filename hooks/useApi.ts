import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';
import { handleApiError } from '../services/api';
import { AxiosRequestConfig } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions extends AxiosRequestConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for making API requests
 * Handles loading, error states, and callbacks
 * 
 * @example
 * const { data, loading, error, request } = useApi<User>();
 * 
 * const fetchUser = () => {
 *   request('/users/profile', { method: 'GET' });
 * };
 */
export const useApi = <T = unknown>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Track if component is mounted to prevent state updates on unmounted components
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const request = useCallback(
    async (url: string, options?: UseApiOptions) => {
      if (!isMountedRef.current) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await api.request<T>({
          url,
          ...options,
        });

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            data: response.data,
            loading: false,
          }));
          options?.onSuccess?.(response.data);
        }

        return response.data;
      } catch (error) {
        const errorMessage = handleApiError(error);

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            error: errorMessage,
            loading: false,
          }));
          options?.onError?.(errorMessage);
        }

        throw error;
      }
    },
    []
  );

  const setData = useCallback((data: T | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, data }));
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, error }));
    }
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, loading }));
    }
  }, []);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({
        data: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  return {
    ...state,
    request,
    setData,
    setError,
    setLoading,
    reset,
  };
};

/**
 * Custom hook for GET requests with caching
 * 
 * @example
 * const { data, loading, error } = useFetch<Post[]>('/posts');
 */
export const useFetch = <T = unknown>(
  url: string | null,
  options?: UseApiOptions
) => {
  const { data, loading, error, request } = useApi<T>();

  useEffect(() => {
    if (!url) return;

    request(url, { method: 'GET', ...options });
  }, [url, request, options]);

  return { data, loading, error };
};

/**
 * Custom hook for POST requests
 * 
 * @example
 * const { loading, error, request: createPost } = usePost();
 * 
 * const handleCreate = async (postData) => {
 *   await createPost('/posts', { data: postData });
 * };
 */
export const usePost = <T = unknown>(url?: string, options?: UseApiOptions) => {
  const { data, loading, error, request } = useApi<T>();

  const post = useCallback(
    async (postUrl: string, postData: unknown) => {
      return request(postUrl || url || '', {
        method: 'POST',
        data: postData,
        ...options,
      });
    },
    [request, url, options]
  );

  return { data, loading, error, post };
};

/**
 * Custom hook for PATCH/PUT requests
 * 
 * @example
 * const { loading, error, request: updateProfile } = useUpdate();
 * 
 * const handleUpdate = async (profileData) => {
 *   await updateProfile('/users/profile', { data: profileData });
 * };
 */
export const useUpdate = <T = unknown>(url?: string, options?: UseApiOptions) => {
  const { data, loading, error, request } = useApi<T>();

  const update = useCallback(
    async (updateUrl: string, updateData: unknown, method: 'PUT' | 'PATCH' = 'PATCH') => {
      return request(updateUrl || url || '', {
        method,
        data: updateData,
        ...options,
      });
    },
    [request, url, options]
  );

  return { data, loading, error, update };
};

/**
 * Custom hook for DELETE requests
 * 
 * @example
 * const { loading, error, request: deletePost } = useDelete();
 * 
 * const handleDelete = async (postId) => {
 *   await deletePost(`/posts/${postId}`);
 * };
 */
export const useDelete = <T = unknown>(url?: string, options?: UseApiOptions) => {
  const { data, loading, error, request } = useApi<T>();

  const remove = useCallback(
    async (deleteUrl: string) => {
      return request(deleteUrl || url || '', {
        method: 'DELETE',
        ...options,
      });
    },
    [request, url, options]
  );

  return { data, loading, error, remove };
};
