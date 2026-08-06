export interface Player {
  id: string;
  username: string;
  tag: string;

  rank: string;
  rankTier:
    | "iron"
    | "bronze"
    | "silver"
    | "gold"
    | "platinum"
    | "diamond"
    | "ascendant"
    | "immortal"
    | "radiant";

  role: "duelist" | "initiator" | "controller" | "sentinel";

  agent: string;

  // Konum ve oyun sunucusu birbirinden ayrı
  city: string;
  server: string;

  tags: string[];

  online: boolean;
  avatar: string;
  banner: string;

  age: number;
  language: string;
  mic: boolean;
  verified: boolean;

  rating: number;
  reviewCount: number;

  winRate: number;
  kd: number;
  headshot: number;

  hours: number;
  rr: number;

  lastActive: string;
  bio: string;
}

export interface Review {
  id: string;
  username: string;
  avatar: string;
  comment: string;
  rating: number;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  badge?: number;
}

export interface HeaderLink {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  {
    label: "Ana Sayfa",
    icon: "home",
    href: "/",
  },
  {
    label: "Duo Bul",
    icon: "users",
    href: "/duo-bul",
  },
  {
    label: "Oyun Arkadaşları",
    icon: "gamepad",
    href: "/oyun-arkadaslari",
  },
  {
    label: "Takımlar",
    icon: "shield",
    href: "/takimlar",
  },
  {
    label: "Mesajlar",
    icon: "message",
    href: "/mesajlar",
    badge: 2,
  },
  {
    label: "Bildirimler",
    icon: "bell",
    href: "/bildirimler",
  },
  {
    label: "Favoriler",
    icon: "heart",
    href: "/favoriler",
  },
  {
    label: "Ayarlar",
    icon: "settings",
    href: "/ayarlar",
  },
];

export const headerLinks: HeaderLink[] = [
  {
    label: "Ana Sayfa",
    href: "/",
  },
  {
    label: "Duo Bul",
    href: "/duo-bul",
  },
  {
    label: "Takımlar",
    href: "/takimlar",
  },
  {
    label: "Topluluk",
    href: "/topluluk",
  },
  {
    label: "İstatistikler",
    href: "/istatistikler",
  },
  {
    label: "Premium",
    href: "/premium",
  },
];

export const filterTags = [
  "Ciddi oynuyorum",
  "Hırslı oynuyorum",
  "Eğlence için",
  "Rank kasıyorum",
  "Mikrofon var",
  "Türkçe konuşuyorum",
];

export const turkishCities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkâri",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kilis",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Şanlıurfa",
  "Siirt",
  "Sinop",
  "Şırnak",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
] as const;

export const valorantServers = [
  "İstanbul",
  "Frankfurt",
  "Paris",
  "Londra",
  "Varşova",
  "Madrid",
  "Stockholm",
] as const;

export const onlinePlayers: Player[] = [
  {
    id: "1",
    username: "yagiz",
    tag: "1234",

    rank: "Diamond 3",
    rankTier: "diamond",

    role: "duelist",
    agent: "Jett",

    city: "İstanbul",
    server: "İstanbul",

    tags: ["Ciddi oynuyorum", "Rank kasıyorum", "17+"],

    online: true,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=yagiz",

    banner:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",

    age: 20,
    language: "Türkçe",
    mic: true,
    verified: true,

    rating: 4.9,
    reviewCount: 126,

    winRate: 67,
    kd: 1.42,
    headshot: 28.4,

    hours: 2130,
    rr: 72,

    lastActive: "Şimdi aktif",

    bio: "Diamond oyuncusuyum. Ciddi şekilde rank kasıyorum. İletişimi güçlü ve tilt olmayan bir takım arkadaşı arıyorum.",
  },

  {
    id: "2",
    username: "berkay",
    tag: "5678",

    rank: "Ascendant 1",
    rankTier: "ascendant",

    role: "initiator",
    agent: "Sova",

    city: "Ankara",
    server: "Frankfurt",

    tags: ["Rank kasıyorum", "Hırslı oynuyorum", "Takım oyuncusu"],

    online: true,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=berkay",

    banner:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",

    age: 22,
    language: "Türkçe",
    mic: true,
    verified: true,

    rating: 4.8,
    reviewCount: 94,

    winRate: 64,
    kd: 1.31,
    headshot: 24.7,

    hours: 1845,
    rr: 46,

    lastActive: "Şimdi aktif",

    bio: "Sova ve Fade oynuyorum. Takım iletişimine önem veriyorum. Özellikle akşam saatlerinde rank girecek duo arıyorum.",
  },

  {
    id: "3",
    username: "elif",
    tag: "9012",

    rank: "Platinum 2",
    rankTier: "platinum",

    role: "controller",
    agent: "Omen",

    city: "İzmir",
    server: "İstanbul",

    tags: ["Eğlence için", "Türkçe konuşuyorum", "Toksik değil"],

    online: true,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=elif",

    banner:
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=80",

    age: 19,
    language: "Türkçe",
    mic: true,
    verified: false,

    rating: 4.7,
    reviewCount: 58,

    winRate: 59,
    kd: 1.18,
    headshot: 21.5,

    hours: 980,
    rr: 38,

    lastActive: "Şimdi aktif",

    bio: "Genellikle Omen ve Clove oynuyorum. Eğlenirken rank yükseltmek isteyen, sakin oyuncularla oynamayı seviyorum.",
  },

  {
    id: "4",
    username: "can",
    tag: "3456",

    rank: "Immortal 1",
    rankTier: "immortal",

    role: "sentinel",
    agent: "Sage",

    city: "Bursa",
    server: "İstanbul",

    tags: ["Ciddi oynuyorum", "Rank kasıyorum", "Immortal hedefi"],

    online: true,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=can",

    banner:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",

    age: 23,
    language: "Türkçe",
    mic: true,
    verified: true,

    rating: 5,
    reviewCount: 211,

    winRate: 72,
    kd: 1.57,
    headshot: 31.2,

    hours: 3260,
    rr: 84,

    lastActive: "Şimdi aktif",

    bio: "Immortal seviyesinde Sentinel oynuyorum. Düzenli ve ciddi oynayan, iletişimi iyi bir duo partneri arıyorum.",
  },

  {
    id: "5",
    username: "emir",
    tag: "TR01",

    rank: "Diamond 1",
    rankTier: "diamond",

    role: "controller",
    agent: "Clove",

    city: "Kahramanmaraş",
    server: "İstanbul",

    tags: ["Akşam aktif", "Rank kasıyorum", "Mikrofon var"],

    online: true,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=emir",

    banner:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80",

    age: 21,
    language: "Türkçe",
    mic: true,
    verified: true,

    rating: 4.9,
    reviewCount: 76,

    winRate: 65,
    kd: 1.36,
    headshot: 26.8,

    hours: 1720,
    rr: 54,

    lastActive: "Şimdi aktif",

    bio: "Controller ağırlıklı oynuyorum. Akşam saatlerinde düzenli rank girecek, iletişimi iyi duo arıyorum.",
  },

  {
    id: "6",
    username: "zeynep",
    tag: "1907",

    rank: "Gold 3",
    rankTier: "gold",

    role: "duelist",
    agent: "Reyna",

    city: "Antalya",
    server: "Frankfurt",

    tags: ["Eğlence için", "Toksik değil", "Hafta sonu aktif"],

    online: false,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep",

    banner:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",

    age: 20,
    language: "Türkçe",
    mic: true,
    verified: false,

    rating: 4.6,
    reviewCount: 37,

    winRate: 56,
    kd: 1.12,
    headshot: 22.3,

    hours: 740,
    rr: 61,

    lastActive: "18 dakika önce",

    bio: "Reyna ve Raze oynuyorum. Eğlenirken gelişmek isteyen, sakin ve saygılı oyuncularla oynamayı seviyorum.",
  },
];

export const reviews: Review[] = [
  {
    id: "1",
    username: "mert#TR",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=mert",
    comment: "Harika bir duo partneri, iletişim çok iyi!",
    rating: 5,
  },
  {
    id: "2",
    username: "ayse#TR",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=ayse",
    comment: "Rank kasarken çok yardımcı oldu, teşekkürler.",
    rating: 5,
  },
  {
    id: "3",
    username: "deniz#TR",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=deniz",
    comment: "Sakin ve stratejik oynuyor, tavsiye ederim.",
    rating: 4.5,
  },
];

export const rankColors: Record<Player["rankTier"], string> = {
  iron: "#4a4a4a",
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
  platinum: "#00cec9",
  diamond: "#b9f2ff",
  ascendant: "#1ae5a0",
  immortal: "#ff4655",
  radiant: "#ffff99",
};

export const roleIcons: Record<Player["role"], string> = {
  duelist: "⚔️",
  initiator: "📡",
  controller: "🌫️",
  sentinel: "🛡️",
};

export const agents = [
  "Jett",
  "Phoenix",
  "Reyna",
  "Raze",
  "Sova",
  "Fade",
  "Omen",
  "Clove",
  "Brimstone",
  "Sage",
  "Cypher",
  "Killjoy",
];