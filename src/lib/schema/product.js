export function buildProductSchema({

  title,
  description,
  image,

  sku,

  brand = "Win-Win Stone",

  material,
  finish,
  category,

  moq,
  leadTime,

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

      url: "https://www.winwinstonecustom.com",

    },


    additionalProperty: [

      material && {

        "@type": "PropertyValue",

        name: "Material",

        value: material,

      },


      finish && {

        "@type": "PropertyValue",

        name: "Finish",

        value: Array.isArray(finish)
          ? finish.join(", ")
          : finish,

      },


      moq && {

        "@type": "PropertyValue",

        name: "MOQ",

        value: moq,

      },


      leadTime && {

        "@type": "PropertyValue",

        name: "Lead Time",

        value: leadTime,

      },

    ].filter(Boolean),



    offers: {

      "@type": "Offer",

      availability:
        "https://schema.org/InStock",

      url,

      seller: {

        "@type": "Organization",

        name: "Win-Win Stone",

      },

    },


    url,

  };

}