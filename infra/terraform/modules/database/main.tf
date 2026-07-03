# --------------------------------------------------------------------------
# Database module — Azure Database for PostgreSQL Flexible Server
# --------------------------------------------------------------------------

resource "random_password" "pg_admin" {
  length           = 24
  special          = true
  override_special = "!#$%&*-_=+"
}

# ── PostgreSQL Flexible Server ───────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "pg-${var.name_prefix}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = var.pg_version
  administrator_login    = "pgadmin"
  administrator_password = random_password.pg_admin.result
  storage_mb             = var.pg_storage_mb
  sku_name               = var.pg_sku
  tags                   = var.tags

  # VNet integration — server is fully private (no public endpoint)
  delegated_subnet_id = var.subnet_data_id
  private_dns_zone_id = var.private_dns_zone_pg_id

  backup_retention_days        = var.pg_backup_retention_days
  geo_redundant_backup_enabled = var.pg_geo_redundant_backup

  # Zone-redundant HA for prod
  dynamic "high_availability" {
    for_each = var.pg_ha_enabled ? [1] : []
    content {
      mode = "ZoneRedundant"
    }
  }

  # Enforce TLS 1.2+
  authentication {
    active_directory_auth_enabled = false
    password_auth_enabled         = true
  }

  lifecycle {
    # Prevent accidental password rotation breaking connections
    ignore_changes = [administrator_password]
  }
}

# ── Server configuration ────────────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server_configuration" "ssl_min_version" {
  name      = "ssl_min_protocol_version"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "TLSv1.2"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_connections" {
  name      = "log_connections"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_disconnections" {
  name      = "log_disconnections"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_duration" {
  name      = "log_duration"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

# ── jobstack database ────────────────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server_database" "jobstack" {
  name      = "jobstack"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "UTF8"

  lifecycle {
    prevent_destroy = true
  }
}

# ── Extension: uuid-ossp (required by schema.sql) ──────────────────────────

resource "azurerm_postgresql_flexible_server_configuration" "extensions" {
  name      = "azure.extensions"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "UUID-OSSP,PG_TRGM"
}

# ── Store credentials in Key Vault ──────────────────────────────────────────

resource "azurerm_key_vault_secret" "pg_admin_password" {
  name         = "pg-admin-password"
  value        = random_password.pg_admin.result
  key_vault_id = var.key_vault_id

  depends_on = [var.key_vault_id]
}

resource "azurerm_key_vault_secret" "pg_connection_string" {
  name         = "pg-connection-string"
  value        = "postgresql://pgadmin:${random_password.pg_admin.result}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/jobstack?sslmode=require"
  key_vault_id = var.key_vault_id
}
