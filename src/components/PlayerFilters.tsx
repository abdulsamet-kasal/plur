"use client";

import { useState } from "react";
import {
  ChevronDown,
  Search,
  RotateCcw,
  Swords,
  Signal,
  Diamond,
  Mic,
  Languages,
  UserRound,
  TrendingUp,
  Circle,
  X,
} from "lucide-react";

type FilterItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const filters: FilterItem[] = [
  {
    label: "Oyun Modu",
    value: "Rekabetçi",
    icon: <Swords size={17} />,
  },
  {
    label: "Sunucu",
    value: "İstanbul",
    icon: <Signal size={17} />,
  },
  {
    label: "Rank",
    value: "Platinum+",
    icon: <Diamond size={17} />,
  },
  {
    label: "Rol",
    value: "Duelist",
    icon: <Swords size={17} />,
  },
  {
    label: "Mikrofon",
    value: "Farketmez",
    icon: <Mic size={17} />,
  },
  {
    label: "Dil",
    value: "Türkçe",
    icon: <Languages size={17} />,
  },
  {
    label: "Yaş",
    value: "18 - 25",
    icon: <UserRound size={17} />,
  },
  {
    label: "Win Rate",
    value: "%40+",
    icon: <TrendingUp size={17} />,
  },
  {
    label: "Çevrimiçi Durum",
    value: "Çevrimiçi",
    icon: <Circle size={17} />,
  },
];

const initialTags = [
  "Rekabetçi",
  "İstanbul",
  "Platinum+",
  "Duelist",
  "Türkçe",
  "18 - 25",
  "%40+",
  "Çevrimiçi",
];

export default function PlayerFilters() {
  const [activeTags, setActiveTags] = useState<string[]>(initialTags);

  const removeTag = (tag: string) => {
    setActiveTags((currentTags) =>
      currentTags.filter((currentTag) => currentTag !== tag),
    );
  };

  const clearFilters = () => {
    setActiveTags([]);
  };

  return (
    <section className="rounded-2xl border border-plur-border bg-plur-card/70 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {filters.slice(0, 5).map((filter) => (
          <FilterButton key={filter.label} filter={filter} />
        ))}

        <button
          type="button"
          className="btn-primary flex min-h-[64px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold sm:col-span-2 xl:col-span-1"
        >
          <Search size={18} />
          Oyuncu Bul
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {filters.slice(5).map((filter) => (
          <FilterButton key={filter.label} filter={filter} />
        ))}

        <button
          type="button"
          onClick={clearFilters}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-xl border border-plur-border bg-plur-bg px-5 text-sm font-semibold text-plur-muted transition hover:border-plur-red/50 hover:text-white sm:col-span-2 xl:col-span-1"
        >
          <RotateCcw size={17} />
          Filtreleri Temizle
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-plur-border/70 pt-4">
        <span className="mr-1 text-xs font-medium text-plur-muted">
          Aktif Filtreler:
        </span>

        {activeTags.length === 0 ? (
          <span className="text-xs text-plur-muted">
            Aktif filtre bulunmuyor.
          </span>
        ) : (
          activeTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="group flex items-center gap-2 rounded-lg border border-plur-border bg-plur-bg px-3 py-2 text-xs font-medium text-white transition hover:border-plur-red/50 hover:bg-plur-red/5"
            >
              <span
                className={
                  tag === "Çevrimiçi"
                    ? "h-2 w-2 rounded-full bg-plur-green"
                    : "h-2 w-2 rounded-full bg-plur-red"
                }
              />

              {tag}

              <X
                size={13}
                className="text-plur-muted transition group-hover:text-plur-red"
              />
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function FilterButton({ filter }: { filter: FilterItem }) {
  return (
    <button
      type="button"
      className="group flex min-h-[64px] items-center gap-3 rounded-xl border border-plur-border bg-plur-bg px-4 py-3 text-left transition hover:border-plur-red/40 hover:bg-[#0d131d]"
    >
      <span className="text-plur-red transition group-hover:scale-110">
        {filter.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-plur-muted">
          {filter.label}
        </span>

        <span className="mt-1 block truncate text-sm font-semibold text-white">
          {filter.value}
        </span>
      </span>

      <ChevronDown
        size={16}
        className="shrink-0 text-plur-muted transition group-hover:text-white"
      />
    </button>
  );
}