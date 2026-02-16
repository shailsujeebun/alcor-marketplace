import { NextRequest, NextResponse } from 'next/server';

type TranslationCache = Map<string, string>;

const MAX_TEXTS_PER_REQUEST = 200;
const MAX_TEXT_LENGTH = 1000;
const MAX_CACHE_SIZE = 10000;
const GOOGLE_REQUEST_PARALLELISM = 8;
const CYRILLIC_REGEX = /[\u0400-\u04FF]/;

function getCache(): TranslationCache {
  const globalRef = globalThis as typeof globalThis & {
    __translationCache?: TranslationCache;
  };

  if (!globalRef.__translationCache) {
    globalRef.__translationCache = new Map<string, string>();
  }

  return globalRef.__translationCache;
}

function setCachedValue(cache: TranslationCache, key: string, value: string) {
  if (cache.size >= MAX_CACHE_SIZE) {
    cache.clear();
  }
  cache.set(key, value);
}

async function translateWithGoogle(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return text;
  }

  const translated = payload[0]
    .map((segment: unknown) => {
      if (!Array.isArray(segment)) return '';
      return typeof segment[0] === 'string' ? segment[0] : '';
    })
    .join('');

  return translated || text;
}

async function translateTexts(texts: string[], cache: TranslationCache): Promise<Record<string, string>> {
  const translations: Record<string, string> = {};
  const missing: string[] = [];

  for (const text of texts) {
    const cacheKey = `en:${text}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      translations[text] = cached;
      continue;
    }
    missing.push(text);
  }

  if (!missing.length) return translations;

  let cursor = 0;
  const worker = async () => {
    while (true) {
      const current = cursor;
      cursor += 1;
      if (current >= missing.length) return;

      const text = missing[current];
      const cacheKey = `en:${text}`;
      try {
        const translated = await translateWithGoogle(text);
        setCachedValue(cache, cacheKey, translated);
        translations[text] = translated;
      } catch {
        translations[text] = text;
      }
    }
  };

  const workerCount = Math.min(GOOGLE_REQUEST_PARALLELISM, missing.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return translations;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsedBody =
      typeof body === 'object' && body !== null
        ? (body as { texts?: unknown })
        : {};
    const incomingTexts = Array.isArray(parsedBody.texts) ? parsedBody.texts : [];

    const seen = new Set<string>();
    const texts: string[] = [];

    for (const value of incomingTexts) {
      if (typeof value !== 'string') continue;
      const normalized = value.trim().slice(0, MAX_TEXT_LENGTH);
      if (!normalized) continue;
      if (!CYRILLIC_REGEX.test(normalized)) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      texts.push(normalized);
      if (texts.length >= MAX_TEXTS_PER_REQUEST) break;
    }

    const cache = getCache();
    const translations = await translateTexts(texts, cache);

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ translations: {} }, { status: 200 });
  }
}
