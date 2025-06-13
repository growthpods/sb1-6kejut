-- Create table for job posting OTP verification
create table if not exists job_post_otps (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  otp text not null,
  created_at timestamp with time zone default now()
);
create index if not exists idx_job_post_otps_email on job_post_otps(email); 