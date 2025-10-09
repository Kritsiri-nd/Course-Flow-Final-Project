'use client';

import { AdminPanel } from '@/components/layouts/sidebar-admin-panel';


import CourseFlowIcon from '@/assets/courseFlowIcon';
import PromoCodesForm from './promoCodeForm';
import { useRouter } from 'next/navigation'; 

import Link from 'next/link';
import Image from 'next/image';

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";



export default function PromoCodesPage() {

    const router = useRouter();

    return (
      <SidebarProvider>

        <AdminPanel />
        
      </SidebarProvider>
    )
}