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

let initPromise: Promise<void> | null = null;
let hasInitialized = false;

interface CachedSettingsPayload {
  settings: Awaited<ReturnType<typeof prisma.restaurantSetting.findUnique>>;
  storeStatus: ReturnType<typeof calculateStoreStatus>;
  subsites: any[];
  subsiteMap: Record<DivisionKey, SubsiteDbConfigLike | null>;
}

let cachedSubsiteSettings: {
  payload: CachedSettingsPayload;
  cachedAt: number;
} | null = null;

let cachedCatalog: {
  categories: any[];
  items: any[];
  cachedAt: number;
} | null = null;

const CACHE_TTL_MS = 20000; // 20s in-memory edge cache

export function clearSubsitesCache() {
  cachedSubsiteSettings = null;
  cachedCatalog = null;
}

/**
 * Idempotently ensures the 4 SubsiteConfig rows exist, categories have accurate division & circular images,
 * and every unseeded division (tiffins, biryanis, fast-food, pickles) is populated from fallback catalog data.
 */
export async function ensureSubsitesInitialized(): Promise<void> {
  if (hasInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Fast path: If configs already exist in DB, skip
      const existingConfigs = await prisma.subsiteConfig.findMany({ select: { id: true } });
      if (existingConfigs.length >= 4) {
        hasInitialized = true;
        return;
      }
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

      // 2. Normalize division & circular thumbnail images on existing categories
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

      // 3. Ensure every division has categories & dishes if unseeded (e.g. fresh ephemeral cloud DB)
      const existingItems = await prisma.foodItem.findMany({
        select: {
          slug: true,
          category: { select: { slug: true, division: true } },
        },
      });
      const existingItemCountByDivision: Record<DivisionKey, number> = {
        tiffins: 0,
        biryanis: 0,
        "fast-food": 0,
        pickles: 0,
      };
      for (const row of existingItems) {
        const dKey = getDivisionForCategory(row.category);
        existingItemCountByDivision[dKey] += 1;
      }

      const categoryIdBySlug = new Map<string, string>(
        dbCategories.map((c) => [c.slug, c.id])
      );

      for (const div of UPAHAR_DIVISION_LIST) {
        if (existingItemCountByDivision[div.key] > 0) continue;

        const fallbackDivCategories = FALLBACK_CATEGORIES.filter(
          (c) => getDivisionForCategory(c) === div.key
        );

        for (const fCat of fallbackDivCategories) {
          const upsertedCat = await prisma.category.upsert({
            where: { slug: fCat.slug },
            update: {
              division: div.key,
              ...(!categoryIdBySlug.has(fCat.slug) && fCat.image ? { image: fCat.image } : {}),
            },
            create: {
              name: fCat.name,
              slug: fCat.slug,
              division: div.key,
              image: fCat.image || CATEGORY_DEFAULT_IMAGES[fCat.slug] || null,
              description: fCat.description || "",
              icon: fCat.icon || "Utensils",
              displayOrder: fCat.displayOrder || 0,
              isActive: true,
            },
          });
          categoryIdBySlug.set(fCat.slug, upsertedCat.id);
        }

        const fallbackDivItems = FALLBACK_MENU_ITEMS.filter(
          (it) => getDivisionForCategory(it.category || it.categoryId) === div.key
        );

        for (const fItem of fallbackDivItems) {
          const targetCatSlug = fItem.category?.slug || div.key;
          const resolvedCategoryId =
            categoryIdBySlug.get(targetCatSlug) ||
            categoryIdBySlug.values().next().value;
          if (!resolvedCategoryId) continue;

          await prisma.foodItem.upsert({
            where: { slug: fItem.slug },
            update: {},
            create: {
              name: fItem.name,
              slug: fItem.slug,
              description: fItem.description,
              price: fItem.price,
              image: fItem.image,
              categoryId: resolvedCategoryId,
              isVeg: Boolean(fItem.isVeg),
              isSpicy: Boolean(fItem.isSpicy),
              isBestseller: Boolean(fItem.isBestseller),
              isSignature: Boolean(fItem.isSignature),
              isAvailable: fItem.isAvailable !== false,
              prepTime: fItem.prepTime || "10-15 mins",
              portionSize: fItem.portionSize || null,
              ingredients: fItem.ingredients || null,
              displayOrder: fItem.displayOrder || 0,
            },
          });
        }
      }

      // 4. Ensure default RestaurantSetting uses updated 7.0km delivery boundary
      const defaultSetting = await prisma.restaurantSetting.findUnique({
        where: { id: "default" },
      });
      if (!defaultSetting) {
        await prisma.restaurantSetting.create({
          data: {
            id: "default",
            deliveryRadiusKm: 7.0,
          },
        });
      } else if (defaultSetting.deliveryRadiusKm === 5.0) {
        await prisma.restaurantSetting.update({
          where: { id: "default" },
          data: { deliveryRadiusKm: 7.0 },
        });
      }
    } catch (err) {
      console.error("ensureSubsitesInitialized warning:", err);
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function getSubsitesAndSettings() {
  const now = Date.now();
  if (cachedSubsiteSettings && now - cachedSubsiteSettings.cachedAt < CACHE_TTL_MS) {
    return cachedSubsiteSettings.payload;
  }

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

    const dbDivCount = categoryCounts
      .filter((c) => getDivisionForCategory(c) === baseDiv.key)
      .reduce((sum, c) => sum + (c._count?.items || 0), 0);

    const itemCount =
      dbDivCount > 0
        ? dbDivCount
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

  const result = { settings, storeStatus, subsites, subsiteMap };
  cachedSubsiteSettings = {
    payload: result,
    cachedAt: Date.now(),
  };

  return result;
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

  const now = Date.now();
  if (cachedCatalog && now - cachedCatalog.cachedAt < CACHE_TTL_MS) {
    allCategories = cachedCatalog.categories;
    allItems = cachedCatalog.items;
  } else {
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
      cachedCatalog = {
        categories: allCategories,
        items: allItems,
        cachedAt: Date.now(),
      };
    } catch (err) {
      console.error("Failed loading subsite catalog, using fallbacks:", err);
      allCategories = FALLBACK_CATEGORIES;
      allItems = FALLBACK_MENU_ITEMS;
    }
  }

  let divisionCategories = allCategories
    .filter((cat) => getDivisionForCategory(cat) === divisionKey)
    .map((cat) => ({
      ...cat,
      image:
        cat.image ||
        CATEGORY_DEFAULT_IMAGES[cat.slug] ||
        allItems.find((i) => i.categoryId === cat.id)?.image ||
        division.heroImage,
    }));

  if (divisionCategories.length === 0) {
    divisionCategories = FALLBACK_CATEGORIES.filter(
      (cat) => getDivisionForCategory(cat) === divisionKey
    ).map((cat) => ({
      ...cat,
      image: cat.image || CATEGORY_DEFAULT_IMAGES[cat.slug] || division.heroImage,
    }));
  }

  const divisionCategoryIds = new Set(divisionCategories.map((c) => c.id));
  let divisionItems = allItems
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

  if (divisionItems.length === 0) {
    divisionItems = FALLBACK_MENU_ITEMS.filter(
      (item) => getDivisionForCategory(item.category || item.categoryId) === divisionKey
    ).map((item) => ({
      ...item,
      isSessionLocked: division.status.isLocked,
      lockReason: division.status.lockBanner,
      availableAtText: division.timingText,
    }));
  }

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

