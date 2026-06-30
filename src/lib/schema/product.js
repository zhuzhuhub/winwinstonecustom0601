export function buildProductSchema({
  title,
  description,
  image,

  sku,

  brand = "Win-Win Stone",

  material,
  category,

  url,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",

    name: title,

    description,

    image,

    sku,

    category,

    material,

    brand: {
      "@type": "Brand",
      name: brand,
    },

    manufacturer: {
      "@type": "Organization",
      name: "Win-Win Stone",
    },

    url,
  };
}