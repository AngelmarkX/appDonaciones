import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white font-bold">RA</span>
          </span>
          <span className="font-bold">ReciclaAlimentos</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4">
            Registrarse
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Conectamos excedentes alimentarios con quienes más los necesitan
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nuestra plataforma facilita la donación de excedentes alimentarios de comercios a organizaciones
                  benéficas, reduciendo el desperdicio y ayudando a quienes más lo necesitan.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href="/register?type=business" passHref>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Soy un Comercio
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/register?type=organization" passHref>
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                      Soy una Organización
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt="Ilustración de donación de alimentos"
                  className="rounded-lg object-cover"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Cómo funciona</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Un proceso simple para conectar excedentes alimentarios con quienes los necesitan
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 border rounded-lg p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold">Registra tu negocio</h3>
                <p className="text-gray-500">
                  Crea una cuenta como comercio y configura tu perfil con tus horarios de disponibilidad.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 border rounded-lg p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold">Publica tus excedentes</h3>
                <p className="text-gray-500">
                  Registra los alimentos disponibles para donar con detalles como tipo, cantidad y fecha de caducidad.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 border rounded-lg p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold">Conecta con organizaciones</h3>
                <p className="text-gray-500">
                  Las organizaciones benéficas reciben notificaciones y pueden solicitar tus donaciones.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-gray-500">© 2025 ReciclaAlimentos. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
