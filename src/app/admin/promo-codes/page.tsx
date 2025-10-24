'use client';

import Link from 'next/link';
import { Edit } from 'lucide-react';
import { getPromoCodesWithCourseNames } from './action';
import DeleteModalAlert from '@/components/ui/delete-modal-alert';
import AdminHeader from '@/components/ui/AdminHeader';
import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AdminPanel } from '@/components/layouts/sidebar-admin-panel';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingTableRow } from '@/components/ui/loading';

interface PromoCode {
  id: string;
  code: string;
  min_purchase_amount: number;
  discount_type: string;
  coursesIncluded: string;
  created_at: string;
}

export default function PromoCodeListPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromoCodes = async () => {
      try {
        const data = await getPromoCodesWithCourseNames();
        setPromoCodes(data);
      } finally {
        setLoading(false);
      }
    };
    loadPromoCodes();
  }, []);

  const handleDelete = async (promoCodeId: string) => {
    try {
      setDeletingId(promoCodeId);
      const response = await fetch(`/api/promo/${promoCodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete promo code');
      }

      setPromoCodes((prev) => prev.filter((p) => p.id !== promoCodeId));
    } catch (error) {
      console.error('Error deleting promo code:', error);
      alert(
        `Failed to delete promo code: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        <AdminHeader
          title="Promo code"
          query={query}
          setQuery={setQuery}
          placeholder="Search promo codes..."
          addButtonText="Add promo code"
          addButtonHref="/admin/promo-codes/new"
        />

        {/* table */}
        <div className="rounded-lg border border-none overflow-x-auto bg-white m-10">
          <Table className="min-w-[960px]">
            <TableHeader>
              <TableRow className="bg-gray-300 border-none">
                <TableHead className="font-medium py-3 text-rigth">Promo code</TableHead>
                <TableHead className="font-medium py-3 text-rigth">Minimum purchase (THB)</TableHead>
                <TableHead className="font-medium py-3 text-rigth">Discount type</TableHead>
                <TableHead className="font-medium py-3 text-rigth">Courses Included</TableHead>
                <TableHead className="font-medium py-3 text-rigth">Created date</TableHead>
                <TableHead className="font-medium py-3 w-28 text-rigth">Action</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No promo codes found.
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo: PromoCode) => (
                  <TableRow key={promo.id}>
                    <TableCell className="text-rigth text-b3">{promo.code}</TableCell>
                    <TableCell className="text-rigth text-b3">{promo.min_purchase_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-rigth text-b3 capitalize">
                      {promo.discount_type === 'fixed' ? 'Fixed amount' : 'Percent'}
                    </TableCell>
                    <TableCell className="text-rigth text-b3 truncate max-w-xs">
                      {promo.coursesIncluded}
                    </TableCell>
                    <TableCell className="text-rigth text-b3">
                      {new Date(promo.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex gap-2 -ml-3">
                        <DeleteModalAlert
                          delText="promo code"
                          onDelete={() => handleDelete(promo.id)}
                          isDeleting={deletingId === promo.id}
                        />
                        <Link
                          href={`/admin/promo-codes/${promo.id}/edit`}
                          className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-blue-300" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}