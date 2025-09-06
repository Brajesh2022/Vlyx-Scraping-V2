import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// CORS headers for public API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { 
          success: false,
          error: 'URL is required',
          message: 'Please provide a valid URL to get final URL'
        }, 
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid URL format',
          message: 'Please provide a valid URL with proper format (e.g., https://example.com)'
        }, 
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log(`Public URL API: Starting URL resolution for: ${url}`);

    // Launch browser with stealth configuration (lighter than full scraping)
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-networking',
        '--disable-sync',
        '--metrics-recording-only',
        '--disable-default-apps',
        '--mute-audio',
        '--no-report-upload',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-domain-reliability',
        '--disable-component-update',
        '--disable-client-side-phishing-detection',
        '--disable-datasaver-prompt',
        '--disable-desktop-notifications',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    });

    const page = await browser.newPage();

    // Basic stealth techniques for URL resolution
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      try { delete (navigator as any).webdriver; } catch (_) { // Ignore if property is read-only }

      Object.defineProperty(navigator, 'plugins', {
        get: () => ({
          length: 3,
          0: { name: 'Chrome PDF Plugin' },
          1: { name: 'Chrome PDF Viewer' },
          2: { name: 'Native Client' }
        }),
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    // Set realistic user agent
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    // Set viewport
    await page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false,
    });

    // Set realistic headers
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    });

    // Block heavy resources for faster URL resolution
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'media' || resourceType === 'font' || resourceType === 'stylesheet') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for potential redirects and Cloudflare bypass
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Basic Cloudflare detection for URL resolution
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Public URL API: Attempt ${attempts}: Checking for redirects...`);

      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      // Check for Cloudflare challenge
      const cloudflareDetected = [
        pageTitle.includes('Just a moment'),
        pageTitle.includes('Checking your browser'),
        pageTitle.includes('Please wait'),
        pageTitle.includes('Attention Required'),
        pageContent.includes('cf-browser-verification'),
        pageContent.includes('cf-challenge-running'),
      ].some(indicator => indicator);

      if (!cloudflareDetected) {
        console.log(`Public URL API: No Cloudflare challenge detected on attempt ${attempts}`);
        break;
      }

      console.log(`Public URL API: Cloudflare challenge detected on attempt ${attempts}, waiting...`);
      
      // Simple wait for Cloudflare
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Try to detect completion
      try {
        await page.waitForNavigation({ 
          waitUntil: 'domcontentloaded', 
          timeout: 10000 
        }).catch(() => console.log('Public URL API: Navigation timeout'));
      } catch (_) {
        console.log(`Public URL API: Detection timeout on attempt ${attempts}`);
      }
    }

    // Get final URL and basic page info
    const finalUrl = page.url();
    const pageTitle = await page.title();
    
    // Parse URL components
    const urlObj = new URL(finalUrl);
    const domain = urlObj.hostname;
    const protocol = urlObj.protocol;
    const pathname = urlObj.pathname;
    const search = urlObj.search;
    const hash = urlObj.hash;

    console.log(`Public URL API: Successfully resolved: ${url} -> ${finalUrl}`);

    return NextResponse.json({
      success: true,
      data: {
        original_url: url,
        final_url: finalUrl,
        title: pageTitle,
        domain: domain,
        protocol: protocol,
        pathname: pathname,
        search: search,
        hash: hash,
        redirected: url !== finalUrl,
        timestamp: new Date().toISOString(),
      },
      message: 'Final URL resolved successfully'
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Public URL API: Resolution error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'URL resolution failed',
      message: error instanceof Error ? error.message : 'An unknown error occurred while resolving the URL',
      details: error instanceof Error ? error.stack : undefined,
    }, { 
      status: 500,
      headers: corsHeaders
    });
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}

// Also support GET requests with URL as query parameter
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { 
        success: false,
        error: 'URL parameter is required',
        message: 'Please provide a URL parameter. Example: /api/public/url?url=https://example.com',
        usage: {
          method: 'GET',
          example: '/api/public/url?url=https://example.com',
          alternative: 'POST with JSON body: {"url": "https://example.com"}'
        }
      }, 
      { 
        status: 400,
        headers: corsHeaders
      }
    );
  }

  // Create a new request with the URL in the body for the POST handler
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ url }),
  });

  return POST(postRequest);
}
