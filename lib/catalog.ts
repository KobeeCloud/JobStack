import {
  Code,
  Database,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Globe,
  Lock,
  Mail,
  Network,
  Smartphone,
  Zap,
  Container,
  Box,
  FileJson,
  Activity,
  BarChart,
  MessageSquare,
  Search,
  ShoppingCart,
  Users,
  Workflow
} from 'lucide-react'

export interface ComponentConfig {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'database' | 'cloud' | 'service'
  icon: any
  color: string
  description: string
  estimatedCost: {
    min: number // monthly cost in USD
    max: number
  }
  terraform?: {
    provider: 'aws' | 'gcp' | 'azure' | 'vercel' | 'cloudflare'
    resource: string
    defaultConfig: Record<string, any>
  }
}

export const COMPONENT_CATALOG: ComponentConfig[] = [
  // Frontend Components
  {
    id: 'react-app',
    name: 'React Application',
    category: 'frontend',
    icon: Code,
    color: '#61DAFB',
    description: 'Single Page Application built with React',
    estimatedCost: { min: 0, max: 50 },
    terraform: {
      provider: 'vercel',
      resource: 'vercel_project',
      defaultConfig: {
        framework: 'react'
      }
    }
  },
  {
    id: 'nextjs-app',
    name: 'Next.js Application',
    category: 'frontend',
    icon: Code,
    color: '#000000',
    description: 'Full-stack React framework with SSR/SSG',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'vercel',
      resource: 'vercel_project',
      defaultConfig: {
        framework: 'nextjs'
      }
    }
  },
  {
    id: 'vue-app',
    name: 'Vue.js Application',
    category: 'frontend',
    icon: Code,
    color: '#42B883',
    description: 'Progressive JavaScript framework',
    estimatedCost: { min: 0, max: 50 },
  },
  {
    id: 'angular-app',
    name: 'Angular Application',
    category: 'frontend',
    icon: Code,
    color: '#DD0031',
    description: 'TypeScript-based web framework',
    estimatedCost: { min: 0, max: 50 },
  },
  {
    id: 'static-site',
    name: 'Static Website',
    category: 'frontend',
    icon: Globe,
    color: '#FF6B6B',
    description: 'HTML/CSS/JS static website',
    estimatedCost: { min: 0, max: 20 },
    terraform: {
      provider: 'aws',
      resource: 'aws_s3_bucket',
      defaultConfig: {
        website: {
          index_document: 'index.html'
        }
      }
    }
  },

  // Backend Components
  {
    id: 'nodejs-api',
    name: 'Node.js API',
    category: 'backend',
    icon: Server,
    color: '#339933',
    description: 'RESTful API built with Node.js/Express',
    estimatedCost: { min: 5, max: 200 },
    terraform: {
      provider: 'aws',
      resource: 'aws_ecs_service',
      defaultConfig: {
        launch_type: 'FARGATE'
      }
    }
  },
  {
    id: 'python-api',
    name: 'Python API',
    category: 'backend',
    icon: Server,
    color: '#3776AB',
    description: 'FastAPI/Django REST API',
    estimatedCost: { min: 5, max: 200 },
  },
  {
    id: 'go-api',
    name: 'Go API',
    category: 'backend',
    icon: Server,
    color: '#00ADD8',
    description: 'High-performance Go API',
    estimatedCost: { min: 5, max: 200 },
  },
  {
    id: 'java-api',
    name: 'Java API',
    category: 'backend',
    icon: Server,
    color: '#007396',
    description: 'Spring Boot REST API',
    estimatedCost: { min: 10, max: 300 },
  },
  {
    id: 'dotnet-api',
    name: '.NET API',
    category: 'backend',
    icon: Server,
    color: '#512BD4',
    description: 'ASP.NET Core Web API',
    estimatedCost: { min: 10, max: 300 },
  },
  {
    id: 'ruby-api',
    name: 'Ruby API',
    category: 'backend',
    icon: Server,
    color: '#CC342D',
    description: 'Ruby on Rails API',
    estimatedCost: { min: 5, max: 200 },
  },

  // Database Components
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    icon: Database,
    color: '#336791',
    description: 'Relational database',
    estimatedCost: { min: 15, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_db_instance',
      defaultConfig: {
        engine: 'postgres',
        engine_version: '15.3',
        instance_class: 'db.t3.micro'
      }
    }
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'database',
    icon: Database,
    color: '#4479A1',
    description: 'Popular relational database',
    estimatedCost: { min: 15, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_db_instance',
      defaultConfig: {
        engine: 'mysql',
        engine_version: '8.0',
        instance_class: 'db.t3.micro'
      }
    }
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    icon: Database,
    color: '#47A248',
    description: 'Document-oriented NoSQL database',
    estimatedCost: { min: 25, max: 1000 },
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    icon: Database,
    color: '#DC382D',
    description: 'In-memory cache and message broker',
    estimatedCost: { min: 10, max: 300 },
    terraform: {
      provider: 'aws',
      resource: 'aws_elasticache_cluster',
      defaultConfig: {
        engine: 'redis',
        node_type: 'cache.t3.micro'
      }
    }
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'database',
    icon: Database,
    color: '#3ECF8E',
    description: 'Open-source Firebase alternative with Postgres',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'dynamodb',
    name: 'DynamoDB',
    category: 'database',
    icon: Database,
    color: '#4053D6',
    description: 'AWS NoSQL database',
    estimatedCost: { min: 0, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_dynamodb_table',
      defaultConfig: {
        billing_mode: 'PAY_PER_REQUEST'
      }
    }
  },

  // Cloud Services - AWS
  {
    id: 'aws-lambda',
    name: 'AWS Lambda',
    category: 'cloud',
    icon: Zap,
    color: '#FF9900',
    description: 'Serverless compute service',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'aws',
      resource: 'aws_lambda_function',
      defaultConfig: {
        runtime: 'nodejs18.x',
        memory_size: 128,
        timeout: 30
      }
    }
  },
  {
    id: 'aws-ecs',
    name: 'AWS ECS',
    category: 'cloud',
    icon: Container,
    color: '#FF9900',
    description: 'Container orchestration service',
    estimatedCost: { min: 30, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_ecs_cluster',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    category: 'cloud',
    icon: HardDrive,
    color: '#FF9900',
    description: 'Object storage service',
    estimatedCost: { min: 0, max: 50 },
    terraform: {
      provider: 'aws',
      resource: 'aws_s3_bucket',
      defaultConfig: {
        versioning: {
          enabled: true
        }
      }
    }
  },
  {
    id: 'aws-api-gateway',
    name: 'AWS API Gateway',
    category: 'cloud',
    icon: Network,
    color: '#FF9900',
    description: 'API management service',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'aws',
      resource: 'aws_api_gateway_rest_api',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-sqs',
    name: 'AWS SQS',
    category: 'service',
    icon: MessageSquare,
    color: '#FF9900',
    description: 'Message queue service',
    estimatedCost: { min: 0, max: 50 },
    terraform: {
      provider: 'aws',
      resource: 'aws_sqs_queue',
      defaultConfig: {
        visibility_timeout_seconds: 30
      }
    }
  },

  // Cloud Services - GCP
  {
    id: 'gcp-cloud-run',
    name: 'GCP Cloud Run',
    category: 'cloud',
    icon: Container,
    color: '#4285F4',
    description: 'Serverless container platform',
    estimatedCost: { min: 0, max: 200 },
    terraform: {
      provider: 'gcp',
      resource: 'google_cloud_run_service',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-cloud-functions',
    name: 'GCP Cloud Functions',
    category: 'cloud',
    icon: Zap,
    color: '#4285F4',
    description: 'Serverless functions',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'gcp',
      resource: 'google_cloudfunctions_function',
      defaultConfig: {
        runtime: 'nodejs18'
      }
    }
  },

  // Cloud Services - Azure
  {
    id: 'azure-functions',
    name: 'Azure Functions',
    category: 'cloud',
    icon: Zap,
    color: '#0078D4',
    description: 'Serverless compute',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'azure-app-service',
    name: 'Azure App Service',
    category: 'cloud',
    icon: Server,
    color: '#0078D4',
    description: 'Web app hosting',
    estimatedCost: { min: 10, max: 300 },
  },

  // Additional Services
  {
    id: 'kubernetes',
    name: 'Kubernetes Cluster',
    category: 'cloud',
    icon: Container,
    color: '#326CE5',
    description: 'Container orchestration platform',
    estimatedCost: { min: 100, max: 2000 },
  },
  {
    id: 'cloudflare-workers',
    name: 'Cloudflare Workers',
    category: 'cloud',
    icon: Zap,
    color: '#F38020',
    description: 'Edge serverless functions',
    estimatedCost: { min: 0, max: 50 },
  },
  {
    id: 'vercel',
    name: 'Vercel Hosting',
    category: 'cloud',
    icon: Globe,
    color: '#000000',
    description: 'Frontend hosting platform',
    estimatedCost: { min: 0, max: 50 },
  },
  {
    id: 'auth-service',
    name: 'Auth Service',
    category: 'service',
    icon: Lock,
    color: '#6366F1',
    description: 'User authentication system',
    estimatedCost: { min: 0, max: 50 },
  },
  {
    id: 'email-service',
    name: 'Email Service',
    category: 'service',
    icon: Mail,
    color: '#8B5CF6',
    description: 'Transactional email service',
    estimatedCost: { min: 0, max: 30 },
  },
  {
    id: 'cdn',
    name: 'CDN',
    category: 'service',
    icon: Network,
    color: '#EC4899',
    description: 'Content delivery network',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'monitoring',
    name: 'Monitoring Service',
    category: 'service',
    icon: Activity,
    color: '#10B981',
    description: 'Application monitoring and logging',
    estimatedCost: { min: 0, max: 100 },
  },
]

export function getComponentById(id: string): ComponentConfig | undefined {
  return COMPONENT_CATALOG.find(c => c.id === id)
}

export function getComponentsByCategory(category: ComponentConfig['category']): ComponentConfig[] {
  return COMPONENT_CATALOG.filter(c => c.category === category)
}

export function searchComponents(query: string): ComponentConfig[] {
  const lowerQuery = query.toLowerCase()
  return COMPONENT_CATALOG.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.category.toLowerCase().includes(lowerQuery)
  )
}
