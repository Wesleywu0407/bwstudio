import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const works = [
  { slug: "orbital-relic", title: "ORBITAL RELIC", category: "CG_FILM", year: 2026, aspect: "9:16", client: "Independent", role: "Direction / CG", software: "Houdini, Cinema 4D, Redshift", coverImage: "/demo/orbital-relic.svg", previewClip: "/demo/portrait.mp4", description: "An artifact wakes in the dark, carrying fragments of a world that no longer exists." },
  { slug: "black-sun", title: "BLACK SUN", category: "MUSIC_VIDEO", year: 2026, aspect: "9:16", client: "AXIØM", role: "CG Direction", software: "Cinema 4D, After Effects", coverImage: "/demo/black-sun.svg", previewClip: "/demo/portrait-alt.mp4", description: "A monochrome visual system built around pressure, ritual, and mechanical rhythm." },
  { slug: "soft-terrain", title: "SOFT TERRAIN", category: "EXPERIMENT", year: 2025, aspect: "16:9", client: "Personal", role: "Direction / Design", software: "Houdini, Unreal Engine", coverImage: "/demo/soft-terrain.svg", previewClip: "/demo/landscape.mp4", description: "Synthetic landscapes suspended somewhere between memory and simulation." },
  { slug: "after-class", title: "AFTER CLASS", category: "COMMERCIAL", year: 2025, aspect: "4:5", client: "Acoustic Lab", role: "Creative Direction", software: "Cinema 4D, Octane", coverImage: "/demo/after-class.svg", previewClip: "/demo/portrait-warm.mp4", description: "A quiet room holds onto the resonance after everybody has gone." },
  { slug: "glory-residency", title: "GLORY RESIDENCY", category: "MUSIC_VIDEO", year: 2025, aspect: "16:9", client: "GLORY", role: "CG Director", software: "Blender, Unreal Engine", coverImage: "/demo/glory.svg", previewClip: "/demo/landscape-alt.mp4", description: "Night-driving visuals for a city that never existed." },
  { slug: "unit-09", title: "UNIT 09", category: "CG_FILM", year: 2025, aspect: "9:16", client: "Independent", role: "Director / Animation", software: "Cinema 4D, Redshift", coverImage: "/demo/unit-09.svg", previewClip: "/demo/portrait-cyan.mp4", description: "A machine waits for an instruction that may never arrive." },
  { slug: "street-signal", title: "STREET SIGNAL", category: "MUSIC_VIDEO", year: 2024, aspect: "4:5", client: "Northside", role: "VFX / Motion", software: "After Effects, Resolve", coverImage: "/demo/street-signal.svg", previewClip: "/demo/portrait-purple.mp4", description: "A fractured broadcast from the edge of the city." },
  { slug: "fauna-01", title: "FAUNA 01", category: "EXPERIMENT", year: 2024, aspect: "1:1", client: "Personal", role: "CG Artist", software: "Houdini, Redshift", coverImage: "/demo/fauna.svg", previewClip: "/demo/square.mp4", description: "Studies of impossible animals and soft-body behavior." },
];

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "BOB",
      tagline: "CG DIRECTOR / MOTION DESIGNER",
      location: "TAIPEI, TAIWAN",
      aboutText: "I direct moving images and build synthetic worlds for music, culture, and brands. My practice moves between CG direction, motion design, and visual development — always searching for the frame that feels unfamiliar but inevitable.",
      email: "hello@bob.studio",
      instagram: "https://instagram.com/",
      vimeo: "https://vimeo.com/",
    },
  });

  for (const [index, work] of works.entries()) {
    await prisma.work.upsert({
      where: { slug: work.slug },
      update: {},
      create: { ...work, featured: index < 5, published: true, sortOrder: index },
    });
  }
}

main().finally(() => prisma.$disconnect());
