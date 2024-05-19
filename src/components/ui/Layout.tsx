export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-screen-xl gap-3 [grid-template-rows:min-content_1fr]">
      {children}
    </div>
  );
}
