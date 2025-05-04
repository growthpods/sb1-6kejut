# Job Search Integration

This document provides information about the job search integration in the InternMatch platform.

## Overview

The job search integration allows the platform to search and list jobs. This provides access to job listings.

## Setup

### Prerequisites

### Configuration

The job search integration requires the following environment variables to be set in the `.env` file:

Replace these values with your actual credentials:

### Creating a Service Account

To create a service account and download the key file:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "Create Service Account"
4. Enter a name and description for the service account
5. Assign the "Cloud Talent Solution API User" role
6. Click "Create and Continue"
7. Click "Done"
8. Find the service account in the list, click the three dots menu, and select "Manage keys"
9. Click "Add Key" > "Create new key"
10. Select "JSON" and click "Create"
11. Save the downloaded JSON file securely
12. Set the path to this file in the `` environment variable

## Usage

### In the Application

The Find Jobs page has a toggle to switch between the local database and an external API. When the external API is selected, the search and filter functionality will use the external API to find jobs.

### Scripts

The following npm scripts are available for working with the external API:

- `npm run test:job-search`: Tests the job search API integration by listing and searching for jobs
- `npm run sync:jobs`: Syncs jobs from Supabase to the external API

## Implementation Details

### Files

- `src/lib/jobSearch.ts`: Main service file for job search API integration
- `scripts/syncJobs.js`: Script to sync jobs from Supabase to the job search API
- `test-job-search.js`: Test script for job search API integration

### Service Methods

The job search service provides the following methods:

- `listJobs(filters)`: Lists jobs from the API with optional filters
- `searchJobs(query, filters)`: Searches for jobs matching the query with optional filters
- `syncJob(job)`: Syncs a job to the API
- `deleteJob(jobId)`: Deletes a job from the API

### Data Flow

1. Jobs are stored in the Supabase database
2. The `syncJobs.js` script syncs jobs from Supabase to the API
3. The Find Jobs page can search and list jobs from either Supabase or the API

## Troubleshooting

### Common Issues

- **Authentication errors**: Make sure the credentials are correctly set up
- **API not enabled**: Ensure the API is enabled

### Debugging

Run the test script to verify the job search API integration is working correctly:

```
npm run test:job-search
```

This will list and search for jobs using the API and output the results.

## Resources

- [API Documentation](https://example.com/api/docs)
- [Node.js Client](https://example.com/nodejs/docs)
