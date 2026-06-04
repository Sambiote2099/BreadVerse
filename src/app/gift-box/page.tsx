import ProductCards from "@/components/gift_box_card";

export default async function ProductsPage() {
  // Fetch initial data server-side
   const baseUrl = process.env.NEXTAUTH_URL;
  
  const res = await fetch(`${baseUrl}/api/gifts?limit=100`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const initialData = await res.json();

  return <ProductCards initialData={initialData} />;
}