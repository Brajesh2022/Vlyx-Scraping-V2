import Link from 'next/link';
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, ExternalLink, Code, Globe, Zap, Shield } from 'lucide-react';

export default function ApiDocs() {
  const [testUrl, setTestUrl] = useState('https://example.com');
  const [sourceResponse, setSourceResponse] = useState('');
  const [urlResponse, setUrlResponse] = useState('');
  const [htmlResponse, setHtmlResponse] = useState('');
  const [loading, setLoading] = useState({ source: false, url: false, html: false });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testSourceApi = async () => {
    setLoading({ ...loading, source: true });
    try {
      const response = await fetch(`${baseUrl}/api/public/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });
      const data = await response.json();
      setSourceResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setSourceResponse(`Error: ${error}`);
    }
    setLoading({ ...loading, source: false });
  };

  const testUrlApi = async () => {
    setLoading({ ...loading, url: true });
    try {
      const response = await fetch(`${baseUrl}/api/public/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });
      const data = await response.json();
      setUrlResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setUrlResponse(`Error: ${error}`);
    }
    setLoading({ ...loading, url: false });
  };

  const testHtmlApi = async () => {
    setLoading({ ...loading, html: true });
    try {
      const response = await fetch(`${baseUrl}/api/public/html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });
      const data = await response.text();
      setHtmlResponse(data.substring(0, 2000) + (data.length > 2000 ? '\n\n... (truncated for display, full HTML available)' : ''));
    } catch (error) {
      setHtmlResponse(`Error: ${error}`);
    }
    setLoading({ ...loading, html: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Web Scraper API
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Powerful public APIs to extract page source and resolve final URLs from any website, 
            with advanced Cloudflare bypass and anti-bot protection
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Cloudflare Bypass
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              No CORS Issues
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public Access
            </Badge>
          </div>
        </div>

        {/* API Endpoints */}
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="html">Clean HTML API</TabsTrigger>
            <TabsTrigger value="source">JSON Source API</TabsTrigger>
            <TabsTrigger value="url">Final URL API</TabsTrigger>
          </TabsList>

          {/* Clean HTML API */}
          <TabsContent value="html" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Clean HTML API (Recommended)
                </CardTitle>
                <CardDescription>
                  Get clean, readable HTML directly - no JSON encoding, perfect for copy-paste and direct use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Recommended</Badge>
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Best for direct HTML usage</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This API returns clean, unescaped HTML that you can directly copy-paste, save to file, or use in iframes. No JSON parsing needed!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Endpoint</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <span>POST /api/public/html</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${baseUrl}/api/public/html`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Alternative</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <span>GET /api/public/html?url=...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${baseUrl}/api/public/html?url=https://example.com`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">JavaScript Example</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`// Get clean HTML directly
const response = await fetch("${baseUrl}/api/public/html", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://example.com"
  })
});

const cleanHtml = await response.text();
console.log("Clean HTML:", cleanHtml);

// Get metadata from headers
const originalUrl = response.headers.get("X-Original-URL");
const finalUrl = response.headers.get("X-Final-URL");
const pageTitle = response.headers.get("X-Page-Title");

// Use directly in DOM
document.getElementById("content").innerHTML = cleanHtml;

// Or save to file
const blob = new Blob([cleanHtml], { type: "text/html" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "scraped-page.html";
a.click();`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">cURL Example</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`# Save directly to file
curl -X POST "${baseUrl}/api/public/html" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}' \\
  -o scraped-page.html

# Or use GET method
curl "${baseUrl}/api/public/html?url=https://example.com" \\
  -o scraped-page.html`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JSON Source API */}
          <TabsContent value="source" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  JSON Source API
                </CardTitle>
                <CardDescription>
                  Extract complete HTML source code with metadata in JSON format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Endpoint</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <span>POST /api/public/source</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${baseUrl}/api/public/source`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Alternative</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <span>GET /api/public/source?url=...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${baseUrl}/api/public/source?url=https://example.com`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Response Format</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "success": true,
  "data": {
    "source": "<html>...</html>",
    "title": "Page Title",
    "url": "https://final-url.com",
    "original_url": "https://example.com",
    "timestamp": "2025-09-06T05:36:00.000Z",
    "source_length": 12345
  },
  "message": "Page source extracted successfully"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Final URL API */}
          <TabsContent value="url" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Final URL Resolution API
                </CardTitle>
                <CardDescription>
                  Get the final URL after all redirects, bypassing Cloudflare and other protections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Endpoint</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <span>POST /api/public/url</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${baseUrl}/api/public/url`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Alternative</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <span>GET /api/public/url?url=...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${baseUrl}/api/public/url?url=https://example.com`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Response Format</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "success": true,
  "data": {
    "original_url": "https://example.com",
    "final_url": "https://www.example.com/final-page",
    "title": "Page Title",
    "domain": "www.example.com",
    "protocol": "https:",
    "pathname": "/final-page",
    "search": "?param=value",
    "hash": "#section",
    "redirected": true,
    "timestamp": "2025-09-06T05:36:00.000Z"
  },
  "message": "Final URL resolved successfully"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API Testing */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test the APIs</CardTitle>
            <CardDescription>
              Try out the APIs directly from this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test URL</label>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={testHtmlApi}
                disabled={loading.html}
                className="w-full"
              >
                {loading.html ? 'Testing HTML API...' : 'Test HTML API'}
              </Button>
              <Button
                onClick={testSourceApi}
                disabled={loading.source}
                variant="outline"
                className="w-full"
              >
                {loading.source ? 'Testing Source API...' : 'Test Source API'}
              </Button>
              <Button
                onClick={testUrlApi}
                disabled={loading.url}
                variant="secondary"
                className="w-full"
              >
                {loading.url ? 'Testing URL API...' : 'Test URL API'}
              </Button>
            </div>

            {htmlResponse && (
              <div>
                <label className="block text-sm font-medium mb-2">HTML API Response (Clean HTML)</label>
                <Textarea
                  value={htmlResponse}
                  readOnly
                  className="h-40 font-mono text-xs"
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 This is clean, readable HTML that you can copy-paste directly!
                </div>
              </div>
            )}

            {sourceResponse && (
              <div>
                <label className="block text-sm font-medium mb-2">Source API Response (JSON)</label>
                <Textarea
                  value={sourceResponse}
                  readOnly
                  className="h-40 font-mono text-xs"
                />
              </div>
            )}

            {urlResponse && (
              <div>
                <label className="block text-sm font-medium mb-2">URL API Response</label>
                <Textarea
                  value={urlResponse}
                  readOnly
                  className="h-40 font-mono text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Advanced Protection Bypass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Bypasses Cloudflare, CAPTCHAs, and other anti-bot measures using advanced stealth techniques
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                No CORS Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Full CORS support allows any website to use these APIs without cross-origin restrictions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                High Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Optimized for speed with intelligent resource blocking and efficient processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">
            Built with Next.js, Puppeteer, and advanced anti-detection techniques
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button variant="outline" size="sm" asChild>
                <a href="/web-scraper-tool.html" download="web-scraper-tool.html" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Standalone Tool
                </a>
              </Button>
            </div>
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Web Interface
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
