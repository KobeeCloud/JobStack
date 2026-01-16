export const APP_CONFIG = {
  name: 'JobStack',
  description: 'Find your perfect job in one place',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '0.1.0',
} as const;

export const PLANS = {
  FREE: {
    candidate: {
      savedJobs: 5,
      emailAlerts: 'basic',
      price: 0,
    },
    employer: {
      jobsPerMonth: 1,
      displayDays: 7,
      apiAccess: false,
      price: 0,
    },
  },
  PREMIUM_CANDIDATE: {
    savedJobs: Infinity,
    emailAlerts: 'instant',
    cvBuilder: true,
    noAds: true,
    price: 5,
  },
  PREMIUM_EMPLOYER: {
    jobsPerMonth: Infinity,
    displayDays: 30,
    apiAccess: true,
    apiRequestsPerMonth: 10000,
    featured: true,
    analytics: true,
    price: 49,
  },
  ENTERPRISE: {
    jobsPerMonth: Infinity,
    displayDays: 60,
    apiAccess: true,
    apiRequestsPerMonth: Infinity,
    featured: true,
    analytics: true,
    whiteLabel: true,
    support: 'priority',
    price: 199,
  },
} as const;

export const JOB_SOURCES = [
  'justjoinit',
  'nofluffjobs',
  'pracuj',
  'indeed',
  'native',
] as const;

export const TECH_STACKS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'Ruby',
  'Rails',
  'Go',
  'Rust',
  'Kotlin',
  'Swift',
  'Flutter',
  'React Native',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'GraphQL',
  'REST API',
] as const;

// Job roles with their popular tech stacks
export const JOB_ROLES = {
  'Frontend Developer': {
    icon: '🎨',
    stacks: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'HTML/CSS', 'Tailwind'],
  },
  'Backend Developer': {
    icon: '⚙️',
    stacks: ['Node.js', 'Python', 'Java', 'Go', 'C#', '.NET', 'PHP', 'Ruby', 'PostgreSQL', 'MongoDB'],
  },
  'Fullstack Developer': {
    icon: '🔄',
    stacks: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'MongoDB', 'Docker'],
  },
  'DevOps Engineer': {
    icon: '🚀',
    stacks: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'Linux'],
  },
  'Cloud Engineer': {
    icon: '☁️',
    stacks: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'CloudFormation', 'Pulumi', 'Linux'],
  },
  'Platform Engineer': {
    icon: '🏗️',
    stacks: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Azure', 'Prometheus', 'Grafana', 'ArgoCD', 'Helm'],
  },
  'SRE (Site Reliability)': {
    icon: '🛡️',
    stacks: ['Kubernetes', 'Docker', 'Prometheus', 'Grafana', 'AWS', 'Python', 'Go', 'Linux', 'Datadog'],
  },
  'Data Engineer': {
    icon: '📊',
    stacks: ['Python', 'SQL', 'Spark', 'Airflow', 'AWS', 'Kafka', 'dbt', 'Snowflake', 'Databricks'],
  },
  'Machine Learning': {
    icon: '🤖',
    stacks: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'AWS', 'Jupyter'],
  },
  'Mobile Developer': {
    icon: '📱',
    stacks: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'TypeScript', 'Firebase'],
  },
  'QA Engineer': {
    icon: '🧪',
    stacks: ['Selenium', 'Cypress', 'Jest', 'Playwright', 'Python', 'JavaScript', 'Postman', 'JMeter'],
  },
  'Security Engineer': {
    icon: '🔐',
    stacks: ['AWS', 'Azure', 'Kubernetes', 'Python', 'Linux', 'SIEM', 'Burp Suite', 'OWASP'],
  },
} as const;

// Work modes
export const WORK_MODES = {
  remote: {
    label: 'Zdalnie',
    icon: '🏠',
    description: 'Praca w pełni zdalna z dowolnego miejsca',
  },
  hybrid: {
    label: 'Hybrydowo',
    icon: '🔄',
    description: 'Część czasu w biurze, część zdalnie',
  },
  onsite: {
    label: 'Stacjonarnie',
    icon: '🏢',
    description: 'Praca w biurze',
  },
} as const;

// Polish voivodeships
export const VOIVODESHIPS = [
  'dolnośląskie',
  'kujawsko-pomorskie',
  'lubelskie',
  'lubuskie',
  'łódzkie',
  'małopolskie',
  'mazowieckie',
  'opolskie',
  'podkarpackie',
  'podlaskie',
  'pomorskie',
  'śląskie',
  'świętokrzyskie',
  'warmińsko-mazurskie',
  'wielkopolskie',
  'zachodniopomorskie',
] as const;

// Distance options in km
export const DISTANCE_OPTIONS = [10, 25, 50, 100, 150] as const;

export const LOCATIONS = [
  'Warszawa',
  'Kraków',
  'Wrocław',
  'Poznań',
  'Gdańsk',
  'Łódź',
  'Katowice',
  'Szczecin',
  'Bydgoszcz',
  'Lublin',
] as const;
