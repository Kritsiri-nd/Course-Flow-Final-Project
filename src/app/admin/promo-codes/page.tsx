import Link from 'next/link';
import { PlusCircle, Search, Trash2, FilePenLine } from 'lucide-react';
import { getPromoCodesWithCourseNames } from './action';
import { PromoCodesClientLayout } from './promo-code-client-layout';

interface PromoCode {
  id: string;
  code: string;
  min_purchase_amount: number;
  discount_type: string;
  coursesIncluded: string;
  created_at: string;
}

export default async function PromoCodeListPage() {
  const promoCodes = await getPromoCodesWithCourseNames();

  return (   
    <PromoCodesClientLayout>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-white p-6">
          {/* ส่วน Search bar */}
          <div className="flex items-center justify-end mb-6">

          </div>

          {/* ส่วนตารางแสดงข้อมูล */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-300 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Promo code</th>
                  <th className="p-4 font-semibold text-gray-600">Minimum purchase (THB)</th>
                  <th className="p-4 font-semibold text-gray-600">Discount type</th>
                  <th className="p-4 font-semibold text-gray-600">Courses Included</th>
                  <th className="p-4 font-semibold text-gray-600">Created date</th>
                  <th className="p-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              
              <tbody>
                {promoCodes.map((promo: PromoCode) => (
                  <tr key={promo.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{promo.code}</td>
                    <td className="p-4 text-gray-600">{promo.min_purchase_amount.toLocaleString()}</td>
                    <td className="p-4 text-gray-600 capitalize">
                      {promo.discount_type === 'fixed' ? 'Fixed amount' : 'Percent'}
                    </td>
                    <td className="p-4 text-gray-600 truncate max-w-xs">
                      {promo.coursesIncluded}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(promo.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <button className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <Link href={`/admin/promo-codes/${promo.id}/edit`} className="text-blue-500 hover:text-blue-700">
                          <FilePenLine className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* แสดงผลเมื่อไม่มีข้อมูล */}
            {promoCodes.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                No promo codes found.
              </div>
            )}
          </div>
        </div>
      </div>
      
    </PromoCodesClientLayout>
  );
}