import AdminLayoutClient from "./layout-client"; // Import client component

// layout.tsx เป็น Server Component โดยปริยาย
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render ตัว Client Layout Wrapper และส่ง page.tsx เข้าไปเป็น children
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}