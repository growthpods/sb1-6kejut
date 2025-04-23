/**
 * Firecrawl service for web scraping job listings
 * Uses the Firecrawl MCP server
 */

// Define types for job data extraction
interface ScrapedJobData {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  type?: string;
  level?: string;
  externalLink?: string;
  applicationUrl?: string;
}

/**
 * Firecrawl service for scraping job listings
 */
export class FirecrawlService {
  /**
   * Scrape a job listing from a URL
   * @param url The URL to scrape
   * @returns Parsed job data
   */
  async scrapeJobListing(url: string): Promise<ScrapedJobData> {
    try {
      // Use the Firecrawl MCP server to scrape the URL
      const response = await this.callFirecrawlMcp('firecrawl_scrape', {
        url,
        formats: ['markdown'],
        onlyMainContent: true
      });

      // If we got markdown content, parse it to extract job details
      if (response && typeof response === 'string') {
        return this.parseJobContent(response, url);
      } else {
        throw new Error('Failed to scrape job content');
      }
    } catch (error) {
      console.error('Error scraping job listing:', error);
      throw error;
    }
  }

  /**
   * Call the Firecrawl MCP server
   * @param toolName The name of the Firecrawl tool to use
   * @param args The arguments to pass to the tool
   * @returns The response from the MCP server
   */
  private async callFirecrawlMcp(toolName: string, args: any): Promise<any> {
    // This is a placeholder for the actual MCP call
    // In a real implementation, this would use the MCP client
    // For now, we'll use a direct fetch to the MCP server
    
    try {
      // Use the global MCP function if available (in Claude environment)
      if (typeof window !== 'undefined' && 'mcpRequest' in window) {
        // @ts-ignore - mcpRequest is injected by the Claude environment
        return await window.mcpRequest({
          serverName: 'github.com/mendableai/firecrawl-mcp-server',
          toolName,
          arguments: args
        });
      } else {
        // Fallback for development/testing
        console.warn('MCP not available, using mock data');
        return this.getMockScrapedContent(args.url);
      }
    } catch (error) {
      console.error(`Error calling Firecrawl MCP (${toolName}):`, error);
      throw error;
    }
  }

  /**
   * Parse job content from markdown
   * @param content The markdown content
   * @param url The original URL
   * @returns Parsed job data
   */
  private parseJobContent(content: string, url: string): ScrapedJobData {
    // Basic parsing logic - in a real implementation, this would be more robust
    // or would use the LLM to extract structured data
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Extract title from first heading
    const titleMatch = content.match(/# (.*?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : undefined;
    
    // Try to extract company name (often near the top, after title)
    let company: string | undefined;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      // Look for company patterns like "at Company" or just "Company"
      const companyMatch = lines[i].match(/(?:at|by|from) ([A-Z][A-Za-z0-9\s&.,]+)/) || 
                          lines[i].match(/^([A-Z][A-Za-z0-9\s&.,]+)$/);
      if (companyMatch && !lines[i].includes('#')) {
        company = companyMatch[1].trim();
        break;
      }
    }
    
    // Try to extract location (often contains city, state format)
    let location: string | undefined;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      // Look for location patterns like "Location: City, State" or "City, State"
      const locationMatch = lines[i].match(/Location:?\s*([^,]+,\s*[A-Z]{2})/) || 
                           lines[i].match(/([A-Za-z\s]+,\s*[A-Z]{2})/);
      if (locationMatch) {
        location = locationMatch[1].trim();
        break;
      }
    }
    
    // Extract requirements (look for bullet points after "Requirements" section)
    const requirementsMatch = content.match(/(?:Requirements|Qualifications):(.*?)(?:##|$)/s);
    let requirements: string[] = [];
    if (requirementsMatch) {
      const reqSection = requirementsMatch[1];
      requirements = reqSection
        .split('\n')
        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[*-]\s*/, '').trim());
    }
    
    // Extract job type (full-time, part-time, etc.)
    let type: string | undefined;
    const typeMatch = content.match(/(?:Job Type|Employment Type|Type):\s*([A-Za-z\s-]+)/i);
    if (typeMatch) {
      type = typeMatch[1].trim();
    }
    
    // Extract job level
    let level: string | undefined;
    const levelMatch = content.match(/(?:Experience|Level):\s*([A-Za-z\s]+)/i);
    if (levelMatch) {
      level = levelMatch[1].trim();
    }
    
    // Extract application URL if present
    let applicationUrl: string | undefined;
    const applyMatch = content.match(/(?:Apply|Application).*?(https?:\/\/[^\s"]+)/i);
    if (applyMatch) {
      applicationUrl = applyMatch[1].trim();
    }
    
    // Use everything else as description
    let description = content;
    // Remove title if found
    if (titleMatch) {
      description = description.replace(titleMatch[0], '');
    }
    // Remove requirements section if found
    if (requirementsMatch) {
      description = description.replace(requirementsMatch[0], '');
    }
    // Clean up the description
    description = description.trim();
    
    return {
      title,
      company,
      location,
      description,
      requirements,
      type,
      level,
      externalLink: url,
      applicationUrl
    };
  }

  /**
   * Get mock scraped content for testing
   * @param url The URL that would have been scraped
   * @returns Mock content
   */
  private getMockScrapedContent(url: string): string {
    return `# Software Developer Intern
    
At Acme Corporation

Location: Chicago, IL

## About the Role

We're looking for a talented Software Developer Intern to join our team for the summer. This is a great opportunity to gain real-world experience in a fast-paced tech environment.

## Responsibilities

* Assist in developing and maintaining web applications
* Write clean, maintainable code
* Collaborate with senior developers on projects
* Participate in code reviews and team meetings
* Debug and fix issues as they arise

## Requirements

* Currently pursuing a degree in Computer Science or related field
* Knowledge of JavaScript, HTML, and CSS
* Familiarity with React or similar frameworks
* Strong problem-solving skills
* Ability to work in a team environment

## Details

* Job Type: Internship
* Duration: 3 months (Summer 2025)
* Location: Chicago, IL (Hybrid)
* Compensation: $25/hour

Apply now: https://acme.example.com/careers/apply

`;
  }
}

// Singleton instance
let firecrawlService: FirecrawlService | null = null;

/**
 * Get the Firecrawl service instance
 */
export function getFirecrawlService(): FirecrawlService {
  if (!firecrawlService) {
    firecrawlService = new FirecrawlService();
  }
  return firecrawlService;
}
