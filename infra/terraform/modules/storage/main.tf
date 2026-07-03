# --------------------------------------------------------------------------
# Storage module — Azure Blob Storage (Supabase Storage replacement)
# --------------------------------------------------------------------------

resource "azurerm_storage_account" "main" {
  name                     = "st${replace(var.name_prefix, "-", "")}app"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.storage_replication
  account_kind             = "StorageV2"
  tags                     = var.tags

  # Security hardening
  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  public_network_access_enabled   = false # Only via private endpoint
  shared_access_key_enabled       = true
  allow_nested_items_to_be_public = false # No anonymous blobs

  blob_properties {
    versioning_enabled = true

    delete_retention_policy {
      days = 30
    }

    container_delete_retention_policy {
      days = 30
    }
  }
}

# ── Blob containers ──────────────────────────────────────────────────────────

resource "azurerm_storage_container" "uploads" {
  name                  = "uploads"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "exports" {
  name                  = "exports"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# ── Private Endpoint ────────────────────────────────────────────────────────

resource "azurerm_private_dns_zone" "storage_blob" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "storage_blob" {
  name                  = "pdnslink-st-${var.name_prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.storage_blob.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
}

resource "azurerm_private_endpoint" "storage" {
  name                = "pe-st-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  subnet_id           = var.subnet_data_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-st-${var.name_prefix}"
    private_connection_resource_id = azurerm_storage_account.main.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdnszg-storage"
    private_dns_zone_ids = [azurerm_private_dns_zone.storage_blob.id]
  }
}
