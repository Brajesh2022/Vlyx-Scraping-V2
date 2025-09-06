import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`Starting scrape for: ${url}`);

    // Launch browser with maximum stealth configuration
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

    // Enhanced stealth techniques
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property completely
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      try { delete (navigator as any).webdriver; } catch (_) { // Ignore if property is read-only }

      // Override plugins with realistic values
      Object.defineProperty(navigator, 'plugins', {
        get: () => ({
          length: 3,
          0: { name: 'Chrome PDF Plugin' },
          1: { name: 'Chrome PDF Viewer' },
          2: { name: 'Native Client' }
        }),
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Override chrome runtime
      Object.defineProperty(window, 'chrome', {
        get: () => ({
          runtime: {},
          loadTimes: () => ({}),
          csi: () => ({}),
        }),
      });

      // Mock screen properties
      Object.defineProperty(screen, 'colorDepth', {
        get: () => 24,
      });

      // Mock connection
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          effectiveType: '4g',
          rtt: 100,
          downlink: 2,
        }),
      });

      // Override toString methods to hide automation
      const originalToString = Function.prototype.toString;
      Function.prototype.toString = function() {
        if (this === navigator.webdriver) {
          return 'function webdriver() { [native code] }';
        }
        return originalToString.call(this);
      };
    });

    // Set realistic user agent
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    // Set viewport with realistic dimensions
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

    // Block unnecessary resources but allow scripts for Cloudflare
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'media' || resourceType === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate with extended timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for initial page load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Enhanced Cloudflare detection and bypass
    let attempts = 0;
    const maxAttempts = 25;
    let lastTitle = '';
    let stableCount = 0;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}: Checking for Cloudflare challenge...`);

      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      // Check if page is stable (title hasn't changed)
      if (pageTitle === lastTitle) {
        stableCount++;
      } else {
        stableCount = 0;
        lastTitle = pageTitle;
      }

      // Multiple ways to detect Cloudflare challenge
      const cloudflareIndicators = [
        pageTitle.includes('Just a moment'),
        pageTitle.includes('Checking your browser'),
        pageTitle.includes('Please wait'),
        pageTitle.includes('Attention Required'),
        pageContent.includes('cf-browser-verification'),
        pageContent.includes('cf-challenge-running'),
        pageContent.includes('challenge-platform'),
        pageContent.includes('DDoS protection by Cloudflare'),
        pageContent.includes('Cloudflare Ray ID'),
        pageContent.includes('cf-ray'),
        pageContent.includes('__cf_chl_jschl_tk__'),
        pageContent.includes('chl-jschl-answer'),
        pageContent.includes('cf-wrapper'),
        pageContent.includes('cf-spinner-please-wait'),
        await page.$('.cf-browser-verification') !== null,
        await page.$('.cf-challenge-running') !== null,
        await page.$('#challenge-running') !== null,
        await page.$('[data-ray]') !== null,
        await page.$('.cf-wrapper') !== null,
      ];

      const cloudflareDetected = cloudflareIndicators.some(indicator => indicator);

      if (!cloudflareDetected && stableCount >= 2) {
        console.log(`No Cloudflare challenge detected and page is stable on attempt ${attempts}`);
        break;
      }

      if (cloudflareDetected) {
        console.log(`Cloudflare challenge detected on attempt ${attempts}, waiting...`);
        
        // Simulate realistic human behavior
        try {
          // Random mouse movements
          await page.mouse.move(Math.random() * 1000, Math.random() * 800);
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          
          // Try to click somewhere on the page
          await page.mouse.click(Math.random() * 1000, Math.random() * 800);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Random scroll
          await page.mouse.wheel(0, Math.random() * 500);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (_) {
          console.log('Human simulation failed:', e.message);
        }
        
        // Wait for Cloudflare to process
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Try to detect completion
        try {
          await Promise.race([
            page.waitForNavigation({ 
              waitUntil: 'domcontentloaded', 
              timeout: 20000 
            }).catch(() => console.log('Navigation timeout')),
            
            page.waitForFunction(
              () => {
                const title = document.title;
                const body = document.body.innerHTML;
                return !title.includes('Just a moment') && 
                       !title.includes('Checking your browser') &&
                       !title.includes('Please wait') &&
                       !title.includes('Attention Required') &&
                       !body.includes('cf-browser-verification') &&
                       !body.includes('cf-challenge-running');
              },
              { timeout: 20000 }
            ).catch(() => console.log('Content change timeout')),
          ]);
        } catch (_) {
          console.log(`Detection timeout on attempt ${attempts}`);
        }
        
        // Additional wait
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        // Page might be loading, wait a bit more
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Final verification
    const finalTitle = await page.title();
    const finalContent = await page.content();
    
    // Check if we're still on Cloudflare challenge
    const stillOnCloudflare = [
      finalTitle.includes('Just a moment'),
      finalTitle.includes('Checking your browser'),
      finalTitle.includes('Please wait'),
      finalTitle.includes('Attention Required'),
      finalContent.includes('cf-browser-verification'),
      finalContent.includes('cf-challenge-running'),
      finalContent.includes('challenge-platform'),
    ].some(indicator => indicator);
    
    if (stillOnCloudflare) {
      console.log('Cloudflare challenge could not be bypassed after all attempts');
      return NextResponse.json({
        error: 'Unable to bypass Cloudflare protection',
        details: 'This website uses very advanced Cloudflare protection that requires human verification. The automated bypass was unsuccessful after multiple attempts.',
      }, { status: 429 });
    }

    // Additional wait for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the final page source
    const pageSource = await page.content();
    const pageTitle = await page.title();
    const finalUrl = page.url();

    console.log(`Successfully scraped: ${finalUrl} (Title: ${pageTitle})`);

    return NextResponse.json({
      success: true,
      data: {
        url: finalUrl,
        title: pageTitle,
        source: pageSource,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    return NextResponse.json({
      error: 'Failed to scrape the website',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}
