export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-(--breakpoint-xl) [grid-template-rows:min-content_1fr] gap-3 p-4">
      {children}
    </div>
  );
}
