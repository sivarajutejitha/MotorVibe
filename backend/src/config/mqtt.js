/**
 * MQTT Broker Client Configuration
 * Handles IIoT sensor communication, topic subscriptions, and message validation.
 * Course Outcome: CO-5 (Real-time Streaming and MQTT)
 */
const mqtt = require('mqtt');
require('dotenv').config();

let client = null;
let isConnected = false;
const listeners = [];

function initMqtt() {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';
  const clientId = (process.env.MQTT_CLIENT_ID || 'motorvibe_backend') + '_' + Math.random().toString(16).substring(2, 8);
  const topic = process.env.MQTT_TOPIC || 'motorvibe/+/telemetry';

  console.log(`[MQTT] Connecting to broker: ${brokerUrl} (Client ID: ${clientId})`);

  try {
    client = mqtt.connect(brokerUrl, {
      clientId,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 10000,
    });

    client.on('connect', () => {
      isConnected = true;
      console.log(`[MQTT Connected]: Subscribed to topic pattern "${topic}"`);
      client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT Subscribe Error]:', err.message);
        }
      });
    });

    client.on('message', (receivedTopic, messageBuffer) => {
      try {
        const payloadStr = messageBuffer.toString();
        const data = JSON.parse(payloadStr);

        // Notify registered telemetry listeners (e.g., Alert Engine, Socket.IO broadcaster)
        listeners.forEach((callback) => {
          try {
            callback(receivedTopic, data);
          } catch (cbErr) {
            console.error('[MQTT Callback Error]:', cbErr.message);
          }
        });
      } catch (parseErr) {
        console.warn(`[MQTT] Invalid JSON on topic ${receivedTopic}:`, parseErr.message);
      }
    });

    client.on('reconnect', () => {
      console.log('[MQTT] Attempting to reconnect to broker...');
    });

    client.on('offline', () => {
      isConnected = false;
      console.log('[MQTT] Client went offline. Falling back to local simulated sensor stream.');
    });

    client.on('error', (err) => {
      isConnected = false;
      console.warn('[MQTT Client Warning]: Broker communication notice -', err.message);
    });

  } catch (err) {
    console.warn('[MQTT Init Error]: Could not establish MQTT connection:', err.message);
  }

  return client;
}

/**
 * Register a listener for incoming telemetry from hardware sensors
 */
function onTelemetryReceived(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
}

/**
 * Publish a telemetry message or command to the MQTT broker
 */
function publishMessage(topic, payload) {
  if (client && isConnected) {
    const message = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
    client.publish(topic, message, { qos: 1 });
  }
}

function getMqttStatus() {
  return {
    connected: isConnected,
    broker: process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883',
    topic: process.env.MQTT_TOPIC || 'motorvibe/+/telemetry',
  };
}

module.exports = {
  initMqtt,
  onTelemetryReceived,
  publishMessage,
  getMqttStatus,
};
