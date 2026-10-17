-- ====================================================================
-- MotorVibe: Industrial Motor Vibration & Health Dashboard
-- Seed Data: College Demonstration & Full-Stack Testing
-- ====================================================================

-- 1. SEED USERS
-- Demo credentials:
-- demo@motorvibe.io      / Password123!
-- admin@motorvibe.io     / Admin@123
-- operator@motorvibe.io  / Operator@123
-- examiner@college.edu   / College@123
INSERT INTO users (full_name, email, password_hash, organization, role) VALUES
('Industrial Demo User', 'demo@motorvibe.io', '$2a$10$ivCPvddDiHIllEJzv7Pav.ybon78tIfJVJ7iV8ramLfbh.S6BiH7.', 'MotorVibe Demo Plant', 'engineer'),
('Dr. Rajesh Kumar', 'admin@motorvibe.io', '$2a$10$k/Ger.GsBQTWZPsAsjCKaOifXVIAgYDtiX0KciV6GdPGu.A3rWO4S', 'Apex Manufacturing Ltd', 'admin'),
('Priya Sharma', 'operator@motorvibe.io', '$2a$10$A7xVark9rdtNEGMUh/vc4eLGmiQtibOIbjlAGq2tZgLeOl1MRMQ2a', 'Apex Manufacturing Ltd', 'operator'),
('External Project Examiner', 'examiner@college.edu', '$2a$10$k/Ger.GsBQTWZPsAsjCKaOifXVIAgYDtiX0KciV6GdPGu.A3rWO4S', 'Dept of Computer Science', 'engineer')
ON CONFLICT (email) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash,
    organization = EXCLUDED.organization,
    role = EXCLUDED.role;

-- 2. SEED MOTORS (6 Industrial Induction Drive Units)
INSERT INTO motors (id, motor_name, equipment_code, location, rated_power_kw, installation_date, vibration_warning_threshold, vibration_critical_threshold, temperature_warning_threshold, temperature_critical_threshold, operational_status) VALUES
(1, 'Primary Slurry Feed Pump', 'MTR-101', 'Pumping Station Alpha - Line 1', 55.00, '2025-01-15', 4.50, 7.10, 70.00, 85.00, 'Healthy'),
(2, 'Secondary Ventilation Blower', 'MTR-102', 'Ventilation Tunnel North', 30.00, '2025-02-10', 4.50, 7.10, 70.00, 85.00, 'Warning'),
(3, 'Rotary Screw Air Compressor', 'MTR-103', 'Utility Compressor Bay B', 75.00, '2024-11-20', 4.50, 7.10, 70.00, 85.00, 'Healthy'),
(4, 'Heavy Ore Conveyor Drive', 'MTR-104', 'Conveyor Gallery Line 3', 18.50, '2024-09-05', 4.50, 7.10, 70.00, 85.00, 'Critical'),
(5, 'CNC High-Precision Spindle', 'MTR-105', 'Machining Cell 2', 22.00, '2025-03-01', 3.00, 5.50, 60.00, 75.00, 'Healthy'),
(6, 'Chilled Water Circulation Pump', 'MTR-106', 'Central HVAC Plant', 45.00, '2024-12-18', 4.50, 7.10, 70.00, 85.00, 'Warning')
ON CONFLICT (equipment_code) DO UPDATE SET
    motor_name = EXCLUDED.motor_name,
    location = EXCLUDED.location,
    rated_power_kw = EXCLUDED.rated_power_kw,
    vibration_warning_threshold = EXCLUDED.vibration_warning_threshold,
    vibration_critical_threshold = EXCLUDED.vibration_critical_threshold,
    temperature_warning_threshold = EXCLUDED.temperature_warning_threshold,
    temperature_critical_threshold = EXCLUDED.temperature_critical_threshold,
    operational_status = EXCLUDED.operational_status;

SELECT setval('motors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM motors));

-- 3. SEED HISTORICAL SENSOR READINGS
INSERT INTO sensor_readings (motor_id, vibration_x, vibration_y, vibration_z, vibration_rms, vibration_frequency_hz, temperature_c, current_a, runtime_hours, recorded_at, data_source) VALUES
-- Motor 1: Primary Slurry Feed Pump (Healthy baseline, ~2.2 mm/s RMS)
(1, 0.42, 0.55, 0.38, 2.15, 49.8, 48.5, 9.2, 3420.5, NOW() - INTERVAL '24 hours', 'simulated'),
(1, 0.45, 0.52, 0.40, 2.22, 50.0, 51.2, 9.4, 3426.5, NOW() - INTERVAL '18 hours', 'simulated'),
(1, 0.48, 0.58, 0.42, 2.30, 49.9, 53.0, 9.6, 3432.5, NOW() - INTERVAL '12 hours', 'simulated'),
(1, 0.44, 0.54, 0.39, 2.18, 50.1, 52.4, 9.3, 3438.5, NOW() - INTERVAL '6 hours', 'simulated'),
(1, 0.43, 0.51, 0.41, 2.20, 50.0, 52.8, 9.5, 3442.5, NOW() - INTERVAL '2 hours', 'simulated'),
(1, 0.46, 0.53, 0.40, 2.24, 50.0, 53.1, 9.4, 3444.0, NOW() - INTERVAL '30 minutes', 'simulated'),
(1, 0.45, 0.52, 0.39, 2.21, 50.0, 53.5, 9.3, 3444.5, NOW() - INTERVAL '5 minutes', 'simulated'),

-- Motor 2: Secondary Ventilation Blower (Warning: Rising Temp & Vib)
(2, 0.62, 0.75, 0.58, 3.40, 98.2, 58.0, 7.8, 2810.0, NOW() - INTERVAL '24 hours', 'simulated'),
(2, 0.65, 0.78, 0.60, 3.55, 98.5, 62.5, 8.1, 2816.0, NOW() - INTERVAL '18 hours', 'simulated'),
(2, 0.68, 0.81, 0.62, 3.70, 98.4, 67.2, 8.4, 2822.0, NOW() - INTERVAL '12 hours', 'simulated'),
(2, 0.70, 0.85, 0.65, 3.88, 98.3, 71.4, 8.7, 2828.0, NOW() - INTERVAL '6 hours', 'simulated'),
(2, 0.82, 0.95, 0.78, 4.82, 98.5, 73.8, 8.9, 2832.0, NOW() - INTERVAL '2 hours', 'simulated'),
(2, 0.84, 0.98, 0.80, 4.88, 98.4, 74.5, 9.1, 2833.8, NOW() - INTERVAL '15 minutes', 'simulated'),

-- Motor 3: Rotary Screw Air Compressor (Healthy, high capacity)
(3, 0.50, 0.60, 0.48, 2.85, 24.8, 61.0, 13.5, 4120.0, NOW() - INTERVAL '24 hours', 'simulated'),
(3, 0.52, 0.62, 0.50, 2.92, 25.0, 63.5, 14.0, 4128.0, NOW() - INTERVAL '16 hours', 'simulated'),
(3, 0.54, 0.65, 0.52, 3.05, 24.9, 64.8, 14.2, 4136.0, NOW() - INTERVAL '8 hours', 'simulated'),
(3, 0.51, 0.61, 0.49, 2.88, 25.0, 64.9, 13.8, 4143.9, NOW() - INTERVAL '5 minutes', 'simulated'),

-- Motor 4: Heavy Ore Conveyor Drive (Critical: Extreme Vibration Spike)
(4, 0.70, 0.80, 0.65, 3.80, 16.2, 52.0, 6.2, 1950.0, NOW() - INTERVAL '24 hours', 'simulated'),
(4, 0.85, 0.98, 0.80, 4.65, 16.4, 56.5, 6.8, 1958.0, NOW() - INTERVAL '16 hours', 'simulated'),
(4, 1.10, 1.35, 1.05, 5.80, 16.3, 62.0, 7.4, 1966.0, NOW() - INTERVAL '8 hours', 'simulated'),
(4, 1.45, 1.70, 1.35, 7.20, 16.5, 66.8, 8.0, 1972.0, NOW() - INTERVAL '2 hours', 'simulated'),
(4, 1.62, 1.88, 1.50, 7.82, 16.4, 69.4, 8.6, 1973.8, NOW() - INTERVAL '10 minutes', 'simulated'),
(4, 1.65, 1.90, 1.52, 7.95, 16.5, 70.1, 8.7, 1974.0, NOW() - INTERVAL '2 minutes', 'simulated'),

-- Motor 5: CNC Precision Spindle (Ultra-quiet high-precision operation)
(5, 0.22, 0.28, 0.20, 1.40, 120.0, 39.5, 5.8, 890.0, NOW() - INTERVAL '24 hours', 'simulated'),
(5, 0.24, 0.30, 0.21, 1.48, 120.0, 41.2, 6.0, 902.0, NOW() - INTERVAL '12 hours', 'simulated'),
(5, 0.23, 0.29, 0.20, 1.45, 120.0, 42.0, 6.2, 913.9, NOW() - INTERVAL '5 minutes', 'simulated'),

-- Motor 6: Chilled Water Circulation Pump (Warning: Impeller cavitation)
(6, 0.78, 0.92, 0.74, 4.75, 49.5, 64.0, 11.2, 5100.0, NOW() - INTERVAL '24 hours', 'simulated'),
(6, 0.85, 1.02, 0.80, 5.20, 49.6, 68.4, 12.1, 5118.0, NOW() - INTERVAL '6 hours', 'simulated'),
(6, 0.86, 1.05, 0.82, 5.25, 49.5, 68.8, 12.3, 5123.9, NOW() - INTERVAL '5 minutes', 'simulated');

-- 4. SEED ALERTS
INSERT INTO alerts (id, motor_id, alert_type, severity, measured_value, threshold_value, message, status, created_at, acknowledged_at, acknowledged_by) VALUES
(1, 4, 'VIBRATION_CRITICAL', 'Critical', 7.82, 7.10,
 'Vibration RMS reached 7.82 mm/s, breaching ISO 10816 Zone D critical threshold (7.10 mm/s). Severe mechanical unbalance and bearing race defect detected on Drive End bearing.',
 'Active', NOW() - INTERVAL '10 minutes', NULL, NULL),

(2, 2, 'TEMPERATURE_WARNING', 'Warning', 74.50, 70.00,
 'Motor bearing housing temperature elevated to 74.5°C, exceeding 70.0°C warning threshold. Thermal gradient rising at +2.1°C/hour under continuous 9.1A load.',
 'Acknowledged', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes', 'Priya Sharma (Operator)'),

(3, 6, 'VIBRATION_WARNING', 'Warning', 5.20, 4.50,
 'Vibration RMS measured at 5.20 mm/s, exceeding ISO Zone C warning threshold of 4.50 mm/s. Impeller vane cavitation harmonics detected.',
 'Active', NOW() - INTERVAL '25 minutes', NULL, NULL),

(4, 2, 'VIBRATION_WARNING', 'Warning', 4.88, 4.50,
 'Vibration RMS rose to 4.88 mm/s due to cooling fan blade imbalance.',
 'Resolved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '22 hours', 'Dr. Rajesh Kumar (Admin)')
ON CONFLICT (id) DO NOTHING;

SELECT setval('alerts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM alerts));

-- 5. SEED MAINTENANCE RECORDS
INSERT INTO maintenance_records (id, motor_id, maintenance_type, description, work_performed, technician_name, maintenance_date, next_maintenance_date, status) VALUES
(1, 1, 'Routine Inspection', 'Quarterly vibration baseline check and bearing thermography.', 'Inspected terminal box, greased SKF Explorer bearing with Polyrex EM, tightened hold-down bolts to 120 Nm torque.', 'Arun Patel (Senior Tech)', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days', 'Completed'),
(2, 4, 'Emergency Repair', 'Critical vibration trip caused by worn flexible coupling insert.', 'Replaced elastomeric spider element on Lovejoy coupling, performed laser shaft alignment to within 0.04 mm tolerance.', 'Vikas Nair (Vibration Specialist)', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '27 days', 'Completed'),
(3, 3, 'Preventive Maintenance', 'Comprehensive air compressor motor 4000-hour service interval.', 'Cleaned stator air passages with dry nitrogen, measured insulation resistance (Megger test: 450 MΩ), verified current clamp calibration.', 'Suresh Menon (Electrical Eng)', CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE + INTERVAL '150 days', 'Completed'),
(4, 2, 'Corrective Repair', 'Cooling fan shroud rattle and bearing repacking.', 'Removed foreign debris from intake louver, cleaned fan blades, replenished Mobil Polyrex synthetic grease.', 'Arun Patel (Senior Tech)', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '55 days', 'Completed')
ON CONFLICT (id) DO NOTHING;

SELECT setval('maintenance_records_id_seq', (SELECT COALESCE(MAX(id), 1) FROM maintenance_records));

-- 6. SEED ACTIVITY LOGS
INSERT INTO activity_logs (id, user_id, action, description, created_at) VALUES
(1, 2, 'MOTOR_REGISTERED', 'Registered industrial motor MTR-105 (CNC High-Precision Spindle) into plant fleet database.', NOW() - INTERVAL '48 hours'),
(2, 3, 'ALERT_ACKNOWLEDGED', 'Operator acknowledged Temperature Warning alert #2 for Ventilation Blower MTR-102.', NOW() - INTERVAL '30 minutes'),
(3, 2, 'THRESHOLD_UPDATED', 'Updated vibration warning threshold for CNC Spindle MTR-105 to 3.00 mm/s for high-precision tolerance.', NOW() - INTERVAL '18 hours'),
(4, 1, 'MAINTENANCE_LOGGED', 'Logged Emergency Repair completion record #2 for Conveyor Drive MTR-104.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('activity_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activity_logs));
