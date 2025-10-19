import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import donationService from "./donationService"
import authService from "./authService"

class PDFExportService {
  async exportDonationHistory() {
    try {
      console.log("📄 [PDF] Iniciando exportación de historial...")

      const user = authService.getUser()
      console.log("📄 [v0] Usuario obtenido:", user)

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Obtener donaciones
      const donations = await donationService.getMyDonations()
      console.log(`📄 [v0] Total donaciones obtenidas: ${donations.length}`)
      console.log("📄 [v0] Primera donación:", donations[0])

      const givenDonations = donations.filter((d) => d.donor_id === user.id)
      const receivedDonations = donations.filter((d) => d.reserved_by === user.id)

      console.log(`📄 [v0] Donaciones dadas: ${givenDonations.length}`)
      console.log(`📄 [v0] Donaciones recibidas: ${receivedDonations.length}`)

      // Calcular estadísticas separadas
      const givenStats = {
        total: givenDonations.length,
        disponibles: givenDonations.filter((d) => d.status === "available").length,
        reservadas: givenDonations.filter((d) => d.status === "reserved").length,
        completadas: givenDonations.filter((d) => d.status === "completed").length,
      }

      const receivedStats = {
        total: receivedDonations.length,
        reservadas: receivedDonations.filter((d) => d.status === "reserved").length,
        completadas: receivedDonations.filter((d) => d.status === "completed").length,
      }

      console.log("📄 [v0] Estadísticas dadas:", givenStats)
      console.log("📄 [v0] Estadísticas recibidas:", receivedStats)

      // Generar HTML para el PDF
      const html = this.generateHTML(user, givenDonations, receivedDonations, givenStats, receivedStats)

      // Crear PDF
      const { uri } = await Print.printToFileAsync({ html })
      console.log("✅ [PDF] PDF generado:", uri)

      // Compartir PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Historial de Donaciones",
          UTI: "com.adobe.pdf",
        })
      }

      return uri
    } catch (error) {
      console.error("❌ [PDF] Error exportando historial:", error)
      throw error
    }
  }

  generateHTML(user, givenDonations, receivedDonations, givenStats, receivedStats) {
    const statusLabels = {
      available: "Disponible",
      reserved: "Reservada",
      completed: "Completada",
      expired: "Expirada",
    }

    const categoryLabels = {
      // Alimentos
      fruits: "Frutas",
      vegetables: "Verduras",
      grains: "Granos",
      dairy: "Lácteos",
      meat: "Carnes",
      bakery: "Panadería",
      canned: "Enlatados",
      beverages: "Bebidas",
      prepared: "Preparados",
      other_food: "Otros Alimentos",
      // Objetos generales
      clothing: "Ropa",
      furniture: "Muebles",
      electronics: "Electrónicos",
      books: "Libros",
      toys: "Juguetes",
      sports: "Deportes",
      tools: "Herramientas",
      kitchen: "Cocina",
      hygiene: "Higiene",
      other_items: "Otros Objetos",
    }

    const generateDonationsTable = (donations, title) => {
      if (donations.length === 0) {
        return `
          <h2>${title}</h2>
          <p style="color: #666; font-style: italic;">No hay donaciones en esta categoría</p>
        `
      }

      const donationsHTML = donations
        .map(
          (d, index) => `
        <tr style="${index % 2 === 0 ? "background-color: #f9f9f9;" : ""}">
          <td style="padding: 8px; border: 1px solid #ddd;">${d.title}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${categoryLabels[d.category] || d.category}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${d.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${statusLabels[d.status] || d.status}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date(d.created_at).toLocaleDateString()}</td>
        </tr>
      `,
        )
        .join("")

      return `
        <h2>${title}</h2>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${donationsHTML}
          </tbody>
        </table>
      `
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Historial de Donaciones</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #4CAF50;
              border-bottom: 3px solid #4CAF50;
              padding-bottom: 10px;
            }
            h2 {
              color: #4CAF50;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .header {
              margin-bottom: 30px;
            }
            .stats-section {
              margin: 20px 0;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 8px;
            }
            .stats-section h3 {
              margin-top: 0;
              color: #4CAF50;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin: 10px 0;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #4CAF50;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              margin-bottom: 30px;
            }
            th {
              background-color: #4CAF50;
              color: white;
              padding: 12px;
              text-align: left;
              border: 1px solid #ddd;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Historial de Donaciones</h1>
            <p><strong>Usuario:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Tipo:</strong> ${user.userType === "donor" ? "Donante" : "Organización"}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString()}</p>
          </div>

          ${
            givenDonations.length > 0
              ? `
          <div class="stats-section">
            <h3>Donaciones Realizadas (Como Donante)</h3>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${givenStats.total}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${givenStats.disponibles}</div>
                <div class="stat-label">Disponibles</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${givenStats.reservadas}</div>
                <div class="stat-label">Reservadas</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${givenStats.completadas}</div>
                <div class="stat-label">Completadas</div>
              </div>
            </div>
          </div>
          `
              : ""
          }

          ${
            receivedDonations.length > 0
              ? `
          <div class="stats-section">
            <h3>Donaciones Recibidas (Como Organización)</h3>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${receivedStats.total}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${receivedStats.reservadas}</div>
                <div class="stat-label">Reservadas</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${receivedStats.completadas}</div>
                <div class="stat-label">Completadas</div>
              </div>
            </div>
          </div>
          `
              : ""
          }

          ${generateDonationsTable(givenDonations, "Detalle de Donaciones Realizadas")}
          ${generateDonationsTable(receivedDonations, "Detalle de Donaciones Recibidas")}

          <div class="footer">
            <p>Documento generado automáticamente por la aplicación de Donaciones de Alimentos</p>
          </div>
        </body>
      </html>
    `
  }
}

export default new PDFExportService()
