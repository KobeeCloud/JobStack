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
  Workflow,
  GitBranch,
  Shield,
  Layers,
  FileCode,
  Terminal,
  Cog,
  Radio,
  Wifi,
  Clock,
  Eye,
  Gauge,
  Key,
  Truck,
  Package,
} from 'lucide-react'

export type ComponentCategory = 'frontend' | 'backend' | 'database' | 'cloud' | 'service' | 'devops' | 'security' | 'analytics' | 'networking' | 'compute' | 'storage' | 'identity' | 'containers' | 'ai' | 'monitoring'
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'cloudflare' | 'vercel' | 'generic'
export type ServiceType = 'iaas' | 'paas' | 'saas' | 'generic'

export interface ComponentConfig {
  id: string
  name: string
  category: ComponentCategory
  provider?: CloudProvider
  serviceType?: ServiceType
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
  // For IaaS components - can contain children
  canContain?: string[] // IDs of components that can be children
  // For configurable components
  configurable?: {
    replicas?: boolean // VMs can have replicas
    size?: boolean // VM size selection
    osImage?: boolean // OS selection
    attachments?: string[] // What can attach to this (e.g., NSG to NIC or Subnet)
  }
}

export const COMPONENT_CATALOG: ComponentConfig[] = [
  // ==========================================
  // AZURE IaaS - Networking
  // ==========================================
  {
    id: 'azure-resource-group',
    name: 'Resource Group',
    category: 'cloud',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Box,
    color: '#0078D4',
    description: 'Azure Resource Group - container for related resources',
    estimatedCost: { min: 0, max: 0 },
    canContain: ['azure-vnet', 'azure-vm', 'azure-storage', 'azure-nsg', 'azure-lb', 'azure-app-gw', 'azure-sql'],
    terraform: {
      provider: 'azure',
      resource: 'azurerm_resource_group',
      defaultConfig: { location: 'westeurope' }
    }
  },
  {
    id: 'azure-vnet',
    name: 'Virtual Network',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure Virtual Network (VNet) - isolated network in Azure',
    estimatedCost: { min: 0, max: 5 },
    canContain: ['azure-subnet'],
    terraform: {
      provider: 'azure',
      resource: 'azurerm_virtual_network',
      defaultConfig: { address_space: ['10.0.0.0/16'] }
    }
  },
  {
    id: 'azure-subnet',
    name: 'Subnet',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure Subnet - network segment within VNet',
    estimatedCost: { min: 0, max: 0 },
    canContain: ['azure-vm', 'azure-nic'],
    configurable: { attachments: ['azure-nsg', 'azure-route-table'] },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_subnet',
      defaultConfig: { address_prefixes: ['10.0.1.0/24'] }
    }
  },
  {
    id: 'azure-nsg',
    name: 'Network Security Group',
    category: 'security',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Shield,
    color: '#0078D4',
    description: 'Azure NSG - firewall rules for VNet/Subnet/NIC',
    estimatedCost: { min: 0, max: 0 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_network_security_group',
      defaultConfig: {}
    }
  },
  {
    id: 'azure-nic',
    name: 'Network Interface',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure NIC - network interface for VMs',
    estimatedCost: { min: 0, max: 0 },
    configurable: { attachments: ['azure-nsg'] },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_network_interface',
      defaultConfig: {}
    }
  },
  {
    id: 'azure-public-ip',
    name: 'Public IP',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Globe,
    color: '#0078D4',
    description: 'Azure Public IP address',
    estimatedCost: { min: 3, max: 5 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_public_ip',
      defaultConfig: { allocation_method: 'Static', sku: 'Standard' }
    }
  },
  {
    id: 'azure-route-table',
    name: 'Route Table',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure Route Table - custom routing for subnets',
    estimatedCost: { min: 0, max: 0 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_route_table',
      defaultConfig: {}
    }
  },
  {
    id: 'azure-nat-gateway',
    name: 'NAT Gateway',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure NAT Gateway - outbound internet connectivity',
    estimatedCost: { min: 32, max: 45 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_nat_gateway',
      defaultConfig: {}
    }
  },
  {
    id: 'azure-vpn-gateway',
    name: 'VPN Gateway',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Lock,
    color: '#0078D4',
    description: 'Azure VPN Gateway - site-to-site/point-to-site VPN',
    estimatedCost: { min: 140, max: 600 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_virtual_network_gateway',
      defaultConfig: { type: 'Vpn', vpn_type: 'RouteBased' }
    }
  },
  {
    id: 'azure-express-route',
    name: 'ExpressRoute',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure ExpressRoute - private connection to Azure',
    estimatedCost: { min: 55, max: 5000 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_express_route_circuit',
      defaultConfig: {}
    }
  },
  {
    id: 'azure-bastion',
    name: 'Azure Bastion',
    category: 'security',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Shield,
    color: '#0078D4',
    description: 'Secure RDP/SSH access to VMs without public IP',
    estimatedCost: { min: 140, max: 700 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_bastion_host',
      defaultConfig: {}
    }
  },
  {
    id: 'azure-firewall',
    name: 'Azure Firewall',
    category: 'security',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Shield,
    color: '#0078D4',
    description: 'Managed firewall service for VNet',
    estimatedCost: { min: 912, max: 1500 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_firewall',
      defaultConfig: { sku_tier: 'Standard' }
    }
  },
  {
    id: 'azure-ddos-protection',
    name: 'DDoS Protection',
    category: 'security',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Shield,
    color: '#0078D4',
    description: 'Azure DDoS Protection Plan',
    estimatedCost: { min: 2944, max: 2944 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_network_ddos_protection_plan',
      defaultConfig: {}
    }
  },
  // ==========================================
  // AZURE IaaS - Compute
  // ==========================================
  {
    id: 'azure-vm',
    name: 'Virtual Machine',
    category: 'compute',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Server,
    color: '#0078D4',
    description: 'Azure Virtual Machine - IaaS compute',
    estimatedCost: { min: 15, max: 2000 },
    configurable: {
      replicas: true,
      size: true,
      osImage: true,
      attachments: ['azure-nic', 'azure-managed-disk']
    },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_linux_virtual_machine',
      defaultConfig: { size: 'Standard_B2s' }
    }
  },
  {
    id: 'azure-vmss',
    name: 'VM Scale Set',
    category: 'compute',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Server,
    color: '#0078D4',
    description: 'Azure VM Scale Set - auto-scaling VMs',
    estimatedCost: { min: 30, max: 5000 },
    configurable: { size: true, osImage: true },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_linux_virtual_machine_scale_set',
      defaultConfig: { instances: 2, sku: 'Standard_B2s' }
    }
  },
  {
    id: 'azure-availability-set',
    name: 'Availability Set',
    category: 'compute',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Server,
    color: '#0078D4',
    description: 'Azure Availability Set - HA for VMs',
    estimatedCost: { min: 0, max: 0 },
    canContain: ['azure-vm'],
    terraform: {
      provider: 'azure',
      resource: 'azurerm_availability_set',
      defaultConfig: { platform_fault_domain_count: 2, platform_update_domain_count: 5 }
    }
  },
  // ==========================================
  // AZURE IaaS - Storage
  // ==========================================
  {
    id: 'azure-storage-account',
    name: 'Storage Account',
    category: 'storage',
    provider: 'azure',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#0078D4',
    description: 'Azure Storage Account - blobs, files, queues, tables',
    estimatedCost: { min: 1, max: 500 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_storage_account',
      defaultConfig: { account_tier: 'Standard', account_replication_type: 'LRS' }
    }
  },
  {
    id: 'azure-managed-disk',
    name: 'Managed Disk',
    category: 'storage',
    provider: 'azure',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#0078D4',
    description: 'Azure Managed Disk - persistent storage for VMs',
    estimatedCost: { min: 2, max: 500 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_managed_disk',
      defaultConfig: { storage_account_type: 'Premium_LRS', disk_size_gb: 128 }
    }
  },
  {
    id: 'azure-file-share',
    name: 'File Share',
    category: 'storage',
    provider: 'azure',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#0078D4',
    description: 'Azure Files - SMB file share',
    estimatedCost: { min: 5, max: 200 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_storage_share',
      defaultConfig: { quota: 100 }
    }
  },
  // ==========================================
  // AZURE IaaS - Load Balancing
  // ==========================================
  {
    id: 'azure-lb',
    name: 'Load Balancer',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure Load Balancer - L4 load balancing',
    estimatedCost: { min: 18, max: 100 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_lb',
      defaultConfig: { sku: 'Standard' }
    }
  },
  {
    id: 'azure-app-gw',
    name: 'Application Gateway',
    category: 'networking',
    provider: 'azure',
    serviceType: 'iaas',
    icon: Network,
    color: '#0078D4',
    description: 'Azure Application Gateway - L7 load balancer with WAF',
    estimatedCost: { min: 175, max: 700 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_application_gateway',
      defaultConfig: { sku: { name: 'Standard_v2', tier: 'Standard_v2' } }
    }
  },
  {
    id: 'azure-front-door',
    name: 'Front Door',
    category: 'networking',
    provider: 'azure',
    serviceType: 'paas',
    icon: Globe,
    color: '#0078D4',
    description: 'Azure Front Door - global load balancer with CDN',
    estimatedCost: { min: 35, max: 500 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_frontdoor',
      defaultConfig: {}
    }
  },
  {
    id: 'azure-traffic-manager',
    name: 'Traffic Manager',
    category: 'networking',
    provider: 'azure',
    serviceType: 'paas',
    icon: Globe,
    color: '#0078D4',
    description: 'Azure Traffic Manager - DNS-based traffic routing',
    estimatedCost: { min: 0.50, max: 50 },
    terraform: {
      provider: 'azure',
      resource: 'azurerm_traffic_manager_profile',
      defaultConfig: { traffic_routing_method: 'Performance' }
    }
  },
  // ==========================================
  // AWS IaaS - Networking
  // ==========================================
  {
    id: 'aws-vpc',
    name: 'VPC',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Network,
    color: '#FF9900',
    description: 'AWS Virtual Private Cloud - isolated network',
    estimatedCost: { min: 0, max: 5 },
    canContain: ['aws-subnet'],
    terraform: {
      provider: 'aws',
      resource: 'aws_vpc',
      defaultConfig: { cidr_block: '10.0.0.0/16' }
    }
  },
  {
    id: 'aws-subnet',
    name: 'Subnet',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Network,
    color: '#FF9900',
    description: 'AWS Subnet - network segment in VPC',
    estimatedCost: { min: 0, max: 0 },
    canContain: ['aws-ec2'],
    terraform: {
      provider: 'aws',
      resource: 'aws_subnet',
      defaultConfig: { cidr_block: '10.0.1.0/24' }
    }
  },
  {
    id: 'aws-security-group',
    name: 'Security Group',
    category: 'security',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Shield,
    color: '#FF9900',
    description: 'AWS Security Group - virtual firewall',
    estimatedCost: { min: 0, max: 0 },
    terraform: {
      provider: 'aws',
      resource: 'aws_security_group',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-internet-gateway',
    name: 'Internet Gateway',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Globe,
    color: '#FF9900',
    description: 'AWS Internet Gateway - connect VPC to internet',
    estimatedCost: { min: 0, max: 0 },
    terraform: {
      provider: 'aws',
      resource: 'aws_internet_gateway',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-nat-gateway',
    name: 'NAT Gateway',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Network,
    color: '#FF9900',
    description: 'AWS NAT Gateway - outbound internet for private subnets',
    estimatedCost: { min: 32, max: 100 },
    terraform: {
      provider: 'aws',
      resource: 'aws_nat_gateway',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-route-table',
    name: 'Route Table',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Network,
    color: '#FF9900',
    description: 'AWS Route Table - routing for subnets',
    estimatedCost: { min: 0, max: 0 },
    terraform: {
      provider: 'aws',
      resource: 'aws_route_table',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-elastic-ip',
    name: 'Elastic IP',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Globe,
    color: '#FF9900',
    description: 'AWS Elastic IP - static public IP',
    estimatedCost: { min: 3.6, max: 5 },
    terraform: {
      provider: 'aws',
      resource: 'aws_eip',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-alb',
    name: 'Application Load Balancer',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Network,
    color: '#FF9900',
    description: 'AWS ALB - L7 load balancer',
    estimatedCost: { min: 16, max: 200 },
    terraform: {
      provider: 'aws',
      resource: 'aws_lb',
      defaultConfig: { load_balancer_type: 'application' }
    }
  },
  {
    id: 'aws-nlb',
    name: 'Network Load Balancer',
    category: 'networking',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Network,
    color: '#FF9900',
    description: 'AWS NLB - L4 load balancer',
    estimatedCost: { min: 16, max: 200 },
    terraform: {
      provider: 'aws',
      resource: 'aws_lb',
      defaultConfig: { load_balancer_type: 'network' }
    }
  },
  {
    id: 'aws-cloudfront',
    name: 'CloudFront',
    category: 'networking',
    provider: 'aws',
    serviceType: 'paas',
    icon: Globe,
    color: '#FF9900',
    description: 'AWS CloudFront - CDN',
    estimatedCost: { min: 0, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_cloudfront_distribution',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-route53',
    name: 'Route 53',
    category: 'networking',
    provider: 'aws',
    serviceType: 'paas',
    icon: Globe,
    color: '#FF9900',
    description: 'AWS Route 53 - DNS service',
    estimatedCost: { min: 0.50, max: 50 },
    terraform: {
      provider: 'aws',
      resource: 'aws_route53_zone',
      defaultConfig: {}
    }
  },
  // ==========================================
  // AWS IaaS - Compute
  // ==========================================
  {
    id: 'aws-ec2',
    name: 'EC2 Instance',
    category: 'compute',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Server,
    color: '#FF9900',
    description: 'AWS EC2 - virtual servers',
    estimatedCost: { min: 8, max: 2000 },
    configurable: { replicas: true, size: true, osImage: true },
    terraform: {
      provider: 'aws',
      resource: 'aws_instance',
      defaultConfig: { instance_type: 't3.micro' }
    }
  },
  {
    id: 'aws-auto-scaling',
    name: 'Auto Scaling Group',
    category: 'compute',
    provider: 'aws',
    serviceType: 'iaas',
    icon: Server,
    color: '#FF9900',
    description: 'AWS Auto Scaling - automatically scale EC2',
    estimatedCost: { min: 0, max: 0 },
    terraform: {
      provider: 'aws',
      resource: 'aws_autoscaling_group',
      defaultConfig: { min_size: 1, max_size: 10 }
    }
  },
  // ==========================================
  // AWS IaaS - Storage
  // ==========================================
  {
    id: 'aws-s3',
    name: 'S3 Bucket',
    category: 'storage',
    provider: 'aws',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#FF9900',
    description: 'AWS S3 - object storage',
    estimatedCost: { min: 0, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_s3_bucket',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-ebs',
    name: 'EBS Volume',
    category: 'storage',
    provider: 'aws',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#FF9900',
    description: 'AWS EBS - block storage for EC2',
    estimatedCost: { min: 2, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_ebs_volume',
      defaultConfig: { type: 'gp3', size: 100 }
    }
  },
  {
    id: 'aws-efs',
    name: 'EFS File System',
    category: 'storage',
    provider: 'aws',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#FF9900',
    description: 'AWS EFS - managed NFS',
    estimatedCost: { min: 5, max: 300 },
    terraform: {
      provider: 'aws',
      resource: 'aws_efs_file_system',
      defaultConfig: {}
    }
  },
  // ==========================================
  // GCP IaaS - Networking
  // ==========================================
  {
    id: 'gcp-vpc',
    name: 'VPC Network',
    category: 'networking',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: Network,
    color: '#4285F4',
    description: 'GCP VPC - virtual private cloud',
    estimatedCost: { min: 0, max: 5 },
    canContain: ['gcp-subnet'],
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_network',
      defaultConfig: { auto_create_subnetworks: false }
    }
  },
  {
    id: 'gcp-subnet',
    name: 'Subnetwork',
    category: 'networking',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: Network,
    color: '#4285F4',
    description: 'GCP Subnet - regional subnet in VPC',
    estimatedCost: { min: 0, max: 0 },
    canContain: ['gcp-compute-instance'],
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_subnetwork',
      defaultConfig: { ip_cidr_range: '10.0.1.0/24' }
    }
  },
  {
    id: 'gcp-firewall',
    name: 'Firewall Rule',
    category: 'security',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: Shield,
    color: '#4285F4',
    description: 'GCP Firewall - network-level firewall',
    estimatedCost: { min: 0, max: 0 },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_firewall',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-cloud-nat',
    name: 'Cloud NAT',
    category: 'networking',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: Network,
    color: '#4285F4',
    description: 'GCP Cloud NAT - managed NAT gateway',
    estimatedCost: { min: 32, max: 100 },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_router_nat',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-cloud-lb',
    name: 'Cloud Load Balancer',
    category: 'networking',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: Network,
    color: '#4285F4',
    description: 'GCP Load Balancer - global/regional LB',
    estimatedCost: { min: 18, max: 200 },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_global_forwarding_rule',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-cloud-cdn',
    name: 'Cloud CDN',
    category: 'networking',
    provider: 'gcp',
    serviceType: 'paas',
    icon: Globe,
    color: '#4285F4',
    description: 'GCP Cloud CDN - content delivery',
    estimatedCost: { min: 0, max: 200 },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_backend_service',
      defaultConfig: { enable_cdn: true }
    }
  },
  // ==========================================
  // GCP IaaS - Compute
  // ==========================================
  {
    id: 'gcp-compute-instance',
    name: 'Compute Engine',
    category: 'compute',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: Server,
    color: '#4285F4',
    description: 'GCP VM - virtual machine',
    estimatedCost: { min: 5, max: 2000 },
    configurable: { replicas: true, size: true, osImage: true },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_instance',
      defaultConfig: { machine_type: 'e2-medium' }
    }
  },
  {
    id: 'gcp-instance-group',
    name: 'Instance Group',
    category: 'compute',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: Server,
    color: '#4285F4',
    description: 'GCP Managed Instance Group - auto-scaling',
    estimatedCost: { min: 10, max: 5000 },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_instance_group_manager',
      defaultConfig: { target_size: 2 }
    }
  },
  // ==========================================
  // GCP IaaS - Storage
  // ==========================================
  {
    id: 'gcp-cloud-storage',
    name: 'Cloud Storage',
    category: 'storage',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#4285F4',
    description: 'GCP Cloud Storage - object storage',
    estimatedCost: { min: 0, max: 500 },
    terraform: {
      provider: 'gcp',
      resource: 'google_storage_bucket',
      defaultConfig: { location: 'EU' }
    }
  },
  {
    id: 'gcp-persistent-disk',
    name: 'Persistent Disk',
    category: 'storage',
    provider: 'gcp',
    serviceType: 'iaas',
    icon: HardDrive,
    color: '#4285F4',
    description: 'GCP Persistent Disk - block storage',
    estimatedCost: { min: 2, max: 500 },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_disk',
      defaultConfig: { type: 'pd-ssd', size: 100 }
    }
  },
  // ==========================================
  // Frontend Components
  // ==========================================
  {
    id: 'react-app',
    name: 'React Application',
    category: 'frontend',
    serviceType: 'generic',
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

  // Additional AWS Services
  {
    id: 'aws-rds',
    name: 'AWS RDS',
    category: 'database',
    provider: 'aws',
    icon: Database,
    color: '#FF9900',
    description: 'Managed relational database service',
    estimatedCost: { min: 15, max: 1000 },
    terraform: {
      provider: 'aws',
      resource: 'aws_db_instance',
      defaultConfig: { engine: 'postgres', instance_class: 'db.t3.micro' }
    }
  },
  {
    id: 'aws-ec2',
    name: 'AWS EC2',
    category: 'cloud',
    provider: 'aws',
    icon: Server,
    color: '#FF9900',
    description: 'Virtual servers in the cloud',
    estimatedCost: { min: 10, max: 2000 },
    terraform: {
      provider: 'aws',
      resource: 'aws_instance',
      defaultConfig: { instance_type: 't3.micro' }
    }
  },
  {
    id: 'aws-eks',
    name: 'AWS EKS',
    category: 'cloud',
    provider: 'aws',
    icon: Container,
    color: '#FF9900',
    description: 'Managed Kubernetes service',
    estimatedCost: { min: 73, max: 3000 },
    terraform: {
      provider: 'aws',
      resource: 'aws_eks_cluster',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-sns',
    name: 'AWS SNS',
    category: 'service',
    provider: 'aws',
    icon: Radio,
    color: '#FF9900',
    description: 'Pub/Sub messaging service',
    estimatedCost: { min: 0, max: 50 },
    terraform: {
      provider: 'aws',
      resource: 'aws_sns_topic',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-cloudfront',
    name: 'AWS CloudFront',
    category: 'service',
    provider: 'aws',
    icon: Globe,
    color: '#FF9900',
    description: 'Content delivery network',
    estimatedCost: { min: 0, max: 200 },
    terraform: {
      provider: 'aws',
      resource: 'aws_cloudfront_distribution',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-cognito',
    name: 'AWS Cognito',
    category: 'security',
    provider: 'aws',
    icon: Users,
    color: '#FF9900',
    description: 'User authentication and authorization',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'aws',
      resource: 'aws_cognito_user_pool',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-secrets-manager',
    name: 'AWS Secrets Manager',
    category: 'security',
    provider: 'aws',
    icon: Key,
    color: '#FF9900',
    description: 'Manage secrets and credentials',
    estimatedCost: { min: 0.40, max: 50 },
    terraform: {
      provider: 'aws',
      resource: 'aws_secretsmanager_secret',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-step-functions',
    name: 'AWS Step Functions',
    category: 'service',
    provider: 'aws',
    icon: Workflow,
    color: '#FF9900',
    description: 'Workflow orchestration',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'aws',
      resource: 'aws_sfn_state_machine',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-eventbridge',
    name: 'AWS EventBridge',
    category: 'service',
    provider: 'aws',
    icon: Zap,
    color: '#FF9900',
    description: 'Event-driven architecture',
    estimatedCost: { min: 0, max: 50 },
    terraform: {
      provider: 'aws',
      resource: 'aws_cloudwatch_event_bus',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-route53',
    name: 'AWS Route 53',
    category: 'service',
    provider: 'aws',
    icon: Globe,
    color: '#FF9900',
    description: 'DNS and domain management',
    estimatedCost: { min: 0.50, max: 50 },
    terraform: {
      provider: 'aws',
      resource: 'aws_route53_zone',
      defaultConfig: {}
    }
  },
  {
    id: 'aws-elb',
    name: 'AWS Load Balancer',
    category: 'cloud',
    provider: 'aws',
    icon: Network,
    color: '#FF9900',
    description: 'Application Load Balancer',
    estimatedCost: { min: 20, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_lb',
      defaultConfig: { load_balancer_type: 'application' }
    }
  },
  {
    id: 'aws-elasticache',
    name: 'AWS ElastiCache',
    category: 'database',
    provider: 'aws',
    icon: Database,
    color: '#FF9900',
    description: 'In-memory caching service',
    estimatedCost: { min: 15, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_elasticache_cluster',
      defaultConfig: { engine: 'redis', node_type: 'cache.t3.micro' }
    }
  },
  {
    id: 'aws-kinesis',
    name: 'AWS Kinesis',
    category: 'analytics',
    provider: 'aws',
    icon: Activity,
    color: '#FF9900',
    description: 'Real-time data streaming',
    estimatedCost: { min: 15, max: 500 },
    terraform: {
      provider: 'aws',
      resource: 'aws_kinesis_stream',
      defaultConfig: { shard_count: 1 }
    }
  },

  // Additional GCP Services
  {
    id: 'gcp-compute-engine',
    name: 'GCP Compute Engine',
    category: 'cloud',
    provider: 'gcp',
    icon: Server,
    color: '#4285F4',
    description: 'Virtual machines on GCP',
    estimatedCost: { min: 5, max: 2000 },
    terraform: {
      provider: 'gcp',
      resource: 'google_compute_instance',
      defaultConfig: { machine_type: 'e2-micro' }
    }
  },
  {
    id: 'gcp-gke',
    name: 'GCP GKE',
    category: 'cloud',
    provider: 'gcp',
    icon: Container,
    color: '#4285F4',
    description: 'Managed Kubernetes service',
    estimatedCost: { min: 73, max: 3000 },
    terraform: {
      provider: 'gcp',
      resource: 'google_container_cluster',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-cloud-sql',
    name: 'GCP Cloud SQL',
    category: 'database',
    provider: 'gcp',
    icon: Database,
    color: '#4285F4',
    description: 'Managed MySQL/PostgreSQL',
    estimatedCost: { min: 10, max: 1000 },
    terraform: {
      provider: 'gcp',
      resource: 'google_sql_database_instance',
      defaultConfig: { database_version: 'POSTGRES_14' }
    }
  },
  {
    id: 'gcp-cloud-storage',
    name: 'GCP Cloud Storage',
    category: 'cloud',
    provider: 'gcp',
    icon: HardDrive,
    color: '#4285F4',
    description: 'Object storage service',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'gcp',
      resource: 'google_storage_bucket',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-pubsub',
    name: 'GCP Pub/Sub',
    category: 'service',
    provider: 'gcp',
    icon: MessageSquare,
    color: '#4285F4',
    description: 'Messaging service',
    estimatedCost: { min: 0, max: 100 },
    terraform: {
      provider: 'gcp',
      resource: 'google_pubsub_topic',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-bigquery',
    name: 'GCP BigQuery',
    category: 'analytics',
    provider: 'gcp',
    icon: BarChart,
    color: '#4285F4',
    description: 'Data warehouse analytics',
    estimatedCost: { min: 0, max: 1000 },
    terraform: {
      provider: 'gcp',
      resource: 'google_bigquery_dataset',
      defaultConfig: {}
    }
  },
  {
    id: 'gcp-firebase',
    name: 'GCP Firebase',
    category: 'service',
    provider: 'gcp',
    icon: Zap,
    color: '#FFCA28',
    description: 'App development platform',
    estimatedCost: { min: 0, max: 200 },
  },

  // Additional Azure Services
  {
    id: 'azure-vm',
    name: 'Azure Virtual Machine',
    category: 'cloud',
    provider: 'azure',
    icon: Server,
    color: '#0078D4',
    description: 'Virtual machines on Azure',
    estimatedCost: { min: 10, max: 2000 },
  },
  {
    id: 'azure-aks',
    name: 'Azure AKS',
    category: 'cloud',
    provider: 'azure',
    icon: Container,
    color: '#0078D4',
    description: 'Managed Kubernetes service',
    estimatedCost: { min: 73, max: 3000 },
  },
  {
    id: 'azure-sql',
    name: 'Azure SQL Database',
    category: 'database',
    provider: 'azure',
    icon: Database,
    color: '#0078D4',
    description: 'Managed SQL database',
    estimatedCost: { min: 15, max: 1000 },
  },
  {
    id: 'azure-blob',
    name: 'Azure Blob Storage',
    category: 'cloud',
    provider: 'azure',
    icon: HardDrive,
    color: '#0078D4',
    description: 'Object storage service',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'azure-cosmos',
    name: 'Azure Cosmos DB',
    category: 'database',
    provider: 'azure',
    icon: Database,
    color: '#0078D4',
    description: 'Globally distributed NoSQL',
    estimatedCost: { min: 25, max: 2000 },
  },
  {
    id: 'azure-event-hub',
    name: 'Azure Event Hubs',
    category: 'service',
    provider: 'azure',
    icon: Activity,
    color: '#0078D4',
    description: 'Big data streaming',
    estimatedCost: { min: 10, max: 500 },
  },
  {
    id: 'azure-service-bus',
    name: 'Azure Service Bus',
    category: 'service',
    provider: 'azure',
    icon: MessageSquare,
    color: '#0078D4',
    description: 'Enterprise messaging',
    estimatedCost: { min: 0, max: 200 },
  },
  {
    id: 'azure-ad',
    name: 'Azure Active Directory',
    category: 'security',
    provider: 'azure',
    icon: Shield,
    color: '#0078D4',
    description: 'Identity management',
    estimatedCost: { min: 0, max: 500 },
  },
  {
    id: 'azure-key-vault',
    name: 'Azure Key Vault',
    category: 'security',
    provider: 'azure',
    icon: Key,
    color: '#0078D4',
    description: 'Secret management',
    estimatedCost: { min: 0, max: 50 },
  },

  // DevOps & CI/CD Tools
  {
    id: 'docker',
    name: 'Docker Container',
    category: 'devops',
    provider: 'generic',
    icon: Container,
    color: '#2496ED',
    description: 'Containerized application',
    estimatedCost: { min: 0, max: 0 },
  },
  {
    id: 'terraform',
    name: 'Terraform',
    category: 'devops',
    provider: 'generic',
    icon: FileCode,
    color: '#7B42BC',
    description: 'Infrastructure as Code',
    estimatedCost: { min: 0, max: 0 },
  },
  {
    id: 'ansible',
    name: 'Ansible',
    category: 'devops',
    provider: 'generic',
    icon: Terminal,
    color: '#EE0000',
    description: 'Configuration management',
    estimatedCost: { min: 0, max: 0 },
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    category: 'devops',
    provider: 'generic',
    icon: Cog,
    color: '#D24939',
    description: 'CI/CD automation server',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    category: 'devops',
    provider: 'generic',
    icon: GitBranch,
    color: '#2088FF',
    description: 'CI/CD workflow automation',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'gitlab-ci',
    name: 'GitLab CI/CD',
    category: 'devops',
    provider: 'generic',
    icon: GitBranch,
    color: '#FC6D26',
    description: 'Built-in CI/CD pipelines',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'argocd',
    name: 'ArgoCD',
    category: 'devops',
    provider: 'generic',
    icon: Workflow,
    color: '#EF7B4D',
    description: 'GitOps continuous delivery',
    estimatedCost: { min: 0, max: 0 },
  },
  {
    id: 'helm',
    name: 'Helm Chart',
    category: 'devops',
    provider: 'generic',
    icon: Package,
    color: '#0F1689',
    description: 'Kubernetes package manager',
    estimatedCost: { min: 0, max: 0 },
  },

  // Monitoring & Observability
  {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'analytics',
    provider: 'generic',
    icon: Gauge,
    color: '#E6522C',
    description: 'Metrics monitoring',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'analytics',
    provider: 'generic',
    icon: BarChart,
    color: '#F46800',
    description: 'Visualization dashboards',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'datadog',
    name: 'Datadog',
    category: 'analytics',
    provider: 'generic',
    icon: Activity,
    color: '#632CA6',
    description: 'Cloud monitoring platform',
    estimatedCost: { min: 15, max: 500 },
  },
  {
    id: 'elastic-stack',
    name: 'ELK Stack',
    category: 'analytics',
    provider: 'generic',
    icon: Search,
    color: '#005571',
    description: 'Log aggregation & search',
    estimatedCost: { min: 0, max: 500 },
  },
  {
    id: 'newrelic',
    name: 'New Relic',
    category: 'analytics',
    provider: 'generic',
    icon: Eye,
    color: '#008C99',
    description: 'Application performance monitoring',
    estimatedCost: { min: 0, max: 300 },
  },
  {
    id: 'jaeger',
    name: 'Jaeger',
    category: 'analytics',
    provider: 'generic',
    icon: Activity,
    color: '#60D0E4',
    description: 'Distributed tracing',
    estimatedCost: { min: 0, max: 0 },
  },

  // Messaging & Queues
  {
    id: 'rabbitmq',
    name: 'RabbitMQ',
    category: 'service',
    provider: 'generic',
    icon: MessageSquare,
    color: '#FF6600',
    description: 'Message broker',
    estimatedCost: { min: 0, max: 200 },
  },
  {
    id: 'kafka',
    name: 'Apache Kafka',
    category: 'service',
    provider: 'generic',
    icon: Activity,
    color: '#231F20',
    description: 'Event streaming platform',
    estimatedCost: { min: 50, max: 1000 },
  },
  {
    id: 'nats',
    name: 'NATS',
    category: 'service',
    provider: 'generic',
    icon: Wifi,
    color: '#27AAE1',
    description: 'Cloud native messaging',
    estimatedCost: { min: 0, max: 100 },
  },

  // Security Services
  {
    id: 'vault',
    name: 'HashiCorp Vault',
    category: 'security',
    provider: 'generic',
    icon: Lock,
    color: '#000000',
    description: 'Secrets management',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'oauth-provider',
    name: 'OAuth Provider',
    category: 'security',
    provider: 'generic',
    icon: Key,
    color: '#EB5424',
    description: 'Authentication provider',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'waf',
    name: 'Web Application Firewall',
    category: 'security',
    provider: 'generic',
    icon: Shield,
    color: '#FF4444',
    description: 'Web security protection',
    estimatedCost: { min: 5, max: 500 },
  },

  // Cloudflare Services
  {
    id: 'cloudflare-cdn',
    name: 'Cloudflare CDN',
    category: 'service',
    provider: 'cloudflare',
    icon: Globe,
    color: '#F38020',
    description: 'Global content delivery',
    estimatedCost: { min: 0, max: 200 },
  },
  {
    id: 'cloudflare-pages',
    name: 'Cloudflare Pages',
    category: 'frontend',
    provider: 'cloudflare',
    icon: Code,
    color: '#F38020',
    description: 'JAMstack platform',
    estimatedCost: { min: 0, max: 20 },
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    category: 'cloud',
    provider: 'cloudflare',
    icon: HardDrive,
    color: '#F38020',
    description: 'S3-compatible object storage',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'cloudflare-d1',
    name: 'Cloudflare D1',
    category: 'database',
    provider: 'cloudflare',
    icon: Database,
    color: '#F38020',
    description: 'Serverless SQLite',
    estimatedCost: { min: 0, max: 50 },
  },

  // Other Popular Services
  {
    id: 'stripe',
    name: 'Stripe Payments',
    category: 'service',
    provider: 'generic',
    icon: ShoppingCart,
    color: '#635BFF',
    description: 'Payment processing',
    estimatedCost: { min: 0, max: 0 },
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'service',
    provider: 'generic',
    icon: Smartphone,
    color: '#F22F46',
    description: 'Communication APIs',
    estimatedCost: { min: 0, max: 200 },
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'service',
    provider: 'generic',
    icon: Mail,
    color: '#1A82E2',
    description: 'Email delivery service',
    estimatedCost: { min: 0, max: 100 },
  },
  {
    id: 'algolia',
    name: 'Algolia',
    category: 'service',
    provider: 'generic',
    icon: Search,
    color: '#5468FF',
    description: 'Search as a service',
    estimatedCost: { min: 0, max: 500 },
  },
  {
    id: 'nginx',
    name: 'NGINX',
    category: 'backend',
    provider: 'generic',
    icon: Server,
    color: '#009639',
    description: 'Web server / reverse proxy',
    estimatedCost: { min: 0, max: 0 },
  },
  {
    id: 'traefik',
    name: 'Traefik',
    category: 'backend',
    provider: 'generic',
    icon: Network,
    color: '#24A1C1',
    description: 'Cloud-native proxy',
    estimatedCost: { min: 0, max: 0 },
  },
]

export function getComponentById(id: string): ComponentConfig | undefined {
  return COMPONENT_CATALOG.find(c => c.id === id)
}

export function getComponentsByCategory(category: ComponentConfig['category']): ComponentConfig[] {
  return COMPONENT_CATALOG.filter(c => c.category === category)
}

export function getComponentsByProvider(provider: ComponentConfig['provider']): ComponentConfig[] {
  return COMPONENT_CATALOG.filter(c => c.provider === provider)
}

export function searchComponents(query: string): ComponentConfig[] {
  const lowerQuery = query.toLowerCase()
  return COMPONENT_CATALOG.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.category.toLowerCase().includes(lowerQuery) ||
    (c.provider && c.provider.toLowerCase().includes(lowerQuery))
  )
}

export const CATEGORIES = [
  { id: 'frontend', name: 'Frontend', icon: Code },
  { id: 'backend', name: 'Backend', icon: Server },
  { id: 'database', name: 'Databases', icon: Database },
  { id: 'cloud', name: 'Cloud Services', icon: Cloud },
  { id: 'service', name: 'Services', icon: Zap },
  { id: 'devops', name: 'DevOps & CI/CD', icon: GitBranch },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'analytics', name: 'Analytics & Monitoring', icon: BarChart },
] as const

export const PROVIDERS = [
  { id: 'aws', name: 'AWS', color: '#FF9900' },
  { id: 'gcp', name: 'Google Cloud', color: '#4285F4' },
  { id: 'azure', name: 'Microsoft Azure', color: '#0078D4' },
  { id: 'cloudflare', name: 'Cloudflare', color: '#F38020' },
  { id: 'vercel', name: 'Vercel', color: '#000000' },
  { id: 'generic', name: 'Multi-Cloud / Generic', color: '#6B7280' },
] as const
