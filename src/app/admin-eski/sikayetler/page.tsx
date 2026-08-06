"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function AdminReportsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadReports() {
    const { data } = await supabase
      .from("user_reports")
      .select("id, reporter_id, reported_id, conversation_id, reason, description, status, created_at")
      .order("created_at", { ascending: false });

    setReports(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadReports();
  }, []);

  async function updateStatus(id: string, status: "resolved" | "dismissed") {
    setActionId(id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("user_reports")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
      })
      .eq("id", id);

    if (!error) {
      setReports((current) =>
        current.map((report) =>
          report.id === id ? { ...report, status } : report
        )
      );
    }

    setActionId(null);
  }

  return (
    <main className="px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <h1 className="font-rajdhani text-4xl font-black">Şikâyet Yönetimi</h1>

        <section className="mt-6 overflow-hidden rounded-2xl border border-plur-border bg-plur-card/60">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoaderCircle className="animate-spin text-plur-red" />
            </div>
          ) : (
            <div className="divide-y divide-plur-border">
              {reports.map((report) => (
                <article key={report.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-yellow-400/10 px-2 py-1 text-[9px] font-bold text-yellow-300">
                          {report.reason}
                        </span>
                        <span className="rounded-lg bg-plur-bg px-2 py-1 text-[9px] text-plur-muted">
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white">
                        {report.description || "Açıklama eklenmemiş."}
                      </p>
                      <p className="mt-2 text-[10px] text-plur-muted">
                        {new Date(report.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionId === report.id}
                          onClick={() => void updateStatus(report.id, "resolved")}
                          className="flex h-10 items-center gap-2 rounded-xl bg-plur-green/10 px-4 text-xs font-bold text-plur-green"
                        >
                          <CheckCircle2 size={15} />
                          Çözüldü
                        </button>
                        <button
                          type="button"
                          disabled={actionId === report.id}
                          onClick={() => void updateStatus(report.id, "dismissed")}
                          className="flex h-10 items-center gap-2 rounded-xl bg-plur-red/10 px-4 text-xs font-bold text-plur-red"
                        >
                          <XCircle size={15} />
                          Reddet
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
