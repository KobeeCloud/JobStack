/**
 * Cloud Provider Region Definitions
 * Complete list of regions for Azure, AWS, and GCP
 */

export interface CloudRegion {
  id: string
  name: string
  displayName: string
  provider: 'azure' | 'aws' | 'gcp'
  geography: string
  continent: 'north-america' | 'south-america' | 'europe' | 'asia-pacific' | 'middle-east' | 'africa'
  coordinates: { lat: number; lng: number }
  paired?: string // Paired region for DR
  zones?: string[]
}

// Azure Regions
export const AZURE_REGIONS: CloudRegion[] = [
  // North America
  { id: 'eastus', name: 'East US', displayName: 'East US (Virginia)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 37.3719, lng: -79.8164 }, paired: 'westus' },
  { id: 'eastus2', name: 'East US 2', displayName: 'East US 2 (Virginia)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 36.6681, lng: -78.3889 }, paired: 'centralus' },
  { id: 'westus', name: 'West US', displayName: 'West US (California)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 37.783, lng: -122.417 }, paired: 'eastus' },
  { id: 'westus2', name: 'West US 2', displayName: 'West US 2 (Washington)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 47.233, lng: -119.852 }, paired: 'westcentralus' },
  { id: 'westus3', name: 'West US 3', displayName: 'West US 3 (Arizona)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 33.448, lng: -112.074 }, paired: 'eastus' },
  { id: 'centralus', name: 'Central US', displayName: 'Central US (Iowa)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 41.5908, lng: -93.6208 }, paired: 'eastus2' },
  { id: 'northcentralus', name: 'North Central US', displayName: 'North Central US (Illinois)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 41.8819, lng: -87.6278 }, paired: 'southcentralus' },
  { id: 'southcentralus', name: 'South Central US', displayName: 'South Central US (Texas)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 29.4167, lng: -98.5 }, paired: 'northcentralus' },
  { id: 'westcentralus', name: 'West Central US', displayName: 'West Central US (Wyoming)', provider: 'azure', geography: 'United States', continent: 'north-america', coordinates: { lat: 40.89, lng: -110.234 }, paired: 'westus2' },
  { id: 'canadacentral', name: 'Canada Central', displayName: 'Canada Central (Toronto)', provider: 'azure', geography: 'Canada', continent: 'north-america', coordinates: { lat: 43.653, lng: -79.383 }, paired: 'canadaeast' },
  { id: 'canadaeast', name: 'Canada East', displayName: 'Canada East (Quebec)', provider: 'azure', geography: 'Canada', continent: 'north-america', coordinates: { lat: 46.817, lng: -71.217 }, paired: 'canadacentral' },
  
  // Europe
  { id: 'northeurope', name: 'North Europe', displayName: 'North Europe (Ireland)', provider: 'azure', geography: 'Europe', continent: 'europe', coordinates: { lat: 53.3478, lng: -6.2597 }, paired: 'westeurope' },
  { id: 'westeurope', name: 'West Europe', displayName: 'West Europe (Netherlands)', provider: 'azure', geography: 'Europe', continent: 'europe', coordinates: { lat: 52.3667, lng: 4.9 }, paired: 'northeurope' },
  { id: 'uksouth', name: 'UK South', displayName: 'UK South (London)', provider: 'azure', geography: 'United Kingdom', continent: 'europe', coordinates: { lat: 51.5074, lng: -0.1278 }, paired: 'ukwest' },
  { id: 'ukwest', name: 'UK West', displayName: 'UK West (Cardiff)', provider: 'azure', geography: 'United Kingdom', continent: 'europe', coordinates: { lat: 51.481, lng: -3.179 }, paired: 'uksouth' },
  { id: 'francecentral', name: 'France Central', displayName: 'France Central (Paris)', provider: 'azure', geography: 'France', continent: 'europe', coordinates: { lat: 46.3772, lng: 2.373 }, paired: 'francesouth' },
  { id: 'francesouth', name: 'France South', displayName: 'France South (Marseille)', provider: 'azure', geography: 'France', continent: 'europe', coordinates: { lat: 43.8345, lng: 2.1972 }, paired: 'francecentral' },
  { id: 'germanywestcentral', name: 'Germany West Central', displayName: 'Germany West Central (Frankfurt)', provider: 'azure', geography: 'Germany', continent: 'europe', coordinates: { lat: 50.110924, lng: 8.682127 }, paired: 'germanynorth' },
  { id: 'switzerlandnorth', name: 'Switzerland North', displayName: 'Switzerland North (Zurich)', provider: 'azure', geography: 'Switzerland', continent: 'europe', coordinates: { lat: 47.451542, lng: 8.564572 }, paired: 'switzerlandwest' },
  { id: 'norwayeast', name: 'Norway East', displayName: 'Norway East (Oslo)', provider: 'azure', geography: 'Norway', continent: 'europe', coordinates: { lat: 59.913868, lng: 10.752245 }, paired: 'norwaywest' },
  { id: 'polandcentral', name: 'Poland Central', displayName: 'Poland Central (Warsaw)', provider: 'azure', geography: 'Poland', continent: 'europe', coordinates: { lat: 52.237049, lng: 21.017532 } },
  
  // Asia Pacific
  { id: 'eastasia', name: 'East Asia', displayName: 'East Asia (Hong Kong)', provider: 'azure', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 22.267, lng: 114.188 }, paired: 'southeastasia' },
  { id: 'southeastasia', name: 'Southeast Asia', displayName: 'Southeast Asia (Singapore)', provider: 'azure', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 1.283, lng: 103.833 }, paired: 'eastasia' },
  { id: 'japaneast', name: 'Japan East', displayName: 'Japan East (Tokyo)', provider: 'azure', geography: 'Japan', continent: 'asia-pacific', coordinates: { lat: 35.68, lng: 139.77 }, paired: 'japanwest' },
  { id: 'japanwest', name: 'Japan West', displayName: 'Japan West (Osaka)', provider: 'azure', geography: 'Japan', continent: 'asia-pacific', coordinates: { lat: 34.6939, lng: 135.5022 }, paired: 'japaneast' },
  { id: 'australiaeast', name: 'Australia East', displayName: 'Australia East (Sydney)', provider: 'azure', geography: 'Australia', continent: 'asia-pacific', coordinates: { lat: -33.86, lng: 151.2094 }, paired: 'australiasoutheast' },
  { id: 'australiasoutheast', name: 'Australia Southeast', displayName: 'Australia Southeast (Melbourne)', provider: 'azure', geography: 'Australia', continent: 'asia-pacific', coordinates: { lat: -37.8136, lng: 144.9631 }, paired: 'australiaeast' },
  { id: 'centralindia', name: 'Central India', displayName: 'Central India (Pune)', provider: 'azure', geography: 'India', continent: 'asia-pacific', coordinates: { lat: 18.5822, lng: 73.9197 }, paired: 'southindia' },
  { id: 'southindia', name: 'South India', displayName: 'South India (Chennai)', provider: 'azure', geography: 'India', continent: 'asia-pacific', coordinates: { lat: 12.9822, lng: 80.1636 }, paired: 'centralindia' },
  { id: 'koreacentral', name: 'Korea Central', displayName: 'Korea Central (Seoul)', provider: 'azure', geography: 'Korea', continent: 'asia-pacific', coordinates: { lat: 37.5665, lng: 126.978 }, paired: 'koreasouth' },
  
  // Middle East & Africa
  { id: 'uaenorth', name: 'UAE North', displayName: 'UAE North (Dubai)', provider: 'azure', geography: 'UAE', continent: 'middle-east', coordinates: { lat: 25.266666, lng: 55.316666 }, paired: 'uaecentral' },
  { id: 'southafricanorth', name: 'South Africa North', displayName: 'South Africa North (Johannesburg)', provider: 'azure', geography: 'South Africa', continent: 'africa', coordinates: { lat: -26.198, lng: 28.03 }, paired: 'southafricawest' },
  { id: 'qatarcentral', name: 'Qatar Central', displayName: 'Qatar Central (Doha)', provider: 'azure', geography: 'Qatar', continent: 'middle-east', coordinates: { lat: 25.2854, lng: 51.531 } },
  
  // South America
  { id: 'brazilsouth', name: 'Brazil South', displayName: 'Brazil South (São Paulo)', provider: 'azure', geography: 'Brazil', continent: 'south-america', coordinates: { lat: -23.55, lng: -46.633 }, paired: 'southcentralus' },
]

// AWS Regions
export const AWS_REGIONS: CloudRegion[] = [
  // North America
  { id: 'us-east-1', name: 'US East (N. Virginia)', displayName: 'US East (N. Virginia)', provider: 'aws', geography: 'United States', continent: 'north-america', coordinates: { lat: 38.9519, lng: -77.4480 }, zones: ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d', 'us-east-1e', 'us-east-1f'] },
  { id: 'us-east-2', name: 'US East (Ohio)', displayName: 'US East (Ohio)', provider: 'aws', geography: 'United States', continent: 'north-america', coordinates: { lat: 40.4167, lng: -82.9167 }, zones: ['us-east-2a', 'us-east-2b', 'us-east-2c'] },
  { id: 'us-west-1', name: 'US West (N. California)', displayName: 'US West (N. California)', provider: 'aws', geography: 'United States', continent: 'north-america', coordinates: { lat: 37.3541, lng: -121.9552 }, zones: ['us-west-1a', 'us-west-1c'] },
  { id: 'us-west-2', name: 'US West (Oregon)', displayName: 'US West (Oregon)', provider: 'aws', geography: 'United States', continent: 'north-america', coordinates: { lat: 45.8399, lng: -119.7006 }, zones: ['us-west-2a', 'us-west-2b', 'us-west-2c', 'us-west-2d'] },
  { id: 'ca-central-1', name: 'Canada (Central)', displayName: 'Canada (Central)', provider: 'aws', geography: 'Canada', continent: 'north-america', coordinates: { lat: 45.5017, lng: -73.5673 }, zones: ['ca-central-1a', 'ca-central-1b', 'ca-central-1d'] },
  
  // Europe
  { id: 'eu-west-1', name: 'Europe (Ireland)', displayName: 'Europe (Ireland)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 53.3478, lng: -6.2597 }, zones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'] },
  { id: 'eu-west-2', name: 'Europe (London)', displayName: 'Europe (London)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 51.5074, lng: -0.1278 }, zones: ['eu-west-2a', 'eu-west-2b', 'eu-west-2c'] },
  { id: 'eu-west-3', name: 'Europe (Paris)', displayName: 'Europe (Paris)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 48.8566, lng: 2.3522 }, zones: ['eu-west-3a', 'eu-west-3b', 'eu-west-3c'] },
  { id: 'eu-central-1', name: 'Europe (Frankfurt)', displayName: 'Europe (Frankfurt)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 50.1109, lng: 8.6821 }, zones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'] },
  { id: 'eu-central-2', name: 'Europe (Zurich)', displayName: 'Europe (Zurich)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 47.3769, lng: 8.5417 }, zones: ['eu-central-2a', 'eu-central-2b', 'eu-central-2c'] },
  { id: 'eu-north-1', name: 'Europe (Stockholm)', displayName: 'Europe (Stockholm)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 59.3293, lng: 18.0686 }, zones: ['eu-north-1a', 'eu-north-1b', 'eu-north-1c'] },
  { id: 'eu-south-1', name: 'Europe (Milan)', displayName: 'Europe (Milan)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 45.4642, lng: 9.1900 }, zones: ['eu-south-1a', 'eu-south-1b', 'eu-south-1c'] },
  { id: 'eu-south-2', name: 'Europe (Spain)', displayName: 'Europe (Spain)', provider: 'aws', geography: 'Europe', continent: 'europe', coordinates: { lat: 41.3851, lng: 2.1734 }, zones: ['eu-south-2a', 'eu-south-2b', 'eu-south-2c'] },
  
  // Asia Pacific
  { id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', displayName: 'Asia Pacific (Tokyo)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 35.6762, lng: 139.6503 }, zones: ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'] },
  { id: 'ap-northeast-2', name: 'Asia Pacific (Seoul)', displayName: 'Asia Pacific (Seoul)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 37.5665, lng: 126.9780 }, zones: ['ap-northeast-2a', 'ap-northeast-2b', 'ap-northeast-2c', 'ap-northeast-2d'] },
  { id: 'ap-northeast-3', name: 'Asia Pacific (Osaka)', displayName: 'Asia Pacific (Osaka)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 34.6937, lng: 135.5023 }, zones: ['ap-northeast-3a', 'ap-northeast-3b', 'ap-northeast-3c'] },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', displayName: 'Asia Pacific (Singapore)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 1.3521, lng: 103.8198 }, zones: ['ap-southeast-1a', 'ap-southeast-1b', 'ap-southeast-1c'] },
  { id: 'ap-southeast-2', name: 'Asia Pacific (Sydney)', displayName: 'Asia Pacific (Sydney)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: -33.8688, lng: 151.2093 }, zones: ['ap-southeast-2a', 'ap-southeast-2b', 'ap-southeast-2c'] },
  { id: 'ap-southeast-3', name: 'Asia Pacific (Jakarta)', displayName: 'Asia Pacific (Jakarta)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: -6.2088, lng: 106.8456 }, zones: ['ap-southeast-3a', 'ap-southeast-3b', 'ap-southeast-3c'] },
  { id: 'ap-south-1', name: 'Asia Pacific (Mumbai)', displayName: 'Asia Pacific (Mumbai)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 19.0760, lng: 72.8777 }, zones: ['ap-south-1a', 'ap-south-1b', 'ap-south-1c'] },
  { id: 'ap-south-2', name: 'Asia Pacific (Hyderabad)', displayName: 'Asia Pacific (Hyderabad)', provider: 'aws', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 17.3850, lng: 78.4867 }, zones: ['ap-south-2a', 'ap-south-2b', 'ap-south-2c'] },
  
  // Middle East
  { id: 'me-south-1', name: 'Middle East (Bahrain)', displayName: 'Middle East (Bahrain)', provider: 'aws', geography: 'Middle East', continent: 'middle-east', coordinates: { lat: 26.0667, lng: 50.5577 }, zones: ['me-south-1a', 'me-south-1b', 'me-south-1c'] },
  { id: 'me-central-1', name: 'Middle East (UAE)', displayName: 'Middle East (UAE)', provider: 'aws', geography: 'Middle East', continent: 'middle-east', coordinates: { lat: 25.2048, lng: 55.2708 }, zones: ['me-central-1a', 'me-central-1b', 'me-central-1c'] },
  { id: 'il-central-1', name: 'Israel (Tel Aviv)', displayName: 'Israel (Tel Aviv)', provider: 'aws', geography: 'Middle East', continent: 'middle-east', coordinates: { lat: 32.0853, lng: 34.7818 }, zones: ['il-central-1a', 'il-central-1b', 'il-central-1c'] },
  
  // South America
  { id: 'sa-east-1', name: 'South America (São Paulo)', displayName: 'South America (São Paulo)', provider: 'aws', geography: 'South America', continent: 'south-america', coordinates: { lat: -23.5505, lng: -46.6333 }, zones: ['sa-east-1a', 'sa-east-1b', 'sa-east-1c'] },
  
  // Africa
  { id: 'af-south-1', name: 'Africa (Cape Town)', displayName: 'Africa (Cape Town)', provider: 'aws', geography: 'Africa', continent: 'africa', coordinates: { lat: -33.9249, lng: 18.4241 }, zones: ['af-south-1a', 'af-south-1b', 'af-south-1c'] },
]

// GCP Regions
export const GCP_REGIONS: CloudRegion[] = [
  // North America
  { id: 'us-central1', name: 'Iowa', displayName: 'Iowa (us-central1)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 41.2619, lng: -95.8608 }, zones: ['us-central1-a', 'us-central1-b', 'us-central1-c', 'us-central1-f'] },
  { id: 'us-east1', name: 'South Carolina', displayName: 'South Carolina (us-east1)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 33.1960, lng: -80.0131 }, zones: ['us-east1-b', 'us-east1-c', 'us-east1-d'] },
  { id: 'us-east4', name: 'Northern Virginia', displayName: 'Northern Virginia (us-east4)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 38.7223, lng: -77.0190 }, zones: ['us-east4-a', 'us-east4-b', 'us-east4-c'] },
  { id: 'us-east5', name: 'Columbus', displayName: 'Columbus (us-east5)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 39.9612, lng: -82.9988 }, zones: ['us-east5-a', 'us-east5-b', 'us-east5-c'] },
  { id: 'us-west1', name: 'Oregon', displayName: 'Oregon (us-west1)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 45.5946, lng: -121.1787 }, zones: ['us-west1-a', 'us-west1-b', 'us-west1-c'] },
  { id: 'us-west2', name: 'Los Angeles', displayName: 'Los Angeles (us-west2)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 34.0522, lng: -118.2437 }, zones: ['us-west2-a', 'us-west2-b', 'us-west2-c'] },
  { id: 'us-west3', name: 'Salt Lake City', displayName: 'Salt Lake City (us-west3)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 40.7608, lng: -111.8910 }, zones: ['us-west3-a', 'us-west3-b', 'us-west3-c'] },
  { id: 'us-west4', name: 'Las Vegas', displayName: 'Las Vegas (us-west4)', provider: 'gcp', geography: 'United States', continent: 'north-america', coordinates: { lat: 36.1699, lng: -115.1398 }, zones: ['us-west4-a', 'us-west4-b', 'us-west4-c'] },
  { id: 'northamerica-northeast1', name: 'Montréal', displayName: 'Montréal (northamerica-northeast1)', provider: 'gcp', geography: 'Canada', continent: 'north-america', coordinates: { lat: 45.5017, lng: -73.5673 }, zones: ['northamerica-northeast1-a', 'northamerica-northeast1-b', 'northamerica-northeast1-c'] },
  { id: 'northamerica-northeast2', name: 'Toronto', displayName: 'Toronto (northamerica-northeast2)', provider: 'gcp', geography: 'Canada', continent: 'north-america', coordinates: { lat: 43.6532, lng: -79.3832 }, zones: ['northamerica-northeast2-a', 'northamerica-northeast2-b', 'northamerica-northeast2-c'] },
  
  // Europe
  { id: 'europe-west1', name: 'Belgium', displayName: 'Belgium (europe-west1)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 50.4501, lng: 3.5547 }, zones: ['europe-west1-b', 'europe-west1-c', 'europe-west1-d'] },
  { id: 'europe-west2', name: 'London', displayName: 'London (europe-west2)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 51.5074, lng: -0.1278 }, zones: ['europe-west2-a', 'europe-west2-b', 'europe-west2-c'] },
  { id: 'europe-west3', name: 'Frankfurt', displayName: 'Frankfurt (europe-west3)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 50.1109, lng: 8.6821 }, zones: ['europe-west3-a', 'europe-west3-b', 'europe-west3-c'] },
  { id: 'europe-west4', name: 'Netherlands', displayName: 'Netherlands (europe-west4)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 53.4386, lng: 6.8355 }, zones: ['europe-west4-a', 'europe-west4-b', 'europe-west4-c'] },
  { id: 'europe-west6', name: 'Zurich', displayName: 'Zurich (europe-west6)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 47.3769, lng: 8.5417 }, zones: ['europe-west6-a', 'europe-west6-b', 'europe-west6-c'] },
  { id: 'europe-west8', name: 'Milan', displayName: 'Milan (europe-west8)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 45.4642, lng: 9.1900 }, zones: ['europe-west8-a', 'europe-west8-b', 'europe-west8-c'] },
  { id: 'europe-west9', name: 'Paris', displayName: 'Paris (europe-west9)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 48.8566, lng: 2.3522 }, zones: ['europe-west9-a', 'europe-west9-b', 'europe-west9-c'] },
  { id: 'europe-north1', name: 'Finland', displayName: 'Finland (europe-north1)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 60.5693, lng: 27.1878 }, zones: ['europe-north1-a', 'europe-north1-b', 'europe-north1-c'] },
  { id: 'europe-central2', name: 'Warsaw', displayName: 'Warsaw (europe-central2)', provider: 'gcp', geography: 'Europe', continent: 'europe', coordinates: { lat: 52.2297, lng: 21.0122 }, zones: ['europe-central2-a', 'europe-central2-b', 'europe-central2-c'] },
  
  // Asia Pacific
  { id: 'asia-east1', name: 'Taiwan', displayName: 'Taiwan (asia-east1)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 24.0717, lng: 120.5624 }, zones: ['asia-east1-a', 'asia-east1-b', 'asia-east1-c'] },
  { id: 'asia-east2', name: 'Hong Kong', displayName: 'Hong Kong (asia-east2)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 22.3193, lng: 114.1694 }, zones: ['asia-east2-a', 'asia-east2-b', 'asia-east2-c'] },
  { id: 'asia-northeast1', name: 'Tokyo', displayName: 'Tokyo (asia-northeast1)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 35.6762, lng: 139.6503 }, zones: ['asia-northeast1-a', 'asia-northeast1-b', 'asia-northeast1-c'] },
  { id: 'asia-northeast2', name: 'Osaka', displayName: 'Osaka (asia-northeast2)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 34.6937, lng: 135.5023 }, zones: ['asia-northeast2-a', 'asia-northeast2-b', 'asia-northeast2-c'] },
  { id: 'asia-northeast3', name: 'Seoul', displayName: 'Seoul (asia-northeast3)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 37.5665, lng: 126.9780 }, zones: ['asia-northeast3-a', 'asia-northeast3-b', 'asia-northeast3-c'] },
  { id: 'asia-south1', name: 'Mumbai', displayName: 'Mumbai (asia-south1)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 19.0760, lng: 72.8777 }, zones: ['asia-south1-a', 'asia-south1-b', 'asia-south1-c'] },
  { id: 'asia-south2', name: 'Delhi', displayName: 'Delhi (asia-south2)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 28.7041, lng: 77.1025 }, zones: ['asia-south2-a', 'asia-south2-b', 'asia-south2-c'] },
  { id: 'asia-southeast1', name: 'Singapore', displayName: 'Singapore (asia-southeast1)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: 1.3521, lng: 103.8198 }, zones: ['asia-southeast1-a', 'asia-southeast1-b', 'asia-southeast1-c'] },
  { id: 'asia-southeast2', name: 'Jakarta', displayName: 'Jakarta (asia-southeast2)', provider: 'gcp', geography: 'Asia Pacific', continent: 'asia-pacific', coordinates: { lat: -6.2088, lng: 106.8456 }, zones: ['asia-southeast2-a', 'asia-southeast2-b', 'asia-southeast2-c'] },
  { id: 'australia-southeast1', name: 'Sydney', displayName: 'Sydney (australia-southeast1)', provider: 'gcp', geography: 'Australia', continent: 'asia-pacific', coordinates: { lat: -33.8688, lng: 151.2093 }, zones: ['australia-southeast1-a', 'australia-southeast1-b', 'australia-southeast1-c'] },
  { id: 'australia-southeast2', name: 'Melbourne', displayName: 'Melbourne (australia-southeast2)', provider: 'gcp', geography: 'Australia', continent: 'asia-pacific', coordinates: { lat: -37.8136, lng: 144.9631 }, zones: ['australia-southeast2-a', 'australia-southeast2-b', 'australia-southeast2-c'] },
  
  // Middle East
  { id: 'me-west1', name: 'Tel Aviv', displayName: 'Tel Aviv (me-west1)', provider: 'gcp', geography: 'Middle East', continent: 'middle-east', coordinates: { lat: 32.0853, lng: 34.7818 }, zones: ['me-west1-a', 'me-west1-b', 'me-west1-c'] },
  { id: 'me-central1', name: 'Doha', displayName: 'Doha (me-central1)', provider: 'gcp', geography: 'Middle East', continent: 'middle-east', coordinates: { lat: 25.2854, lng: 51.5310 }, zones: ['me-central1-a', 'me-central1-b', 'me-central1-c'] },
  
  // South America
  { id: 'southamerica-east1', name: 'São Paulo', displayName: 'São Paulo (southamerica-east1)', provider: 'gcp', geography: 'South America', continent: 'south-america', coordinates: { lat: -23.5505, lng: -46.6333 }, zones: ['southamerica-east1-a', 'southamerica-east1-b', 'southamerica-east1-c'] },
  { id: 'southamerica-west1', name: 'Santiago', displayName: 'Santiago (southamerica-west1)', provider: 'gcp', geography: 'South America', continent: 'south-america', coordinates: { lat: -33.4489, lng: -70.6693 }, zones: ['southamerica-west1-a', 'southamerica-west1-b', 'southamerica-west1-c'] },
  
  // Africa
  { id: 'africa-south1', name: 'Johannesburg', displayName: 'Johannesburg (africa-south1)', provider: 'gcp', geography: 'Africa', continent: 'africa', coordinates: { lat: -26.2041, lng: 28.0473 }, zones: ['africa-south1-a', 'africa-south1-b', 'africa-south1-c'] },
]

// Combined exports
export const ALL_REGIONS: CloudRegion[] = [...AZURE_REGIONS, ...AWS_REGIONS, ...GCP_REGIONS]

export function getRegionsByProvider(provider: 'azure' | 'aws' | 'gcp'): CloudRegion[] {
  return ALL_REGIONS.filter(r => r.provider === provider)
}

export function getRegionsByContinent(continent: CloudRegion['continent']): CloudRegion[] {
  return ALL_REGIONS.filter(r => r.continent === continent)
}

export function getRegionById(id: string): CloudRegion | undefined {
  return ALL_REGIONS.find(r => r.id === id)
}

export function getPairedRegion(regionId: string): CloudRegion | undefined {
  const region = getRegionById(regionId)
  if (region?.paired) {
    return getRegionById(region.paired)
  }
  return undefined
}

// Calculate approximate latency between regions (simplified)
export function estimateLatency(region1Id: string, region2Id: string): number {
  const r1 = getRegionById(region1Id)
  const r2 = getRegionById(region2Id)
  
  if (!r1 || !r2) return -1
  
  // Haversine formula for distance
  const toRad = (deg: number) => deg * (Math.PI / 180)
  const R = 6371 // Earth's radius in km
  
  const dLat = toRad(r2.coordinates.lat - r1.coordinates.lat)
  const dLng = toRad(r2.coordinates.lng - r1.coordinates.lng)
  
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(r1.coordinates.lat)) * Math.cos(toRad(r2.coordinates.lat)) *
            Math.sin(dLng/2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  // Rough latency estimate: ~5ms per 1000km + 10ms base
  return Math.round(10 + (distance / 1000) * 5)
}
