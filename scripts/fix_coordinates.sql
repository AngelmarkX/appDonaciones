-- Script para corregir coordenadas en la base de datos
USE food_donation_db;

-- Actualizar donaciones sin coordenadas con valores de ejemplo alrededor de Madrid
UPDATE donations 
SET 
  pickup_latitude = 40.4168 + (RAND() - 0.5) * 0.1,
  pickup_longitude = -3.7038 + (RAND() - 0.5) * 0.1
WHERE pickup_latitude IS NULL OR pickup_longitude IS NULL OR pickup_latitude = 0 OR pickup_longitude = 0;

-- Verificar que todas las donaciones tienen coordenadas válidas
SELECT id, title, pickup_latitude, pickup_longitude 
FROM donations 
WHERE pickup_latitude IS NULL OR pickup_longitude IS NULL;
