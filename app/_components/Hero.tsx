"use client"
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Truck, Shield, Zap, Eye, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const { isSignedIn } = useUser();
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    buses: 0,
    alerts: 0,
    uptime: 0
  });

  const features = [
    { icon: Eye, text: "Monitoreo en Tiempo Real", color: "text-blue-500" },
    { icon: Shield, text: "Alertas Críticas", color: "text-red-500" },
    { icon: Zap, text: "Mantenimiento Preventivo", color: "text-green-500" }
  ];

  // Animación de estadísticas
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        buses: Math.min(prev.buses + 1, 247),
        alerts: Math.min(prev.alerts + 1, 12),
        uptime: Math.min(prev.uptime + 0.1, 99.8)
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Rotación de características
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
        {/* Elementos de fondo animados */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.03&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Contenido principal */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-sm font-medium">Sistema en Línea</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="block">FleetCare</span>
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Monitor
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                Supervisa en tiempo real el estado técnico de tu flota de buses con
                <span className="text-blue-400 font-semibold"> tecnología IoT avanzada</span>.
                Garantiza la seguridad y eficiencia del transporte.
              </p>

              {/* Características rotativas */}
              <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${activeFeature === index
                        ? 'bg-white/10 backdrop-blur-sm border border-white/20 scale-105'
                        : 'bg-white/5 border border-white/10'}`}
                    >
                      <Icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="text-white text-sm font-medium">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Estadísticas en tiempo real */}
              <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-blue-400">{stats.buses}</div>
                  <div className="text-xs text-gray-400">Buses Activos</div>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-red-400">{stats.alerts}</div>
                  <div className="text-xs text-gray-400">Alertas Hoy</div>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-green-400">{stats.uptime.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href={isSignedIn ? '/dashboard' : '/sign-in'}
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                >
                  <Truck className="w-5 h-5" />
                  Acceder al Centro de Control
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <button className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium px-8 py-4 rounded-full hover:bg-white/20 transition-all duration-300">
                  Ver Demo
                </button>
              </div>
            </div>

            {/* Panel de monitoreo visual */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Estado de la Flota</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">En Línea</span>
                  </div>
                </div>

                {/* Simulación de buses */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[1, 2, 3, 4].map((bus) => (
                    <div key={bus} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">Bus {bus.toString().padStart(3, '0')}</span>
                        <div className={`w-2 h-2 rounded-full ${bus === 2 ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {bus === 2 ? 'Mantenimiento requerido' : 'Operativo'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Indicadores de rendimiento */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Eficiencia de Combustible</span>
                      <span className="text-white">87%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full w-[87%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Mantenimiento al Día</span>
                      <span className="text-white">94%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full w-[94%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyan-500/20 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Sección de dashboard preview */}
          <div className="mt-20 text-center">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Control Total de tu Flota
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Visualiza datos críticos, gestiona alertas y toma decisiones informadas desde un
                <span className="text-cyan-400 font-semibold"> centro de comando unificado</span>.
                Todo lo que necesitas para mantener tu flota operando al máximo rendimiento.
              </p>
            </div>

            {/* Container para la imagen del dashboard */}
            <div className="relative max-w-6xl mx-auto">
              {/* Efectos de resplandor */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl transform scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-2xl"></div>

              {/* Frame del dashboard */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-2 shadow-2xl">
                <div className="bg-gray-900/80 rounded-xl overflow-hidden">
                  {/* Header simulado del dashboard */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-300 text-sm font-medium">FleetCare Monitor Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Live Data
                    </div>
                  </div>

                  {/* Área principal donde va la imagen */}
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center overflow-hidden rounded-xl">
                    <Image
                      src={'/dashboard.png'}
                      alt={'dashboard'}
                      fill
                      style={{ objectFit: 'contain' }} // 'cover' si quieres que llene recortando un poco
                      priority // opcional, para que cargue rápido si es clave en la UI
                    />
                  </div>


                </div>
              </div>

              {/* Elementos decorativos alrededor del dashboard */}
              <div className="absolute -top-8 -left-8 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute -top-4 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-6 -right-6 w-6 h-6 bg-blue-500/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 left-16 w-3 h-3 bg-green-400/50 rounded-full animate-ping"></div>
            </div>

            {/* Features highlight */}
            <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Monitoreo 24/7</h3>
                <p className="text-gray-400 text-sm">Supervisa todos tus vehículos en tiempo real con datos precisos de sensores IoT</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Alertas Inteligentes</h3>
                <p className="text-gray-400 text-sm">Recibe notificaciones instantáneas sobre condiciones críticas y fallas potenciales</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Mantenimiento Predictivo</h3>
                <p className="text-gray-400 text-sm">Anticipa necesidades de mantenimiento para evitar fallas costosas</p>
              </div>
            </div>
          </div>
        </div>

      </section >
    </>
  );
}