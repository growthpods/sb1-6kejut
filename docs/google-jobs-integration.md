# Google Jobs API Integration

This document provides information about the Google Jobs API integration in the InternMatch platform.

## Overview

The Google Jobs API integration allows the platform to search and list jobs from Google's Cloud Talent Solution. This provides access to a much larger pool of job listings beyond what is stored in our local Supabase database.

## Setup

### Prerequisites

1. Google Cloud Platform account
2. Google Cloud project with Cloud Talent Solution API enabled
3. Google Cloud Tenant ID

### Configuration

The Google Jobs API integration requires the following environment variables to be set in the `.env` file:

```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_TENANT_ID=your-tenant-id
```

Replace `your-project-id` and `your-tenant-id` with your actual Google Cloud project ID and tenant ID.

## Usage

### In the Application

The Find Jobs page has a toggle to switch between the local database and Google Jobs API. When the Google Jobs API is selected, the search and filter functionality will use the Google Cloud Talent Solution API to find jobs.

### Scripts

The following npm scripts are available for working with the Google Jobs API:

- `npm run test:google-jobs`: Tests the Google Jobs API integration by listing and searching for jobs
- `npm run sync:google-jobs`: Syncs jobs from Supabase to Google Jobs API

## Implementation Details

### Files

- `src/lib/googleJobs.ts`: Main service file for Google Jobs API integration
- `scripts/syncJobsToGoogle.js`: Script to sync jobs from Supabase to Google Jobs API
- `test-google-jobs.js`: Test script for Google Jobs API integration

### Service Methods

The Google Jobs service provides the following methods:

- `listJobs(filters)`: Lists jobs from Google Jobs API with optional filters
- `searchJobs(query, filters)`: Searches for jobs matching the query with optional filters
- `syncJob(job)`: Syncs a job to Google Jobs API
- `deleteJob(jobId)`: Deletes a job from Google Jobs API

### Data Flow

1. Jobs are stored in the Supabase database
2. The `syncJobsToGoogle.js` script syncs jobs from Supabase to Google Jobs API
3. The Find Jobs page can search and list jobs from either Supabase or Google Jobs API

## Troubleshooting

### Common Issues

- **Authentication errors**: Make sure the Google Cloud credentials are correctly set up
- **API not enabled**: Ensure the Cloud Talent Solution API is enabled in your Google Cloud project
- **Missing tenant**: Create a tenant in the Google Cloud Talent Solution console

### Debugging

Run the test script to verify the Google Jobs API integration is working correctly:

```
npm run test:google-jobs
```

This will list and search for jobs using the Google Jobs API and output the results.

## Resources

- [Google Cloud Talent Solution Documentation](https://cloud.google.com/talent-solution/docs)
- [Google Cloud Talent Solution API Reference](https://cloud.google.com/talent-solution/docs/reference/rest)
- [Google Cloud Talent Solution Node.js Client](https://cloud.google.com/nodejs/docs/reference/talent/latest)
