ALTER TABLE public.jobs
ADD CONSTRAINT jobs_title_company_location_unique UNIQUE (title, company, location);
