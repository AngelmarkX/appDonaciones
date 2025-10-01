const express = require("express")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "food_donation_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(dbConfig)

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" })
    }
    req.user = user
    next()
  })
}

// Función para limpiar y validar donación
const cleanDonation = (donation) => {
  if (!donation || typeof donation !== "object") {
    return null
  }

  // Validar campos obligatorios
  if (!donation.id || !donation.title || !donation.category) {
    return null
  }

  // Limpiar y convertir coordenadas
  let lat = Number.parseFloat(donation.pickup_latitude)
  let lng = Number.parseFloat(donation.pickup_longitude)

  // Si las coordenadas son inválidas, usar coordenadas de Pereira
  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    lat = 4.8133 + (Math.random() - 0.5) * 0.02
    lng = -75.6961 + (Math.random() - 0.5) * 0.02
  }

  return {
    id: Number.parseInt(donation.id),
    title: String(donation.title).trim(),
    description: String(donation.description || "").trim(),
    category: String(donation.category).toLowerCase().trim(),
    quantity: Number.parseInt(donation.quantity) || 1,
    expiry_date: donation.expiry_date || null,
    pickup_address: String(donation.pickup_address || "").trim(),
    pickup_latitude: Number.parseFloat(lat.toFixed(6)),
    pickup_longitude: Number.parseFloat(lng.toFixed(6)),
    latitude: Number.parseFloat(lat.toFixed(6)), // Alias para compatibilidad
    longitude: Number.parseFloat(lng.toFixed(6)), // Alias para compatibilidad
    status: String(donation.status || "available").toLowerCase(),
    donor_id: Number.parseInt(donation.donor_id) || null,
    donor_name: String(donation.donor_name || "Donante anónimo").trim(),
    donor_phone: donation.donor_phone ? String(donation.donor_phone).trim() : null,
    donor_email: donation.donor_email ? String(donation.donor_email).trim() : null,
    reserved_by: donation.reserved_by ? Number.parseInt(donation.reserved_by) : null,
    reserved_at: donation.reserved_at || null,
    completed_at: donation.completed_at || null,
    created_at: donation.created_at || new Date().toISOString(),
    updated_at: donation.updated_at || new Date().toISOString(),
    donor_confirmed: Boolean(donation.donor_confirmed || false),
    recipient_confirmed: Boolean(donation.recipient_confirmed || false),
    donor_confirmed_at: donation.donor_confirmed_at || null,
    recipient_confirmed_at: donation.recipient_confirmed_at || null,
  }
}

// Rutas de autenticación
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" })
    }

    const [users] = await pool.execute("SELECT id, email, password, name, user_type FROM users WHERE email = ?", [
      email,
    ])

    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "24h" },
    )

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone, userType, address } = req.body

    if (!email || !password || !name || !phone || !userType) {
      return res.status(400).json({ error: "Todos los campos requeridos deben ser completados" })
    }

    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" })
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const [result] = await pool.execute(
      "INSERT INTO users (email, password, name, phone, user_type, address) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, name, phone, userType, address || ""],
    )

    // Generar token
    const token = jwt.sign({ id: result.insertId, email, userType }, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "24h",
    })

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: result.insertId,
        email,
        name,
        userType,
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Ruta para actualizar perfil de usuario
app.put("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body

    console.log("📝 [BACKEND] Actualizando perfil usuario:", {
      userId: req.user.id,
      name,
      email,
      phone,
      address,
    })

    if (!name || !email) {
      return res.status(400).json({ error: "Nombre y email son obligatorios" })
    }

    // Verificar si el email ya existe para otro usuario
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, req.user.id])

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: "Este email ya está en uso por otro usuario" })
    }

    // Actualizar usuario
    const [result] = await pool.execute(
      `UPDATE users SET 
        name = ?, 
        email = ?, 
        phone = ?, 
        address = ?
      WHERE id = ?`,
      [name.trim(), email.trim(), phone ? phone.trim() : null, address ? address.trim() : null, req.user.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    // Obtener datos actualizados
    const [updatedUser] = await pool.execute(
      "SELECT id, email, name, phone, address, user_type FROM users WHERE id = ?",
      [req.user.id],
    )

    console.log("✅ [BACKEND] Perfil actualizado exitosamente")

    res.json({
      message: "Perfil actualizado exitosamente",
      user: updatedUser[0],
    })
  } catch (error) {
    console.error("❌ [BACKEND] Error actualizando perfil:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Rutas de donaciones
app.get("/api/donations", authenticateToken, async (req, res) => {
  try {
    const { status, category, reserved_by } = req.query

    let query = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.category,
        d.quantity,
        d.expiry_date,
        d.pickup_address,
        d.pickup_latitude,
        d.pickup_longitude,
        d.status,
        d.donor_id,
        d.reserved_by,
        d.reserved_at,
        d.completed_at,
        d.created_at,
        d.updated_at,
        COALESCE(d.donor_confirmed, FALSE) as donor_confirmed,
        COALESCE(d.recipient_confirmed, FALSE) as recipient_confirmed,
        d.donor_confirmed_at,
        d.recipient_confirmed_at,
        u.name as donor_name,
        u.phone as donor_phone,
        u.email as donor_email
      FROM donations d 
      LEFT JOIN users u ON d.donor_id = u.id
      WHERE d.title IS NOT NULL 
        AND d.title != ''
        AND d.category IS NOT NULL 
        AND d.category != ''
        AND d.quantity > 0
        AND d.pickup_latitude IS NOT NULL 
        AND d.pickup_longitude IS NOT NULL
        AND d.pickup_latitude != 0 
        AND d.pickup_longitude != 0
    `

    const params = []

    if (status) {
      query += " AND d.status = ?"
      params.push(status)
    }

    if (category) {
      query += " AND d.category = ?"
      params.push(category)
    }

    if (reserved_by) {
      query += " AND d.reserved_by = ?"
      params.push(Number.parseInt(reserved_by))
    }

    query += " ORDER BY d.created_at DESC LIMIT 50"

    const [rows] = await pool.execute(query, params)

    if (!Array.isArray(rows)) {
      return res.json([])
    }

    // Limpiar y validar cada donación
    const cleanDonations = rows.map(cleanDonation).filter((donation) => donation !== null)

    res.json(cleanDonations)
  } catch (error) {
    console.error("Error obteniendo donaciones:", error)
    res.status(500).json({ error: "Error interno del servidor", donations: [] })
  }
})

app.get("/api/donations/my", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        d.*,
        COALESCE(d.donor_confirmed, FALSE) as donor_confirmed,
        COALESCE(d.recipient_confirmed, FALSE) as recipient_confirmed,
        u.name as donor_name,
        u.phone as donor_phone,
        u.email as donor_email
      FROM donations d 
      LEFT JOIN users u ON d.donor_id = u.id
      WHERE d.donor_id = ? 
      ORDER BY d.created_at DESC`,
      [req.user.id],
    )

    if (!Array.isArray(rows)) {
      return res.json([])
    }

    const cleanDonations = rows.map(cleanDonation).filter((donation) => donation !== null)

    res.json(cleanDonations)
  } catch (error) {
    console.error("Error obteniendo mis donaciones:", error)
    res.status(500).json({ error: "Error interno del servidor", donations: [] })
  }
})

app.post("/api/donations", authenticateToken, async (req, res) => {
  try {
    console.log("📥 [BACKEND] Datos recibidos para crear donación:", req.body)

    const {
      title,
      description,
      category,
      quantity,
      expiry_date,
      pickup_address,
      latitude,
      longitude,
      pickup_latitude,
      pickup_longitude,
    } = req.body

    // Validar campos requeridos
    if (!title || !description || !category || !quantity) {
      console.error("❌ [BACKEND] Campos faltantes:", {
        title: !!title,
        description: !!description,
        category: !!category,
        quantity: !!quantity,
      })
      return res.status(400).json({
        error: "Los campos título, descripción, categoría y cantidad son requeridos",
      })
    }

    // Obtener coordenadas (priorizar pickup_latitude/pickup_longitude)
    const finalLatitude = pickup_latitude || latitude
    const finalLongitude = pickup_longitude || longitude

    if (!finalLatitude || !finalLongitude) {
      console.error("❌ [BACKEND] Coordenadas faltantes:", {
        latitude,
        longitude,
        pickup_latitude,
        pickup_longitude,
        finalLatitude,
        finalLongitude,
      })
      return res.status(400).json({
        error: "Las coordenadas de ubicación son requeridas",
      })
    }

    // Validar que las coordenadas sean números válidos
    const lat = Number.parseFloat(finalLatitude)
    const lng = Number.parseFloat(finalLongitude)

    if (isNaN(lat) || isNaN(lng)) {
      console.error("❌ [BACKEND] Coordenadas inválidas:", {
        finalLatitude,
        finalLongitude,
        lat,
        lng,
      })
      return res.status(400).json({
        error: "Las coordenadas deben ser números válidos",
      })
    }

    // Usar dirección proporcionada o generar una por defecto
    const address = pickup_address || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`

    console.log("✅ [BACKEND] Datos validados:", {
      title,
      description,
      category,
      quantity: Number.parseInt(quantity),
      expiry_date,
      address,
      coordinates: { lat, lng },
    })

    const [result] = await pool.execute(
      `INSERT INTO donations (
        donor_id, title, description, category, quantity, expiry_date, 
        pickup_address, pickup_latitude, pickup_longitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        description.trim(),
        category.toLowerCase().trim(),
        Number.parseInt(quantity),
        expiry_date || null,
        address.trim(),
        Number.parseFloat(lat.toFixed(6)),
        Number.parseFloat(lng.toFixed(6)),
        "available",
      ],
    )

    console.log("✅ [BACKEND] Donación creada con ID:", result.insertId)

    res.status(201).json({
      message: "Donación creada exitosamente",
      donationId: result.insertId,
      coordinates: {
        latitude: Number.parseFloat(lat.toFixed(6)),
        longitude: Number.parseFloat(lng.toFixed(6)),
      },
    })
  } catch (error) {
    console.error("❌ [BACKEND] Error creando donación:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

app.post("/api/donations/:id/reserve", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    if (!id || isNaN(Number.parseInt(id))) {
      return res.status(400).json({ error: "ID de donación inválido" })
    }

    // Verificar que la donación existe y está disponible
    const [donations] = await pool.execute("SELECT id FROM donations WHERE id = ? AND status = 'available'", [
      Number.parseInt(id),
    ])

    if (!donations || donations.length === 0) {
      return res.status(400).json({ error: "Donación no disponible para reservar" })
    }

    // Reservar la donación
    const [result] = await pool.execute(
      "UPDATE donations SET status = 'reserved', reserved_by = ?, reserved_at = NOW() WHERE id = ?",
      [req.user.id, Number.parseInt(id)],
    )

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "No se pudo reservar la donación" })
    }

    res.json({ message: "Donación reservada exitosamente" })
  } catch (error) {
    console.error("Error reservando donación:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

app.post("/api/donations/:id/confirm", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    if (!id || isNaN(Number.parseInt(id))) {
      return res.status(400).json({ error: "ID de donación inválido" })
    }

    // Obtener información de la donación
    const [donations] = await pool.execute(
      `SELECT id, donor_id, reserved_by, status, 
       COALESCE(donor_confirmed, FALSE) as donor_confirmed,
       COALESCE(recipient_confirmed, FALSE) as recipient_confirmed
       FROM donations WHERE id = ?`,
      [Number.parseInt(id)],
    )

    if (!donations || donations.length === 0) {
      return res.status(404).json({ error: "Donación no encontrada" })
    }

    const donation = donations[0]

    // Validar que la donación esté reservada
    if (donation.status !== "reserved") {
      return res.status(400).json({ error: "La donación debe estar reservada para confirmar" })
    }

    // Determinar si es donante u organización
    let updateQuery = ""
    let message = ""

    if (donation.donor_id === req.user.id) {
      // Es el donante
      if (donation.donor_confirmed) {
        return res.status(400).json({ error: "Ya confirmaste esta donación" })
      }
      updateQuery = "UPDATE donations SET donor_confirmed = TRUE, donor_confirmed_at = NOW()"
      message = "Confirmación de donante registrada"
    } else if (donation.reserved_by === req.user.id) {
      // Es la organización
      if (donation.recipient_confirmed) {
        return res.status(400).json({ error: "Ya confirmaste esta donación" })
      }
      updateQuery = "UPDATE donations SET recipient_confirmed = TRUE, recipient_confirmed_at = NOW()"
      message = "Confirmación de organización registrada"
    } else {
      return res.status(403).json({ error: "No tienes permisos para confirmar esta donación" })
    }

    // Si ambos ya confirmaron, marcar como completada
    const bothConfirmed =
      (donation.donor_confirmed || donation.donor_id === req.user.id) &&
      (donation.recipient_confirmed || donation.reserved_by === req.user.id)

    if (bothConfirmed) {
      updateQuery += ", status = 'completed', completed_at = NOW()"
      message = "¡Donación completada! Ambas partes confirmaron"
    }

    updateQuery += " WHERE id = ?"

    // Ejecutar la actualización
    const [result] = await pool.execute(updateQuery, [Number.parseInt(id)])

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "No se pudo confirmar la donación" })
    }

    res.json({ message })
  } catch (error) {
    console.error("Error confirmando donación:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Rutas de estadísticas
app.get("/api/stats", authenticateToken, async (req, res) => {
  try {
    console.log("📊 [BACKEND] Calculando estadísticas para usuario:", {
      id: req.user.id,
      userType: req.user.userType,
    })

    let stats = {
      totalDonations: 0,
      activeDonations: 0,
      completedDonations: 0,
      impactScore: 0,
    }

    if (req.user.userType === "donor") {
      // Estadísticas para donantes (sus propias donaciones)
      const [totalDonations] = await pool.execute("SELECT COUNT(*) as count FROM donations WHERE donor_id = ?", [
        req.user.id,
      ])
      const [completedDonations] = await pool.execute(
        "SELECT COUNT(*) as count FROM donations WHERE donor_id = ? AND status = 'completed'",
        [req.user.id],
      )
      const [activeDonations] = await pool.execute(
        "SELECT COUNT(*) as count FROM donations WHERE donor_id = ? AND status IN ('available', 'reserved')",
        [req.user.id],
      )

      stats = {
        totalDonations: totalDonations[0]?.count || 0,
        completedDonations: completedDonations[0]?.count || 0,
        activeDonations: activeDonations[0]?.count || 0,
        impactScore: (completedDonations[0]?.count || 0) * 10,
      }
    } else if (req.user.userType === "organization") {
      // Estadísticas para organizaciones (donaciones que han reservado/completado)
      const [totalReserved] = await pool.execute("SELECT COUNT(*) as count FROM donations WHERE reserved_by = ?", [
        req.user.id,
      ])
      const [completedDonations] = await pool.execute(
        "SELECT COUNT(*) as count FROM donations WHERE reserved_by = ? AND status = 'completed'",
        [req.user.id],
      )
      const [activeDonations] = await pool.execute(
        "SELECT COUNT(*) as count FROM donations WHERE reserved_by = ? AND status = 'reserved'",
        [req.user.id],
      )

      stats = {
        totalDonations: totalReserved[0]?.count || 0,
        completedDonations: completedDonations[0]?.count || 0,
        activeDonations: activeDonations[0]?.count || 0,
        impactScore: (completedDonations[0]?.count || 0) * 10,
      }
    }

    console.log("📊 [BACKEND] Estadísticas calculadas:", stats)
    res.json(stats)
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    status: "OK",
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
})
