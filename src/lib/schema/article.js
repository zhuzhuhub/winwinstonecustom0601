export function buildBlogPostingSchema({
  title,
  description,
  image,
  url,
  publishDate,
  updatedDate,
  authorName = "Win-Win Stone Team",
  publisherName = "Win-Win Stone",
  publisherLogo = "https://www.winwinstonecustom.com/logo.png",
  category,
  keywords = [],
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",

    headline: title,
    description,
    image: image ? [image] : undefined,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },

    author: {
      "@type": "Person",
      name: authorName,
    },

    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },

    datePublished: publishDate
      ? new Date(publishDate).toISOString()
      : undefined,

    dateModified: updatedDate
      ? new Date(updatedDate).toISOString()
      : publishDate
      ? new Date(publishDate).toISOString()
      : undefined,

    articleSection: category || undefined,
    keywords: keywords.length ? keywords.join(", ") : undefined,
    url,
  };
}

export function buildFAQSchema(faqItems = []) {
  if (!faqItems.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}




export function buildCollectionSchema({
  name,
  description,
  url
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url
  };
}

export function buildItemListSchema({
  category = "blog",
  items = [],
  baseUrl = ""
}) {
  const cleanBaseUrl = String(baseUrl).replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category,
    itemListElement: items.map((item, index) => {
      const slug = item?.id ?? "";
      const title = item?.data?.title ?? "";
      const featuredImage = item?.data?.featuredImage;

      let imageUrl;

      if (featuredImage) {
        imageUrl = /^https?:\/\//.test(featuredImage)
          ? featuredImage
          : `${cleanBaseUrl}${featuredImage.startsWith("/") ? "" : "/"}${featuredImage}`;
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        url: `${cleanBaseUrl}/blog/${slug}/`,
        name: title,
        image: imageUrl
      };
    })
  };
}