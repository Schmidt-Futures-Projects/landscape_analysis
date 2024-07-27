import { useHttp }  from './useHttp';
import { waitFor, renderHook, act } from '@testing-library/react';

describe('useHttp hook', () => {
    let fetchMock: jest.SpyInstance;
  
    const mockResponse = (body: any, status: number) =>
      Promise.resolve(new Response(JSON.stringify(body), { status }));
  
    beforeEach(() => {
      fetchMock = jest.spyOn(globalThis, 'fetch');
    });
  
    afterEach(() => {
      fetchMock.mockRestore();
    });
  
    it('should set loading to true initially', () => {
      fetchMock.mockReturnValue(mockResponse({}, 200));
      
      const { result } = renderHook(() => useHttp('/test-url'));
  
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });
  
    it('should call the correct URL', async () => {
      fetchMock.mockReturnValue(mockResponse({}, 200));
      
      renderHook(() => useHttp('/test-url'));
  
      await act(async () => {
        await new Promise(setImmediate); // Wait for fetch to resolve
      });
  
      expect(fetchMock).toHaveBeenCalledWith('https://s3.eu-central-1.amazonaws.com/ecosia-frontend-developer/test-url', {});
    });
  
    describe('on success', () => {
      const responseData = { data: 'test' };
  
      beforeEach(() => {
        fetchMock.mockReturnValue(mockResponse(responseData, 200));
      });
  
      it('should set loading to false and return the response data', async () => {
        const { result } = renderHook(() => useHttp('/test-url'));
  
        await act(async () => {
          await new Promise(setImmediate); // Wait for fetch to resolve
        });
  
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual(responseData);
        expect(result.current.error).toBeNull();
      });
    });
  
    describe('on failure', () => {
      const errorData = { message: 'Fetch error' };
  
      beforeEach(() => {
        fetchMock.mockReturnValue(mockResponse(errorData, 422));
      });
  
      it('should set loading to false and return the error message', async () => {
        const { result } = renderHook(() => useHttp('/test-url'));
  
        await act(async () => {
          await new Promise(setImmediate); // Wait for fetch to resolve
        });
  
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe('Fetch error');
      });
    });
  
    describe('when the hook rerenders with the same URL', () => {
      it('should not resend the HTTP request', async () => {
        fetchMock.mockReturnValue(mockResponse({}, 200));
  
        const { result, rerender } = renderHook(() => useHttp('/test-url'));
  
        await act(async () => {
          await new Promise(setImmediate); // Wait for fetch to resolve
        });
  
        expect(fetchMock).toHaveBeenCalledTimes(1);
  
        rerender(); // Trigger rerender
  
        await act(async () => {
          await new Promise(setImmediate); // Wait for fetch to resolve
        });
  
        expect(fetchMock).toHaveBeenCalledTimes(1); // Ensure fetch is not called again
      });
    });
  
    describe('when the hook rerenders with a different URL', () => {
      it('should resend the HTTP request', async () => {
        fetchMock.mockReturnValue(mockResponse({}, 200));
  
        const { result, rerender } = renderHook(({ url }) => useHttp(url), {
          initialProps: { url: '/test-url' }
        });
  
        await act(async () => {
          await new Promise(setImmediate); // Wait for fetch to resolve
        });
  
        expect(fetchMock).toHaveBeenCalledTimes(1);
  
        rerender({ url: '/new-url' });
  
        fetchMock.mockReturnValue(mockResponse({}, 200)); // Mock new response
  
        await act(async () => {
          await new Promise(setImmediate); // Wait for fetch to resolve
        });
  
        expect(fetchMock).toHaveBeenCalledTimes(2); // Ensure fetch is called again
      });
    });
  });