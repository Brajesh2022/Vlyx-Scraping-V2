'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Download, 
  Copy, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Zap,
  Code
} from 'lucide-react';
import { toast } from 'sonner';

interface ScrapeResult {
  url: string;
  title: string;
  source: string;
  timestamp: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape website');
      }

      setResult(data.data);
      setProgress(100);
      toast.success('Website scraped successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to scrape website');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const copyToClipboard = async () => {
    if (result?.source) {
      await navigator.clipboard.writeText(result.source);
      toast.success('Source code copied to clipboard!');
    }
  };

  const downloadSource = () => {
    if (result?.source) {
      const blob = new Blob([result.source], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.title || 'webpage'}-source.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Source code downloaded!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Advanced Web Scraper</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Extract page source from any website, even those protected by Cloudflare, CAPTCHAs, and anti-bot measures
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Cloudflare Bypass</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Anti-Detection</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Code className="h-3 w-3" />
              <span>Full Source Extraction</span>
            </Badge>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Enter Website URL</span>
            </CardTitle>
            <CardDescription>
              Enter any website URL to extract its complete page source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button 
                onClick={handleScrape} 
                disabled={loading || !url.trim()}
                className="px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Scrape
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-slate-600 text-center">
                  {progress < 30 ? 'Initializing browser...' :
                   progress < 60 ? 'Bypassing protection...' :
                   progress < 90 ? 'Extracting content...' :
                   'Finalizing...'}
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Scraping Complete</span>
                  </CardTitle>
                  <CardDescription>
                    Successfully extracted page source from {result.url}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSource}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Page Title</p>
                  <p className="text-sm text-slate-600 truncate">{result.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Final URL</p>
                  <p className="text-sm text-slate-600 truncate">{result.url}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Scraped At</p>
                  <p className="text-sm text-slate-600">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Source Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Page Source</h3>
                  <Badge variant="outline">
                    {result.source.length.toLocaleString()} characters
                  </Badge>
                </div>
                <Textarea
                  value={result.source}
                  readOnly
                  className="min-h-[400px] font-mono text-xs"
                  placeholder="Page source will appear here..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pb-8">
          <p>Built with Next.js, Puppeteer, and advanced anti-detection techniques</p>
        </div>
      </div>
    </div>
  );
}
