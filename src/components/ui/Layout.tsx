export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto	grid min-h-screen w-full  max-w-screen-xl grid-rows-layout gap-3">
      {children}
    </div>
  );
}
