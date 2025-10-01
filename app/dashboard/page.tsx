"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Home, LogOut, Menu, Package, PieChart, Plus, Search, Settings, User } from "lucide-react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const userType = "business" // Esto vendría de la autenticación

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white font-bold">RA</span>
          </span>
          <span className="font-bold">ReciclaAlimentos</span>
        </div>
        <div className="flex-1"></div>
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificaciones</span>
        </Button>
        <Button variant="outline" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">Perfil</span>
        </Button>
      </header>
      <div className="flex-1 md:grid md:grid-cols-[220px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-full flex-col border-r bg-background p-6 md:flex md:w-[220px] ${sidebarOpen ? "flex" : "hidden"}`}
        >
          <nav className="grid gap-2 text-sm font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900">
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            {userType === "business" ? (
              <Link
                href="/dashboard/donations"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900"
              >
                <Package className="h-4 w-4" />
                Mis Donaciones
              </Link>
            ) : (
              <Link
                href="/dashboard/available"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900"
              >
                <Package className="h-4 w-4" />
                Donaciones Disponibles
              </Link>
            )}
            <Link
              href="/dashboard/stats"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900"
            >
              <PieChart className="h-4 w-4" />
              Estadísticas
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </nav>
          <div className="mt-auto">
            <Button variant="outline" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
            <div className="ml-auto flex items-center gap-2">
              <form className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full rounded-lg border bg-background pl-8 md:w-[300px]"
                />
              </form>
              {userType === "business" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Donación
                </Button>
              )}
            </div>
          </div>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="analytics">Analíticas</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Donaciones</CardTitle>
                    <Package className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-gray-500">+10% desde el mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Donaciones Activas</CardTitle>
                    <Package className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-gray-500">+2 desde la semana pasada</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kg Donados</CardTitle>
                    <Package className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">120</div>
                    <p className="text-xs text-gray-500">+15% desde el mes pasado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Organizaciones Ayudadas</CardTitle>
                    <User className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-gray-500">+1 desde el mes pasado</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Historial de donaciones y solicitudes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="rounded-full bg-gray-100 p-2">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Donación #{i}</p>
                            <p className="text-xs text-gray-500">{i % 2 === 0 ? "Entregada" : "En proceso"}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            Hace {i} {i === 1 ? "día" : "días"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Próximas Entregas</CardTitle>
                    <CardDescription>Donaciones programadas para entrega</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="rounded-full bg-gray-100 p-2">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Entrega #{i}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(Date.now() + i * 86400000).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analíticas</CardTitle>
                  <CardDescription>Visualización de métricas y tendencias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded">
                    <p className="text-gray-500">Gráficos de analíticas irían aquí</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes</CardTitle>
                  <CardDescription>Informes y reportes de actividad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Reporte Mensual", "Reporte de Impacto", "Reporte de Trazabilidad"].map((report) => (
                      <div key={report} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">{report}</p>
                          <p className="text-sm text-gray-500">Última actualización: hace 2 días</p>
                        </div>
                        <Button variant="outline">Descargar PDF</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}
