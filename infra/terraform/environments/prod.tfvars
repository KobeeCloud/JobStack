# ─────────────────────────────────────────────────────────────
# prod.tfvars — Production environment
# ─────────────────────────────────────────────────────────────
# Usage: terraform plan -var-file=environments/prod.tfvars

subscription_id = "YOUR_SUBSCRIPTION_ID" # Replace with your Azure Subscription ID
environment     = "prod"
project_name    = "jobstack"
location        = "westeurope"
domain_name     = "jobstack.kobecloud.pl"

# Networking
vnet_address_space = "10.1.0.0/16"
subnet_app_cidr    = "10.1.10.0/24"
subnet_data_cidr   = "10.1.20.0/24"
subnet_mgmt_cidr   = "10.1.250.0/24"

# Compute — production-grade, two VMs in Availability Set
vm_count            = 2
vm_size             = "Standard_D2s_v5"
admin_username      = "deploy"
ssh_public_key_path = "~/.ssh/id_rsa.pub"

# Database — General Purpose, Zone-Redundant HA, geo-backup
pg_sku                   = "GP_Standard_D2s_v3"
pg_storage_mb            = 65536 # 64 GB
pg_version               = "16"
pg_ha_enabled            = true
pg_backup_retention_days = 35
pg_geo_redundant_backup  = true

# Redis — Standard tier with replication
redis_sku      = "Standard"
redis_family   = "C"
redis_capacity = 1 # 1 GB

# Storage — Geo-redundant
storage_replication = "GRS"

# Monitoring — 90-day retention for compliance
log_retention_days = 90
alert_email        = "kuba.pospieszny@gmail.com"

tags = {
  owner       = "kuba.pospieszny"
  cost_center = "prod"
  repo        = "github.com/KobeCloud/jobstack"
}
