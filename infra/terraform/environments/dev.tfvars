# ─────────────────────────────────────────────────────────────
# dev.tfvars — Development environment
# ─────────────────────────────────────────────────────────────
# Usage: terraform plan -var-file=environments/dev.tfvars

subscription_id = "YOUR_SUBSCRIPTION_ID" # Replace with your Azure Subscription ID
environment     = "dev"
project_name    = "jobstack"
location        = "westeurope"
domain_name     = "dev.jobstack.kobecloud.pl"

# Networking
vnet_address_space = "10.1.0.0/16"
subnet_app_cidr    = "10.1.10.0/24"
subnet_data_cidr   = "10.1.20.0/24"
subnet_mgmt_cidr   = "10.1.250.0/24"

# Compute — small/cheap for dev
vm_count            = 2
vm_size             = "Standard_B2s"
admin_username      = "deploy"
ssh_public_key_path = "~/.ssh/id_rsa.pub"

# Database — burstable tier, minimal storage
pg_sku                   = "B_Standard_B1ms"
pg_storage_mb            = 32768 # 32 GB
pg_version               = "16"
pg_ha_enabled            = false
pg_backup_retention_days = 7
pg_geo_redundant_backup  = false

# Redis — smallest tier
redis_sku      = "Basic"
redis_family   = "C"
redis_capacity = 0 # 250 MB

# Storage
storage_replication = "LRS"

# Monitoring
log_retention_days = 30
alert_email        = "kuba.pospieszny@gmail.com"

tags = {
  owner       = "kuba.pospieszny"
  cost_center = "dev"
  repo        = "github.com/KobeCloud/jobstack"
}
