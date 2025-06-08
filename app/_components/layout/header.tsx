"use client";

import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/app/_components/layout/mode-toggle';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
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
        
        <UserButton />
        

      </div>
    </motion.header>
  );
}