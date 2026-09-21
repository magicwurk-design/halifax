import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center space-y-5 px-6">
        <p className="text-6xl font-light" style={{ color:'rgba(29,110,245,0.35)' }}>404</p>
        <h2 className="text-lg font-semibold" style={{ color:'rgba(255,255,255,0.55)' }}>Page not found</h2>
        <Link href="/admin/login" className="inline-flex btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
          Return to portal
        </Link>
      </div>
    </div>
  );
}
