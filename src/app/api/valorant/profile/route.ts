"use server";

import { NextRequest, NextResponse } from "next/server";

const HENRIK_BASE_URL = "https://api.henrikdev.xyz/valorant";
const VALID_REGIONS = new Set(["eu", "na", "latam", "br", "ap", "kr"]);
const VALID_PLATFORMS = new Set(["pc", "console"]);

type HenrikResponse<T> = {
  status?: number;
  data?: T;
  errors?: Array<{
    code?: number;
    message?: string;
    details?: string;
  }>;
};

async function fetchHenrik<T>(
  path: string,
  apiKey: string
): Promise<HenrikResponse<T>> {
  const response = await fetch(`${HENRIK_BASE_URL}${path}`, {
    headers: {
      Authorization: apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as HenrikResponse<T>;

  if (!response.ok) {
    const apiMessage =
      body.errors?.[0]?.message ||
      body.errors?.[0]?.details ||
      `HenrikDev API isteği başarısız oldu (${response.status}).`;

    throw new Error(apiMessage);
  }

  return body;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.HENRIKDEV_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "HENRIKDEV_API_KEY bulunamadı. .env.local dosyasını kontrol et.",
      },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const rawName = searchParams.get("name")?.trim();
  const rawTag = searchParams.get("tag")?.trim();
  const region = (searchParams.get("region") || "eu").toLowerCase();
  const platform = (searchParams.get("platform") || "pc").toLowerCase();

  if (!rawName || !rawTag) {
    return NextResponse.json(
      { error: "Riot kullanıcı adı ve tag zorunludur." },
      { status: 400 }
    );
  }

  if (!VALID_REGIONS.has(region)) {
    return NextResponse.json(
      { error: "Geçersiz bölge seçildi." },
      { status: 400 }
    );
  }

  if (!VALID_PLATFORMS.has(platform)) {
    return NextResponse.json(
      { error: "Geçersiz platform seçildi." },
      { status: 400 }
    );
  }

  const name = encodeURIComponent(rawName);
  const tag = encodeURIComponent(rawTag);

  try {
    const [accountResult, mmrResult, matchesResult] = await Promise.all([
      fetchHenrik<unknown>(`/v2/account/${name}/${tag}`, apiKey),
      fetchHenrik<unknown>(
        `/v3/mmr/${region}/${platform}/${name}/${tag}`,
        apiKey
      ),
      fetchHenrik<unknown>(
        `/v4/matches/${region}/${platform}/${name}/${tag}?mode=competitive&size=5`,
        apiKey
      ),
    ]);

    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      account: accountResult.data ?? null,
      mmr: mmrResult.data ?? null,
      matches: matchesResult.data ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Valorant bilgileri alınırken bilinmeyen bir hata oluştu.";

    const normalizedMessage = message.toLocaleLowerCase("tr-TR");

    let status = 502;

    if (
      normalizedMessage.includes("not found") ||
      normalizedMessage.includes("bulunamadı")
    ) {
      status = 404;
    } else if (normalizedMessage.includes("rate limit")) {
      status = 429;
    }

    return NextResponse.json({ error: message }, { status });
  }
}