import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid justify-items-center gap-3 py-12 text-center">
      <Image src="/art/cf-404.webp" alt="" width={360} height={270} className="h-auto w-72" />
      <h1 className="text-3xl font-bold">We could not find that page</h1>
      <p className="text-muted">The link may be old, or the campaign was taken down.</p>
      <Link href="/" className="btn btn-primary">Back to campaigns</Link>
    </div>
  );
}
