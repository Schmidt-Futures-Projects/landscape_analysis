import React, { useEffect } from 'react';
import { useHttp } from '../hooks/useHttp';

interface Sensor {
  id: number;
  name: string;
  value: number;
}

const Sensor: React.FC = () => {
  const { data, loading, error, callRequest } = useHttp<Sensor[]>('/');

  useEffect(() => {
    callRequest();
  }, []);

  return (
    <div>
      <button onClick={callRequest}>Fetch Data</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <h1>Data:</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Sensor;