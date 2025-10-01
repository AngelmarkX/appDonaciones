"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Clock, MapPin, Search } from "lucide-react"

export default function AvailableDonationsPage() {
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
      distance: "1.2",
    },
    {
      id: "2",
      title: "Frutas variadas",
      category: "fruits",
      quantity: "10",
      unit: "kg",
      expirationDate: "2025-05-21",
      status: "published",
      createdAt: "2025-05-18",
      description: "Manzanas, plátanos y naranjas en buen estado.",
      address: "Calle Secundaria 45, Ciudad",
      pickupTime: "17:00",
      distance: "2.5",
    },
    {
      id: "3",
      title: "Yogures",
      category: "dairy",
      quantity: "20",
      unit: "units",
      expirationDate: "2025-05-22",
      status: "published",
      createdAt: "2025-05-17",
      description: "Yogures naturales y de sabores.",
      address: "Plaza Central 8, Ciudad",
      pickupTime: "10:00",
      distance: "3.7",
    },
    {
      id: "4",
      title: "Verduras frescas",
      category: "fruits",
      quantity: "8",
      unit: "kg",
      expirationDate: "2025-05-19",
      status: "published",
      createdAt: "2025-05-16",
      description: "Tomates, lechugas, zanahorias y pimientos.",
      address: "Avenida Norte 67, Ciudad",
      pickupTime: "16:00",
      distance: "4.2",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [distanceFilter, setDistanceFilter] = useState("all")

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

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      searchTerm === "" ||
      donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || donation.category === categoryFilter

    const matchesDistance =
      distanceFilter === "all" ||
      (distanceFilter === "5" && Number.parseFloat(donation.distance) <= 5) ||
      (distanceFilter === "10" && Number.parseFloat(donation.distance) <= 10) ||
      (distanceFilter === "20" && Number.parseFloat(donation.distance) <= 20)

    return matchesSearch && matchesCategory && matchesDistance
  })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>
        <div className="flex-1"></div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="font-semibold text-lg md:text-2xl">Donaciones Disponibles</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar donaciones..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="bakery">Panadería</SelectItem>
                  <SelectItem value="dairy">Lácteos</SelectItem>
                  <SelectItem value="fruits">Frutas y Verduras</SelectItem>
                  <SelectItem value="meat">Carnes</SelectItem>
                  <SelectItem value="canned">Enlatados</SelectItem>
                  <SelectItem value="prepared">Comida Preparada</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Distancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier distancia</SelectItem>
                  <SelectItem value="5">Hasta 5 km</SelectItem>
                  <SelectItem value="10">Hasta 10 km</SelectItem>
                  <SelectItem value="20">Hasta 20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <Card key={donation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{donation.title}</CardTitle>
                    <Badge className="bg-green-600">{donation.distance} km</Badge>
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
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/dashboard/available/${donation.id}`}>Ver Detalles</Link>
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Solicitar</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Search className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium">No se encontraron donaciones</h3>
              <p className="text-sm text-gray-500 mt-1">Intenta con otros filtros o vuelve más tarde</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
