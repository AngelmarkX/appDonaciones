"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, Download, Edit, MapPin, Trash, User } from "lucide-react"

export default function DonationDetailPage({ params }: { params: { id: string } }) {
  // Datos de ejemplo - en una implementación real vendrían de Firebase
  const donation = {
    id: params.id,
    title: "Pan del día",
    category: "bakery",
    quantity: "5",
    unit: "kg",
    expirationDate: "2025-05-20",
    status: "requested",
    createdAt: "2025-05-18",
    description:
      "Pan fresco del día, incluye baguettes y pan de molde. Todo en perfecto estado y empaquetado adecuadamente para su transporte.",
    address: "Av. Principal 123, Ciudad",
    pickupTime: "18:00",
    requestedBy: "Fundación Ayuda",
    requestedAt: "2025-05-18T15:30:00",
    history: [
      {
        status: "published",
        timestamp: "2025-05-18T10:00:00",
        user: "Restaurante Ejemplo",
      },
      {
        status: "requested",
        timestamp: "2025-05-18T15:30:00",
        user: "Fundación Ayuda",
      },
    ],
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-blue-500">Publicado</Badge>
      case "requested":
        return <Badge className="bg-yellow-500">Solicitado</Badge>
      case "in_progress":
        return <Badge className="bg-orange-500">En Proceso</Badge>
      case "delivered":
        return <Badge className="bg-green-600">Entregado</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      bakery: "Panadería",
      dairy: "Lácteos",
      fruits: "Frutas y Verduras",
      meat: "Carnes",
      canned: "Enlatados",
      prepared: "Comida Preparada",
      other: "Otros",
    }
    return categories[category] || category
  }

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      published: "Publicado",
      requested: "Solicitado",
      in_progress: "En Proceso",
      delivered: "Entregado",
    }
    return statuses[status] || status
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard/donations" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Donaciones
        </Link>
        <div className="flex-1"></div>
        <Button variant="outline" size="icon" className="text-red-500">
          <Trash className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-semibold text-lg md:text-2xl">{donation.title}</h1>
            {getStatusBadge(donation.status)}
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Donación</CardTitle>
                  <CardDescription>Detalles completos de la donación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Categoría</p>
                      <p>{getCategoryLabel(donation.category)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Cantidad</p>
                      <p>
                        {donation.quantity} {donation.unit}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Fecha de caducidad</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p>{new Date(donation.expirationDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Horario de recogida</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p>{donation.pickupTime}h</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Descripción</p>
                    <p className="text-sm">{donation.description}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Dirección de recogida</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p>{donation.address}</p>
                    </div>
                  </div>

                  <Separator />

                  {donation.requestedBy && (
                    <div className="space-y-2 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-yellow-600" />
                        <p className="font-medium">Solicitado por: {donation.requestedBy}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Fecha de solicitud: {new Date(donation.requestedAt).toLocaleString()}
                      </p>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          Rechazar
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Aceptar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de la Donación</CardTitle>
                  <CardDescription>Seguimiento de todos los cambios de estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donation.history.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative flex-none">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-green-600" />
                          </div>
                          {index < donation.history.length - 1 && (
                            <div className="absolute top-6 bottom-0 left-3 w-px bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{getStatusLabel(event.status)}</p>
                          <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Por: {event.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>Documentos relacionados con la donación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Download className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">Comprobante de donación</p>
                          <p className="text-sm text-gray-500">PDF - 245 KB</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Download className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">Certificado de entrega</p>
                          <p className="text-sm text-gray-500">PDF - 198 KB</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
