// ─── Dynamic Collection Page — M02 ───
export default async function ColecaoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-3xl font-bold capitalize">{slug}</h1>
      <p className="mt-2 text-muted-foreground">
        Em breve — coleção temática com produtos personalizados.
      </p>
    </div>
  )
}
