import { prisma } from "@/lib/prisma";
import {
  UPAHAR_DIVISIONS,
  UPAHAR_DIVISION_LIST,
  calculateStoreStatus,
  evaluateDivisionStatus,
  getDivisionForCategory,
  mergeDivisionConfig,
  type DivisionKey,
  type SubsiteDbConfigLike,
} from "@/lib/store-hours";
import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from "@/lib/fallback-menu";

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  tiffins: "/images/upahar_chitti_idly.jpg",
  dosa: "/ghee-karam-dosa.jpg",
  biryanis: "/images/dishes/chicken-dum-biryani.jpg",
  "evening-specials": "/images/dishes/parotta.jpg",
  noodles: "/veg-manchurian-noodles.jpg",
  "veg-noodles": "/veg-manchurian-noodles.jpg",
  "nonveg-noodles": "/images/dishes/chicken-noodles.jpg",
  "fried-rice": "/chicken-fried-rice.jpg",
  "veg-rice": "/images/dishes/veg-fried-rice.jpg",
  "nonveg-rice": "/chicken-fried-rice.jpg",
  starters: "/images/dishes/chicken-manchurian.jpg",
  "veg-starters": "/images/dishes/paneer-manchurian.jpg",
  "nonveg-starters": "/images/dishes/chicken-manchurian.jpg",
  pickles: "/images/dishes/mango-avakaya.jpg",
};

const DEFAULT_PICKLES_ITEMS = [
  {
    name: "Andhra Mango Avakaya Pickle",
    slug: "andhra-mango-avakaya",
    description:
      "Classic sun-matured raw farm mango cubes blended with Guntur red chilli powder, mustard powder, garlic & cold-pressed gingelly oil.",
    price: 140,
    image: "/images/dishes/mango-avakaya.jpg",
    isVeg: true,
    isSpicy: true,
    isBestseller: true,
    isSignature: true,
    prepTime: "Ready 24×7",
    portionSize: "250g Airtight Jar",
    ingredients: "Raw mango pieces, Guntur chilli, Mustard powder, Gingelly oil, Garlic",
    displayOrder: 54,
  },
  {
    name: "Gongura Red Chilli Pickle",
    slug: "gongura-red-chilli-pickle",
    description:
      "Tangy Andhra sorrel leaves slow-cooked with roasted red chillies, fenugreek, garlic cloves & fragrant sesame oil tempering.",
    price: 130,
    image: "/images/dishes/gongura-pickle.jpg",
    isVeg: true,
    isSpicy: true,
    isBestseller: true,
    isSignature: true,
    prepTime: "Ready 24×7",
    portionSize: "250g Sealed Jar",
    ingredients: "Fresh gongura leaves, Guntur red chillies, Garlic, Gingelly oil",
    displayOrder: 55,
  },
  {
    name: "Andhra Cut Mango Magaya",
    slug: "cut-mango-magaya-pickle",
    description:
      "Crisp hand-diced tender mango relish seasoned in bright spiced red chilli oil and toasted cumin-mustard tempering.",
    price: 120,
    image: "/images/dishes/tomato-pickle.jpg",
    isVeg: true,
    isSpicy: true,
    isBestseller: false,
    isSignature: false,
    prepTime: "Ready 24×7",
    portionSize: "250g Sealed Jar",
    ingredients: "Diced mango, Red chilli, Mustard seeds, Cold-pressed sesame oil",
    displayOrder: 56,
  },
  {
    name: "Vellulli Garlic Karam Pickle",
    slug: "garlic-vellulli-pickle",
    description:
      "Whole tender garlic cloves marinated in fiery Guntur chilli paste, tamarind essence, and rich golden sesame oil.",
    price: 135,
    image: "/images/dishes/garlic-pickle.jpg",
    isVeg: true,
    isSpicy: true,
    isBestseller: true,
    isSignature: false,
    prepTime: "Ready 24×7",
    portionSize: "250g Sealed Jar",
    ingredients: "Peeled farm garlic, Guntur chilli, Fenugreek, Gingelly oil",
    displayOrder: 57,
  },
  {
    name: "Andhra Boneless Chicken Pickle",
    slug: "andhra-chicken-pickle",
    description:
      "Crispy golden boneless chicken chunks slow-pickled in authentic coastal Andhra garam masala, ginger-garlic & spicy red chilli oil.",
    price: 240,
    image: "/images/dishes/chicken-pickle.jpg",
    isVeg: false,
    isSpicy: true,
    isBestseller: true,
    isSignature: true,
    prepTime: "Ready 24×7",
    portionSize: "250g Premium Sealed Jar",
    ingredients: "Boneless chicken, Guntur chilli, Fresh ginger-garlic, Curry leaves, Sesame oil",
    displayOrder: 58,
  },
];

let initPromise: Promise<void> | null = null;

/**
 * Idempotently ensures the 4 SubsiteConfig rows exist, categories have accurate division & circular images,
 * and the Pickles category + items exist in SQLite without disturbing existing admin edits.
 */
export async function ensureSubsitesInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Ensure all 4 SubsiteConfig rows exist
      const existingConfigs = await prisma.subsiteConfig.findMany();
      const existingIds = new Set(existingConfigs.map((c) => c.id));

      for (let i = 0; i < UPAHAR_DIVISION_LIST.length; i++) {
        const div = UPAHAR_DIVISION_LIST[i];
        if (!existingIds.has(div.key)) {
          await prisma.subsiteConfig.create({
            data: {
              id: div.key,
              title: div.title,
              shortTitle: div.shortTitle,
              tagline: div.tagline,
              quote: div.quote,
              description: div.description,
              heroImage: div.heroImage,
              theme: div.theme,
              scheduleLabel: div.timingText,
              timeWindowsJson: JSON.stringify(div.timeWindows),
              alwaysOpen: Boolean(div.alwaysOpen),
              isActive: true,
              displayOrder: i + 1,
            },
          });
        }
      }

      // 2. Ensure existing categories have accurate division & default circular thumbnail image
      const dbCategories = await prisma.category.findMany();
      for (const cat of dbCategories) {
        const inferredDivision = getDivisionForCategory({ slug: cat.slug });
        const defaultImg = CATEGORY_DEFAULT_IMAGES[cat.slug] || null;
        if (cat.division !== inferredDivision && cat.division === "fast-food" && inferredDivision !== "fast-food") {
          await prisma.category.update({
            where: { id: cat.id },
            data: {
              division: inferredDivision,
              ...(!cat.image && defaultImg ? { image: defaultImg } : {}),
            },
          });
        } else if (!cat.image && defaultImg) {
          await prisma.category.update({
            where: { id: cat.id },
            data: { image: defaultImg },
          });
        }
      }

      // 3. Ensure a Pickles category & items exist if none present
      const hasPicklesCat = dbCategories.some(
        (c) => c.division === "pickles" || c.slug === "pickles"
      );
      if (!hasPicklesCat) {
        const picklesCat = await prisma.category.create({
          data: {
            name: "Andhra Homemade Pickles",
            slug: "pickles",
            division: "pickles",
            image: "/images/dishes/mango-avakaya.jpg",
            description:
              "Authentic sun-matured Andhra Avakaya, Gongura, Garlic & Chicken pickles available 24×7 anytime.",
            icon: "Flame",
            displayOrder: 8,
            isActive: true,
          },
        });

        for (const item of DEFAULT_PICKLES_ITEMS) {
          await prisma.foodItem.upsert({
            where: { slug: item.slug },
            update: {},
            create: {
              ...item,
              categoryId: picklesCat.id,
            },
          });
        }
      }
    } catch (err) {
      console.error("ensureSubsitesInitialized warning:", err);
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function getSubsitesAndSettings() {
  await ensureSubsitesInitialized();

  let settings: Awaited<ReturnType<typeof prisma.restaurantSetting.findUnique>> = null;
  let subsiteRows: SubsiteDbConfigLike[] = [];
  let categoryCounts: { division: string; slug: string; _count: { items: number } }[] = [];

  try {
    const [dbSettings, dbSubsites, dbCats] = await Promise.all([
      prisma.restaurantSetting.findUnique({ where: { id: "default" } }),
      prisma.subsiteConfig.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          division: true,
          slug: true,
          _count: { select: { items: true } },
        },
      }),
    ]);
    settings = dbSettings;
    subsiteRows = dbSubsites;
    categoryCounts = dbCats;
  } catch (err) {
    console.error("Failed reading subsites/settings, falling back to defaults:", err);
  }

  const storeStatus = calculateStoreStatus(
    settings?.openingTime || "06:00",
    settings?.closingTime || "22:30",
    settings?.isEmergencyClosed || false
  );
  const enforceStoreHours = settings?.enforceStoreHours !== false;

  const subsiteMap: Record<DivisionKey, SubsiteDbConfigLike | null> = {
    tiffins: subsiteRows.find((r) => r.id === "tiffins") || null,
    biryanis: subsiteRows.find((r) => r.id === "biryanis") || null,
    "fast-food": subsiteRows.find((r) => r.id === "fast-food") || null,
    pickles: subsiteRows.find((r) => r.id === "pickles") || null,
  };

  const subsites = UPAHAR_DIVISION_LIST.map((baseDiv, index) => {
    const dbRow = subsiteMap[baseDiv.key];
    const merged = mergeDivisionConfig(baseDiv.key, dbRow);
    const status = evaluateDivisionStatus(baseDiv.key, {
      isEmergencyClosed: Boolean(settings?.isEmergencyClosed),
      enforceStoreHours,
      dbConfig: dbRow,
    });

    const itemCount =
      categoryCounts.length > 0
        ? categoryCounts
            .filter((c) => getDivisionForCategory(c) === baseDiv.key)
            .reduce((sum, c) => sum + (c._count?.items || 0), 0)
        : FALLBACK_MENU_ITEMS.filter(
            (it) => getDivisionForCategory(it.category || it.categoryId) === baseDiv.key
          ).length;

    return {
      ...merged,
      id: baseDiv.key,
      displayOrder: index + 1,
      timeWindowsJson: JSON.stringify(merged.timeWindows),
      scheduleLabel: merged.timingText,
      itemCount,
      status,
    };
  });

  return { settings, storeStatus, subsites, subsiteMap };
}

export async function getSubsitePageData(divisionKey: DivisionKey) {
  const { settings, storeStatus, subsites, subsiteMap } = await getSubsitesAndSettings();
  const division = subsites.find((s) => s.key === divisionKey) || {
    ...mergeDivisionConfig(divisionKey, subsiteMap[divisionKey]),
    status: evaluateDivisionStatus(divisionKey, {
      isEmergencyClosed: Boolean(settings?.isEmergencyClosed),
      enforceStoreHours: settings?.enforceStoreHours !== false,
      dbConfig: subsiteMap[divisionKey],
    }),
  };

  let allCategories: typeof FALLBACK_CATEGORIES = [];
  let allItems: typeof FALLBACK_MENU_ITEMS = [];

  try {
    const [dbCats, dbItems] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { items: true } },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.foodItem.findMany({
        include: { category: true },
        orderBy: [
          { isAvailable: "desc" },
          { isSignature: "desc" },
          { isBestseller: "desc" },
          { displayOrder: "asc" },
        ],
      }),
    ]);
    allCategories = dbCats && dbCats.length > 0 ? dbCats : FALLBACK_CATEGORIES;
    allItems = dbItems && dbItems.length > 0 ? dbItems : FALLBACK_MENU_ITEMS;
  } catch (err) {
    console.error("Failed loading subsite catalog, using fallbacks:", err);
    allCategories = FALLBACK_CATEGORIES;
    allItems = FALLBACK_MENU_ITEMS;
  }

  const divisionCategories = allCategories
    .filter((cat) => getDivisionForCategory(cat) === divisionKey)
    .map((cat) => ({
      ...cat,
      image:
        cat.image ||
        CATEGORY_DEFAULT_IMAGES[cat.slug] ||
        allItems.find((i) => i.categoryId === cat.id)?.image ||
        division.heroImage,
    }));

  const divisionCategoryIds = new Set(divisionCategories.map((c) => c.id));
  const divisionItems = allItems
    .filter(
      (item) =>
        divisionCategoryIds.has(item.categoryId) ||
        getDivisionForCategory(item.category || item.categoryId) === divisionKey
    )
    .map((item) => ({
      ...item,
      isSessionLocked: division.status.isLocked,
      lockReason: division.status.lockBanner,
      availableAtText: division.timingText,
    }));

  return {
    division,
    categories: divisionCategories,
    items: divisionItems,
    settings,
    storeStatus,
    allSubsites: subsites,
    isEmergencyWebsiteStopped: Boolean(settings?.isEmergencyWebsiteStopped),
    emergencyStopMessage: settings?.emergencyStopMessage || null,
  };
}

export function getDefaultDivisionReference(key: DivisionKey) {
  return UPAHAR_DIVISIONS[key];
}

