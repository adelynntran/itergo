import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  boardMembers,
  dreamBoards,
  pinMedia,
  pins,
} from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { badRequest, forbidden } from "@/lib/api/errors";
import { generateCode, generatePin } from "@/lib/api/utils";

const DEMO_BOARD_NAMES = [
  "Scotland 2026 Dream",
  "Kyoto + Osaka 2027 Dream",
  "Portugal Coast 2026 Execute",
] as const;

type DemoPin = {
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  category: string;
  notes: string;
  image: string;
};

const scotlandDreamPins: DemoPin[] = [
  {
    name: "Arthur's Seat Sunrise Hike",
    address: "Holyrood Park, Edinburgh EH8 8HG, UK",
    city: "Edinburgh",
    country: "Scotland",
    latitude: 55.9444,
    longitude: -3.1618,
    category: "nature",
    notes: "Start before 5:30 AM for sunrise and fewer crowds.",
    image: "/demo/pin-arthurs-seat.jpg",
  },
  {
    name: "Edinburgh Castle",
    address: "Castlehill, Edinburgh EH1 2NG, UK",
    city: "Edinburgh",
    country: "Scotland",
    latitude: 55.9486,
    longitude: -3.1999,
    category: "culture",
    notes: "Book the first slot and stay for the city view.",
    image: "/demo/pin-castle.jpg",
  },
  {
    name: "The Elephant House",
    address: "21 George IV Bridge, Edinburgh EH1 1EN, UK",
    city: "Edinburgh",
    country: "Scotland",
    latitude: 55.9473,
    longitude: -3.1925,
    category: "food",
    notes: "Brunch + coffee stop between old town sights.",
    image: "/demo/pin-elephant-house.jpg",
  },
  {
    name: "Grassmarket",
    address: "Grassmarket, Edinburgh EH1, UK",
    city: "Edinburgh",
    country: "Scotland",
    latitude: 55.947,
    longitude: -3.1962,
    category: "shopping",
    notes: "Vintage stores and pub hopping in the evening.",
    image: "/demo/pin-grassmarket.jpg",
  },
  {
    name: "Isle of Skye Day Tour",
    address: "Isle of Skye, Scotland, UK",
    city: "Skye",
    country: "Scotland",
    latitude: 57.2736,
    longitude: -6.215,
    category: "activity",
    notes: "Full-day tour from Inverness, weather backup needed.",
    image: "/demo/pin-skye.jpg",
  },
];

const kyotoDreamPins: DemoPin[] = [
  {
    name: "Fushimi Inari Shrine",
    address: "68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto, Japan",
    city: "Kyoto",
    country: "Japan",
    latitude: 34.9671,
    longitude: 135.7727,
    category: "culture",
    notes: "Go before 8:00 AM to avoid heavy crowds.",
    image: "/demo/scotland-hero.jpg",
  },
  {
    name: "Arashiyama Bamboo Grove",
    address: "Ukyo Ward, Kyoto, Japan",
    city: "Kyoto",
    country: "Japan",
    latitude: 35.0094,
    longitude: 135.6668,
    category: "nature",
    notes: "Pair with Tenryu-ji + riverside walk.",
    image: "/demo/pin-glencoe.jpg",
  },
  {
    name: "Nishiki Market",
    address: "Nakagyo Ward, Kyoto, Japan",
    city: "Kyoto",
    country: "Japan",
    latitude: 35.005,
    longitude: 135.764,
    category: "food",
    notes: "Street snacks budget: around $25 pp.",
    image: "/demo/pin-whisky.jpg",
  },
  {
    name: "Dotonbori Night Walk",
    address: "Dotonbori, Chuo Ward, Osaka, Japan",
    city: "Osaka",
    country: "Japan",
    latitude: 34.6687,
    longitude: 135.5023,
    category: "nightlife",
    notes: "Great for late dinner + photos by canal.",
    image: "/demo/pin-witchery.jpg",
  },
];

const portugalExecutePins: DemoPin[] = [
  {
    name: "LX Factory Breakfast",
    address: "R. Rodrigues de Faria 103, 1300-501 Lisboa, Portugal",
    city: "Lisbon",
    country: "Portugal",
    latitude: 38.7032,
    longitude: -9.1783,
    category: "food",
    notes: "08:00-09:30 brunch and local shops.",
    image: "/demo/pin-elephant-house.jpg",
  },
  {
    name: "Belém Tower + Riverside",
    address: "Av. Brasília, 1400-038 Lisboa, Portugal",
    city: "Lisbon",
    country: "Portugal",
    latitude: 38.6916,
    longitude: -9.216,
    category: "culture",
    notes: "10:30-12:30, buy skip-the-line entry.",
    image: "/demo/pin-castle.jpg",
  },
  {
    name: "Sintra Pena Palace",
    address: "Estrada da Pena, 2710-609 Sintra, Portugal",
    city: "Sintra",
    country: "Portugal",
    latitude: 38.7874,
    longitude: -9.3904,
    category: "activity",
    notes: "Leave Lisbon by 07:30, allocate 4 hours.",
    image: "/demo/pin-glencoe.jpg",
  },
  {
    name: "Porto Ribeira Sunset",
    address: "Ribeira, Porto, Portugal",
    city: "Porto",
    country: "Portugal",
    latitude: 41.1409,
    longitude: -8.611,
    category: "nature",
    notes: "Golden hour walk + dinner reservation nearby.",
    image: "/demo/pin-grassmarket.jpg",
  },
  {
    name: "Douro Valley Winery Stop",
    address: "Peso da Régua, Portugal",
    city: "Peso da Régua",
    country: "Portugal",
    latitude: 41.1608,
    longitude: -7.7851,
    category: "activity",
    notes: "Book transfer and tasting in advance.",
    image: "/demo/pin-whisky.jpg",
  },
];

async function createBoardWithPins(input: {
  userId: string;
  name: string;
  description: string;
  boardMode: "dream" | "execution" | "travel";
  pinsData: DemoPin[];
}) {
  const [board] = await db
    .insert(dreamBoards)
    .values({
      name: input.name,
      description: input.description,
      createdBy: input.userId,
      inviteCode: generateCode(6),
      invitePin: generatePin(),
      boardMode: input.boardMode,
      executionStartedAt: input.boardMode === "execution" ? new Date() : null,
      coverImage: input.pinsData[0]?.image ?? null,
    })
    .returning();

  await db.insert(boardMembers).values({
    boardId: board.id,
    userId: input.userId,
    role: "host",
  });

  for (const [index, pin] of input.pinsData.entries()) {
    const [createdPin] = await db
      .insert(pins)
      .values({
        boardId: board.id,
        addedBy: input.userId,
        name: pin.name,
        address: pin.address,
        city: pin.city,
        country: pin.country,
        latitude: pin.latitude,
        longitude: pin.longitude,
        category: pin.category,
        notes: pin.notes,
        sourceType: "manual",
      })
      .returning();

    await db.insert(pinMedia).values({
      pinId: createdPin.id,
      type: "image",
      url: pin.image,
      thumbnail: pin.image,
      caption: pin.name,
      sortOrder: index,
    });
  }
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return forbidden("Demo seed is disabled in production");
  }

  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  await db
    .delete(dreamBoards)
    .where(
      and(
        eq(dreamBoards.createdBy, auth.userId),
        inArray(dreamBoards.name, [...DEMO_BOARD_NAMES])
      )
    );

  await createBoardWithPins({
    userId: auth.userId,
    name: "Scotland 2026 Dream",
    description: "Idea dump for Highlands + Edinburgh spots",
    boardMode: "dream",
    pinsData: scotlandDreamPins,
  });
  await createBoardWithPins({
    userId: auth.userId,
    name: "Kyoto + Osaka 2027 Dream",
    description: "Food-first Japan planning board",
    boardMode: "dream",
    pinsData: kyotoDreamPins,
  });
  await createBoardWithPins({
    userId: auth.userId,
    name: "Portugal Coast 2026 Execute",
    description: "Active execution plan with day-by-day stops",
    boardMode: "execution",
    pinsData: portugalExecutePins,
  });

  return NextResponse.json({
    ok: true,
    message: "Demo plans seeded",
  });
}

export async function GET() {
  return badRequest("Use POST to seed demo plans");
}
