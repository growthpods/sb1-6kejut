export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          location: string
          description: string
          requirements: string[]
          type: string
          level: string
          applicants: number
          posted_at: string
          external_link: string | null
          company_logo: string | null
          employer_id: string
          time_commitment: string | null
          application_url: string | null
        }
        Insert: {
          id?: string
          title: string
          company: string
          location: string
          description: string
          requirements?: string[]
          type: string
          level: string
          applicants?: number
          posted_at?: string
          external_link?: string | null
          company_logo?: string | null
          employer_id: string
          time_commitment?: string | null
          application_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string
          description?: string
          requirements?: string[]
          type?: string
          level?: string
          applicants?: number
          posted_at?: string
          external_link?: string | null
          company_logo?: string | null
          employer_id?: string
          time_commitment?: string | null
          application_url?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          user_id: string
          status: string
          applied_at: string
          resume_url: string | null
          cover_letter: string | null
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          status?: string
          applied_at?: string
          resume_url?: string | null
          cover_letter?: string | null
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          status?: string
          applied_at?: string
          resume_url?: string | null
          cover_letter?: string | null
        }
      }
    }
  }
}
