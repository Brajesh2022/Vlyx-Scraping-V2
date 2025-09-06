# Vlyx Scraping V2 🚀

A powerful web scraper API built with Next.js that can bypass Cloudflare protection and extract source code from any website.

## Features

- 🛡️ **Advanced Cloudflare Bypass** - Uses stealth techniques to bypass anti-bot measures
- 🌐 **No CORS Issues** - Full CORS support for cross-origin requests
- ⚡ **High Performance** - Optimized with intelligent resource blocking
- 📱 **Multiple APIs** - Clean HTML, JSON Source, and URL Resolution endpoints
- 💾 **Standalone Tool** - Downloadable HTML tool for offline use
- 🎨 **Beautiful UI** - Modern interface with API documentation

## API Endpoints

### 1. Clean HTML API (Recommended)
```bash
POST /api/public/html
```
Returns clean, unescaped HTML directly - perfect for copy-paste and direct use.

### 2. JSON Source API
```bash
POST /api/public/source
```
Returns HTML source with metadata in JSON format.

### 3. Final URL API
```bash
POST /api/public/url
```
Resolves final URLs after all redirects.

## Quick Start

### Using the API

```javascript
// Clean HTML API
const response = await fetch("https://your-domain.com/api/public/html", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://example.com"
  })
});

const cleanHtml = await response.text();
console.log(cleanHtml);
```

### Using cURL

```bash
# Get clean HTML
curl -X POST "https://your-domain.com/api/public/html" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -o scraped-page.html
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/brajeshcodes/vlyx-scraping-v2.git
cd vlyx-scraping-v2
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brajeshcodes/vlyx-scraping-v2)

## Project Structure

```
├── app/
│   ├── api/
│   │   └── public/          # Public API endpoints
│   ├── api-docs/            # API documentation page
│   └── page.tsx             # Main scraper interface
├── components/              # Reusable UI components
├── lib/                     # Utility functions
├── public/                  # Static files
└── standalone-scraper.html  # Downloadable standalone tool
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **Puppeteer** - Headless browser automation
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components

## Advanced Features

- **Stealth Mode**: Advanced browser fingerprint masking
- **Human-like Behavior**: Random delays and mouse movements
- **Resource Optimization**: Blocks unnecessary resources for faster scraping
- **Error Handling**: Comprehensive error handling and retry logic
- **Rate Limiting**: Built-in protection against abuse

## API Documentation

Visit `/api-docs` on your deployed instance for comprehensive API documentation with interactive testing.

## Standalone Tool

Download the standalone HTML tool from `/web-scraper-tool.html` - a complete web scraper that works offline and connects to your API.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ by [Brajesh Codes](https://github.com/brajeshcodes)
