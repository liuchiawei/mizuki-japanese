export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-5xl mx-auto px-4 md:px-0">{children}</main>
  );
}
