"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Gamepad2,
  HeartHandshake,
  MessageCircle,
  Smartphone,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  UsersRound,
  Zap,
  Check,
  X,
  Crown,
  ChevronDown,
} from "lucide-react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
const features = [
  {
    icon: ShieldCheck,
    title: "Güvenli Eşleşme",
    description:
      "Doğrulanmış profiller, şikâyet sistemi ve topluluk puanlarıyla daha güvenli oyuncularla tanış.",
  },
  {
    icon: Zap,
    title: "Anında Bağlantı",
    description:
      "Duo isteği, anlık bildirimler ve gerçek zamanlı mesajlaşmayla beklemeden oyuna geç.",
  },
  {
    icon: Target,
    title: "Sana Uygun Duo",
    description:
      "Rank, rol, şehir, sunucu ve oyun tarzına göre tam sana uygun takım arkadaşını bul.",
  },
  {
    icon: Trophy,
    title: "Birlikte Yüksel",
    description:
      "Solo queue stresini geride bırak, uyumlu takım arkadaşlarınla daha istikrarlı rank kas.",
  },
];

const steps = [
  ["01", "Profilini oluştur", "Rankını, rolünü, ajanını ve oyun tercihlerini ekle."],
  ["02", "İlanını paylaş", "Ne aradığını birkaç saniye içinde topluluğa duyur."],
  ["03", "Duo isteği al", "Sana uygun oyuncularla eşleş ve sohbet etmeye başla."],
  ["04", "Birlikte kazan", "Takımını kur, oyuna gir ve rank yolculuğuna devam et."],
];

const reviews = [
  {
    name: "Mert#TR1",
    rank: "Ascendant",
    text: "İlk geceden düzenli oynadığım bir duo buldum. Aradığım kişiyle direkt eşleştim.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MertTR1",
  },
  {
    name: "Selin#VAL",
    rank: "Diamond",
    text: "Filtreler gerçekten işe yarıyor. Aynı sunucuda ve aynı saatlerde oynayan birini bulmak çok kolay.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SelinVAL",
  },
  {
    name: "Ege#FPS",
    rank: "Immortal",
    text: "Mesajlaşma ve duo isteği sistemi çok akıcı. Topluluk büyüdükçe daha da iyi olacak.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=EgeFPS",
  },
  {
    name: "Naz#ACE",
    rank: "Platinum",
    text: "Solo girmek yerine artık her akşam aynı ekiple oynuyorum. Ortam gerçekten çok iyi.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NazACE",
  },
  {
    name: "Bora#RUSH",
    rank: "Diamond",
    text: "İlanımı açtıktan kısa süre sonra üç farklı oyuncudan istek geldi. Sistem çok hızlı.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BoraRUSH",
  },
  {
    name: "İrem#SAGE",
    rank: "Ascendant",
    text: "Rol ve mikrofon filtreleri sayesinde tam aradığım oyuncuyu buldum. Çok daha az tilt oluyorum.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=IremSAGE",
  },
];

const soloProblems = [
  "AFK ve troll oyuncular",
  "Mikrofonsuz ve iletişimsiz maçlar",
  "Uyumsuz roller ve oyun tarzları",
  "Her maç sıfırdan takım kurma stresi",
];

const plurBenefits = [
  "Rankına ve rolüne uygun oyuncular",
  "Mikrofon ve sunucu tercihleri",
  "Duo isteği ve anlık mesajlaşma",
  "Daha düzenli, daha uyumlu takım oyunu",
];

const upcomingFeatures = [
  { icon: BarChart3, title: "Valorant Tracker", description: "K/D, win rate, ACS ve son maçlarını profilinde göster.", badge: "Yakında" },
  { icon: Smartphone, title: "Mobil Uygulama", description: "Duo isteklerini ve mesajlarını telefondan anında takip et.", badge: "Planlandı" },
  { icon: Trophy, title: "Turnuvalar", description: "Topluluk turnuvalarına katıl, takımını kur ve ödüller kazan.", badge: "Yakında" },
  { icon: UsersRound, title: "Takım Sistemi", description: "Kalıcı ekipler oluştur, rollerini belirle ve birlikte geliş.", badge: "Geliştiriliyor" },
  { icon: Crown, title: "PLUR Premium", description: "Profilini öne çıkar, özel rozetler ve gelişmiş özellikler kazan.", badge: "Planlandı" },
];

const faqs = [
  ["PLUR ücretli mi?", "PLUR'un temel özellikleri ücretsizdir. Duo bulma, ilan oluşturma, mesajlaşma ve bildirim sistemlerini ücretsiz kullanabilirsin."],
  ["Duo isteği nasıl gönderilir?", "Duo Bul sayfasında sana uygun bir ilan seçip Duo İsteği butonuna basman yeterli. Karşı taraf kabul ettiğinde sohbet otomatik açılır."],
  ["Valorant Tracker ne zaman gelecek?", "Tracker entegrasyonu geliştirme yol haritasında yer alıyor. Hazır olduğunda profilinde gerçek oyun istatistiklerini gösterebileceksin."],
  ["Güvenli olmayan kullanıcıları ne yapabilirim?", "Kullanıcıları engelleyebilir veya şikâyet edebilirsin. Şikâyetler yönetim panelinden incelenir."],
];

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-plur-bg text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="overflow-hidden">
        <section className="relative px-4 pb-14 pt-6 md:px-6 lg:pb-20 lg:pt-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[8%] top-10 h-72 w-72 rounded-full bg-plur-red/15 blur-[120px]" />
            <div className="absolute right-[5%] top-16 h-96 w-96 rounded-full bg-cyan-400/10 blur-[150px]" />
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
                backgroundSize: "46px 46px",
              }}
            />
          </div>

          <div className="relative mx-auto grid min-h-[620px] max-w-[1500px] items-center gap-14 rounded-[32px] border border-plur-border bg-plur-card/55 p-6 shadow-[0_30px_120px_rgba(0,0,0,.35)] backdrop-blur-xl md:p-10 lg:grid-cols-[1.05fr_.95fr] lg:p-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-plur-red/30 bg-plur-red/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-plur-red">
                <Sparkles size={13} className="animate-pulse" />
                Türkiye&apos;nin Valorant Duo Topluluğu
              </div>

              <h1 className="mt-7 font-rajdhani text-5xl font-black uppercase leading-[.92] tracking-[-.035em] sm:text-6xl lg:text-7xl xl:text-[88px]">
                <span className="block">Tek Başına Girmekten Sıkılmadın mı?</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-plur-muted md:text-lg">
                PLUR ile saniyeler içinde sana uygun takım arkadaşını bul,
                birlikte kazan.
              </p>

              <p className="mt-4 font-rajdhani text-xl font-black uppercase tracking-[.12em] text-plur-red md:text-2xl">
                Doğru Duo, Daha Fazla Zafer.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/duo-bul"
                  className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-plur-red px-7 text-sm font-black text-white shadow-[0_16px_45px_rgba(255,70,85,.30)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(255,70,85,.45)]"
                >
                  <span className="absolute inset-0 -translate-x-[130%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[130%]" />
                  <Gamepad2 size={18} className="relative" />
                  <span className="relative">Hemen Duo Bul</span>
                  <ArrowRight size={17} className="relative transition group-hover:translate-x-1" />
                </Link>

                <a
                  href="#nasil-calisir"
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-plur-border bg-plur-bg/70 px-7 text-sm font-bold text-white transition hover:-translate-y-1 hover:border-plur-red/40 hover:bg-plur-red/10"
                >
                  Nasıl Çalışır?
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                <HeroMetric value="81" label="İlde Topluluk" />
                <HeroMetric value="7/24" label="Aktif Platform" green />
                <HeroMetric value="Anlık" label="Duo ve Mesajlaşma" />
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-[560px] lg:block">
              <div className="absolute inset-10 rounded-full bg-plur-red/15 blur-[90px]" />
              <div className="relative min-h-[480px] overflow-hidden rounded-[34px] border border-plur-red/25 bg-gradient-to-br from-plur-red/15 via-plur-card to-cyan-400/5 p-7 shadow-[0_35px_120px_rgba(0,0,0,.5)]">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-plur-red/20" />
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/10" />

                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-plur-green/25 bg-plur-green/10 px-3 py-1.5 text-[10px] font-bold text-plur-green">
                    CANLI EŞLEŞME
                  </span>
                  <Radio size={18} className="animate-pulse text-plur-green" />
                </div>

                <div className="mt-12 flex items-center gap-5">
                  <div className="relative">
                    <div className="rounded-[28px] bg-gradient-to-br from-plur-red via-pink-500 to-cyan-400 p-[2px]">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=plur-hero"
                        alt="PLUR öne çıkan oyuncu"
                        className="h-28 w-28 rounded-[26px] bg-plur-bg object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-plur-card bg-plur-green" />
                  </div>

                  <div>
                    <p className="font-rajdhani text-3xl font-black">
                      PLUR Oyuncusu
                      <span className="text-plur-muted">#TR</span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-cyan-300">
                      Diamond 2
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={14} className="fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                  <MiniCard label="Tercih" value="Rekabetçi" icon={<Trophy size={16} />} />
                  <MiniCard label="İletişim" value="Mikrofon Açık" icon={<MessageCircle size={16} />} />
                  <MiniCard label="Rol" value="Duelist" icon={<Target size={16} />} />
                  <MiniCard label="Sunucu" value="İstanbul" icon={<Radio size={16} />} />
                </div>

                <div className="mt-8 rounded-2xl border border-plur-red/20 bg-plur-red/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[.15em] text-plur-muted">
                        Eşleşme Durumu
                      </p>
                      <p className="mt-1 font-rajdhani text-xl font-black">
                        Uygun duo bulundu
                      </p>
                    </div>
                    <BadgeCheck size={28} className="text-plur-green" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeading
              eyebrow="NEDEN PLUR?"
              title="Solo queue artık tek seçeneğin değil."
              description="PLUR, sana sadece oyuncu göstermiyor; oyun tarzına uyum sağlayacak takım arkadaşını bulmana yardımcı oluyor."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="group rounded-[24px] border border-plur-border bg-plur-card/55 p-6 transition duration-300 hover:-translate-y-2 hover:border-plur-red/35 hover:shadow-[0_24px_70px_rgba(255,70,85,.10)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plur-red/10 text-plur-red transition group-hover:scale-110">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-5 font-rajdhani text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-plur-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeading
              eyebrow="SOLO QUEUE VS PLUR"
              title="Aynı oyuna giriyorsun, ama aynı deneyimi yaşamak zorunda değilsin."
              description="PLUR, rastgele takım arkadaşlarının yarattığı stresi azaltır ve seni gerçekten uyum sağlayabileceğin oyuncularla buluşturur."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <ComparisonCard
                title="Solo Queue"
                subtitle="Her maç yeni bir belirsizlik"
                items={soloProblems}
                negative
              />

              <div className="flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-plur-red/30 bg-plur-red/10 font-rajdhani text-xl font-black text-plur-red shadow-[0_0_40px_rgba(255,70,85,.15)]">
                  VS
                </div>
              </div>

              <ComparisonCard
                title="PLUR"
                subtitle="Doğru oyuncuyla daha güçlü takım"
                items={plurBenefits}
              />
            </div>
          </div>
        </section>

        <section id="nasil-calisir" className="border-y border-plur-border bg-plur-card/25 px-4 py-16 md:px-6 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeading
              eyebrow="4 ADIMDA BAŞLA"
              title="Duo bulmak hiç bu kadar kolay olmamıştı."
              description="Profilini oluştur, ilanını yayınla ve sana uygun oyuncularla saniyeler içinde bağlantı kur."
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map(([number, title, description], index) => (
                <article key={number} className="relative rounded-[24px] border border-plur-border bg-plur-bg/70 p-6">
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-plur-red xl:block" size={22} />
                  )}
                  <span className="font-rajdhani text-4xl font-black text-plur-red/25">{number}</span>
                  <h3 className="mt-5 font-rajdhani text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-plur-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard value="81" label="İlde Oyuncu" icon={<Users size={20} />} />
              <StatCard value="7/24" label="Aktif Topluluk" icon={<Radio size={20} />} />
              <StatCard value="Anlık" label="Mesajlaşma" icon={<MessageCircle size={20} />} />
              <StatCard value="%100" label="Oyuncu Odaklı" icon={<HeartHandshake size={20} />} />
            </div>
          </div>
        </section>

        <section className="border-y border-plur-border bg-plur-card/25 px-4 py-16 md:px-6 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeading
              eyebrow="YAKINDA PLUR'DA"
              title="Bu daha başlangıç."
              description="PLUR, sadece duo bulma sitesi değil; Valorant oyuncularının buluştuğu kapsamlı bir topluluk platformuna dönüşüyor."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {upcomingFeatures.map(({ icon: Icon, title, description, badge }) => (
                <article key={title} className="group relative overflow-hidden rounded-[24px] border border-plur-border bg-plur-bg/70 p-5 transition duration-300 hover:-translate-y-2 hover:border-plur-red/40 hover:shadow-[0_22px_60px_rgba(255,70,85,.10)]">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-plur-red/10 blur-3xl transition group-hover:bg-plur-red/20" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-plur-red/10 text-plur-red">
                        <Icon size={21} />
                      </div>
                      <span className="rounded-full border border-plur-red/25 bg-plur-red/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-plur-red">
                        {badge}
                      </span>
                    </div>
                    <h3 className="mt-5 font-rajdhani text-xl font-black">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-plur-muted">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-plur-border bg-plur-card/25 px-4 py-16 md:px-6 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeading
              eyebrow="TOPLULUK NE DİYOR?"
              title="İyi bir duo, oyunun tamamını değiştirir."
              description="PLUR topluluğundan oyuncuların deneyimlerinden kısa kesitler."
            />
            <div className="relative mt-10 space-y-4 overflow-hidden py-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-plur-bg via-plur-bg/80 to-transparent md:w-36" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-plur-bg via-plur-bg/80 to-transparent md:w-36" />

              <ReviewMarquee reviews={[...reviews, ...reviews]} direction="left" />
              <ReviewMarquee reviews={[...reviews.slice().reverse(), ...reviews.slice().reverse()]} direction="right" />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 lg:py-24">
          <div className="mx-auto max-w-[1100px]">
            <SectionHeading
              eyebrow="SIK SORULAN SORULAR"
              title="Aklındaki soruların cevabı burada."
              description="PLUR'u kullanmaya başlamadan önce en çok merak edilen konuları kısa ve net şekilde yanıtladık."
            />

            <div className="mt-10 space-y-3">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group rounded-2xl border border-plur-border bg-plur-card/55 open:border-plur-red/35 open:bg-plur-red/[0.04]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-sm font-bold text-white">
                    {question}
                    <ChevronDown size={18} className="shrink-0 text-plur-muted transition group-open:rotate-180 group-open:text-plur-red" />
                  </summary>
                  <div className="border-t border-plur-border px-5 py-5 text-sm leading-7 text-plur-muted">
                    {answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 lg:py-24">
          <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[32px] border border-plur-red/30 bg-gradient-to-br from-plur-red/20 via-plur-card to-cyan-400/10 p-8 md:p-12 lg:p-16">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-plur-red/20 blur-[100px]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-plur-red">SIRA SENDE</p>
                <h2 className="mt-4 max-w-3xl font-rajdhani text-4xl font-black uppercase leading-tight md:text-5xl">
                  Doğru Duo, Daha Fazla Zafer.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-plur-muted md:text-base">
                  Tek başına queue girmek yerine seninle aynı hedefe sahip oyuncularla tanış ve birlikte yüksel.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/duo-bul" className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-plur-red px-7 text-sm font-black text-white">
                  Duo Bul <ArrowRight size={16} />
                </Link>
                <Link href="/ilan-olustur" className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-plur-border bg-plur-bg/70 px-7 text-sm font-bold text-white">
                  İlan Oluştur
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-plur-border px-4 py-10 md:px-6">
          <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-center gap-3 text-center">
            <div>
              <p className="font-rajdhani text-2xl font-black tracking-[.18em] text-plur-red">PLUR</p>
              <p className="mt-1 text-xs text-plur-muted">Doğru Duo, Daha Fazla Zafer.</p>
            </div>

            <p className="text-xs text-plur-muted">© 2026 PLUR</p>

            <p className="text-sm text-plur-muted">
              This page was developed by{" "}
              <span className="font-bold text-white transition hover:text-plur-red hover:drop-shadow-[0_0_12px_rgba(255,70,85,0.65)]">
                emirloper
              </span>
            </p>
          </div>
        </footer>
      </main>
      <style jsx global>{`
        @keyframes reviewMarqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.5rem)); }
        }

        @keyframes reviewMarqueeRight {
          from { transform: translateX(calc(-50% - 0.5rem)); }
          to { transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="reviewMarquee"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function ReviewMarquee({
  reviews,
  direction,
}: {
  reviews: Array<{
    name: string;
    rank: string;
    text: string;
    avatar: string;
  }>;
  direction: "left" | "right";
}) {
  return (
    <div className="group/marquee overflow-hidden">
      <div
        className={`flex w-max gap-4 will-change-transform group-hover/marquee:[animation-play-state:paused] ${
          direction === "left"
            ? "animate-[reviewMarqueeLeft_38s_linear_infinite]"
            : "animate-[reviewMarqueeRight_42s_linear_infinite]"
        }`}
      >
        {reviews.map((review, index) => (
          <article
            key={`${direction}-${review.name}-${index}`}
            className="group/review w-[300px] shrink-0 rounded-[24px] border border-plur-border bg-plur-bg/75 p-5 shadow-[0_18px_50px_rgba(0,0,0,.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-plur-red/40 hover:shadow-[0_24px_65px_rgba(255,70,85,.12)] sm:w-[340px]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={`${review.name} avatarı`}
                  className="h-11 w-11 rounded-xl border border-plur-border bg-plur-card object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-white">{review.name}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.12em] text-plur-muted">
                    {review.rank}
                  </p>
                </div>
              </div>

              <div className="flex gap-0.5 text-yellow-400">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={12} className="fill-yellow-400" />
                ))}
              </div>
            </div>

            <p className="mt-5 min-h-[72px] text-sm leading-6 text-white/75">
              “{review.text}”
            </p>

            <div className="mt-4 flex items-center gap-2 border-t border-plur-border pt-4 text-[10px] font-semibold text-plur-green">
              <BadgeCheck size={13} />
              Doğrulanmış topluluk yorumu
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  subtitle,
  items,
  negative = false,
}: {
  title: string;
  subtitle: string;
  items: string[];
  negative?: boolean;
}) {
  return (
    <article className={`relative overflow-hidden rounded-[28px] border p-7 ${
      negative
        ? "border-white/10 bg-white/[0.025]"
        : "border-plur-red/30 bg-gradient-to-br from-plur-red/12 via-plur-card to-cyan-400/5 shadow-[0_24px_80px_rgba(255,70,85,.10)]"
    }`}>
      {!negative && <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-plur-red/15 blur-3xl" />}
      <div className="relative">
        <p className={`text-[10px] font-bold uppercase tracking-[.18em] ${negative ? "text-plur-muted" : "text-plur-red"}`}>
          {subtitle}
        </p>
        <h3 className="mt-3 font-rajdhani text-3xl font-black uppercase">{title}</h3>
        <div className="mt-7 space-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border border-plur-border bg-plur-bg/60 px-4 py-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                negative ? "bg-white/5 text-red-300" : "bg-plur-green/10 text-plur-green"
              }`}>
                {negative ? <X size={15} /> : <Check size={15} />}
              </span>
              <span className="text-sm text-white/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-[.2em] text-plur-red">{eyebrow}</p>
      <h2 className="mt-3 font-rajdhani text-3xl font-black uppercase leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-plur-muted md:text-base">{description}</p>
    </div>
  );
}

function HeroMetric({ value, label, green = false }: { value: string; label: string; green?: boolean }) {
  return (
    <div className="rounded-2xl border border-plur-border bg-plur-bg/60 p-4 backdrop-blur-xl">
      <p className={`font-rajdhani text-2xl font-black ${green ? "text-plur-green" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.15em] text-plur-muted">{label}</p>
    </div>
  );
}

function MiniCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-plur-border bg-plur-bg/65 p-4">
      <div className="flex items-center gap-2 text-plur-red">{icon}<span className="text-[9px] uppercase tracking-[.14em] text-plur-muted">{label}</span></div>
      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-plur-border bg-plur-card/55 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-plur-red/10 text-plur-red">{icon}</div>
      <p className="mt-6 font-rajdhani text-4xl font-black">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[.15em] text-plur-muted">{label}</p>
    </div>
  );
}