export interface Job {
  id: string;
  title: string;
  company?: string; // For backward compatibility
  company_name: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  } | null;
  techStack?: string[];
  description: string;
  requirements?: string[];
  benefits?: string[];
  source: 'native' | 'justjoinit' | 'nofluffjobs' | 'pracuj' | 'indeed';
  sourceUrl?: string;
  featured: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  apiKey?: string;
  plan: 'free' | 'premium' | 'enterprise';
  ownerId: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'employer';
  profile?: CandidateProfile | EmployerProfile;
  createdAt: Date;
}

export interface CandidateProfile {
  firstName?: string;
  lastName?: string;
  title?: string;
  skills: string[];
  experience?: string;
  cvUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface EmployerProfile {
  companyId: string;
  position?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  cvUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'viewed' | 'rejected' | 'hired';
  createdAt: Date;
}

export interface JobFilters {
  search?: string;
  location?: string;
  remote?: boolean;
  techStack?: string[];
  salaryMin?: number;
  source?: Job['source'][];
  featured?: boolean;
}
