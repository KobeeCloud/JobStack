output "redis_hostname" {
  value     = azurerm_redis_cache.main.hostname
  sensitive = true
}

output "redis_ssl_port" {
  value = azurerm_redis_cache.main.ssl_port
}

output "redis_primary_key" {
  value     = azurerm_redis_cache.main.primary_access_key
  sensitive = true
}

output "redis_id" {
  value = azurerm_redis_cache.main.id
}
