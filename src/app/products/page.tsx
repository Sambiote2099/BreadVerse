import ProductCards from "@/components/product_card";

export default async function ProductsPage() {
  // Fetch initial data server-side
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products?limit=100`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const initialData = await res.json();

  return <ProductCards initialData={initialData} />;
}