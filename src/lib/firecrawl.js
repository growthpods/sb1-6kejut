/**
 * Firecrawl service for web scraping job listings
 * Uses the Firecrawl MCP server
 */

/**
 * Firecrawl service for scraping job listings
 */
export class FirecrawlService {
    /**
     * Scrape a job listing from a URL
     * @param url The URL to scrape
     * @returns Parsed job data
     */
    async scrapeJobListing(url) {
        try {
            // Use the Firecrawl MCP server to scrape the URL
            const response = await this.callFirecrawlMcp('firecrawl_scrape', {
                url,
                formats: ['markdown'],
                onlyMainContent: true
            });
            // If we got markdown content, parse it to extract job details
            if (response) {
                if (typeof response === 'string') {
                    return this.parseJobContent(response, url);
                }
                return response;
            }
            else {
                throw new Error('Failed to scrape job content');
            }
        }
        catch (error) {
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
    async callFirecrawlMcp(toolName, args) {
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
            }
            else {
                // Fallback for development/testing
                console.warn('MCP not available, using mock data');
                return this.getMockScrapedContent(args.url);
            }
        }
        catch (error) {
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
    parseJobContent(content, url) {
        // Robust parsing for unstructured internship/program pages
        const lines = content.split('\n').filter(line => line.trim() !== '');
        let title, company, location, description = '', requirements = [], type, level, applicationUrl;
        // 1. Extract all headings and their content
        const headingRegex = /^(#+)\s*(.+)$/gm;
        let match, headings = [];
        while ((match = headingRegex.exec(content)) !== null) {
            headings.push({ level: match[1].length, text: match[2], index: match.index });
        }
        // 2. Extract content under each heading
        let sections = {};
        for (let i = 0; i < headings.length; i++) {
            const start = headings[i].index + headings[i].level + 1 + headings[i].text.length;
            const end = i + 1 < headings.length ? headings[i + 1].index : content.length;
            const sectionText = content.slice(start, end).trim();
            sections[headings[i].text.toLowerCase()] = sectionText;
        }
        // 3. Try to extract title from first heading or page title
        title = headings.length > 0 ? headings[0].text : undefined;
        // 4. Try to extract company from content or known patterns
        company = (content.match(/(?:Company|Organization|Employer):\s*([A-Za-z0-9 &.,'-]+)/i) || [])[1];
        if (!company) {
            // Fallback: use domain name or known orgs in the text
            const domainMatch = url.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9-]+)\./);
            company = domainMatch ? domainMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : undefined;
        }
        // 5. Try to extract location from 'Location' section or address patterns
        location = (sections['location'] && sections['location'].split('\n')[0]) ||
            (content.match(/\b([A-Za-z .]+,\s*[A-Z]{2,}(?:,?\s*USA|United States)?)\b/) || [])[1];
        // 6. Extract requirements from 'Eligibility', 'Requirements', or 'Qualifications' sections
        const reqSection = sections['eligibility'] || sections['requirements'] || sections['qualifications'];
        if (reqSection) {
            requirements = reqSection.split('\n').filter(line => line.trim().match(/^[-*•]/)).map(line => line.replace(/^[-*•]\s*/, '').trim());
            // Also try to extract bullet points even if not marked
            if (requirements.length === 0) {
                requirements = reqSection.split('\n').filter(line => line.trim().length > 0);
            }
        }
        // 7. Extract application URL from 'Application', 'Apply', or 'How to Apply' sections
        const appSection = sections['application'] || sections['apply'] || sections['how to apply'];
        if (appSection) {
            const urlMatch = appSection.match(/https?:\/\/[^\s)"']+/);
            if (urlMatch) applicationUrl = urlMatch[0];
        }
        if (!applicationUrl) {
            // Fallback: any link near 'apply' or 'application' in the content
            const applyMatch = content.match(/(?:Apply|Application).*?(https?:\/\/[^\s)"']+)/i);
            if (applyMatch) applicationUrl = applyMatch[1];
        }
        // 8. Aggregate description from all relevant sections
        const descSections = ['about', 'overview', 'description', 'program', 'summary', 'internship guidelines & requirements'];
        for (const key of descSections) {
            if (sections[key]) description += sections[key] + '\n';
        }
        // Fallback: use the first 20 lines as description if still empty
        if (!description) description = lines.slice(0, 20).join(' ');
        // 9. Extract type and level from content or fallback
        type = (content.match(/(?:Job Type|Employment Type|Type):\s*([A-Za-z\s-]+)/i) || [])[1] || 'Internship';
        level = (content.match(/(?:Experience|Level):\s*([A-Za-z\s]+)/i) || [])[1] || 'Entry Level';
        // 10. Clean up
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
    getMockScrapedContent(url) {
        return {
            title: 'Software Developer Intern',
            company: 'Acme Corporation',
            location: 'Chicago, IL',
            description: "We're looking for a talented Software Developer Intern to join our team for the summer. This is a great opportunity to gain real-world experience in a fast-paced tech environment.",
            requirements: [
                'Currently pursuing a degree in Computer Science or related field',
                'Knowledge of JavaScript, HTML, and CSS',
                'Familiarity with React or similar frameworks',
                'Strong problem-solving skills',
                'Ability to work in a team environment'
            ],
            type: 'Internship',
            level: 'Entry Level',
            applicationUrl: 'https://acme.example.com/careers/apply'
        };
    }
}
// Singleton instance
let firecrawlService = null;
/**
 * Get the Firecrawl service instance
 */
export function getFirecrawlService() {
    if (!firecrawlService) {
        firecrawlService = new FirecrawlService();
    }
    return firecrawlService;
}
