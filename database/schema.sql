-- ====================================================================
-- MotorVibe: Industrial Motor Vibration & Health Dashboard
-- Database Schema: PostgreSQL 14+ / 16+ / 18+ Compatible
-- Industry 4.0 Predictive Maintenance Data Architecture
-- ====================================================================

-- Migration check: If old legacy schema exists with 'machine_id', safely drop legacy tables
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_readings' AND column_name = 'machine_id'
    ) THEN
        DROP TABLE IF EXISTS sensor_readings CASCADE;
        DROP TABLE IF EXISTS alerts CASCADE;
        DROP TABLE IF EXISTS maintenance_records CASCADE;
        DROP TABLE IF EXISTS threshold_settings CASCADE;
        DROP TABLE IF EXISTS sensors CASCADE;
        DROP TABLE IF EXISTS machines CASCADE;
    END IF;
END $$;

-- 1. USERS TABLE: Operators, plant engineers, managers, and examiners
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    organization VARCHAR(150) DEFAULT 'MotorVibe Industrial Plant',
    role VARCHAR(50) DEFAULT 'operator', -- 'admin', 'engineer', 'operator'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ensure organization column exists if users table was created previously
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(150) DEFAULT 'MotorVibe Industrial Plant';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'operator';

-- 2. MOTORS TABLE: Industrial electric induction motors monitored on plant floor
CREATE TABLE IF NOT EXISTS motors (
    id SERIAL PRIMARY KEY,
    motor_name VARCHAR(150) NOT NULL,
    equipment_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'MTR-101', 'MTR-102'
    location VARCHAR(150) NOT NULL, -- e.g., 'Pumping Station Alpha - Line 1'
    rated_power_kw NUMERIC(6, 2) NOT NULL, -- e.g., 55.00 kW
    installation_date DATE DEFAULT CURRENT_DATE,
    vibration_warning_threshold NUMERIC(5, 2) DEFAULT 4.50, -- ISO 10816 Zone C (mm/s RMS)
    vibration_critical_threshold NUMERIC(5, 2) DEFAULT 7.10, -- ISO 10816 Zone D (mm/s RMS)
    temperature_warning_threshold NUMERIC(5, 2) DEFAULT 70.00, -- Motor bearing thermal warning (°C)
    temperature_critical_threshold NUMERIC(5, 2) DEFAULT 85.00, -- Class F insulation critical (°C)
    operational_status VARCHAR(30) DEFAULT 'Healthy', -- 'Healthy', 'Warning', 'Critical', 'Offline'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. SENSOR READINGS TABLE: High-frequency telemetry time-series data
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    motor_id INT NOT NULL REFERENCES motors(id) ON DELETE CASCADE,
    vibration_x NUMERIC(6, 3), -- X-axis acceleration in g
    vibration_y NUMERIC(6, 3), -- Y-axis acceleration in g
    vibration_z NUMERIC(6, 3), -- Z-axis acceleration in g
    vibration_rms NUMERIC(6, 3) NOT NULL, -- Derived ISO 10816 Root Mean Square velocity in mm/s
    vibration_frequency_hz NUMERIC(6, 2), -- FFT dominant peak frequency in Hz
    temperature_c NUMERIC(5, 2) NOT NULL, -- Bearing / stator casing temperature in °C
    current_a NUMERIC(5, 2) NOT NULL, -- Electrical RMS current drawn in Amperes
    runtime_hours NUMERIC(8, 2) DEFAULT 0.0, -- Cumulative running operational hours
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(50) DEFAULT 'simulated' -- 'simulated', 'mqtt_hardware'
);

-- 4. ALERTS TABLE: Rule-based predictive maintenance and threshold breach alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    motor_id INT NOT NULL REFERENCES motors(id) ON DELETE CASCADE,
    alert_type VARCHAR(60) NOT NULL, -- 'VIBRATION_WARNING', 'VIBRATION_CRITICAL', 'TEMPERATURE_WARNING', 'TEMPERATURE_CRITICAL', 'CURRENT_OVERLOAD'
    severity VARCHAR(20) NOT NULL, -- 'Warning', 'Critical'
    measured_value NUMERIC(8, 2) NOT NULL,
    threshold_value NUMERIC(8, 2) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Acknowledged', 'Resolved'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(150)
);

-- 5. MAINTENANCE RECORDS TABLE: Logs of scheduled, corrective, and preventive servicing
CREATE TABLE IF NOT EXISTS maintenance_records (
    id SERIAL PRIMARY KEY,
    motor_id INT NOT NULL REFERENCES motors(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(60) NOT NULL, -- 'Routine Inspection', 'Preventive Maintenance', 'Corrective Repair', 'Bearing Replacement', 'Lubrication'
    description TEXT NOT NULL,
    work_performed TEXT NOT NULL,
    technician_name VARCHAR(150) NOT NULL,
    maintenance_date DATE DEFAULT CURRENT_DATE,
    next_maintenance_date DATE,
    status VARCHAR(30) DEFAULT 'Completed', -- 'Scheduled', 'In Progress', 'Completed'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. ACTIVITY LOGS TABLE: Audit trail for actions performed within the application
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'MOTOR_REGISTERED', 'ALERT_ACKNOWLEDGED', 'MAINTENANCE_CREATED', etc.
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- PERFORMANCE INDEXES (Optimized for fast dashboard, query & analytics)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_sensor_readings_motor_time 
    ON sensor_readings(motor_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_time 
    ON sensor_readings(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_motor_status 
    ON alerts(motor_id, status);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at 
    ON alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_motor 
    ON maintenance_records(motor_id, maintenance_date DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at 
    ON activity_logs(created_at DESC);

-- Drop base table machines if it exists from previous installations before creating compatibility view
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'machines' AND table_type = 'BASE TABLE'
    ) THEN
        DROP TABLE machines CASCADE;
    END IF;
END $$;

CREATE OR REPLACE VIEW machines AS 
SELECT 
    id,
    equipment_code AS machine_code,
    motor_name AS name,
    '3-Phase Induction Motor' AS type,
    location,
    rated_power_kw,
    1480 AS rated_rpm,
    415 AS rated_voltage_v,
    (rated_power_kw * 1.8)::NUMERIC(6, 2) AS rated_current_a,
    UPPER(operational_status) AS status,
    created_at,
    updated_at
FROM motors;
