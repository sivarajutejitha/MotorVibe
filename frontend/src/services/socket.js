/**
 * Socket.IO Client Configuration
 * Manages real-time bidirectional WebSocket stream with MotorVibe backend.
 * Course Outcome: CO-3 (React), CO-5 (Real-time streaming)
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('connect', () => {
  console.log('[Socket.IO Connected]: Stream link established with backend ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('[Socket.IO Connect Warning]:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket.IO Disconnected]:', reason);
});
