"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, MapPin, Plus } from "lucide-react"

export default function DonationsPage() {
  // Datos de ejemplo - en una implementación real vendrían de Firebase
  const donations = [
    {
      id: "1",
      title: "Pan del día",
      category: "bakery",
      quantity: "5",
      unit: "kg",
      expirationDate: "2025-05-20",
      status: "published",
      createdAt: "2025-05-18",
      description: "Pan fresco del día, incluye baguettes y pan de molde.",
      address: "Av. Principal 123, Ciudad",
      pickupTime: "18:00",
    },
    {
      id: "2",
      title: "Frutas variadas",
      category: "fruits",
      quantity: "10",
      unit: "kg",
      expirationDate: "2025-05-21",
      status: "requested",
      createdAt: "2025-05-18",
      description: "Manzanas, plátanos y naranjas en buen estado.",
      address: "Av. Principal 123, Ciudad",
      pickupTime: "17:00",
      requestedBy: "Fundación Ayuda",
    },
    {
      id: "3",
      title: "Yogures",
      category: "dairy",
      quantity: "20",
      unit: "units",
      expirationDate: "2025-05-22",
      status: "in_progress",
      createdAt: "2025-05-17",
      description: "Yogures naturales y de sabores.",
      address: "Av. Principal 123, Ciudad",
      pickupTime: "10:00",
      requestedBy: "Comedor Social",
    },
    {
      id: "4",
      title: "Verduras frescas",
      category: "fruits",
      quantity: "8",
      unit: "kg",
      expirationDate: "2025-05-19",
      status: "delivered",
      createdAt: "2025-05-16",
      description: "Tomates, lechugas, zanahorias y pimientos.",
      address: "Av. Principal 123, Ciudad",
      pickupTime: "16:00",
      requestedBy: "Asociación Vecinal",
      deliveredAt: "2025-05-17",
    },
  ]

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>
        <div className="flex-1"></div>
        <Button className="bg-green-600 hover:bg-green-700" asChild>
          <Link href="/dashboard/new-donation">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Donación
          </Link>
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Mis Donaciones</h1>
        </div>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="published">Publicadas</TabsTrigger>
            <TabsTrigger value="requested">Solicitadas</TabsTrigger>
            <TabsTrigger value="in_progress">En Proceso</TabsTrigger>
            <TabsTrigger value="delivered">Entregadas</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donations.map((donation) => (
                <Card key={donation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{donation.title}</CardTitle>
                      {getStatusBadge(donation.status)}
                    </div>
                    <CardDescription>
                      {getCategoryLabel(donation.category)} - {donation.quantity} {donation.unit}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2 mb-4">{donation.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Caduca: {new Date(donation.expirationDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Recogida: {donation.pickupTime}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{donation.address}</span>
                      </div>
                      {donation.requestedBy && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <span className="font-medium">Solicitado por:</span>
                          <span>{donation.requestedBy}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/donations/${donation.id}`}>Ver Detalles</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="published" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donations
                .filter((d) => d.status === "published")
                .map((donation) => (
                  <Card key={donation.id}>
                    {/* Contenido similar al anterior */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{donation.title}</CardTitle>
                        {getStatusBadge(donation.status)}
                      </div>
                      <CardDescription>
                        {getCategoryLabel(donation.category)} - {donation.quantity} {donation.unit}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm line-clamp-2 mb-4">{donation.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Caduca: {new Date(donation.expirationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Recogida: {donation.pickupTime}h</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/donations/${donation.id}`}>Ver Detalles</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
          {/* Contenido similar para las otras pestañas */}
        </Tabs>
      </main>
    </div>
  )
}
