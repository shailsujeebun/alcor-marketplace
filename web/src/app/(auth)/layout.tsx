import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-cta flex items-center justify-center text-white font-bold text-xl">
              А
            </div>
            <span className="font-heading font-bold text-2xl gradient-text">
              АЛЬКОР
            </span>
          </Link>
        </div>
        <div className="glass-card p-8">{children}</div>
      </div>
    </div>
  );
}
