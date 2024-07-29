import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/useHttp';

interface Sensor {
  id: number;
  name: string;
  value: number;
}


const Sensor: React.FC = () => {
    const [sensorIdCount, setSensorIdCount] = useState(0)
    const [newSensor, _setNewSensor] = useState<Sensor>({ id: 1, name: "Liam", value: Math.floor(Math.random() * 101) });
    const { data, loading, error, callRequest } = useHttp<string>('/');
    const { loading: getSensorLoading, data: getSensorData, error: getSensorError, callRequest: getSensor } = useHttp<Sensor>(`/sensor/${sensorIdCount}`, {});
    const { loading: createSensorLoading, data: createSensorData, error: createSensorError, callRequest: createSensor } = useHttp<Sensor>('/sensor', {
        method: 'POST',
        body: JSON.stringify(newSensor),
        headers: { 'Content-Type': 'application/json' },
    });

    useEffect(() => {
        createSensor();
    }, [createSensor]);

    useEffect(() => {
        callRequest()
    }, [callRequest])

    return (
        <>
        <div>
            <h2>Backend Root Response:</h2>
            <button onClick={callRequest}>Fetch Backend Root</button>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && (
            <div>
                <pre>{data}</pre>
            </div>
            )}
        </div>
        <div>
            <h2>New Sensor:</h2>
            <button onClick={createSensor}>Create Sensor</button>
            {createSensorError && <p>Error: {createSensorError.message}</p>}
            {createSensorLoading && <p>Creating New Sensor</p>}
            { createSensorData && (
            <div>
                <pre>{JSON.stringify(createSensorData)}</pre>
            </div>
            )}
        </div>
        <div>
            <h2>Get Sensor:</h2>
            <button onClick={getSensor}>Get Sensor</button>
            {getSensorError && <p>Error: {getSensorError.message}</p>}
            {getSensorLoading && <p>Get New Sensor</p>}
            { getSensorData && (
            <div>
                <pre>{JSON.stringify(getSensorData)}</pre>
            </div>
            )}
        </div>
        <div className="card">
            <button onClick={() => setSensorIdCount((sensorIdCount) => sensorIdCount + 1)}>
            Sensor ID to fetch is {sensorIdCount}
            </button>
      </div>
    </>
    );
};

export default Sensor;