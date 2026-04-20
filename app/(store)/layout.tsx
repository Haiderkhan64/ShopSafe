import ScrollHeader from "@/components/ScrollAwareHeader";
import { CartSyncWrapper } from "@/components/CartSyncWrapper";

export default function StoreLayout({ children } : Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartSyncWrapper>
      <>
        <ScrollHeader />
        <main className="pt-[50px]">{children}</main>
      </>
    </CartSyncWrapper>
  );
}