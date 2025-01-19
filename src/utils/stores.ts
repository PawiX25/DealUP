import stores from '../../sklepy.json';

export function detectStore(url: string): string | null {
  if (!url) return null;
  
  try {
    const hostname = new URL(url).hostname;
    return Object.entries(stores).find(([domain]) => 
      hostname.includes(domain.toLowerCase())
    )?.[1] || null;
  } catch {
    return null;
  }
}
