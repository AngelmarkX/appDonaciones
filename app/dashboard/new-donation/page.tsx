"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export default function NewDonationPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    quantity: "",
    unit: "kg",
    expirationDate: "",
    pickupTime: "",
    description: "",
    address: "Av. Principal 123, Ciudad", // Esto vendría del perfil del usuario
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la donación en Firebase
    console.log("Donation data:", formData)
  }

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
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Donación</CardTitle>
              <CardDescription>Completa el formulario para publicar una nueva donación de alimentos</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la donación</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Excedente de pan del día"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select onValueChange={(value) => handleSelectChange("category", value)} value={formData.category}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bakery">Panadería</SelectItem>
                      <SelectItem value="dairy">Lácteos</SelectItem>
                      <SelectItem value="fruits">Frutas y Verduras</SelectItem>
                      <SelectItem value="meat">Carnes</SelectItem>
                      <SelectItem value="canned">Enlatados</SelectItem>
                      <SelectItem value="prepared">Comida Preparada</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="Ej: 5"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidad</Label>
                    <Select
                      defaultValue="kg"
                      onValueChange={(value) => handleSelectChange("unit", value)}
                      value={formData.unit}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Selecciona una unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                        <SelectItem value="units">Unidades</SelectItem>
                        <SelectItem value="liters">Litros</SelectItem>
                        <SelectItem value="boxes">Cajas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Fecha de caducidad</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="expirationDate"
                        type="date"
                        className="pl-10"
                        value={formData.expirationDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime">Horario de recogida</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="pickupTime"
                        type="time"
                        className="pl-10"
                        value={formData.pickupTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe los alimentos, su estado y cualquier información relevante"
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección de recogida</Label>
                  <Input id="address" value={formData.address} onChange={handleChange} disabled />
                  <p className="text-xs text-gray-500">
                    Esta es la dirección registrada en tu perfil. Para cambiarla, actualiza tu perfil.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" asChild>
                  <Link href="/dashboard">Cancelar</Link>
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Publicar Donación
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
