"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"

export default function ProfilePage() {
  // Datos de ejemplo - en una implementación real vendrían de Firebase
  const [profileData, setProfileData] = useState({
    name: "Restaurante Ejemplo",
    email: "contacto@restauranteejemplo.com",
    phone: "+1234567890",
    address: "Av. Principal 123, Ciudad",
    description: "Restaurante especializado en comida mediterránea con más de 10 años de experiencia.",
    contactPerson: "Juan Pérez",
    contactPhone: "+1234567890",
    website: "www.restauranteejemplo.com",
  })

  const [availabilityData, setAvailabilityData] = useState({
    monday: { available: true, from: "09:00", to: "18:00" },
    tuesday: { available: true, from: "09:00", to: "18:00" },
    wednesday: { available: true, from: "09:00", to: "18:00" },
    thursday: { available: true, from: "09:00", to: "18:00" },
    friday: { available: true, from: "09:00", to: "18:00" },
    saturday: { available: false, from: "10:00", to: "14:00" },
    sunday: { available: false, from: "10:00", to: "14:00" },
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newRequests: true,
    statusChanges: true,
    reminders: true,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setProfileData((prev) => ({ ...prev, [id]: value }))
  }

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setAvailabilityData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar los cambios en Firebase
    console.log("Profile data:", profileData)
    console.log("Availability data:", availabilityData)
    console.log("Notification settings:", notificationSettings)
  }

  const days = [
    { id: "monday", label: "Lunes" },
    { id: "tuesday", label: "Martes" },
    { id: "wednesday", label: "Miércoles" },
    { id: "thursday", label: "Jueves" },
    { id: "friday", label: "Viernes" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
  ]

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
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="font-semibold text-lg md:text-2xl mb-4">Configuración de Perfil</h1>

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Información del Perfil</CardTitle>
                    <CardDescription>Actualiza la información de tu negocio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del comercio</Label>
                      <Input id="name" value={profileData.name} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" value={profileData.address} onChange={handleProfileChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        className="min-h-[100px]"
                        value={profileData.description}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Persona de contacto</Label>
                      <Input
                        id="contactPerson"
                        value={profileData.contactPerson}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={profileData.contactPhone}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio web (opcional)</Label>
                      <Input id="website" value={profileData.website} onChange={handleProfileChange} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Horarios de Disponibilidad</CardTitle>
                    <CardDescription>
                      Configura los días y horarios en los que puedes entregar donaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {days.map((day) => (
                      <div key={day.id} className="flex items-center space-x-4 py-2 border-b last:border-0">
                        <div className="flex items-center space-x-2 w-1/3">
                          <Switch
                            id={`${day.id}-available`}
                            checked={availabilityData[day.id as keyof typeof availabilityData].available}
                            onCheckedChange={(checked) => handleAvailabilityChange(day.id, "available", checked)}
                          />
                          <Label htmlFor={`${day.id}-available`}>{day.label}</Label>
                        </div>
                        <div className="flex items-center space-x-2 w-2/3">
                          <div className="grid grid-cols-2 gap-2 w-full">
                            <div className="space-y-1">
                              <Label htmlFor={`${day.id}-from`} className="text-xs">
                                Desde
                              </Label>
                              <Input
                                id={`${day.id}-from`}
                                type="time"
                                value={availabilityData[day.id as keyof typeof availabilityData].from}
                                onChange={(e) => handleAvailabilityChange(day.id, "from", e.target.value)}
                                disabled={!availabilityData[day.id as keyof typeof availabilityData].available}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`${day.id}-to`} className="text-xs">
                                Hasta
                              </Label>
                              <Input
                                id={`${day.id}-to`}
                                type="time"
                                value={availabilityData[day.id as keyof typeof availabilityData].to}
                                onChange={(e) => handleAvailabilityChange(day.id, "to", e.target.value)}
                                disabled={!availabilityData[day.id as keyof typeof availabilityData].available}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Preferencias de Notificaciones</CardTitle>
                    <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div>
                          <h3 className="font-medium">Canales de notificación</h3>
                          <p className="text-sm text-gray-500">Elige cómo quieres recibir notificaciones</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <Label htmlFor="emailNotifications">Notificaciones por correo</Label>
                        <Switch
                          id="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <Label htmlFor="pushNotifications">Notificaciones push</Label>
                        <Switch
                          id="pushNotifications"
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between pb-2 pt-4 border-b">
                        <div>
                          <h3 className="font-medium">Tipos de notificaciones</h3>
                          <p className="text-sm text-gray-500">Elige qué notificaciones quieres recibir</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <Label htmlFor="newRequests">Nuevas solicitudes de donación</Label>
                        <Switch
                          id="newRequests"
                          checked={notificationSettings.newRequests}
                          onCheckedChange={(checked) => handleNotificationChange("newRequests", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <Label htmlFor="statusChanges">Cambios de estado en donaciones</Label>
                        <Switch
                          id="statusChanges"
                          checked={notificationSettings.statusChanges}
                          onCheckedChange={(checked) => handleNotificationChange("statusChanges", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <Label htmlFor="reminders">Recordatorios</Label>
                        <Switch
                          id="reminders"
                          checked={notificationSettings.reminders}
                          onCheckedChange={(checked) => handleNotificationChange("reminders", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
