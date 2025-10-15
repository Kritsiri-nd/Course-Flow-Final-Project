import { redirect } from 'next/navigation';

export default async function PromoCodeEditPage() {
  // For now, redirect to the main promo codes page
  // This page can be implemented later when edit functionality is needed
  redirect('/admin/promo-codes');
}