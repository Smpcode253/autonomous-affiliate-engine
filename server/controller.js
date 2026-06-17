const { saveProduct, listProducts } = require("./db.js");

/** Auto-detect affiliate links */
function detectAffiliateLink(url) {
  const patterns = [
    /amazon\.com.*tag=([a-zA-Z0-9-]+)/i,
    /partner=([a-zA-Z0-9]+)/i,
    /ref=([a-zA-Z0-9]+)/i,
    /affiliate/i
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { isAffiliate: true, network: 'Detected', tag: match[1] || 'auto' };
    }
  }

  return {
    isAffiliate: false,
    suggestedAffiliate: url + (url.includes('?') ? '&' : '?') + 'tag=YOURTAGHERE',
    network: 'Manual'
  };
}

function healthCheck(req, res) {
  return res.json({ status: "backend online" });
}

async function ingestProductController(req, res) {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    const { scrapeProduct } = require('./scraper.js');
    let productData = await scrapeProduct(url);
    productData.affiliateLink = detectAffiliateLink(url);
    
    const saved = saveProduct(productData);
    return res.json({ status: "ingested", product: saved });
  } catch (error) {
    console.error("Ingest error:", error);
    return res.status(500).json({ error: "Failed to scrape product", details: error.message });
  }
}

async function generateCampaignController(req, res) {
  const { product, platform, description } = req.body || {};
  if (!product || !platform) return res.status(400).json({ error: "Missing product or platform" });

  try {
    const campaign = await generateAICampaign(product, platform, description);
    return res.json({ status: "campaign_generated", campaign });
  } catch (error) {
    console.error("AI error:", error);
    // Fallback
    return res.json({
      status: "campaign_generated_fallback",
      campaign: {
        headline: `Boost ${product} on ${platform}`,
        hook: `Turn viewers into buyers!`,
        bullets: ["Premium quality", "Limited offer", "Easy to use"],
        callToAction: `Get ${product} now →`,
        platform,
        createdAt: new Date().toISOString()
      }
    });
  }
}

function listProductsController(req, res) {
  return res.json({ products: listProducts() });
}

async function generateAICampaign(product, platform, description = '') {
  require('dotenv').config();
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) throw new Error("No XAI_API_KEY");

  const prompt = `Create a high-converting \( {platform} campaign for " \){product}". ${description ? `Details: ${description}` : ''}

Return ONLY valid JSON:
{
  "headline": "Short catchy headline",
  "hook": "Strong video hook",
  "bullets": ["bullet1", "bullet2", "bullet3"],
  "callToAction": "Strong CTA",
  "platform": "${platform}"
}`;

  const axios = require('axios');
  const response = await axios.post('https://api.x.ai/v1/chat/completions', {
    model: "grok-beta",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500
  }, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });

  const content = response.data.choices[0].message.content;
  return JSON.parse(content);
}

module.exports = {
  healthCheck,
  ingestProductController,
  generateCampaignController,
  listProductsController
};
