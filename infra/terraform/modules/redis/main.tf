# --------------------------------------------------------------------------
# Redis module — Azure Cache for Redis + Private Endpoint
# --------------------------------------------------------------------------

resource "azurerm_redis_cache" "main" {
  name                = "redis-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  capacity            = var.redis_capacity
  family              = var.redis_family
  sku_name            = var.redis_sku
  tags                = var.tags

  # TLS 1.2 only — non-SSL port is disabled by default in azurerm 4.x
  minimum_tls_version           = "1.2"
  public_network_access_enabled = false # Only via private endpoint

  redis_configuration {
    maxmemory_policy   = "allkeys-lru"
    aof_backup_enabled = var.redis_sku != "Basic" ? true : false
    rdb_backup_enabled = false
  }
}

# ── Private Endpoint ────────────────────────────────────────────────────────

resource "azurerm_private_endpoint" "redis" {
  name                = "pe-redis-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  subnet_id           = var.subnet_data_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-redis-${var.name_prefix}"
    private_connection_resource_id = azurerm_redis_cache.main.id
    subresource_names              = ["redisCache"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdnszg-redis"
    private_dns_zone_ids = [var.private_dns_zone_redis_id]
  }
}

# ── Store credentials in Key Vault ──────────────────────────────────────────

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "redis-connection-string"
  value        = "${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port},password=${azurerm_redis_cache.main.primary_access_key},ssl=True,abortConnect=False"
  key_vault_id = var.key_vault_id
}

resource "azurerm_key_vault_secret" "redis_primary_key" {
  name         = "redis-primary-key"
  value        = azurerm_redis_cache.main.primary_access_key
  key_vault_id = var.key_vault_id
}
