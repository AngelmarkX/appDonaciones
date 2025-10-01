-- Crear base de datos
CREATE DATABASE IF NOT EXISTS food_donation_db;
USE food_donation_db;

-- Tabla de usuarios
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type ENUM('donor', 'organization') NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de donaciones
CREATE TABLE donations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  donor_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('bakery', 'dairy', 'fruits', 'meat', 'canned', 'prepared', 'other') NOT NULL,
  quantity INT NOT NULL,
  expiry_date DATE,
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NULL,
  pickup_longitude DECIMAL(11, 8) NULL,
  status ENUM('available', 'reserved', 'completed', 'expired') DEFAULT 'available',
  reserved_by INT NULL,
  reserved_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reserved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('donation_created', 'donation_reserved', 'donation_completed', 'general') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de historial de donaciones
CREATE TABLE donation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  donation_id INT NOT NULL,
  action ENUM('created', 'reserved', 'completed', 'cancelled') NOT NULL,
  user_id INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_category ON donations(category);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_donations_location ON donations(pickup_latitude, pickup_longitude);

-- Datos de prueba
INSERT INTO users (email, password, name, phone, user_type, address, latitude, longitude) VALUES
('donor1@example.com', '$2b$10$rOvHPGkwMkMZF5Z5Z5Z5ZeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Juan Pérez', '+573123456789', 'donor', 'Carrera 7 #25-50, Pereira', 4.8133, -75.6961),
('org1@example.com', '$2b$10$rOvHPGkwMkMZF5Z5Z5Z5ZeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Banco de Alimentos Pereira', '+573987654321', 'organization', 'Avenida 30 de Agosto #45-20, Pereira', 4.8200, -75.7000);

INSERT INTO donations (donor_id, title, description, category, quantity, expiry_date, pickup_address, pickup_latitude, pickup_longitude, status) VALUES
(1, 'Pan del día', 'Pan fresco del día, perfecto estado', 'bakery', 20, '2024-01-15', 'Carrera 7 #25-50, Pereira', 4.8133, -75.6961, 'available'),
(1, 'Frutas variadas', 'Manzanas, naranjas y plátanos', 'fruits', 15, '2024-01-18', 'Carrera 7 #25-50, Pereira', 4.8150, -75.6980, 'available');

-- Actualizar donaciones existentes con coordenadas de Pereira
UPDATE donations SET 
  pickup_latitude = 4.8133 + (RAND() - 0.5) * 0.1,
  pickup_longitude = -75.6961 + (RAND() - 0.5) * 0.1
WHERE pickup_latitude IS NULL OR pickup_latitude = 40.4168;
