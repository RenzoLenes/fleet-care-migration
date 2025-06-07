"use client";

import { Bell, Menu, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { motion } from 'framer-motion';
import Image from 'next/image';
interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b h-16 flex items-center justify-between px-6 shadow-sm"
    >
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="hover:bg-alice-blue transition-colors"
        >
          <Menu className="h-5 w-5 text-ruddy-blue" />
        </Button>
        <div className="flex items-center space-x-3">
          <Image src={'/logo.svg'} alt={'logo'} width={30} height={30} />
          <h1 className="text-xl font-semibold text-gray-800">FleetCare Monitor</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-alice-blue transition-colors"
        >
          <Bell className="h-5 w-5 text-ruddy-blue" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shadow-sm"
          >
            3
          </Badge>
        </Button>
        
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-alice-blue transition-colors"
            >
              <User className="h-5 w-5 text-ruddy-blue" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-seasalt border-alice-blue shadow-md rounded-2xl"
          >
            <DropdownMenuLabel className="text-gray-800">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-alice-blue" />
            <DropdownMenuItem className="hover:bg-alice-blue cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-ruddy-blue" />
              <span className="text-gray-700">Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-alice-blue" />
            <DropdownMenuItem className="text-destructive hover:bg-alice-blue cursor-pointer">
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}