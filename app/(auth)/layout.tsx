export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-background to-orange-50/30 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
