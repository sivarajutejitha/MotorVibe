/**
 * Custom React Hook: useSensorData
 * Manages live WebSocket sensor stream, 60-second rolling buffer, and connection status.
 */
import { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';

export function useSensorData(selectedMotorId = 1) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [latestReadings, setLatestReadings] = useState({});
  const [history60s, setHistory60s] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [lastNotification, setLastNotification] = useState(null);

  const motorIdRef = useRef(selectedMotorId);
  motorIdRef.current = selectedMotorId;

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onSensorReading(reading) {
      if (!reading) return;
      const mId = reading.motor_id || reading.machine_id;
      if (!mId) return;

      // 1. Update latest reading map
      setLatestReadings((prev) => ({
        ...prev,
        [mId]: reading,
      }));

      // 2. If reading is for the currently selected motor, append to 60-second rolling buffer
      if (Number(mId) === Number(motorIdRef.current)) {
        setHistory60s((prev) => {
          const point = {
            time: new Date(reading.recorded_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            vib_rms: reading.vibration_rms || reading.vib_rms,
            vib_x: reading.vibration_x || reading.vib_x,
            vib_y: reading.vibration_y || reading.vib_y,
            vib_z: reading.vibration_z || reading.vib_z,
            temperature: reading.temperature_c || reading.temperature,
            current: reading.current_a || reading.current,
            frequency_peak: reading.vibration_frequency_hz || reading.frequency_peak,
          };
          const next = [...prev, point];
          return next.length > 60 ? next.slice(next.length - 60) : next;
        });
      }
    }

    function onNewAlert(alert) {
      setLastNotification(alert);
      setActiveAlerts((prev) => [alert, ...prev.slice(0, 19)]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('sensor_reading', onSensorReading);
    socket.on('new_alert', onNewAlert);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sensor_reading', onSensorReading);
      socket.off('new_alert', onNewAlert);
    };
  }, []);

  // When selectedMotorId changes, reset buffer
  useEffect(() => {
    setHistory60s([]);
  }, [selectedMotorId]);

  const currentReading = latestReadings[selectedMotorId] || null;

  return {
    isConnected,
    latestReadings,
    currentReading,
    history60s,
    activeAlerts,
    lastNotification,
  };
}
