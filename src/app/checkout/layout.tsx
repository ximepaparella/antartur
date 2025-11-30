// Force dynamic rendering for checkout (no pre-render)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

