/**
 * Google Jobs API Service
 * Integrates with Google Cloud Talent Solution for job search and discovery
 */

import { Job } from '../types';
// Import Google Cloud Talent Solution
const talent = require('@google-cloud/talent').v4;

// Define interfaces for Google Jobs API
interface GoogleJobQuery {
  query?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  timeCommitment?: string;
  pageSize?: number;
  pageToken?: string;
}

interface GoogleJobResult {
  jobs: Job[];
  nextPageToken?: string;
  totalSize: number;
}

/**
 * Service for Google Jobs API integration
 */
export class GoogleJobsService {
  private jobServiceClient: any; // Using any type for now since we're using require
  private projectId: string;
  private tenantId: string;
  private formattedParent: string;

  constructor() {
    // Initialize the Google Cloud Talent Solution client
    this.jobServiceClient = new talent.JobServiceClient();
    
    // Get project and tenant IDs from environment variables
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
    this.tenantId = process.env.GOOGLE_CLOUD_TENANT_ID || '';
    
    if (!this.projectId || !this.tenantId) {
      console.warn('GoogleJobsService: Missing project ID or tenant ID. Set GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_TENANT_ID in .env');
    }
    
    // Format parent resource
    this.formattedParent = this.jobServiceClient.tenantPath(this.projectId, this.tenantId);
  }

  /**
   * List jobs from Google Jobs API
   * @param filters Optional filters for the job listing
   * @returns List of jobs matching the filters
   */
  async listJobs(filters: GoogleJobQuery = {}): Promise<GoogleJobResult> {
    try {
      console.log('GoogleJobsService: Listing jobs with filters', filters);
      
      // Build filter string
      const filterString = this.buildFilterString(filters);
      
      // Create request
      const request = {
        parent: this.formattedParent,
        filter: filterString,
        pageSize: filters.pageSize || 10,
        pageToken: filters.pageToken || '',
      };
      
      // Call Google Jobs API
      const [response] = await this.jobServiceClient.listJobs(request);
      
      // Transform Google Jobs to our Job format
      const jobs = (response.jobs || []).map(this.transformGoogleJob);
      
      return {
        jobs,
        nextPageToken: response.nextPageToken || undefined,
        totalSize: response.totalSize || jobs.length,
      };
    } catch (error) {
      console.error('GoogleJobsService: Error listing jobs', error);
      throw error;
    }
  }

  /**
   * Search jobs from Google Jobs API
   * @param query Search query
   * @param filters Optional filters for the job search
   * @returns List of jobs matching the search query and filters
   */
  async searchJobs(query: string, filters: GoogleJobQuery = {}): Promise<GoogleJobResult> {
    try {
      console.log('GoogleJobsService: Searching jobs with query', query, 'and filters', filters);
      
      // Create request
      const request = {
        parent: this.formattedParent,
        requestMetadata: {
          domain: 'internmatch.com',
          sessionId: `session-${Date.now()}`,
          userId: `user-${Date.now()}`,
        },
        jobQuery: {
          query,
          locationFilters: filters.location ? [{ name: filters.location }] : undefined,
          jobCategories: filters.jobType ? [this.mapJobType(filters.jobType)] : undefined,
          employmentTypes: filters.jobType ? [this.mapEmploymentType(filters.jobType)] : undefined,
          // Add more filters as needed
        },
        searchMode: 'JOB_SEARCH',
        pageSize: filters.pageSize || 10,
        pageToken: filters.pageToken || '',
      };
      
      // Call Google Jobs API
      const [response] = await this.jobServiceClient.searchJobs(request);
      
      // Transform Google Jobs to our Job format
      const jobs = (response.matchingJobs || []).map((match: any) => 
        this.transformGoogleJob(match.job)
      );
      
      return {
        jobs,
        nextPageToken: response.nextPageToken || undefined,
        totalSize: response.totalSize || jobs.length,
      };
    } catch (error) {
      console.error('GoogleJobsService: Error searching jobs', error);
      throw error;
    }
  }

  /**
   * Sync a job to Google Jobs API
   * @param job Job to sync
   * @returns Created or updated job
   */
  async syncJob(job: Job): Promise<any> {
    try {
      console.log('GoogleJobsService: Syncing job', job.id);
      
      // Create a Google Job
      const googleJob = this.createGoogleJob(job);
      
      // Check if job already exists
      const existingJob = await this.getJobByExternalId(job.id);
      
      if (existingJob) {
        // Update existing job
        const request = {
          job: {
            ...googleJob,
            name: existingJob.name,
          },
          updateMask: {
            paths: ['title', 'description', 'addresses', 'applicationInfo', 'jobBenefits', 'compensationInfo', 'customAttributes'],
          },
        };
        
        const [response] = await this.jobServiceClient.updateJob(request);
        return response;
      } else {
        // Create new job
        const request = {
          parent: this.formattedParent,
          job: googleJob,
        };
        
        const [response] = await this.jobServiceClient.createJob(request);
        return response;
      }
    } catch (error) {
      console.error('GoogleJobsService: Error syncing job', error);
      throw error;
    }
  }

  /**
   * Delete a job from Google Jobs API
   * @param jobId Job ID to delete
   * @returns Deleted job
   */
  async deleteJob(jobId: string): Promise<any> {
    try {
      console.log('GoogleJobsService: Deleting job', jobId);
      
      // Get job by external ID
      const existingJob = await this.getJobByExternalId(jobId);
      
      if (!existingJob) {
        console.warn('GoogleJobsService: Job not found', jobId);
        return null;
      }
      
      // Delete job
      const request = {
        name: existingJob.name,
      };
      
      const [response] = await this.jobServiceClient.deleteJob(request);
      return response;
    } catch (error) {
      console.error('GoogleJobsService: Error deleting job', error);
      throw error;
    }
  }

  /**
   * Get a job by external ID
   * @param externalId External ID of the job
   * @returns Google Job or null if not found
   */
  private async getJobByExternalId(externalId: string): Promise<any> {
    try {
      // List jobs with filter for external ID
      const request = {
        parent: this.formattedParent,
        filter: `requisitionId="${externalId}"`,
      };
      
      const [response] = await this.jobServiceClient.listJobs(request);
      
      if (response.jobs && response.jobs.length > 0) {
        return response.jobs[0];
      }
      
      return null;
    } catch (error) {
      console.error('GoogleJobsService: Error getting job by external ID', error);
      throw error;
    }
  }

  /**
   * Build filter string for Google Jobs API
   * @param filters Filters for the job listing
   * @returns Filter string
   */
  private buildFilterString(filters: GoogleJobQuery): string {
    const filterParts = [];
    
    if (filters.location) {
      filterParts.push(`address CONTAINS "${filters.location}"`);
    }
    
    if (filters.jobType) {
      filterParts.push(`employmentTypes CONTAINS "${this.mapEmploymentType(filters.jobType)}"`);
    }
    
    if (filters.experienceLevel) {
      filterParts.push(`experienceLevel = "${this.mapExperienceLevel(filters.experienceLevel)}"`);
    }
    
    if (filters.timeCommitment) {
      filterParts.push(`customAttributes.timeCommitment CONTAINS "${filters.timeCommitment}"`);
    }
    
    return filterParts.join(' AND ');
  }

  /**
   * Create a Google Job from our Job format
   * @param job Job to convert
   * @returns Google Job
   */
  private createGoogleJob(job: Job): any {
    return {
      requisitionId: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      addresses: [job.location],
      applicationInfo: {
        uris: job.applicationUrl ? [job.applicationUrl] : [],
        emails: [],
        instruction: 'Apply online',
      },
      jobBenefits: [],
      compensationInfo: {
        entries: [],
      },
      customAttributes: {
        timeCommitment: {
          stringValues: [job.timeCommitment || 'Summer'],
          filterable: true,
        },
        requirements: {
          stringValues: job.requirements || [],
          filterable: false,
        },
        externalLink: {
          stringValues: job.externalLink ? [job.externalLink] : [],
          filterable: false,
        },
      },
    };
  }

  /**
   * Transform a Google Job to our Job format
   * @param googleJob Google Job to convert
   * @returns Job in our format
   */
  private transformGoogleJob(googleJob: any): Job {
    const customAttributes = googleJob.customAttributes || {};
    
    return {
      id: googleJob.requisitionId || '',
      title: googleJob.title || '',
      company: googleJob.company || '',
      location: googleJob.addresses && googleJob.addresses.length > 0 ? googleJob.addresses[0] : '',
      description: googleJob.description || '',
      requirements: customAttributes.requirements?.stringValues || [],
      type: 'Part-Time' as 'Full-Time' | 'Part-Time' | 'Remote', // Default to Part-Time for high school jobs
      level: 'Entry Level', // Default to Entry Level for high school jobs
      timeCommitment: customAttributes.timeCommitment?.stringValues?.[0] || 'Summer',
      applicants: 0, // Google Jobs API doesn't provide this information
      postedAt: new Date(googleJob.postingCreateTime || Date.now()),
      externalLink: customAttributes.externalLink?.stringValues?.[0] || undefined,
      applicationUrl: googleJob.applicationInfo?.uris?.[0] || undefined,
      companyLogo: undefined, // Google Jobs API doesn't provide this information
    };
  }

  /**
   * Map job type to Google Jobs API employment type
   * @param jobType Job type
   * @returns Google Jobs API employment type
   */
  private mapEmploymentType(jobType: string): string {
    switch (jobType) {
      case 'Full-Time':
        return 'FULL_TIME';
      case 'Part-Time':
        return 'PART_TIME';
      case 'Remote':
        return 'OTHER';
      default:
        return 'OTHER';
    }
  }

  /**
   * Map job type to Google Jobs API job category
   * @param jobType Job type
   * @returns Google Jobs API job category
   */
  private mapJobType(jobType: string): string {
    // Map job type to Google Jobs API job category
    // This is a simplified mapping, you may need to expand it
    switch (jobType) {
      case 'Internship':
        return 'INTERNSHIP';
      default:
        return 'EDUCATION';
    }
  }

  /**
   * Map experience level to Google Jobs API experience level
   * @param experienceLevel Experience level
   * @returns Google Jobs API experience level
   */
  private mapExperienceLevel(experienceLevel: string): string {
    switch (experienceLevel) {
      case 'Entry Level':
        return 'ENTRY_LEVEL';
      case 'Intermediate':
        return 'EXPERIENCED';
      case 'Expert':
        return 'EXPERIENCED';
      default:
        return 'ENTRY_LEVEL';
    }
  }
}

// Singleton instance
let googleJobsService: GoogleJobsService | null = null;

/**
 * Get the Google Jobs service instance
 */
export function getGoogleJobsService(): GoogleJobsService {
  if (!googleJobsService) {
    googleJobsService = new GoogleJobsService();
  }
  return googleJobsService;
}
