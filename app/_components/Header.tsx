"use client";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Truck, Menu, X, Shield, BarChart3, Bell } from "lucide-react";

export default function Header() {
  const { isSignedIn } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Monitoreo', href: '/dashboard', icon: BarChart3 },
    { name: 'Alertas', href: '/', icon: Bell },
    { name: 'Seguridad', href: '/', icon: Shield },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-blue-500/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Logo y marca */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                {/* Reemplaza con tu logo o usa el icono de truck */}
                <Image 
                  src="/logo.svg" 
                  alt="FleetCare Monitor" 
                  width={24} 
                  height={24}
                  className="w-6 h-6"
                />
                <Truck className="w-6 h-6 text-white hidden" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">
                FleetCare
                <span className="text-cyan-400 ml-1">Monitor</span>
              </h1>
            </div>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <Icon className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Estado del sistema */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Sistema Online</span>
            </div>
          </div>

          {/* Botones de autenticación */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-blue-500/30 hover:ring-blue-500/50 transition-all"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/sign-in">
                  <Button 
                    variant="ghost" 
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105">
                    Comenzar
                  </Button>
                </Link>
              </div>
            )}

            {/* Botón de menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-200 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              {!isSignedIn && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Link href="/sign-in" className="block">
                    <Button 
                      variant="ghost" 
                      className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/sign-up" className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Comenzar
                    </Button>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-2 w-fit">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Sistema Online</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}