const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

/**
 * Advanced web scraper with Puppeteer fallback for dynamic sites
 */
async function scrapeWithPuppeteer(url) {
  let browser;
  try {
    console.log(`Puppeteer scraping: ${url}`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const productData = await page.evaluate(() => {
      return {
        title: document.querySelector('h1')?.innerText.trim() || document.title.split('-')[0].trim() || 'Untitled Product',
        price: document.querySelector('.price, [class*="price"], .a-price')?.innerText.trim() || '$N/A',
        description: document.querySelector('meta[name="description"]')?.content || 'No description available.'
      };
    });

    return productData;
  } catch (err) {
    console.error('Puppeteer failed:', err.message);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}

async function scrapeProduct(url) {
  try {
    console.log(`Scraping: ${url}`);
    
    // Try fast Axios + Cheerio first
    let productData;
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      let title = $('h1').first().text().trim() ||
                  $('[class*="title"]').first().text().trim() ||
                  $('title').text().split('-')[0].trim() ||
                  'Untitled Product';

      let price = $('.price, [class*="price"], .a-price, .product-price').first().text().trim() || '$XX.XX';

      let description = $('meta[name="description"]').attr('content') ||
                        $('.description, [class*="desc"]').first().text().trim().substring(0, 300) ||
                        'No description available.';

      productData = {
        url,
        title: title.replace(/\s+/g, ' ').trim(),
        description: description.replace(/\s+/g, ' ').trim(),
        price: price || '$N/A',
        source: 'web-scraper',
        scrapedAt: new Date().toISOString()
      };
    } catch (axiosError) {
      console.log('Axios failed, trying Puppeteer...');
      const puppeteerData = await scrapeWithPuppeteer(url);
      productData = {
        url,
        title: puppeteerData.title,
        description: puppeteerData.description,
        price: puppeteerData.price,
        source: 'puppeteer-scraper',
        scrapedAt: new Date().toISOString()
      };
    }

    return productData;
  } catch (error) {
    console.error(`Scraping failed:`, error.message);
    return {
      url,
      title: `Product from ${new URL(url).hostname}`,
      description: `Scraping error: ${error.message}`,
      price: '$N/A',
      source: 'fallback',
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = { scrapeProduct };