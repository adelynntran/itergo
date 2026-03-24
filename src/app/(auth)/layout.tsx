export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="paper-canvas analog-fabric-canvas flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
