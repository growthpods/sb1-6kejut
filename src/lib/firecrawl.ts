/**
 * Firecrawl Service
 * 
 * This service provides a wrapper around the Firecrawl API for scraping websites.
 * It is designed to be used as a singleton to ensure that the API key is only
 * loaded once.
 * 
 * The service can be initialized with a mock parameter to return mock data for
 * testing purposes.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the structure of a job listing
export interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  postedAt: string;
}

// Define the structure of the Firecrawl API response
interface FirecrawlScrapeResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Define the Firecrawl service
export class FirecrawlService {
  private apiKey: string;
  private mock: boolean;

  constructor(apiKey: string, mock = false) {
    if (!apiKey) {
      throw new Error('Firecrawl API key is required.');
    }
    this.apiKey = apiKey;
    this.mock = mock;
  }

  /**
   * Scrapes a URL for job listings.
   * @param url The URL to scrape.
   * @returns A promise that resolves to an array of job listings.
   */
  async scrapeJobListing(url: string): Promise<any | null> {
    if (this.mock) {
      console.log('Firecrawl: Using mock data for scraping.');
      return this.getMockScrapedData();
    }

    try {
      console.log(`Firecrawl: Scraping URL: ${url}`);
      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Firecrawl API request failed with status ${response.status}: ${errorBody}`);
        throw new Error(`Firecrawl API request failed with status ${response.status}`);
      }

      const result: FirecrawlScrapeResponse = await response.json();

      if (result.success && result.data) {
        console.log('Firecrawl: Scraping successful.');
        return result.data;
      } else {
        console.error('Firecrawl: Scraping failed.', result.error);
        return null;
      }
    } catch (error) {
      console.error('An error occurred during scraping:', error);
      throw error;
    }
  }

  /**
   * Returns mock data for testing purposes.
   * @returns An array of mock job listings.
   */
  private getMockScrapedData(): any[] {
    return [
      {
        title: 'Software Engineer Intern',
        company: 'Tech Corp',
        location: 'Austin, TX',
        description: 'This is a mock description for a software engineer intern position.',
        url: 'https://example.com/job/1',
        source: 'Mock Source',
        postedAt: new Date().toISOString(),
      },
      {
        title: 'Product Manager Intern',
        company: 'Innovate LLC',
        location: 'Dallas, TX',
        description: 'This is a mock description for a product manager intern position.',
        url: 'https://example.com/job/2',
        source: 'Mock Source',
        postedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Scrapes a URL and returns the raw HTML content.
   * @param url The URL to scrape.
   * @returns A promise that resolves to the raw HTML content.
   */
  async scrapeRawHtml(url: string): Promise<string | null> {
    if (this.mock) {
      console.log('Firecrawl: Using mock data for raw HTML scraping.');
      return this.getMockScrapedContent(url);
    }

    try {
      console.log(`Firecrawl: Scraping raw HTML from URL: ${url}`);
      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ url, pageOptions: { rawHtml: true } }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Firecrawl API request failed with status ${response.status}: ${errorBody}`);
        throw new Error(`Firecrawl API request failed with status ${response.status}`);
      }

      const result: FirecrawlScrapeResponse = await response.json();

      if (result.success && result.data && result.data.rawHtml) {
        console.log('Firecrawl: Raw HTML scraping successful.');
        return result.data.rawHtml;
      } else {
        console.error('Firecrawl: Raw HTML scraping failed.', result.error);
        return null;
      }
    } catch (error) {
      console.error('An error occurred during raw HTML scraping:', error);
      throw error;
    }
  }

  /**
   * Returns mock HTML content for testing purposes.
   * @param url The URL for which to generate mock content.
   * @returns Mock HTML content as a string.
   */
  private getMockScrapedContent(url: string): string {
    return `
      <html>
        <head>
          <title>Mock Page</title>
        </head>
        <body>
          <h1>Mock Content for ${url}</h1>
          <p>This is mock HTML content for testing purposes.</p>
          <ul>
            <li>Job: Software Engineer Intern</li>
            <li>Company: Mock Company</li>
            <li>Location: Mock Location</li>
          </ul>
        </body>
      </html>
    `;
  }
}

// Singleton instance of the Firecrawl service
let firecrawlService: FirecrawlService | null = null;

/**
 * Returns a singleton instance of the Firecrawl service.
 * @param mock Whether to use mock data for testing.
 * @returns An instance of the FirecrawlService.
 */
export function getFirecrawlService(mock = false): FirecrawlService {
  if (!firecrawlService) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('Firecrawl API key not found. Please set FIRECRAWL_API_KEY in your .env file.');
    }
    firecrawlService = new FirecrawlService(apiKey, mock);
  }
  return firecrawlService;
}
