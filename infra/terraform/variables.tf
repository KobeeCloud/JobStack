# --------------------------------------------------------------------------
# Root variables
# --------------------------------------------------------------------------

variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be 'dev' or 'prod'."
  }
}

variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
  default     = "jobstack"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "domain_name" {
  description = "Primary domain for the application"
  type        = string
  default     = "jobstack.kobecloud.pl"
}

# ── Networking ──────────────────────────────────────────────────────────────

variable "vnet_address_space" {
  description = "VNet CIDR block"
  type        = string
  default     = "10.1.0.0/16"
}

variable "subnet_app_cidr" {
  description = "App subnet CIDR"
  type        = string
  default     = "10.1.10.0/24"
}

variable "subnet_data_cidr" {
  description = "Data subnet CIDR"
  type        = string
  default     = "10.1.20.0/24"
}

variable "subnet_mgmt_cidr" {
  description = "Management subnet CIDR"
  type        = string
  default     = "10.1.250.0/24"
}

# ── Compute ─────────────────────────────────────────────────────────────────

variable "vm_size" {
  description = "Azure VM size"
  type        = string
  default     = "Standard_B2s"
}

variable "vm_count" {
  description = "Number of application VMs"
  type        = number
  default     = 2
}

variable "admin_username" {
  description = "VM admin username"
  type        = string
  default     = "deploy"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

# ── Database ────────────────────────────────────────────────────────────────

variable "pg_sku" {
  description = "PostgreSQL Flexible Server SKU"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "pg_storage_mb" {
  description = "PostgreSQL storage in MB"
  type        = number
  default     = 32768 # 32 GB
}

variable "pg_version" {
  description = "PostgreSQL major version"
  type        = string
  default     = "16"
}

variable "pg_ha_enabled" {
  description = "Enable zone-redundant HA for PostgreSQL"
  type        = bool
  default     = false
}

variable "pg_backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

variable "pg_geo_redundant_backup" {
  description = "Enable geo-redundant backups"
  type        = bool
  default     = false
}

# ── Redis ───────────────────────────────────────────────────────────────────

variable "redis_sku" {
  description = "Azure Cache for Redis SKU (Basic, Standard, Premium)"
  type        = string
  default     = "Basic"
}

variable "redis_family" {
  description = "Redis SKU family (C for Basic/Standard, P for Premium)"
  type        = string
  default     = "C"
}

variable "redis_capacity" {
  description = "Redis cache size (0-6)"
  type        = number
  default     = 0
}

# ── Storage ─────────────────────────────────────────────────────────────────

variable "storage_replication" {
  description = "Storage account replication type"
  type        = string
  default     = "LRS"
}

# ── Monitoring ──────────────────────────────────────────────────────────────

variable "log_retention_days" {
  description = "Log Analytics retention in days"
  type        = number
  default     = 30
}

variable "alert_email" {
  description = "Email for monitoring alerts"
  type        = string
  default     = "kuba.pospieszny@gmail.com"
}

# ── Tags ────────────────────────────────────────────────────────────────────

variable "tags" {
  description = "Default tags for all resources"
  type        = map(string)
  default     = {}
}
