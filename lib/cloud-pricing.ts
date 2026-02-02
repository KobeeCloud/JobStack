// Real pricing data from cloud providers (as of 2026)
// Prices are monthly estimates in USD

export interface VMSize {
  id: string
  name: string
  vcpus: number
  memory: number // GB
  storage?: string
  pricePerHour: number
  pricePerMonth: number
  category: 'general' | 'compute' | 'memory' | 'storage' | 'gpu'
}

export interface OSImage {
  id: string
  name: string
  publisher: string
  version: string
  licenseType: 'linux' | 'windows' | 'byol'
  additionalCost: number // per hour
}

// ================================
// AZURE VM SIZES
// ================================
export const AZURE_VM_SIZES: VMSize[] = [
  // General Purpose - B Series (Burstable)
  { id: 'Standard_B1s', name: 'B1s', vcpus: 1, memory: 1, pricePerHour: 0.0104, pricePerMonth: 7.59, category: 'general' },
  { id: 'Standard_B1ms', name: 'B1ms', vcpus: 1, memory: 2, pricePerHour: 0.0207, pricePerMonth: 15.11, category: 'general' },
  { id: 'Standard_B2s', name: 'B2s', vcpus: 2, memory: 4, pricePerHour: 0.0416, pricePerMonth: 30.37, category: 'general' },
  { id: 'Standard_B2ms', name: 'B2ms', vcpus: 2, memory: 8, pricePerHour: 0.0832, pricePerMonth: 60.74, category: 'general' },
  { id: 'Standard_B4ms', name: 'B4ms', vcpus: 4, memory: 16, pricePerHour: 0.166, pricePerMonth: 121.18, category: 'general' },

  // General Purpose - D Series v5
  { id: 'Standard_D2s_v5', name: 'D2s v5', vcpus: 2, memory: 8, pricePerHour: 0.096, pricePerMonth: 70.08, category: 'general' },
  { id: 'Standard_D4s_v5', name: 'D4s v5', vcpus: 4, memory: 16, pricePerHour: 0.192, pricePerMonth: 140.16, category: 'general' },
  { id: 'Standard_D8s_v5', name: 'D8s v5', vcpus: 8, memory: 32, pricePerHour: 0.384, pricePerMonth: 280.32, category: 'general' },
  { id: 'Standard_D16s_v5', name: 'D16s v5', vcpus: 16, memory: 64, pricePerHour: 0.768, pricePerMonth: 560.64, category: 'general' },
  { id: 'Standard_D32s_v5', name: 'D32s v5', vcpus: 32, memory: 128, pricePerHour: 1.536, pricePerMonth: 1121.28, category: 'general' },

  // Compute Optimized - F Series v2
  { id: 'Standard_F2s_v2', name: 'F2s v2', vcpus: 2, memory: 4, pricePerHour: 0.085, pricePerMonth: 62.05, category: 'compute' },
  { id: 'Standard_F4s_v2', name: 'F4s v2', vcpus: 4, memory: 8, pricePerHour: 0.169, pricePerMonth: 123.37, category: 'compute' },
  { id: 'Standard_F8s_v2', name: 'F8s v2', vcpus: 8, memory: 16, pricePerHour: 0.338, pricePerMonth: 246.74, category: 'compute' },
  { id: 'Standard_F16s_v2', name: 'F16s v2', vcpus: 16, memory: 32, pricePerHour: 0.677, pricePerMonth: 494.21, category: 'compute' },

  // Memory Optimized - E Series v5
  { id: 'Standard_E2s_v5', name: 'E2s v5', vcpus: 2, memory: 16, pricePerHour: 0.126, pricePerMonth: 91.98, category: 'memory' },
  { id: 'Standard_E4s_v5', name: 'E4s v5', vcpus: 4, memory: 32, pricePerHour: 0.252, pricePerMonth: 183.96, category: 'memory' },
  { id: 'Standard_E8s_v5', name: 'E8s v5', vcpus: 8, memory: 64, pricePerHour: 0.504, pricePerMonth: 367.92, category: 'memory' },
  { id: 'Standard_E16s_v5', name: 'E16s v5', vcpus: 16, memory: 128, pricePerHour: 1.008, pricePerMonth: 735.84, category: 'memory' },

  // GPU - NC Series
  { id: 'Standard_NC6s_v3', name: 'NC6s v3 (V100)', vcpus: 6, memory: 112, pricePerHour: 3.06, pricePerMonth: 2233.80, category: 'gpu' },
  { id: 'Standard_NC12s_v3', name: 'NC12s v3 (2x V100)', vcpus: 12, memory: 224, pricePerHour: 6.12, pricePerMonth: 4467.60, category: 'gpu' },
  { id: 'Standard_NC24s_v3', name: 'NC24s v3 (4x V100)', vcpus: 24, memory: 448, pricePerHour: 12.24, pricePerMonth: 8935.20, category: 'gpu' },
]

export const AZURE_OS_IMAGES: OSImage[] = [
  { id: 'ubuntu-2204', name: 'Ubuntu 22.04 LTS', publisher: 'Canonical', version: '22.04', licenseType: 'linux', additionalCost: 0 },
  { id: 'ubuntu-2404', name: 'Ubuntu 24.04 LTS', publisher: 'Canonical', version: '24.04', licenseType: 'linux', additionalCost: 0 },
  { id: 'debian-12', name: 'Debian 12', publisher: 'Debian', version: '12', licenseType: 'linux', additionalCost: 0 },
  { id: 'rhel-9', name: 'Red Hat Enterprise Linux 9', publisher: 'RedHat', version: '9', licenseType: 'linux', additionalCost: 0.06 },
  { id: 'windows-2022', name: 'Windows Server 2022', publisher: 'Microsoft', version: '2022', licenseType: 'windows', additionalCost: 0.046 },
  { id: 'windows-2019', name: 'Windows Server 2019', publisher: 'Microsoft', version: '2019', licenseType: 'windows', additionalCost: 0.046 },
  { id: 'centos-stream-9', name: 'CentOS Stream 9', publisher: 'CentOS', version: '9', licenseType: 'linux', additionalCost: 0 },
  { id: 'rocky-9', name: 'Rocky Linux 9', publisher: 'Rocky', version: '9', licenseType: 'linux', additionalCost: 0 },
  { id: 'alma-9', name: 'AlmaLinux 9', publisher: 'AlmaLinux', version: '9', licenseType: 'linux', additionalCost: 0 },
]

// ================================
// AWS EC2 INSTANCE TYPES
// ================================
export const AWS_VM_SIZES: VMSize[] = [
  // General Purpose - T3
  { id: 't3.micro', name: 't3.micro', vcpus: 2, memory: 1, pricePerHour: 0.0104, pricePerMonth: 7.59, category: 'general' },
  { id: 't3.small', name: 't3.small', vcpus: 2, memory: 2, pricePerHour: 0.0208, pricePerMonth: 15.18, category: 'general' },
  { id: 't3.medium', name: 't3.medium', vcpus: 2, memory: 4, pricePerHour: 0.0416, pricePerMonth: 30.37, category: 'general' },
  { id: 't3.large', name: 't3.large', vcpus: 2, memory: 8, pricePerHour: 0.0832, pricePerMonth: 60.74, category: 'general' },
  { id: 't3.xlarge', name: 't3.xlarge', vcpus: 4, memory: 16, pricePerHour: 0.1664, pricePerMonth: 121.47, category: 'general' },
  { id: 't3.2xlarge', name: 't3.2xlarge', vcpus: 8, memory: 32, pricePerHour: 0.3328, pricePerMonth: 242.94, category: 'general' },

  // General Purpose - M6i
  { id: 'm6i.large', name: 'm6i.large', vcpus: 2, memory: 8, pricePerHour: 0.096, pricePerMonth: 70.08, category: 'general' },
  { id: 'm6i.xlarge', name: 'm6i.xlarge', vcpus: 4, memory: 16, pricePerHour: 0.192, pricePerMonth: 140.16, category: 'general' },
  { id: 'm6i.2xlarge', name: 'm6i.2xlarge', vcpus: 8, memory: 32, pricePerHour: 0.384, pricePerMonth: 280.32, category: 'general' },
  { id: 'm6i.4xlarge', name: 'm6i.4xlarge', vcpus: 16, memory: 64, pricePerHour: 0.768, pricePerMonth: 560.64, category: 'general' },
  { id: 'm6i.8xlarge', name: 'm6i.8xlarge', vcpus: 32, memory: 128, pricePerHour: 1.536, pricePerMonth: 1121.28, category: 'general' },

  // Compute Optimized - C6i
  { id: 'c6i.large', name: 'c6i.large', vcpus: 2, memory: 4, pricePerHour: 0.085, pricePerMonth: 62.05, category: 'compute' },
  { id: 'c6i.xlarge', name: 'c6i.xlarge', vcpus: 4, memory: 8, pricePerHour: 0.17, pricePerMonth: 124.10, category: 'compute' },
  { id: 'c6i.2xlarge', name: 'c6i.2xlarge', vcpus: 8, memory: 16, pricePerHour: 0.34, pricePerMonth: 248.20, category: 'compute' },
  { id: 'c6i.4xlarge', name: 'c6i.4xlarge', vcpus: 16, memory: 32, pricePerHour: 0.68, pricePerMonth: 496.40, category: 'compute' },

  // Memory Optimized - R6i
  { id: 'r6i.large', name: 'r6i.large', vcpus: 2, memory: 16, pricePerHour: 0.126, pricePerMonth: 91.98, category: 'memory' },
  { id: 'r6i.xlarge', name: 'r6i.xlarge', vcpus: 4, memory: 32, pricePerHour: 0.252, pricePerMonth: 183.96, category: 'memory' },
  { id: 'r6i.2xlarge', name: 'r6i.2xlarge', vcpus: 8, memory: 64, pricePerHour: 0.504, pricePerMonth: 367.92, category: 'memory' },
  { id: 'r6i.4xlarge', name: 'r6i.4xlarge', vcpus: 16, memory: 128, pricePerHour: 1.008, pricePerMonth: 735.84, category: 'memory' },

  // GPU - P4d
  { id: 'p4d.24xlarge', name: 'p4d.24xlarge (8x A100)', vcpus: 96, memory: 1152, pricePerHour: 32.77, pricePerMonth: 23922.10, category: 'gpu' },
  { id: 'g4dn.xlarge', name: 'g4dn.xlarge (T4)', vcpus: 4, memory: 16, pricePerHour: 0.526, pricePerMonth: 383.98, category: 'gpu' },
  { id: 'g4dn.2xlarge', name: 'g4dn.2xlarge (T4)', vcpus: 8, memory: 32, pricePerHour: 0.752, pricePerMonth: 548.96, category: 'gpu' },
]

export const AWS_OS_IMAGES: OSImage[] = [
  { id: 'ami-ubuntu-2204', name: 'Ubuntu 22.04 LTS', publisher: 'Canonical', version: '22.04', licenseType: 'linux', additionalCost: 0 },
  { id: 'ami-ubuntu-2404', name: 'Ubuntu 24.04 LTS', publisher: 'Canonical', version: '24.04', licenseType: 'linux', additionalCost: 0 },
  { id: 'ami-amazon-linux-2023', name: 'Amazon Linux 2023', publisher: 'Amazon', version: '2023', licenseType: 'linux', additionalCost: 0 },
  { id: 'ami-debian-12', name: 'Debian 12', publisher: 'Debian', version: '12', licenseType: 'linux', additionalCost: 0 },
  { id: 'ami-rhel-9', name: 'Red Hat Enterprise Linux 9', publisher: 'RedHat', version: '9', licenseType: 'linux', additionalCost: 0.06 },
  { id: 'ami-windows-2022', name: 'Windows Server 2022', publisher: 'Microsoft', version: '2022', licenseType: 'windows', additionalCost: 0.046 },
  { id: 'ami-windows-2019', name: 'Windows Server 2019', publisher: 'Microsoft', version: '2019', licenseType: 'windows', additionalCost: 0.046 },
]

// ================================
// GCP MACHINE TYPES
// ================================
export const GCP_VM_SIZES: VMSize[] = [
  // General Purpose - E2
  { id: 'e2-micro', name: 'e2-micro', vcpus: 0.25, memory: 1, pricePerHour: 0.0084, pricePerMonth: 6.11, category: 'general' },
  { id: 'e2-small', name: 'e2-small', vcpus: 0.5, memory: 2, pricePerHour: 0.0168, pricePerMonth: 12.26, category: 'general' },
  { id: 'e2-medium', name: 'e2-medium', vcpus: 1, memory: 4, pricePerHour: 0.0336, pricePerMonth: 24.53, category: 'general' },
  { id: 'e2-standard-2', name: 'e2-standard-2', vcpus: 2, memory: 8, pricePerHour: 0.067, pricePerMonth: 48.91, category: 'general' },
  { id: 'e2-standard-4', name: 'e2-standard-4', vcpus: 4, memory: 16, pricePerHour: 0.134, pricePerMonth: 97.82, category: 'general' },
  { id: 'e2-standard-8', name: 'e2-standard-8', vcpus: 8, memory: 32, pricePerHour: 0.268, pricePerMonth: 195.64, category: 'general' },
  { id: 'e2-standard-16', name: 'e2-standard-16', vcpus: 16, memory: 64, pricePerHour: 0.536, pricePerMonth: 391.28, category: 'general' },

  // General Purpose - N2
  { id: 'n2-standard-2', name: 'n2-standard-2', vcpus: 2, memory: 8, pricePerHour: 0.097, pricePerMonth: 70.81, category: 'general' },
  { id: 'n2-standard-4', name: 'n2-standard-4', vcpus: 4, memory: 16, pricePerHour: 0.194, pricePerMonth: 141.62, category: 'general' },
  { id: 'n2-standard-8', name: 'n2-standard-8', vcpus: 8, memory: 32, pricePerHour: 0.388, pricePerMonth: 283.24, category: 'general' },
  { id: 'n2-standard-16', name: 'n2-standard-16', vcpus: 16, memory: 64, pricePerHour: 0.776, pricePerMonth: 566.48, category: 'general' },

  // Compute Optimized - C2
  { id: 'c2-standard-4', name: 'c2-standard-4', vcpus: 4, memory: 16, pricePerHour: 0.209, pricePerMonth: 152.57, category: 'compute' },
  { id: 'c2-standard-8', name: 'c2-standard-8', vcpus: 8, memory: 32, pricePerHour: 0.418, pricePerMonth: 305.14, category: 'compute' },
  { id: 'c2-standard-16', name: 'c2-standard-16', vcpus: 16, memory: 64, pricePerHour: 0.836, pricePerMonth: 610.28, category: 'compute' },

  // Memory Optimized - M2
  { id: 'm2-ultramem-208', name: 'm2-ultramem-208', vcpus: 208, memory: 5888, pricePerHour: 42.186, pricePerMonth: 30795.78, category: 'memory' },

  // GPU - A2
  { id: 'a2-highgpu-1g', name: 'a2-highgpu-1g (A100)', vcpus: 12, memory: 85, pricePerHour: 3.67, pricePerMonth: 2679.10, category: 'gpu' },
  { id: 'a2-highgpu-2g', name: 'a2-highgpu-2g (2x A100)', vcpus: 24, memory: 170, pricePerHour: 7.35, pricePerMonth: 5365.50, category: 'gpu' },
  { id: 'a2-highgpu-4g', name: 'a2-highgpu-4g (4x A100)', vcpus: 48, memory: 340, pricePerHour: 14.69, pricePerMonth: 10723.70, category: 'gpu' },
]

export const GCP_OS_IMAGES: OSImage[] = [
  { id: 'ubuntu-2204-lts', name: 'Ubuntu 22.04 LTS', publisher: 'Canonical', version: '22.04', licenseType: 'linux', additionalCost: 0 },
  { id: 'ubuntu-2404-lts', name: 'Ubuntu 24.04 LTS', publisher: 'Canonical', version: '24.04', licenseType: 'linux', additionalCost: 0 },
  { id: 'debian-12', name: 'Debian 12', publisher: 'Google', version: '12', licenseType: 'linux', additionalCost: 0 },
  { id: 'centos-stream-9', name: 'CentOS Stream 9', publisher: 'CentOS', version: '9', licenseType: 'linux', additionalCost: 0 },
  { id: 'rhel-9', name: 'Red Hat Enterprise Linux 9', publisher: 'RedHat', version: '9', licenseType: 'linux', additionalCost: 0.06 },
  { id: 'windows-2022', name: 'Windows Server 2022', publisher: 'Google', version: '2022', licenseType: 'windows', additionalCost: 0.046 },
  { id: 'windows-2019', name: 'Windows Server 2019', publisher: 'Google', version: '2019', licenseType: 'windows', additionalCost: 0.046 },
  { id: 'rocky-linux-9', name: 'Rocky Linux 9', publisher: 'Rocky', version: '9', licenseType: 'linux', additionalCost: 0 },
]

// ================================
// STORAGE PRICING
// ================================
export interface StorageTier {
  id: string
  name: string
  type: 'ssd' | 'hdd' | 'premium'
  pricePerGBMonth: number
  iops?: number
  throughput?: string
}

export const AZURE_STORAGE: StorageTier[] = [
  { id: 'standard-hdd', name: 'Standard HDD', type: 'hdd', pricePerGBMonth: 0.04 },
  { id: 'standard-ssd', name: 'Standard SSD', type: 'ssd', pricePerGBMonth: 0.075 },
  { id: 'premium-ssd', name: 'Premium SSD', type: 'premium', pricePerGBMonth: 0.12, iops: 120, throughput: '25 MB/s' },
  { id: 'premium-ssd-v2', name: 'Premium SSD v2', type: 'premium', pricePerGBMonth: 0.15, iops: 3000, throughput: '125 MB/s' },
  { id: 'ultra-disk', name: 'Ultra Disk', type: 'premium', pricePerGBMonth: 0.20, iops: 160000, throughput: '4000 MB/s' },
]

export const AWS_STORAGE: StorageTier[] = [
  { id: 'gp2', name: 'General Purpose SSD (gp2)', type: 'ssd', pricePerGBMonth: 0.10, iops: 3000 },
  { id: 'gp3', name: 'General Purpose SSD (gp3)', type: 'ssd', pricePerGBMonth: 0.08, iops: 3000, throughput: '125 MB/s' },
  { id: 'io1', name: 'Provisioned IOPS SSD (io1)', type: 'premium', pricePerGBMonth: 0.125, iops: 64000 },
  { id: 'io2', name: 'Provisioned IOPS SSD (io2)', type: 'premium', pricePerGBMonth: 0.125, iops: 256000 },
  { id: 'st1', name: 'Throughput Optimized HDD', type: 'hdd', pricePerGBMonth: 0.045, throughput: '500 MB/s' },
  { id: 'sc1', name: 'Cold HDD', type: 'hdd', pricePerGBMonth: 0.015, throughput: '250 MB/s' },
]

export const GCP_STORAGE: StorageTier[] = [
  { id: 'pd-standard', name: 'Standard Persistent Disk', type: 'hdd', pricePerGBMonth: 0.04 },
  { id: 'pd-balanced', name: 'Balanced Persistent Disk', type: 'ssd', pricePerGBMonth: 0.10, iops: 6000 },
  { id: 'pd-ssd', name: 'SSD Persistent Disk', type: 'ssd', pricePerGBMonth: 0.17, iops: 30000 },
  { id: 'pd-extreme', name: 'Extreme Persistent Disk', type: 'premium', pricePerGBMonth: 0.125, iops: 120000 },
]

// ================================
// NETWORK PRICING
// ================================
export interface NetworkPricing {
  provider: 'azure' | 'aws' | 'gcp'
  egressPricePerGB: number // First 10 TB
  egressPricePerGBHighVolume: number // 10-50 TB
  vnetPeeringPerGB: number
  loadBalancerHourly: number
  publicIPMonthly: number
  natGatewayHourly: number
}

export const NETWORK_PRICING: NetworkPricing[] = [
  {
    provider: 'azure',
    egressPricePerGB: 0.087,
    egressPricePerGBHighVolume: 0.083,
    vnetPeeringPerGB: 0.01,
    loadBalancerHourly: 0.025,
    publicIPMonthly: 4.00,
    natGatewayHourly: 0.045,
  },
  {
    provider: 'aws',
    egressPricePerGB: 0.09,
    egressPricePerGBHighVolume: 0.085,
    vnetPeeringPerGB: 0.01,
    loadBalancerHourly: 0.0225,
    publicIPMonthly: 3.60,
    natGatewayHourly: 0.045,
  },
  {
    provider: 'gcp',
    egressPricePerGB: 0.12,
    egressPricePerGBHighVolume: 0.11,
    vnetPeeringPerGB: 0.01,
    loadBalancerHourly: 0.025,
    publicIPMonthly: 4.00,
    natGatewayHourly: 0.045,
  },
]

// ================================
// HELPER FUNCTIONS
// ================================
export function getVMSizesForProvider(provider: 'azure' | 'aws' | 'gcp'): VMSize[] {
  switch (provider) {
    case 'azure': return AZURE_VM_SIZES
    case 'aws': return AWS_VM_SIZES
    case 'gcp': return GCP_VM_SIZES
    default: return []
  }
}

export function getOSImagesForProvider(provider: 'azure' | 'aws' | 'gcp'): OSImage[] {
  switch (provider) {
    case 'azure': return AZURE_OS_IMAGES
    case 'aws': return AWS_OS_IMAGES
    case 'gcp': return GCP_OS_IMAGES
    default: return []
  }
}

export function getStorageForProvider(provider: 'azure' | 'aws' | 'gcp'): StorageTier[] {
  switch (provider) {
    case 'azure': return AZURE_STORAGE
    case 'aws': return AWS_STORAGE
    case 'gcp': return GCP_STORAGE
    default: return []
  }
}

export function getNetworkPricing(provider: 'azure' | 'aws' | 'gcp'): NetworkPricing | undefined {
  return NETWORK_PRICING.find(p => p.provider === provider)
}

export function calculateVMCost(
  vmSize: VMSize,
  osImage: OSImage,
  storageGB: number,
  storageTier: StorageTier,
  replicas: number = 1
): { hourly: number; monthly: number; breakdown: Record<string, number> } {
  const vmCostHourly = vmSize.pricePerHour
  const osCostHourly = osImage.additionalCost
  const storageCostMonthly = storageGB * storageTier.pricePerGBMonth

  const hourlyTotal = (vmCostHourly + osCostHourly) * replicas
  const monthlyTotal = (hourlyTotal * 730) + (storageCostMonthly * replicas) // 730 hours/month

  return {
    hourly: hourlyTotal,
    monthly: monthlyTotal,
    breakdown: {
      compute: vmSize.pricePerMonth * replicas,
      license: osCostHourly * 730 * replicas,
      storage: storageCostMonthly * replicas,
    }
  }
}
