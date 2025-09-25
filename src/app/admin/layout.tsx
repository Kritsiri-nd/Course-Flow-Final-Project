export const metadata = {
  title: 'CourseFlow - Admin Panel',
  description: 'Admin Panel for CourseFlow',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
}
