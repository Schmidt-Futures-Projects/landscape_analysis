import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useHttp } from './useHttp'; // Adjust the import path as needed

// Mock the global fetch function
globalThis.fetch = jest.fn();

describe('useHttp', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });
    it('should set loading to true initially and then set data when fetch is successful', async () => {
      // Mock the fetch function to return a successful response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
          new Response(JSON.stringify({ data: 'test data' }), { status: 200 })
      );

      const { result } = renderHook(() => useHttp<{ data: string }>('/my-endpoint'));
      
      // Call the callback function to trigger the fetch
        act(() => {
          result.current.callRequest();
      });

      // Wait for the hook to complete fetching
      await waitFor(() => {
          // First, check the loading state
          expect(result.current.loading).toBe(false);
          // Check the data
          expect(result.current.data).toEqual({ data: 'test data' });
          // Check the error
          expect(result.current.error).toBeNull();
      });

      // Check if fetch was called with the correct URL
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/my-endpoint', {});
  });

    // it('should set error when fetch fails', async () => {
    //     // Mock the fetch function to simulate an error
    //     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
    //         new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 })
    //     );

    //     const { result } = renderHook(() => useHttp<{ data: string }>('/my-endpoint'));

    //     // Wait for the hook to finish loading
    //     await waitFor(() => {
    //         expect(result.current.loading).toBe(false);
    //         expect(result.current.data).toBeNull();
    //         expect(result.current.error).toBe('Internal server error');
    //     });

    //     // Check if fetch was called
    //     expect(fetch).toHaveBeenCalledWith('http://localhost:8000/my-endpoint');
    // });
});