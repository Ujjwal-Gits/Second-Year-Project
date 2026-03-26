// Run once: node scripts/fix_image_urls.js
// Replaces all localhost:5000 image URLs with the production Render URL

require("dotenv").config({ path: "../.env" });
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const OLD = "http://localhost:5000";
const NEW = "https://second-year-project-heoc.onrender.com";

const fix = (val) =>
  typeof val === "string" && val.startsWith(OLD) ? val.replace(OLD, NEW) : val;

async function main() {
  // Fix agent images
  const agents = await prisma.hamroAgent.findMany({
    where: {
      OR: [
        { panImage: { startsWith: OLD } },
        { citizenshipImage: { startsWith: OLD } },
        { profileImage: { startsWith: OLD } },
        { coverImage: { startsWith: OLD } },
      ],
    },
  });

  console.log(`Found ${agents.length} agents with localhost URLs`);

  for (const agent of agents) {
    await prisma.hamroAgent.update({
      where: { id: agent.id },
      data: {
        panImage: fix(agent.panImage),
        citizenshipImage: fix(agent.citizenshipImage),
        profileImage: fix(agent.profileImage),
        coverImage: fix(agent.coverImage),
      },
    });
    console.log(`Fixed agent: ${agent.companyName || agent.email}`);
  }

  // Fix listing images
  const listings = await prisma.listing.findMany();
  let listingFixed = 0;
  for (const listing of listings) {
    const fixedImages = (listing.images || []).map(fix);
    const hasChange = fixedImages.some((img, i) => img !== listing.images[i]);
    if (hasChange) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { images: fixedImages },
      });
      listingFixed++;
    }
  }
  console.log(`Fixed ${listingFixed} listings`);

  // Fix guide images
  const guides = await prisma.guide.findMany({
    where: {
      OR: [
        { profileImage: { startsWith: OLD } },
        { certificateImage: { startsWith: OLD } },
      ],
    },
  });
  for (const guide of guides) {
    await prisma.guide.update({
      where: { id: guide.id },
      data: {
        profileImage: fix(guide.profileImage),
        certificateImage: fix(guide.certificateImage),
      },
    });
  }
  console.log(`Fixed ${guides.length} guides`);

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
