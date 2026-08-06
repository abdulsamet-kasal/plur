"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Crosshair,
  Swords,
  TrendingUp,
} from "lucide-react";

const tabs = ["Genel Bakış", "Rekabetçi", "Ajanlar"];

const metrics = [
  {
    label: "K/D",
    value: "1.32",
    change: "+8.4%",
    icon: Swords,
  },
  {
    label: "ADR",
    value: "156.7",
    change: "+12.1",
    icon: Activity,
  },
  {
    label: "HS%",
    value: "24.6%",
    change: "+3.2%",
    icon: Crosshair,
  },
];

const recentMatches = [
  { result: "G", score: "13-8" },
  { result: "G", score: "13-10" },
  { result: "M", score: "9-13" },
  { result: "G", score: "13-6" },
  { result: "G", score: "14-12" },
];

export default function GameStats() {
  const [activeTab, setActiveTab] = useState("Genel Bakış");

  const winRate = 52;
  const circumference = 2 * Math.PI * 42;
  const progress = (winRate / 100) * circumference;

  return (
    <section className="relative min-h-[300px] overflow-hidden rounded-2xl border border-plur-border bg-plur-card/70 p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-plur-red/10 blur-3xl" />

      <div className="relative">
        {/* Başlık */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={17} className="text-plur-red" />

              <h3 className="font-rajdhani text-lg font-black tracking-[0.06em] text-white">
                OYUN İSTATİSTİKLERİM
              </h3>
            </div>

            <p className="mt-1 text-[11px] text-plur-muted">
              Son 30 günlük performansın
            </p>
          </div>

          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-plur-red transition hover:text-white"
          >
            Tümü
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Sekmeler */}
        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-plur-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative shrink-0 px-3 py-2 text-[11px] font-semibold transition ${
                activeTab === tab
                  ? "text-white"
                  : "text-plur-muted hover:text-white"
              }`}
            >
              {tab}

              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-plur-red shadow-[0_0_12px_rgba(255,70,85,0.45)]" />
              )}
            </button>
          ))}
        </div>

        {/* Win Rate + K/D + ADR + HS% ortak kutu */}
        <div className="mt-5 rounded-2xl border border-plur-border bg-plur-bg/55 p-4">
          <div className="grid items-center gap-4 grid-cols-[105px_1fr]">
            {/* Win Rate */}
            <div className="flex items-center justify-center">
              <div className="relative h-28 w-28 shrink-0">
                <svg
                  className="h-full w-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="8"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#ff4655"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progress} ${circumference}`}
                    className="drop-shadow-[0_0_10px_rgba(255,70,85,0.35)]"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-rajdhani text-2xl font-black text-white">
                    {winRate}%
                  </span>

                  <span className="text-[9px] uppercase tracking-wider text-plur-muted">
                    Win Rate
                  </span>
                </div>
              </div>
            </div>

            {/* K/D - ADR - HS% */}
            <div className="grid min-w-0 grid-cols-3 divide-x divide-white/10">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.label}
                    className="min-w-0 px-2 py-2 text-center sm:px-3"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Icon
                        size={13}
                        className="shrink-0 text-plur-red"
                      />

                      <span className="truncate text-[8px] font-bold text-plur-green sm:text-[9px]">
                        {metric.change}
                      </span>
                    </div>

                    <p className="mt-4 font-rajdhani text-xl font-black text-white">
                      {metric.value}
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-plur-muted">
                      {metric.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Son 5 maç */}
        <div className="mt-5 rounded-2xl border border-plur-border bg-plur-bg/55 p-4 shadow-[0_0_35px_rgba(255,70,85,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white">Son 5 Maç</p>

              <p className="mt-0.5 text-[9px] text-plur-muted">
                4 galibiyet, 1 mağlubiyet
              </p>
            </div>

            <span className="shrink-0 text-[10px] font-semibold text-plur-green">
              4 Maç Seri
            </span>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {recentMatches.map((match, index) => (
              <div
                key={`${match.score}-${index}`}
                className={`rounded-xl border p-2 text-center ${
                  match.result === "G"
                    ? "border-plur-green/20 bg-plur-green/10"
                    : "border-plur-red/20 bg-plur-red/10"
                }`}
              >
                <p
                  className={`text-[10px] font-black ${
                    match.result === "G"
                      ? "text-plur-green"
                      : "text-plur-red"
                  }`}
                >
                  {match.result}
                </p>

                <p className="mt-1 text-[9px] font-semibold text-white">
                  {match.score}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}