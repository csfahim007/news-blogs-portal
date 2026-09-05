require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const image = (photo, width = 1400) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminSeed2026!';
  const readerPassword = process.env.SEED_READER_PASSWORD || 'ReaderSeed2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const readerHash = await bcrypt.hash(readerPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pinesaas.local' },
    update: { name: 'PineSaaS Admin', role: 'admin', password: passwordHash },
    create: { email: 'admin@pinesaas.local', name: 'PineSaaS Admin', role: 'admin', password: passwordHash },
  });
  const reader = await prisma.user.upsert({
    where: { email: 'reader@pinesaas.local' },
    update: { name: 'Demo Reader', role: 'user', password: readerHash },
    create: { email: 'reader@pinesaas.local', name: 'Demo Reader', role: 'user', password: readerHash },
  });

  const categoryData = [
    ['Product craft', 'product-craft', 'Notes on making software feel clear, useful, and human.'],
    ['Engineering', 'engineering', 'Practical systems thinking for teams that ship.'],
    ['Design systems', 'design-systems', 'Patterns that help teams move with consistency and care.'],
    ['Leadership', 'leadership', 'Lessons on building teams with trust and a long view.'],
    ['Customer stories', 'customer-stories', 'What we learn from the people using PineSaaS every day.'],
    ['Company news', 'company-news', 'Updates from the PineSaaS team.'],
  ];
  const categories = {};
  for (const [name, slug, description] of categoryData) {
    categories[slug] = await prisma.category.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description },
    });
  }

  const blogs = [
    {
      slug: 'the-case-for-boring-software', title: 'The case for boring software', categoryId: categories['product-craft'].id,
      excerpt: 'The best tools disappear into the work. A short argument for restraint, clarity, and fewer surprises.',
      content: 'The best tools disappear into the work. They do not demand a performance from the people using them.\n\nBoring software is not lifeless software. It is software with enough discipline to keep the important parts visible and the incidental parts quiet.',
      coverImage: image('photo-1497366811353-6870744d04b2'),
    },
    {
      slug: 'shipping-with-a-smaller-surface-area', title: 'Shipping with a smaller surface area', categoryId: categories.engineering.id,
      excerpt: 'A reliable release process starts by making fewer promises at a time.',
      content: 'Every new surface is a new promise to maintain. Smaller releases make the promise legible, testable, and easier to keep.\n\nThe result is not slower progress. It is progress that compounds instead of creating a second project called cleanup.',
      coverImage: image('photo-1556761175-b413da4baf72'),
    },
    {
      slug: 'notes-from-the-first-hundred-customers', title: 'Notes from the first hundred customers', categoryId: categories['product-craft'].id,
      excerpt: 'What repeated questions taught us about onboarding, trust, and the distance between a feature and a habit.',
      content: 'The first hundred customers do not give you a list of features. They give you a map of hesitation.\n\nThe work is to notice which questions repeat, then build an answer into the product instead of asking the customer to remember it.',
      coverImage: image('photo-1552664730-d307ca884978'),
    },
    {
      slug: 'a-design-system-for-real-life', title: 'A design system for real life', categoryId: categories['design-systems'].id,
      excerpt: 'Consistency is not sameness. It is the confidence that comes from knowing what can be trusted.',
      content: 'A design system earns its keep when it helps people make decisions quickly without flattening the character of the product.\n\nThe best systems leave room for judgment. They make the common path obvious and the unusual path possible.',
      coverImage: image('photo-1558655146-d09347e92766'),
    },
    {
      slug: 'the-quiet-work-of-good-leadership', title: 'The quiet work of good leadership', categoryId: categories.leadership.id,
      excerpt: 'Teams do their best work when context travels freely and fear does not.',
      content: 'Leadership is often less about having the answer and more about making it safe for the team to find the answer together.\n\nThat means sharing context early, naming tradeoffs clearly, and leaving people with enough ownership to surprise you.',
      coverImage: image('photo-1521737711867-e3b97375f902'),
    },
    {
      slug: 'what-customers-teach-us-about-momentum', title: 'What customers teach us about momentum', categoryId: categories['customer-stories'].id,
      excerpt: 'Small wins become durable habits when the product meets people where their work already happens.',
      content: 'Our customers rarely describe momentum as a dramatic leap. They describe a week that feels less fragmented, a handoff that needs fewer reminders, or a decision that arrives sooner.\n\nThose details are the product.',
      coverImage: image('photo-1556761175-4b46a572b786'),
    },
    {
      slug: 'when-to-delete-a-feature', title: 'When to delete a feature', categoryId: categories.engineering.id,
      excerpt: 'Removing a capability can be an act of care when it clears the path for the work that matters more.',
      content: 'A feature should not stay simply because it exists. We look for evidence that it creates value, clarity, or leverage. When it creates more ambiguity than any of those things, it is time to make space.',
      coverImage: image('photo-1497366216548-37526070297c'),
    },
    {
      slug: 'the-whispering-cliffs', title: 'The Whispering Cliffs', categoryId: categories['customer-stories'].id,
      excerpt: 'A field note on finding perspective when the work gets loud, and the image of the landscape that stays with us.',
      content: 'There are places where the wind seems to carry a second voice. The Whispering Cliffs are one of them: a long edge of stone, sea, and weather where the next decision feels easier to see.\n\nWe brought that feeling back to the product: more room to think, fewer competing signals, and a surface that lets important work speak first.',
      coverImage: image('photo-1500534623283-312aade485b7'),
    },
    {
      slug: 'the-shape-of-a-better-handoff', title: 'The shape of a better handoff', categoryId: categories['customer-stories'].id,
      excerpt: 'Good collaboration is less about passing work along and more about preserving context as it moves.',
      content: 'A handoff becomes lighter when the next person can see what changed, why it changed, and what still needs a decision. The product should carry that context without asking people to reconstruct it.',
      coverImage: image('photo-1517245386807-bb43f82c33c4'),
    },
    {
      slug: 'small-rituals-big-compounding-effects', title: 'Small rituals, big compounding effects', categoryId: categories.leadership.id,
      excerpt: 'The habits that make a team dependable are usually small enough to repeat and meaningful enough to keep.',
      content: 'A weekly note, a clear decision log, and a few minutes of quiet review can change the texture of a whole quarter. Reliable teams are built from practices that survive busy weeks.',
      coverImage: image('photo-1521737604893-d14cc237f11d'),
    },
  ];

  const seededBlogs = [];
  for (const blog of blogs) {
    seededBlogs.push(await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: { ...blog, authorId: admin.id, published: true, titleAlignment: 'left' },
      create: { ...blog, authorId: admin.id, published: true, titleAlignment: 'left', tagIds: [] },
    }));
  }

  const news = [
    {
      slug: 'pinesaas-journal-is-live', title: 'The PineSaaS journal is live', categoryId: categories['company-news'].id,
      excerpt: 'A new home for the ideas, decisions, and lessons behind the product.',
      content: 'Today we are opening the doors to the PineSaaS journal. Expect practical notes, honest experiments, and news from the team.',
      coverImage: image('photo-1497366754035-f200968a6e72'), featured: true,
    },
    {
      slug: 'building-in-public-with-care', title: 'Building in public, with care', categoryId: categories['company-news'].id,
      excerpt: 'Transparency is useful when it helps people understand the work, not when it turns work into theatre.',
      content: 'We will share what we learn while keeping customer privacy and thoughtful craft at the center.',
      coverImage: image('photo-1556761175-5973dc0f32e7'), featured: false,
    },
    {
      slug: 'pinesaas-community-notes', title: 'PineSaaS community notes', categoryId: categories['company-news'].id,
      excerpt: 'We are opening a small space for customers and builders to compare notes and share what works.',
      content: 'The best product conversations happen between people doing the work. Our new community notes series will bring those conversations into the open.',
      coverImage: image('photo-1529156069898-49953e39b3ac'), featured: true,
    },
    {
      slug: 'a-faster-way-to-find-the-signal', title: 'A faster way to find the signal', categoryId: categories['company-news'].id,
      excerpt: 'Search and filtering improvements make it easier to move from a busy workspace to the next useful decision.',
      content: 'This release focuses on the small moments that add up: finding the right record, understanding its context, and getting back to the work.',
      coverImage: image('photo-1553877522-43269d4ea984'), featured: false,
    },
    {
      slug: 'our-next-chapter', title: 'Our next chapter', categoryId: categories['company-news'].id,
      excerpt: 'A note from the team on the product principles guiding the months ahead.',
      content: 'We are keeping the ambition high and the interface calm: better defaults, clearer collaboration, and fewer places for important work to hide.',
      coverImage: image('photo-1497366754035-f200968a6e72'), featured: false,
    },
    {
      slug: 'a-clearer-home-for-team-decisions', title: 'A clearer home for team decisions', categoryId: categories['company-news'].id,
      excerpt: 'The latest workspace update brings decisions, owners, and context into one easier-to-scan view.',
      content: 'Teams told us the hardest part was not making decisions, but finding the decision again later. This update gives important context a durable home.',
      coverImage: image('photo-1497366811360-1431c6d9a3a4'), featured: true,
    },
    {
      slug: 'welcome-to-the-pinesaas-field-notes', title: 'Welcome to the PineSaaS field notes', categoryId: categories['company-news'].id,
      excerpt: 'A new series about the places, people, and working practices that shape how we build.',
      content: 'Field notes are where product thinking meets the real world. We will use this series to share observations from customer conversations and team workdays.',
      coverImage: image('photo-1500530855697-b586d89ba3ee'), featured: false,
    },
  ];
  for (const item of news) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: { ...item, authorId: admin.id, published: true },
      create: { ...item, authorId: admin.id, published: true, titleAlignment: 'left' },
    });
  }

  for (const blog of seededBlogs) {
    const existingComment = await prisma.comment.findFirst({ where: { blogId: blog.id, authorId: reader.id } });
    if (!existingComment) {
      const comment = blog.id === seededBlogs[0].id
        ? 'This is a useful distinction. The quiet tools tend to be the ones we keep using.'
        : 'A thoughtful perspective. I am taking this one back to the team.';
    await prisma.comment.create({
        data: { blogId: blog.id, authorId: reader.id, content: comment },
      });
    }
  }

  console.log(JSON.stringify({
    seeded: { admin: admin.email, reader: reader.email, categories: categoryData.length, blogs: blogs.length, news: news.length, comments: seededBlogs.length },
    credentials: { adminPassword, readerPassword },
  }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
