# --------------------------------------------------------------------------
# Root outputs — values needed for Ansible and CI/CD
# --------------------------------------------------------------------------

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "vm_public_ips" {
  description = "Public IPs of application VMs (for Ansible inventory)"
  value       = module.compute.vm_public_ips
}

output "vm_private_ips" {
  description = "Private IPs of application VMs"
  value       = module.compute.vm_private_ips
}

output "lb_public_ip" {
  description = "Load Balancer public IP"
  value       = module.compute.lb_public_ip
}

output "postgresql_fqdn" {
  description = "PostgreSQL Flexible Server FQDN"
  value       = module.database.postgresql_fqdn
  sensitive   = true
}

output "redis_hostname" {
  description = "Azure Cache for Redis hostname"
  value       = module.redis.redis_hostname
  sensitive   = true
}

output "storage_account_name" {
  description = "Blob storage account name"
  value       = module.storage.storage_account_name
}

output "key_vault_name" {
  description = "Key Vault name"
  value       = module.security.key_vault_name
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = module.security.key_vault_uri
}

output "app_insights_connection_string" {
  description = "Application Insights connection string"
  value       = module.monitoring.app_insights_connection_string
  sensitive   = true
}

output "frontdoor_endpoint" {
  description = "Azure Front Door endpoint hostname"
  value       = module.cdn.frontdoor_endpoint
}
