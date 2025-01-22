import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface ScrapedData {
  title: string;
  price: number | null;
  comparisonPrice: number | null;
  imageUrl: string;
  description: string;
}

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const data: ScrapedData = { title: '', price: null, comparisonPrice: null, imageUrl: '', description: '' };

    const titleSelectors = ['h1', '[data-testid="product-title"]', '.product-title', '.product-name', '[itemprop="name"]', '#title'];
    const priceSelectors = ['.price-new', '.product_price', '.price-wrapper .price', '.price-wrapper span[data-price-type="finalPrice"]', 'span[data-price-type="finalPrice"]', '.special-price .price', '.product-info-price .price', '.price', '[data-price]', '[data-product-price]', '*:contains("zł")', '*:contains(" PLN")', '*:contains("złotych")'];
    const oldPriceSelectors = ['.old-price', '.regular-price', '.price-wrapper-old', '.crossed-price', '.previous-price', '.original-price', '.compare-price', '.was-price', '.list-price', 'del .price', 'del:contains("zł")', 'del:contains("PLN")'];
    const imageSelectors = ['[property="og:image"]', '[itemprop="image"]', '.product-image img', '#main-image', '.primary-image'];
    const descriptionSelectors = ['[itemprop="description"]', '.product-description', '#description', '.description'];

    function extractPolishPrice(text: string): number | null {
      text = text.toLowerCase().trim()
        .replace(/\bzł\b/g, '')
        .replace(/\bpln\b/g, '')
        .replace(/\bzłotych\b/g, '')
        .replace(/[^\d,.]/g, '')
        .replace(',', '.');
      
      const match = text.match(/\d+\.?\d*/);
      if (match) {
        const price = parseFloat(match[0]);
        return !isNaN(price) ? price : null;
      }
      return null;
    }

    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        data.title = element.text().trim();
        break;
      }
    }

    for (const selector of priceSelectors) {
      const elements = $(selector).toArray();
      
      for (const element of elements) {
        const $el = $(element);
        const priceText: string = $el.text().trim();
        
        if (!priceText || priceText.length > 50) continue;
        
        const isStrikethrough = $el.closest('del, .old-price, .crossed-price, .regular-price').length > 0;
        if (isStrikethrough) continue;
        
        const price = extractPolishPrice(priceText);
        if (price !== null && price > 0 && price < 1000000) {
          data.price = price;
          break;
        }
      }
      
      if (data.price) break;
    }

    for (const selector of oldPriceSelectors) {
      const elements = $(selector);
      for (const element of elements) {
        const priceText = $(element).text().trim();
        const price = extractPolishPrice(priceText);
        
        if (price !== null) {
          data.comparisonPrice = price;
          break;
        }
      }
      if (data.comparisonPrice !== null) break;
    }

    const structuredData = $('script[type="application/ld+json"]').toArray()
      .map(element => {
        try {
          return JSON.parse($(element).html() || '');
        } catch {
          return null;
        }
      })
      .filter(data => data);

    if (!data.price) {
      for (const jsonLD of structuredData) {
        const price = jsonLD.offers?.price || jsonLD.price;
        if (price) {
          data.price = parseFloat(price);
          break;
        }
      }
    }

    for (const selector of imageSelectors) {
      const element = $(selector);
      if (element.length) {
        data.imageUrl = element.attr('src') || element.attr('content');
        if (data.imageUrl && !data.imageUrl.startsWith('http')) {
          data.imageUrl = new URL(data.imageUrl, url).toString();
        }
        break;
      }
    }

    for (const selector of descriptionSelectors) {
      const element = $(selector).first();
      if (element.length) {
        data.description = element.text().trim();
        break;
      }
    }

    if (!data.title) {
      data.title = $('meta[property="og:title"]').attr('content') || 
                   $('meta[name="title"]').attr('content');
    }

    if (!data.description) {
      data.description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="description"]').attr('content');
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 });
  }
}
