export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Course Detail</h1>
      <p>Course ID: {params.id}</p>
    </div>
  )
}
