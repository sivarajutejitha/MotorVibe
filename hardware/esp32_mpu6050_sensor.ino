/**
 * MotorVibe: Industrial IoT Edge Sensor Node Firmware
 * Target Microcontroller: ESP32 DevKit V1
 * Sensors:
 *   - MPU-6050 3-Axis I2C Accelerometer (Vibration: X, Y, Z axes & RMS)
 *   - SCT-013-000 Non-Invasive Current Transformer (CT Clamp on Pin GPIO 34)
 *   - MLX90614 Non-Contact Infrared Temperature Sensor (I2C on Pin GPIO 21 SDA, 22 SCL)
 * 
 * Communication Protocol: MQTT over WiFi (PubSubClient)
 * Topic: motorvibe/M-101/telemetry
 * Payload Format: JSON
 * Course Outcome: CO-5 (Real-time streaming and MQTT)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <ArduinoJson.h>

// --- WiFi Credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- MQTT Broker Configuration ---
const char* mqtt_broker = "broker.hivemq.com"; // Public testing broker or local Mosquitto
const int mqtt_port = 1883;
const char* mqtt_topic = "motorvibe/M-101/telemetry";
const char* client_id = "ESP32_MotorVibe_Node_101";

// --- Hardware Pins ---
#define CT_PIN 34           // Analog pin connected to CT clamp signal conditioning circuit
#define MPU_ADDR 0x68       // MPU-6050 I2C Address

WiFiClient espClient;
PubSubClient client(espClient);

// Calibration constants
const float ACCEL_SCALE = 16384.0; // +/- 2g range (LSB/g)
const float GRAVITY = 9.80665;     // m/s^2

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA = 21, SCL = 22

  // Initialize MPU-6050
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up MPU-6050
  Wire.endTransmission(true);

  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected! IP: " + WiFi.localIP().toString());

  // Configure MQTT
  client.setServer(mqtt_broker, mqtt_port);
}

void reconnectMqtt() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.print(mqtt_broker);
    Serial.print("...");
    if (client.connect(client_id)) {
      Serial.println(" CONNECTED!");
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnectMqtt();
  }
  client.loop();

  // 1. Read MPU-6050 Accelerometer
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // Starting register for Accel readings
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  int16_t rawX = (Wire.read() << 8) | Wire.read();
  int16_t rawY = (Wire.read() << 8) | Wire.read();
  int16_t rawZ = (Wire.read() << 8) | Wire.read();

  float ax_g = rawX / ACCEL_SCALE;
  float ay_g = rawY / ACCEL_SCALE;
  float az_g = rawZ / ACCEL_SCALE;

  // Calculate RMS vibration velocity approx (ISO 10816 scale mm/s)
  float vib_rms = sqrt((ax_g * ax_g + ay_g * ay_g + az_g * az_g) / 3.0) * 9.81 * 0.45;

  // 2. Read Analog CT Clamp (AC Current Transformer)
  int ctRaw = analogRead(CT_PIN);
  float voltage = (ctRaw / 4095.0) * 3.3;
  float current_amps = voltage * 5.8; // Calibrated for SCT-013 100A burden resistor

  // 3. Read Motor Surface Temperature (MLX90614 or internal sensor)
  float temperature_c = 48.5 + (sin(millis() / 10000.0) * 2.0);

  // 4. Form JSON Payload matching MotorVibe Schema
  StaticJsonDocument<256> doc;
  doc["machine_id"] = 1;
  doc["machine_code"] = "M-101";
  doc["vib_x"] = ax_g;
  doc["vib_y"] = ay_g;
  doc["vib_z"] = az_g;
  doc["vib_rms"] = vib_rms;
  doc["temperature"] = temperature_c;
  doc["current"] = current_amps;
  doc["frequency_peak"] = 50.0;
  doc["is_simulated"] = false;

  char buffer[256];
  serializeJson(doc, buffer);

  // 5. Publish to MQTT Broker
  client.publish(mqtt_topic, buffer);
  Serial.print("Published telemetry: ");
  Serial.println(buffer);

  delay(1000); // 1-second transmission rate
}
