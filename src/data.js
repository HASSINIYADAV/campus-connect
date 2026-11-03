export const categories = ["All", "Technical", "Cultural", "Sports", "Workshops"];

export const demoEvents = [
  {
    id: "demo-innovatex",
    title: "InnovateX: Student Tech Fest",
    category: "Technical",
    date: "Nov 15, 2025 · 10:00 AM – 5:00 PM",
    venue: "Innovation Auditorium, Campus",
    price: 299,
    organizer: "CampusConnect Club",
    description: "A day for curious builders, bold ideas, and student-led technology. Meet teams from across campus, explore hands-on demos, and take part in a friendly innovation challenge.",
    highlights: ["Coding & design competitions", "Hands-on demos", "Networking with student builders"],
    agenda: ["10:00 AM · Opening and check-in", "11:00 AM · Project showcase", "2:00 PM · Innovation challenge"],
    art: "navy",
    short: "INNOVATEX",
  },
  {
    id: "demo-rhythm",
    title: "Rhythm & Rhyme",
    category: "Cultural",
    date: "Nov 21, 2025 · 6:00 PM – 9:00 PM",
    venue: "Open Air Theatre",
    price: 199,
    organizer: "Campus Arts Society",
    description: "An evening of live music, spoken word, and student performances under the lights.",
    highlights: ["Live student bands", "Open mic poetry", "Food and campus pop-ups"],
    agenda: ["6:00 PM · Gates open", "6:30 PM · Open mic", "7:30 PM · Live sets"],
    art: "purple",
    short: "RHYTHM & RHYME",
  },
  {
    id: "demo-football",
    title: "Inter-College Football Tournament",
    category: "Sports",
    date: "Nov 23, 2025 · 9:00 AM – 4:00 PM",
    venue: "University Sports Ground",
    price: 99,
    organizer: "Campus Athletics Club",
    description: "Cheer on campus teams as they compete for the inter-college trophy.",
    highlights: ["Knockout matches", "Student team showcase", "Final and awards"],
    agenda: ["9:00 AM · Qualifiers", "12:30 PM · Semi-finals", "3:00 PM · Final"],
    art: "green",
    short: "CAMPUS CUP",
  },
  {
    id: "demo-ux",
    title: "UI/UX Design Workshop",
    category: "Workshops",
    date: "Nov 25, 2025 · 2:00 PM – 5:00 PM",
    venue: "Design Lab, Block B",
    price: 149,
    organizer: "Design Circle",
    description: "Learn how to move from a problem statement to a polished, testable interface.",
    highlights: ["Practical Figma exercises", "User journey mapping", "Bring your own idea"],
    agenda: ["2:00 PM · Design principles", "3:00 PM · Studio exercise", "4:30 PM · Share-outs"],
    art: "brown",
    short: "DESIGN STUDIO",
  },
  {
    id: "demo-dhwani",
    title: "Dhwani – Music Festival",
    category: "Cultural",
    date: "Nov 28, 2025 · 5:00 PM – 10:00 PM",
    venue: "Central Lawn",
    price: 249,
    organizer: "Campus Arts Society",
    description: "A campus-wide celebration of music with performances from emerging student artists.",
    highlights: ["Four live acts", "Open-air stage", "Student-run stalls"],
    agenda: ["5:00 PM · Doors open", "6:00 PM · Acoustic sets", "8:00 PM · Main stage"],
    art: "pink",
    short: "DHWANI",
  },
  {
    id: "demo-ai",
    title: "AI for a Better Tomorrow",
    category: "Technical",
    date: "Dec 2, 2025 · 11:00 AM – 3:00 PM",
    venue: "Seminar Hall 1",
    price: 99,
    organizer: "CampusConnect Club",
    description: "A student forum on useful, responsible applications of artificial intelligence.",
    highlights: ["Student project talks", "Responsible AI discussion", "Interactive Q&A"],
    agenda: ["11:00 AM · Welcome", "11:30 AM · Project talks", "1:30 PM · Open discussion"],
    art: "blue",
    short: "AI FOR GOOD",
  },
];

const palettes = {
  technical: { category: "Technical", art: "navy", short: "INNOVATEX" },
  innovate: { category: "Technical", art: "navy", short: "INNOVATEX" },
  acid: { category: "Technical", art: "blue", short: "ACID DEMO" },
  line: { category: "Technical", art: "navy", short: "LINE FOLLOWER" },
  rhythm: { category: "Cultural", art: "purple", short: "RHYTHM & RHYME" },
  dhwani: { category: "Cultural", art: "pink", short: "DHWANI" },
  football: { category: "Sports", art: "green", short: "CAMPUS CUP" },
  tournament: { category: "Sports", art: "green", short: "CAMPUS CUP" },
  workshop: { category: "Workshops", art: "brown", short: "DESIGN STUDIO" },
  design: { category: "Workshops", art: "brown", short: "DESIGN STUDIO" },
  ai: { category: "Technical", art: "blue", short: "AI FOR GOOD" },
};

export function mapDatabaseEvent(row) {
  const title = row.title || "Campus event";
  const titleKey = title.toLowerCase();
  const match = Object.entries(palettes).find(([key]) => titleKey.includes(key))?.[1] || palettes.technical;
  const date = row.timestamp
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.timestamp))
    : "Date to be announced";
  return {
    ...demoEvents[0],
    ...match,
    id: row.id,
    title,
    date,
    venue: "Campus venue · Details to be announced",
    price: null,
    capacity: row.capacity,
    status: row.status,
    live: true,
    description: "Event details will be shared by the organizer.",
  };
}
