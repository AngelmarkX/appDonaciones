-- Script para corregir y normalizar datos de donaciones
USE food_donation_db;

-- Actualizar donaciones sin coordenadas con valores válidos de Pereira
UPDATE donations 
SET 
  pickup_latitude = 4.8133 + (RAND() - 0.5) * 0.1,
  pickup_longitude = -75.6961 + (RAND() - 0.5) * 0.1
WHERE pickup_latitude IS NULL 
   OR pickup_longitude IS NULL 
   OR pickup_latitude = 0 
   OR pickup_longitude = 0
   OR pickup_latitude = 40.4168; -- Coordenadas de Madrid que podrían estar por error

-- Actualizar campos que podrían estar NULL
UPDATE donations 
SET 
  title = COALESCE(title, 'Donación sin título'),
  description = COALESCE(description, 'Sin descripción disponible'),
  category = COALESCE(category, 'other'),
  quantity = COALESCE(quantity, 1),
  pickup_address = COALESCE(pickup_address, 'Dirección no especificada'),
  status = COALESCE(status, 'available')
WHERE title IS NULL 
   OR description IS NULL 
   OR category IS NULL 
   OR quantity IS NULL 
   OR pickup_address IS NULL 
   OR status IS NULL;

-- Verificar que todas las donaciones tienen datos válidos
SELECT 
  id,
  title,
  category,
  quantity,
  pickup_latitude,
  pickup_longitude,
  status,
  CASE 
    WHEN pickup_latitude IS NULL OR pickup_longitude IS NULL THEN 'SIN COORDENADAS'
    WHEN pickup_latitude = 0 OR pickup_longitude = 0 THEN 'COORDENADAS CERO'
    WHEN pickup_latitude < -4 OR pickup_latitude > 15 THEN 'LATITUD FUERA DE COLOMBIA'
    WHEN pickup_longitude < -85 OR pickup_longitude > -65 THEN 'LONGITUD FUERA DE COLOMBIA'
    ELSE 'OK'
  END as validation_status
FROM donations
ORDER BY id;

-- Insertar donaciones de prueba si no existen
INSERT IGNORE INTO donations (
  donor_id, 
  title, 
  description, 
  category, 
  quantity, 
  expiry_date, 
  pickup_address, 
  pickup_latitude, 
  pickup_longitude, 
  status
) VALUES
(1, 'Pan fresco del día', 'Pan artesanal recién horneado, perfecto estado', 'bakery', 15, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Carrera 7 #25-50, Pereira', 4.8133, -75.6961, 'available'),
(1, 'Frutas variadas', 'Manzanas, naranjas y plátanos en buen estado', 'fruits', 20, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Avenida 30 de Agosto #45-20, Pereira', 4.8200, -75.7000, 'available'),
(1, 'Lácteos frescos', 'Leche y yogures próximos a vencer', 'dairy', 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Calle 14 #8-15, Pereira', 4.8100, -75.6900, 'available');

-- Mostrar resumen final
SELECT 
  COUNT(*) as total_donations,
  COUNT(CASE WHEN pickup_latitude IS NOT NULL AND pickup_longitude IS NOT NULL THEN 1 END) as with_coordinates,
  COUNT(CASE WHEN status = 'available' THEN 1 END) as available_donations
FROM donations;
