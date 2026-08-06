# PLUR — Valorant Duo Bul

Valorant oyuncuları için duo eşleştirme platformu. Doğru partneri bul, rank kas, daha iyi oyna.

## Teknolojiler

- **Next.js 15** — React framework
- **TypeScript** — Tip güvenliği
- **Tailwind CSS** — Stil
- **Lucide React** — İkonlar

## Kurulum

Node.js 18+ gereklidir. [nodejs.org](https://nodejs.org) adresinden indirebilirsin.

```bash
cd Projects/plur
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

## Proje Yapısı

```
src/
├── app/
│   ├── layout.tsx      # Root layout & fontlar
│   ├── page.tsx        # Ana sayfa
│   └── globals.css     # Global stiller
├── components/
│   ├── Sidebar.tsx     # Sol navigasyon
│   ├── Header.tsx      # Üst bar
│   ├── HeroBanner.tsx  # Hero bölümü
│   ├── PlayerFilters.tsx
│   ├── OnlinePlayers.tsx
│   ├── PlayerCard.tsx
│   ├── PremiumCard.tsx
│   ├── GameStats.tsx
│   └── RightSidebar.tsx
└── lib/
    └── data.ts         # Mock veriler
```

## Sonraki Adımlar

- [ ] Kullanıcı kayıt/giriş (NextAuth)
- [ ] Veritabanı (PostgreSQL + Prisma)
- [ ] Gerçek zamanlı online durum (Socket.io)
- [ ] Mesajlaşma sistemi
- [ ] Eşleşme algoritması
- [ ] Valorant API entegrasyonu
