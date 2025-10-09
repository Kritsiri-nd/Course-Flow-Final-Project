"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PromoCode {
  id: number;
  code: string;
  discount_percentage: number;
  valid_until: string;
  is_active: boolean;
}

export default function PromoCodesForm() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setPromoCodes([
      {
        id: 1,
        code: "WELCOME10",
        discount_percentage: 10,
        valid_until: "2024-12-31",
        is_active: true
      }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Promo Codes Management</h1>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Promo Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Promo Code</Label>
            <Input id="code" placeholder="Enter promo code" />
          </div>
          <div>
            <Label htmlFor="discount">Discount Percentage</Label>
            <Input id="discount" type="number" placeholder="10" />
          </div>
          <div>
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input id="validUntil" type="date" />
          </div>
          <div className="flex items-end">
            <Button className="w-full">Create Promo Code</Button>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Existing Promo Codes</h2>
        <div className="space-y-4">
          {promoCodes.map((promo) => (
            <Card key={promo.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{promo.code}</h3>
                  <p className="text-sm text-gray-600">
                    {promo.discount_percentage}% discount
                  </p>
                  <p className="text-sm text-gray-500">
                    Valid until: {promo.valid_until}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}