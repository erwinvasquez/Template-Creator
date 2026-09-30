#!/usr/bin/env node
/**
 * Replace catalog + sections + brand in food template defaults.json
 * Usage: node scripts/bootstrap-food-defaults.mjs <templateId>
 */
import fs from "node:fs";
import path from "node:path";

const templateId = process.argv[2];
if (!templateId) {
  console.error("Usage: node scripts/bootstrap-food-defaults.mjs <templateId>");
  process.exit(1);
}

const FOOD = {
  "food-trattoria-v1": {
    brand: {
      name: "Nonna",
      displayName: "TRATTORIA NONNA",
      tagline: "Pasta fresca y despensa italiana.",
      locale: "es-ES",
      currency: "EUR",
    },
    theme: {
      colors: {
        primary: "#7C2D12",
        secondary: "#CA8A04",
        cta: "#CA8A04",
        ctaHover: "#A16207",
        background: "#FEF2F2",
        surface: "#FEE2E2",
        text: "#450A0A",
        muted: "#9A3412",
        border: "#FECACA",
      },
    },
    navigation: {
      primary: [
        { type: "path", label: "Menú", href: "/menu" },
        { type: "shopFilter", label: "Pasta fresca", categorySlug: "pasta-fresca" },
        { type: "shopFilter", label: "Antipasti", categorySlug: "antipasti" },
        { type: "shopFilter", label: "Vinos", categorySlug: "vinos" },
        { type: "path", label: "Nosotros", href: "/nosotros" },
      ],
    },
    seo: {
      titleTemplate: "%s · Trattoria Nonna",
      default: {
        title: "Trattoria Nonna — Pasta fresca y cocina italiana",
        description:
          "Restaurante y despensa: pasta hecha cada mañana, antipasti de temporada, vinos italianos y kits para llevar.",
        openGraph: {
          title: "Trattoria Nonna — Cocina de la nonna",
          description: "Pasta fresca, salsas lentas y vinos seleccionados para tu mesa.",
        },
      },
      pages: {
        shop: {
          title: "Menú",
          description: "Platos listos, pasta fresca y despensa italiana para llevar o a pedido.",
        },
        about: {
          title: "Nosotros",
          description: "Historia de la trattoria, cocina abierta y horarios del restaurante.",
        },
      },
    },
    catalog: {
      categories: [
        { id: "cat_pasta", slug: "pasta-fresca", label: "Pasta fresca" },
        { id: "cat_antipasti", slug: "antipasti", label: "Antipasti" },
        { id: "cat_vinos", slug: "vinos", label: "Vinos" },
        { id: "cat_despensa", slug: "despensa", label: "Despensa" },
      ],
      collections: [
        {
          id: "col_nonna",
          slug: "nonna-clasica",
          name: "Nonna clásica",
          description: "Recetas de siempre: ragú lento, lasagna y pasta al huevo.",
          image: {
            url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1600&q=80",
            alt: "Pasta fresca con tomate y albahaca",
          },
        },
        {
          id: "col_temporada",
          slug: "temporada",
          name: "De temporada",
          description: "Ingredientes del mercado: trufa, setas y verduras de huerto.",
          image: {
            url: "https://images.unsplash.com/photo-1476124369491-e7addf5bb371?w=1600&q=80",
            alt: "Risotto con setas en plato de cerámica",
          },
        },
        {
          id: "col_vinos",
          slug: "vinos-italia",
          name: "Vinos de Italia",
          description: "Selección de bar: Chianti, Primitivo y blancos del norte.",
          image: {
            url: "https://images.unsplash.com/photo-1510812431400-5740fbbd02c5?w=1600&q=80",
            alt: "Copas de vino tinto sobre mesa de madera",
          },
        },
        {
          id: "col_kits",
          slug: "kits-regalo",
          name: "Kits regalo",
          description: "Cajas con pasta, salsas y aceite para regalar (o guardar).",
          image: {
            url: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=1600&q=80",
            alt: "Caja regalo con productos italianos",
          },
        },
      ],
      products: [
        prod("1", "tagliatelle-ragu", "Tagliatelle al ragú", "Pasta al huevo con ragú de ternera cocinado 6 horas. Listo para calentar en 8 minutos.", 14.5, "cat_pasta", "col_nonna", ["https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&q=80", "Tagliatelle con ragú"]),
        prod("2", "lasagna-nonna", "Lasagna de la nonna", "Capas de pasta, bechamel y ragú gratinado. Porción individual lista para horno.", 16, "cat_pasta", "col_nonna", ["https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200&q=80", "Lasagna recién horneada"]),
        prod("3", "ravioli-ricotta", "Ravioli ricotta y limón", "Ravioli frescos rellenos de ricotta, limón y hierbas. Con mantequilla y parmesano.", 15.5, "cat_pasta", "col_temporada", ["https://images.unsplash.com/photo-1612874741227-f802a4d7a1a1?w=1200&q=80", "Ravioli en plato blanco"], ["new"]),
        prod("4", "carpaccio-beef", "Carpaccio de ternera", "Ternera fina, rúcula, parmesano y alcaparras. Antipasto frío listo.", 12, "cat_antipasti", "col_temporada", ["https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80", "Carpaccio con rúcula"]),
        prod("5", "chianti-riserva", "Chianti Riserva 2020", "Botella 750 ml. Notas de cereza, especias y taninos suaves. Marida con pasta roja.", 22, "cat_vinos", "col_vinos", ["https://images.unsplash.com/photo-1510812431400-5740fbbd02c5?w=1200&q=80", "Botella de vino Chianti"], ["featured"]),
        prod("6", "salsa-tomate-basil", "Salsa pomodoro & basilico", "Tarro 500 g. Tomate San Marzano, ajo confitado y albahaca fresca.", 8.5, "cat_despensa", "col_kits", ["https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=1200&q=80", "Tarro de salsa de tomate"]),
        prod("7", "aceite-oliva-extra", "Aceite extra virgen", "Botella 500 ml de oliva italiana prensada en frío. Ideal para aliños.", 18, "cat_despensa", "col_kits", ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&q=80", "Botella de aceite de oliva"]),
        prod("8", "kit-pasta-regalo", "Kit pasta regalo", "Tagliatelle, salsa pomodoro, aceite y grana padano. Caja lista para regalar.", 34, "cat_despensa", "col_kits", ["https://images.unsplash.com/photo-1546548970-71785318a17b?w=1200&q=80", "Kit regalo de pasta italiana"], ["featured"]),
      ],
    },
    hero: {
      headline: "Cocina de la nonna, en tu mesa",
      subheadline: "Pasta fresca cada mañana, antipasti de temporada y vinos italianos para llevar o disfrutar en sala.",
      image: {
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2400&q=80",
        alt: "Mesa italiana con pasta y vino tinto",
      },
      ctaPrimary: { label: "Ver menú", href: "/menu" },
      ctaSecondary: { label: "Nosotros", href: "/nosotros" },
    },
    sections: {
      courses: {
        eyebrow: "Por mesa",
        title: "Cuatro caminos a la mesa",
        collectionIds: ["col_nonna", "col_temporada", "col_vinos", "col_kits"],
      },
      kitchen: {
        eyebrow: "Cocina abierta",
        title: "De la masa al plato en un día",
        body: "Amasamos cada mañana. Lo que ves en el menú sale de la misma cocina del restaurante.",
        steps: [
          { id: "masa", title: "Masa al huevo", body: "Harina, huevos y tiempo. Sin atajos ni conservantes." },
          { id: "salsa", title: "Salsas lentas", body: "Ragú, pomodoro y mantequilla de hierbas cocinadas en ollas pequeñas." },
          { id: "mesa", title: "A tu mesa", body: "Listo para llevar o servido en sala con el mismo cuidado." },
        ],
      },
      signatures: {
        eyebrow: "Platos firma",
        title: "Lo que la nonna recomienda",
        productIds: ["1", "2", "5"],
        viewAll: { label: "Ver menú completo", href: "/menu" },
      },
      sommelier: {
        eyebrow: "Sala y bar",
        title: "Reserva tu mesa o pide para llevar",
        body: "Comemos en familia larga. Si prefieres, pedimos la pasta fresca y la despensa para que la calientes en casa.",
        cta: { label: "Conocer la trattoria", href: "/nosotros" },
      },
      pantry: {
        eyebrow: "Despensa",
        title: "Lleva la cocina a tu casa",
        body: "Salsas, aceites y kits regalo hechos en la trattoria. Perfectos para regalar o repetir la experiencia.",
        productIds: ["6", "7", "8"],
        cta: { label: "Ver despensa", href: "/menu?categoria=despensa" },
      },
      shop: {
        eyebrow: "Menú",
        title: "Platos y despensa",
        description: "Pasta fresca lista, antipasti, vinos y productos para llevar.",
      },
      about: {
        intro: {
          eyebrow: "Nuestra historia",
          title: "Una trattoria de barrio con cocina abierta",
          body: "Nonna abrió la puerta en 1987 con ocho mesas y una olla de ragú. Hoy seguimos amasando cada mañana y sirviendo la misma hospitalidad italiana.",
        },
        bannerImage: {
          url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2400&q=80",
          alt: "Interior de trattoria con mesas y luz cálida",
        },
        blocks: [
          { id: "cocina", title: "Cocina visible", body: "Ves la pasta salir de la máquina y las salsas reducir en ollas de cobre." },
          { id: "familia", title: "Mesa larga", body: "Platos para compartir, vino de la casa y postres que no cambian con la moda." },
          { id: "despensa", title: "Para llevar", body: "La misma calidad del restaurante en tarros y cajas listas para tu cocina." },
        ],
        locations: {
          eyebrow: "Visítanos",
          title: "Trattoria y despensa",
          items: [
            { city: "Roma (barrio)", address: "Via del Corso 28", hours: "Mar–Dom 12:00–23:00 · Despensa 10:00–20:00" },
          ],
        },
        closing: {
          title: "Reserva o pide",
          body: "Llámanos para mesa o escríbenos para pedidos de pasta fresca.",
          cta: { label: "Contactar", href: "#" },
        },
      },
      footer: {
        blurb: "Pasta fresca, antipasti y despensa italiana. Cocina de la nonna en sala o para llevar.",
        columns: [
          {
            title: "Menú",
            links: [
              { label: "Todo el menú", href: "/menu" },
              { label: "Pasta fresca", href: "/menu?categoria=pasta-fresca" },
              { label: "Vinos", href: "/menu?categoria=vinos" },
              { label: "Despensa", href: "/menu?categoria=despensa" },
            ],
          },
          {
            title: "Trattoria",
            links: [
              { label: "Nosotros", href: "/nosotros" },
              { label: "Reservas", href: "/nosotros#reserva" },
              { label: "Contacto", href: "#" },
            ],
          },
        ],
        tagline: "Pasta fresca y despensa italiana.",
        copyrightName: "Trattoria Nonna",
      },
    },
    salesModeUi: {
      stock: { navLabel: "Listo para llevar", cartLabel: "Listo para llevar" },
      madeToOrder: {
        navLabel: "A pedido",
        cartLabel: "A pedido",
        preparationLabel: "Preparación",
        closedLabel: "Cocina cerrada para pedidos a medida",
        reopensAtLabel: "Reabre pedidos a medida",
      },
      nav: {
        stockHref: "/menu?salesMode=stock",
        madeToOrderHref: "/menu?salesMode=madeToOrder",
      },
    },
  },
  "food-cantina-v1": {
    brand: {
      name: "Cantina Roja",
      displayName: "CANTINA ROJA",
      tagline: "Tacos, salsas y fiesta en la mesa.",
      locale: "es-ES",
      currency: "EUR",
    },
    theme: {
      colors: {
        primary: "#BE123C",
        secondary: "#0D9488",
        cta: "#BE123C",
        ctaHover: "#9F1239",
        background: "#FFFBEB",
        surface: "#FEF3C7",
        text: "#881337",
        muted: "#9F1239",
        border: "#FDE68A",
      },
    },
    navigation: {
      primary: [
        { type: "path", label: "Tienda", href: "/tienda" },
        { type: "shopFilter", label: "Tacos", categorySlug: "tacos" },
        { type: "shopFilter", label: "Salsas", categorySlug: "salsas" },
        { type: "shopFilter", label: "Merch", categorySlug: "merch" },
        { type: "path", label: "Historia", href: "/historia" },
      ],
    },
    seo: {
      titleTemplate: "%s · Cantina Roja",
      default: {
        title: "Cantina Roja — Tacos y salsas picantes",
        description: "Cantina mexicana: kits de tacos, salsas artesanales, bebidas y merch para llevar la fiesta a casa.",
        openGraph: {
          title: "Cantina Roja — Sabor de barrio",
          description: "Tacos listos, salsas hechas a mano y packs para compartir.",
        },
      },
      pages: {
        shop: {
          title: "Tienda",
          description: "Tacos, salsas, bebidas y merch de la cantina.",
        },
        about: {
          title: "Historia",
          description: "Origen de la cantina, equipo y catering para eventos.",
        },
      },
    },
    catalog: {
      categories: [
        { id: "cat_tacos", slug: "tacos", label: "Tacos" },
        { id: "cat_salsas", slug: "salsas", label: "Salsas" },
        { id: "cat_bebidas", slug: "bebidas", label: "Bebidas" },
        { id: "cat_merch", slug: "merch", label: "Merch" },
      ],
      collections: [
        {
          id: "col_ruta",
          slug: "ruta-del-taco",
          name: "Ruta del taco",
          description: "Recorre barbacoa, pollo y vegetales en un solo pedido.",
          image: {
            url: "https://images.unsplash.com/photo-1565299585323-38174c4a6bce?w=1600&q=80",
            alt: "Tacos en bandeja con limón y cilantro",
          },
        },
        {
          id: "col_picante",
          slug: "picante",
          name: "Picante nivel",
          description: "Salsas que suben de intensidad: verde, roja y habanero.",
          image: {
            url: "https://images.unsplash.com/photo-1606491956689-2ea86650f4a6?w=1600&q=80",
            alt: "Salsas picantes en tarros",
          },
        },
        {
          id: "col_familia",
          slug: "familia",
          name: "Pack familia",
          description: "Para mesas largas: tacos, guacamole y bebidas.",
          image: {
            url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80",
            alt: "Mesa con comida mexicana para compartir",
          },
        },
        {
          id: "col_catering",
          slug: "catering",
          name: "Catering fiesta",
          description: "Packs para eventos: tacos al vapor y barra de salsas.",
          image: {
            url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
            alt: "Barra de tacos en evento",
          },
        },
      ],
      products: [
        prod("1", "tacos-barbacoa", "Tacos de barbacoa (6)", "Seis tacos de barbacoa de res lentamente cocinada. Incluye cilantro y limón.", 13.5, "cat_tacos", "col_ruta", ["https://images.unsplash.com/photo-1565299585323-38174c4a6bce?w=1200&q=80", "Tacos de barbacoa"], ["featured"]),
        prod("2", "tacos-pollo", "Tacos de pollo al achiote", "Pollo marinado, piña asada y salsa roja. Pack de 6 tacos.", 12, "cat_tacos", "col_ruta", ["https://images.unsplash.com/photo-1599974579688-e7a6e9beb0c0?w=1200&q=80", "Tacos de pollo"]),
        prod("3", "tacos-veg", "Tacos de calabaza", "Calabaza asada, queso fresco y pepitas. Vegetariano. 6 unidades.", 11.5, "cat_tacos", "col_familia", ["https://images.unsplash.com/photo-1613514785940-d59007712a31?w=1200&q=80", "Tacos vegetarianos"], ["new"]),
        prod("4", "salsa-verde", "Salsa verde picante", "Tarro 250 ml. Tomatillo, chile serrano y cilantro. Nivel medio-alto.", 6.5, "cat_salsas", "col_picante", ["https://images.unsplash.com/photo-1606491956689-2ea86650f4a6?w=1200&q=80", "Salsa verde en tarro"]),
        prod("5", "salsa-habanero", "Salsa habanero mango", "Tarro 250 ml. Habanero, mango y lima. Para valientes.", 7, "cat_salsas", "col_picante", ["https://images.unsplash.com/photo-1588137378633-dea1336ce1e9?w=1200&q=80", "Salsa habanero"], ["featured"]),
        prod("6", "agua-jamaica", "Agua de jamaica", "Botella 1 L. Hibisco, cítricos y poca azúcar. Refrescante.", 5.5, "cat_bebidas", "col_familia", ["https://images.unsplash.com/photo-1622483563222-3bf4fdebf7f5?w=1200&q=80", "Agua de jamaica"]),
        prod("7", "pack-fiesta", "Pack fiesta (12 tacos)", "Mix de barbacoa, pollo y calabaza. Guacamole y dos salsas.", 28, "cat_tacos", "col_catering", ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80", "Pack fiesta de tacos"], ["featured"]),
        prod("8", "gorra-cantina", "Gorra Cantina Roja", "Gorra bordada con logo vintage. Ajustable. Algodón.", 18, "cat_merch", "col_catering", ["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200&q=80", "Gorra roja con logo"]),
      ],
    },
    hero: {
      headline: "Tacos que no esperan",
      subheadline: "Barbacoa lentamente cocinada, salsas hechas a mano y packs para armar la fiesta en casa.",
      image: {
        url: "https://images.unsplash.com/photo-1565299585323-38174c4a6bce?w=2400&q=80",
        alt: "Tacos en bandeja con limón y cilantro",
      },
      ctaPrimary: { label: "Ver tienda", href: "/tienda" },
      ctaSecondary: { label: "Historia", href: "/historia" },
    },
    sections: {
      lanes: {
        eyebrow: "La ruta",
        title: "Tres calles de sabor",
        collectionIds: ["col_ruta", "col_picante", "col_familia", "col_catering"],
      },
      salsaBar: {
        eyebrow: "Barra de salsas",
        title: "Picante con personalidad",
        body: "Preparamos cada salsa en lotes pequeños. Pregunta por el nivel y te guiamos.",
        steps: [
          { id: "tostar", title: "Tostar chiles", body: "Aroma ahumado antes de moler." },
          { id: "balance", title: "Balance", body: "Ácido, sal y picante en la medida justa." },
          { id: "servir", title: "Servir fresco", body: "Sin conservantes: mejor en la semana." },
        ],
      },
      mercado: {
        eyebrow: "Destacados",
        title: "Lo más pedido en la barra",
        productIds: ["1", "5", "7"],
        viewAll: { label: "Ver tienda", href: "/tienda" },
      },
      fiesta: {
        eyebrow: "Catering",
        title: "Llevamos la fiesta a tu evento",
        body: "Tacos al vapor, barra de salsas y equipo que monta la mesa en minutos. Ideal para cumpleaños y oficinas.",
        cta: { label: "Nuestra historia", href: "/historia" },
      },
      merch: {
        eyebrow: "Merch",
        title: "Lleva el logo a la calle",
        body: "Gorras, camisetas y salsas extra para los que no pueden vivir sin picante.",
        productIds: ["4", "5", "8"],
        cta: { label: "Ver merch", href: "/tienda?categoria=merch" },
      },
      shop: {
        eyebrow: "Tienda",
        title: "Tacos, salsas y más",
        description: "Todo lo que sale de la cantina: listo para comer o para armar tu mesa.",
      },
      about: {
        intro: {
          eyebrow: "Historia",
          title: "De un puesto de tacos a la cantina del barrio",
          body: "Cantina Roja empezó con una plancha y una salsa verde que no duraba el día. Hoy la misma energía en sala y en los packs para llevar.",
        },
        bannerImage: {
          url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=2400&q=80",
          alt: "Interior de cantina con neones y mesas",
        },
        blocks: [
          { id: "barra", title: "Barra viva", body: "Salsas que cambian según la temporada del chile." },
          { id: "musica", title: "Música y mesa", body: "Ambiente de barrio: compartir tacos y brindar con agua de jamaica." },
          { id: "catering", title: "Fiesta móvil", body: "Llevamos tacos al vapor y barra de salsas a tu evento." },
        ],
        locations: {
          eyebrow: "Encuéntranos",
          title: "Cantina y tienda",
          items: [
            { city: "Ciudad", address: "Calle Revolución 142", hours: "Lun–Dom 11:00–00:00" },
          ],
        },
        closing: {
          title: "Reserva catering",
          body: "Cuéntanos fecha y personas. Te mandamos menú y precio.",
          cta: { label: "Pedir info", href: "#" },
        },
      },
      footer: {
        blurb: "Tacos, salsas picantes y merch de cantina. Fiesta en sala o en tu casa.",
        columns: [
          {
            title: "Tienda",
            links: [
              { label: "Todo", href: "/tienda" },
              { label: "Tacos", href: "/tienda?categoria=tacos" },
              { label: "Salsas", href: "/tienda?categoria=salsas" },
              { label: "Merch", href: "/tienda?categoria=merch" },
            ],
          },
          {
            title: "Cantina",
            links: [
              { label: "Historia", href: "/historia" },
              { label: "Catering", href: "/historia#catering" },
              { label: "Contacto", href: "#" },
            ],
          },
        ],
        tagline: "Tacos y salsas con actitud.",
        copyrightName: "Cantina Roja",
      },
    },
  },
  "food-patisserie-v1": {
    brand: {
      name: "Lune",
      displayName: "PÂTISSERIE LUNE",
      tagline: "Viennoiserie y tortas a pedido.",
      locale: "es-ES",
      currency: "EUR",
    },
    theme: {
      colors: {
        primary: "#92400E",
        secondary: "#B45309",
        cta: "#92400E",
        ctaHover: "#78350F",
        background: "#FEF3C7",
        surface: "#FDE68A",
        text: "#78350F",
        muted: "#A16207",
        border: "#FCD34D",
      },
    },
    navigation: {
      primary: [
        { type: "path", label: "Boutique", href: "/boutique" },
        { type: "shopFilter", label: "Viennoiserie", categorySlug: "viennoiserie" },
        { type: "shopFilter", label: "Tortas", categorySlug: "tortas" },
        { type: "shopFilter", label: "Regalos", categorySlug: "regalos" },
        { type: "path", label: "Atelier", href: "/atelier" },
      ],
    },
    seo: {
      titleTemplate: "%s · Pâtisserie Lune",
      default: {
        title: "Pâtisserie Lune — Pastelería francesa a pedido",
        description: "Croissants, tartas de temporada y tortas de celebración elaboradas en nuestro atelier.",
        openGraph: {
          title: "Pâtisserie Lune — Dulce artesanal",
          description: "Viennoiserie de mañana y celebraciones hechas a medida.",
        },
      },
      pages: {
        shop: {
          title: "Boutique",
          description: "Pasteles, chocolates y cajas regalo de la pâtisserie.",
        },
        about: {
          title: "Atelier",
          description: "Taller, equipo y proceso de elaboración a pedido.",
        },
      },
    },
    catalog: {
      categories: [
        { id: "cat_vien", slug: "viennoiserie", label: "Viennoiserie" },
        { id: "cat_tortas", slug: "tortas", label: "Tortas" },
        { id: "cat_choco", slug: "chocolates", label: "Chocolates" },
        { id: "cat_regalos", slug: "regalos", label: "Regalos" },
      ],
      collections: [
        {
          id: "col_manana",
          slug: "mañanas",
          name: "Mañanas",
          description: "Croissants, pains au chocolat y brioche antes de que se acabe.",
          image: {
            url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1600&q=80",
            alt: "Croissants y café en bandeja",
          },
        },
        {
          id: "col_estacion",
          slug: "estacion",
          name: "De estación",
          description: "Frutas del mercado en tartas y entremets que cambian cada mes.",
          image: {
            url: "https://images.unsplash.com/photo-1464349095432-e9a21285b5f3?w=1600&q=80",
            alt: "Tarta de frutas de temporada",
          },
        },
        {
          id: "col_celebracion",
          slug: "celebraciones",
          name: "Celebraciones",
          description: "Tortas de cumpleaños, boda y eventos con diseño personalizado.",
          image: {
            url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&q=80",
            alt: "Tarta de celebración decorada",
          },
        },
        {
          id: "col_gift",
          slug: "gift-box",
          name: "Gift box",
          description: "Cajas con macarons, chocolates y galletas para regalar.",
          image: {
            url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1600&q=80",
            alt: "Caja regalo con pasteles",
          },
        },
      ],
      products: [
        prod("1", "box-croissant", "Box croissant (6)", "Seis croissants de mantequilla francesa. Horneados en la mañana del pedido.", 14, "cat_vien", "col_manana", ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80", "Caja de croissants"], ["featured"]),
        prod("2", "pain-chocolat", "Pain au chocolat (4)", "Cuatro pains con chocolate Valrhona. Pedido con 24 h de antelación.", 12.5, "cat_vien", "col_manana", ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80", "Pain au chocolat"]),
        prod("3", "tarta-frutas", "Tarta frutas del mercado", "Base de almendra, crema de vainilla y fruta fresca. Tamaño 20 cm.", 38, "cat_tortas", "col_estacion", ["https://images.unsplash.com/photo-1464349095432-e9a21285b5f3?w=1200&q=80", "Tarta de frutas"], ["new"]),
        prod("4", "entremet-chocolate", "Entremet chocolate", "Capas de ganache, biscuit y crujiente. 8 raciones. A pedido.", 42, "cat_tortas", "col_estacion", ["https://images.unsplash.com/photo-1606313564200-e75d5e7f9668?w=1200&q=80", "Entremet de chocolate"]),
        prod("5", "torta-celebracion", "Torta celebración", "Diseño personalizado. Consulta sabores y decoración. Mín. 48 h.", 85, "cat_tortas", "col_celebracion", ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80", "Torta de celebración"], ["featured"]),
        prod("6", "trufas-cacao", "Trufas cacao single", "Caja 12 trufas. Cacao de origen y mantequilla de cacao.", 22, "cat_choco", "col_gift", ["https://images.unsplash.com/photo-1511381939411-adc4097d4e90?w=1200&q=80", "Trufas de chocolate"]),
        prod("7", "macaron-mix", "Macarons surtidos (12)", "Sabores de temporada en caja regalo.", 24, "cat_choco", "col_gift", ["https://images.unsplash.com/photo-1569860878021-9a6f5d281d2a?w=1200&q=80", "Macarons de colores"]),
        prod("8", "gift-box-lune", "Gift box Lune", "Macarons, trufas y galletas sablé. Lista para regalar.", 48, "cat_regalos", "col_gift", ["https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&q=80", "Caja regalo Lune"], ["featured"]),
      ],
    },
    hero: {
      headline: "Dulce que respeta el tiempo",
      subheadline: "Croissants de mantequilla francesa, tartas de estación y celebraciones elaboradas a pedido.",
      image: {
        url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=2400&q=80",
        alt: "Viennoiserie y café en mesa de madera",
      },
      ctaPrimary: { label: "Ver boutique", href: "/boutique" },
      ctaSecondary: { label: "Atelier", href: "/atelier" },
    },
    sections: {
      viennoiserie: {
        eyebrow: "Mañanas",
        title: "Viennoiserie del día",
        collectionIds: ["col_manana", "col_estacion", "col_celebracion", "col_gift"],
      },
      seasonal: {
        eyebrow: "Estación",
        title: "Lo que el mercado dicta",
        body: "Frutas, especias y chocolates que cambian con el calendario. Nada congelado de fábrica.",
        steps: [
          { id: "mercado", title: "Mercado", body: "Fruta y mantequilla francesa cada mañana." },
          { id: "lamas", title: "Laminado", body: "Croissants con 27 capas de mantequilla." },
          { id: "horneo", title: "Horneo", body: "Salen del horno cuando confirmas tu pedido." },
        ],
      },
      celebration: {
        eyebrow: "Celebraciones",
        title: "Tortas que cuentan una historia",
        productIds: ["5", "4", "3"],
        viewAll: { label: "Ver boutique", href: "/boutique" },
      },
      atelierNote: {
        eyebrow: "Atelier",
        title: "Pedidos a medida con tiempo",
        body: "Las tortas de celebración y viennoiserie especial se elaboran tras tu pedido. Te confirmamos fecha de entrega.",
        cta: { label: "Nuestro atelier", href: "/atelier" },
      },
      giftBox: {
        eyebrow: "Regalos",
        title: "Cajas para llevar la dulzura",
        body: "Macarons, trufas y galletas en packaging listo para regalar.",
        productIds: ["6", "7", "8"],
        cta: { label: "Ver regalos", href: "/boutique?categoria=regalos" },
      },
      shop: {
        eyebrow: "Boutique",
        title: "Pasteles y regalos",
        description: "Viennoiserie, tortas a pedido y cajas regalo de la pâtisserie.",
      },
      about: {
        intro: {
          eyebrow: "Atelier",
          title: "Pastelería francesa con reloj de horno",
          body: "Lune abrió como un pequeño laboratorio de laminado. Hoy combinamos viennoiserie de mañana y tortas de celebración hechas a medida.",
        },
        bannerImage: {
          url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=2400&q=80",
          alt: "Pastelero trabajando en atelier",
        },
        blocks: [
          { id: "laminado", title: "Laminado", body: "Mantequilla francesa y tiempo: la base de todo lo que sale del horno." },
          { id: "pedido", title: "A pedido", body: "Celebraciones con mínimo 48 h. Confirmamos sabor y decoración contigo." },
          { id: "regalo", title: "Para regalar", body: "Cajas curadas con lo mejor de cada semana." },
        ],
        locations: {
          eyebrow: "Visítanos",
          title: "Boutique y atelier",
          items: [
            { city: "París (barrio)", address: "Rue des Lunes 7", hours: "Mar–Sáb 08:00–19:00 · Pedidos online 24/7" },
          ],
        },
        closing: {
          title: "Haz tu pedido",
          body: "Indica fecha y ocasión. Te respondemos con opciones de sabor.",
          cta: { label: "Contactar", href: "#" },
        },
      },
      footer: {
        blurb: "Viennoiserie de mañana y tortas a pedido. Pastelería francesa artesanal.",
        columns: [
          {
            title: "Boutique",
            links: [
              { label: "Todo", href: "/boutique" },
              { label: "Viennoiserie", href: "/boutique?categoria=viennoiserie" },
              { label: "Tortas", href: "/boutique?categoria=tortas" },
              { label: "Regalos", href: "/boutique?categoria=regalos" },
            ],
          },
          {
            title: "Lune",
            links: [
              { label: "Atelier", href: "/atelier" },
              { label: "Pedidos", href: "/atelier#pedidos" },
              { label: "Contacto", href: "#" },
            ],
          },
        ],
        tagline: "Viennoiserie y tortas a pedido.",
        copyrightName: "Pâtisserie Lune",
      },
    },
  },
};

function prod(id, slug, name, description, price, categoryId, collectionId, [imgUrl, imgAlt], badges = []) {
  const p = {
    id,
    slug,
    name,
    description,
    price,
    categoryId,
    collectionId,
    colors: ["Único"],
    sizes: ["Único"],
    image: { url: imgUrl, alt: imgAlt },
  };
  if (badges.length) p.badges = badges;
  return p;
}

const data = FOOD[templateId];
if (!data) {
  console.error(`No food defaults for ${templateId}`);
  process.exit(1);
}

const defaultsPath = path.join(process.cwd(), "templates", templateId, "defaults.json");
const defaults = JSON.parse(fs.readFileSync(defaultsPath, "utf8"));

defaults.templateId = templateId;
defaults.brand = data.brand;
defaults.theme = data.theme;
defaults.navigation = data.navigation;
defaults.seo = data.seo;
defaults.catalog = data.catalog;
defaults.sections = {
  hero: data.hero,
  ...data.sections,
};

fs.writeFileSync(defaultsPath, `${JSON.stringify(defaults, null, 2)}\n`);
console.log(`Updated defaults for ${templateId}`);
