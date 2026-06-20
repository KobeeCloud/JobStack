# --------------------------------------------------------------------------
# Root module — resource group + module orchestration
# --------------------------------------------------------------------------

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  default_tags = merge(var.tags, {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  })
}

# ── Resource Group ──────────────────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.name_prefix}"
  location = var.location
  tags     = local.default_tags
}

# ── Networking ──────────────────────────────────────────────────────────────

module "networking" {
  source = "./modules/networking"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  name_prefix         = local.name_prefix
  vnet_address_space  = var.vnet_address_space
  subnet_app_cidr     = var.subnet_app_cidr
  subnet_data_cidr    = var.subnet_data_cidr
  subnet_mgmt_cidr    = var.subnet_mgmt_cidr
  tags                = local.default_tags
}

# ── Security (Key Vault + Managed Identity) ─────────────────────────────────

module "security" {
  source = "./modules/security"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  name_prefix         = local.name_prefix
  environment         = var.environment
  subnet_mgmt_id      = module.networking.subnet_mgmt_id
  vnet_id             = module.networking.vnet_id
  tags                = local.default_tags
}

# ── Database (PostgreSQL Flexible Server) ───────────────────────────────────

module "database" {
  source = "./modules/database"

  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  name_prefix              = local.name_prefix
  subnet_data_id           = module.networking.subnet_data_id
  private_dns_zone_pg_id   = module.networking.private_dns_zone_pg_id
  pg_sku                   = var.pg_sku
  pg_storage_mb            = var.pg_storage_mb
  pg_version               = var.pg_version
  pg_ha_enabled            = var.pg_ha_enabled
  pg_backup_retention_days = var.pg_backup_retention_days
  pg_geo_redundant_backup  = var.pg_geo_redundant_backup
  key_vault_id             = module.security.key_vault_id
  tags                     = local.default_tags
}

# ── Redis ───────────────────────────────────────────────────────────────────

module "redis" {
  source = "./modules/redis"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  name_prefix         = local.name_prefix
  subnet_data_id      = module.networking.subnet_data_id
  vnet_id             = module.networking.vnet_id
  redis_sku           = var.redis_sku
  redis_family        = var.redis_family
  redis_capacity      = var.redis_capacity
  key_vault_id        = module.security.key_vault_id
  tags                = local.default_tags
}

# ── Storage ─────────────────────────────────────────────────────────────────

module "storage" {
  source = "./modules/storage"

  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  name_prefix            = local.name_prefix
  subnet_data_id         = module.networking.subnet_data_id
  vnet_id                = module.networking.vnet_id
  storage_replication    = var.storage_replication
  tags                   = local.default_tags
}

# ── Monitoring ──────────────────────────────────────────────────────────────

module "monitoring" {
  source = "./modules/monitoring"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  name_prefix         = local.name_prefix
  log_retention_days  = var.log_retention_days
  alert_email         = var.alert_email
  tags                = local.default_tags
}

# ── Compute (VMs + Load Balancer) ───────────────────────────────────────────

module "compute" {
  source = "./modules/compute"

  resource_group_name       = azurerm_resource_group.main.name
  location                  = azurerm_resource_group.main.location
  name_prefix               = local.name_prefix
  subnet_app_id             = module.networking.subnet_app_id
  vm_size                   = var.vm_size
  vm_count                  = var.vm_count
  admin_username            = var.admin_username
  ssh_public_key_path       = var.ssh_public_key_path
  key_vault_id              = module.security.key_vault_id
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id
  user_assigned_identity_id  = module.security.user_assigned_identity_id
  tags                      = local.default_tags
}

# ── CDN (Azure Front Door) ─────────────────────────────────────────────────

module "cdn" {
  source = "./modules/cdn"

  resource_group_name = azurerm_resource_group.main.name
  name_prefix         = local.name_prefix
  domain_name         = var.domain_name
  lb_public_ip        = module.compute.lb_public_ip
  tags                = local.default_tags
}
