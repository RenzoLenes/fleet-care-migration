"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Truck,
  AlertTriangle,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { UserButton, useUser } from '@clerk/nextjs';

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vehículos', href: '/dashboard/vehicles', icon: Truck },
  { name: 'Alertas', href: '/dashboard/alerts', icon: AlertTriangle },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = (href: string) => {
    router.push(href);
    // Cerrar sidebar en móvil después de navegar
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        "bg-seasalt border-r transition-all duration-300 z-40 shadow-md flex flex-col",
        // Posicionamiento diferente para móvil vs desktop
        isMobile
          ? "fixed left-0 top-0 h-screen w-64" // ← Quité bg-white
          : "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64", // Desktop: debajo del header
        !open && "w-20"
      )}
    >
      {/* Header del sidebar solo en móvil */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-alice-blue bg-seasalt flex-shrink-0">
          <Image src={'/logo.svg'} alt={'logo'} width={30} height={30} />
          <h2 className="text-lg font-semibold text-ruddy-blue">
            {open ? 'Menú' : ''}
          </h2>
          {open && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-blue-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {/* Área de navegación - crece para ocupar el espacio disponible */}
      <div className={cn("p-4 flex-1", isMobile && "pt-2")}>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start sidebar-item cursor-pointer hover:bg-blue-500 hover:text-white",
                    !open && "w-10 justify-center",
                    isActive && "active bg-blue-500 text-white"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-ruddy-blue hover:text-white"
                  )} />
                  {open && (
                    <span className={cn(
                      "ml-3 font-medium",
                      isActive ? "text-white" : "hover:text-white"
                    )}>
                      {item.name}
                    </span>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Área de usuario - fija en la parte inferior */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className={cn(
          "p-3 transition-all duration-300",
          !open && "px-2"
        )}>
          {open ? (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || user?.fullName || 'Usuario'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center bg-seasalt">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}