import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/useHttp';

interface Sensor {
  id: number;
  name: string;
  value: number;
}

const Sensor: React.FC = () => {
    const [newSensor, setNewSensor] = useState<Sensor>({ id: 1, name: "Liam", value: Math.floor(Math.random() * 101) });
    const { data, loading, error, callRequest } = useHttp<Sensor[]>('/', {i: 1});
    const { loading: createSensorLoading, data: createSensorData, error: createSensorError, callRequest: createSensor } = useHttp('/sensor', {
        method: 'POST',
        body: JSON.stringify(newSensor),
        headers: { 'Content-Type': 'application/json' },
    });

    useEffect(() => {
        console.log('callRequest:', createSensor);
        createSensor();
    }, [createSensor]);

    useEffect(() => {
        callRequest()
    }, [callRequest])

    return (
        <>
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
        <div>
            <button onClick={createSensor}>Create Sensor</button>
            {createSensorError && <p>Error: {createSensorError.message}</p>}
            {createSensorLoading && <p>Creating New Sensor</p>}
            { createSensorData && (
            <div>
                <h1>New Sensor:</h1>
                <pre>{JSON.stringify(createSensorData)}</pre>
            </div>
            )}
        </div>
    </>
    );
};

export default Sensor;