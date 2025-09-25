import HeaderNav from "@/components/ui/navbar/HeaderNav"; // <-- ใช้ตัวที่ดึงข้อมูล Session

// Layout นี้จะครอบหน้าทั้งหมดใน /non-user/*
export default function NonUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      
      <main>{children}</main>
    </div>
  );
}
