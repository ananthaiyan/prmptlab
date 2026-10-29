import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h2 className="text-2xl font-bold font-mono text-white">404 - Page Not Found</h2>
      <p className="text-sm text-neutral-400">The page you are looking for does not exist.</p>
      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs font-mono hover:bg-neutral-200 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
