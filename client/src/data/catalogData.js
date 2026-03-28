export const shopCategories = [
  {
    id: 1,
    slug: "electronics",
    name: "Electronics",
    description: "Phones, laptops, audio gear, and everyday tech essentials.",
    image:
      "https://plus.unsplash.com/premium_photo-1683120889995-b6a309252981?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subcategories: [
      {
        label: "Computers",
        items: ["Laptops", "Desktops", "Monitors", "Keyboards"],
      },
      {
        label: "Mobile",
        items: ["Smartphones", "Tablets", "Smart Watches"],
      },
      {
        label: "Audio",
        items: ["Headphones", "Speakers", "Microphones"],
      },
    ],
  },
  {
    id: 2,
    slug: "ebooks",
    name: "Ebooks",
    description: "Digital books and learning resources for readers, students, and professionals.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    subcategories: [
      {
        label: "Fiction",
        items: ["Mystery", "Thriller", "Fantasy", "Romance"],
      },
      {
        label: "Business",
        items: ["Leadership", "Marketing", "Finance", "Startups"],
      },
      {
        label: "Learning",
        items: ["Programming", "Design", "Productivity", "Research"],
      },
    ],
  },
  {
    id: 3,
    slug: "software-tools",
    name: "Softwares",
    description: "Licensed apps and digital products for work, design, and development.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    subcategories: [
      {
        label: "Development",
        items: ["Code Editors", "API Tools", "Dev Utilities"],
      },
      {
        label: "Design",
        items: ["UI Kits", "Graphic Tools", "Prototyping"],
      },
      {
        label: "Productivity",
        items: ["Office Suites", "Team Tools", "Cloud Storage"],
      },
    ],
  },
  {
    id: 4,
    slug: "accessories",
    name: "Accessories",
    description: "Power, travel, and daily carry add-ons for your devices.",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    subcategories: [
      {
        label: "Power",
        items: ["Chargers", "Power Banks", "Cables"],
      },
      {
        label: "Workspace",
        items: ["Mouse", "Laptop Stands", "Webcams"],
      },
      {
        label: "Travel",
        items: ["Cases", "Adapters", "Portable Gear"],
      },
    ],
  },
];

export const megaMenu = shopCategories.map((category) => ({
  label: category.name,
  image: category.image,
  subcategories: category.subcategories,
}));
