import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="logo-link inline-flex items-center gap-3">
            <Image
              src="/alcor-logo.png"
              alt="АЛЬКОР Logo"
              width={50}
              height={50}
              className="logo-image h-11 w-auto"
              priority
            />
            <span className="logo-text font-heading font-bold text-2xl">
              АЛЬКОР
            </span>
          </Link>
        </div>
        <div className="glass-card p-8">{children}</div>
      </div>
    </div>
  );
}
