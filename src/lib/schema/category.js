export function buildItemListSchema({
  category,
  products,
  baseUrl
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",

    name: category,

    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",

      position: index + 1,

      url:
        `${baseUrl}/${category}/${product.id.split("/").pop()}/`,

      name: product.data.title,

      image:
        `${baseUrl}${product.data.featuredImage}`
    }))
  };
}

export function buildCollectionSchema({
  name,
  description,
  url,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
  };
}