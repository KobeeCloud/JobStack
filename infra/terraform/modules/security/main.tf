# --------------------------------------------------------------------------
# Security module — Key Vault, User-Assigned Identity, Private Endpoints
# --------------------------------------------------------------------------

data "azurerm_client_config" "current" {}

# ── User-Assigned Managed Identity ──────────────────────────────────────────

resource "azurerm_user_assigned_identity" "main" {
  name                = "id-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
}

# ── Key Vault ────────────────────────────────────────────────────────────────

resource "azurerm_key_vault" "main" {
  name                       = "kv-${var.name_prefix}"
  resource_group_name        = var.resource_group_name
  location                   = var.location
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 90
  purge_protection_enabled   = var.environment == "prod" ? true : false
  enable_rbac_authorization  = true # Use Azure RBAC instead of access policies
  tags                       = var.tags

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    # Allow from VNet subnets via private endpoint; direct public access denied
    virtual_network_subnet_ids = []
    ip_rules                   = []
  }
}

# ── Key Vault RBAC — Terraform deployer gets admin ──────────────────────────

resource "azurerm_role_assignment" "kv_admin_deployer" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# ── Key Vault RBAC — VMs (managed identity) get secrets reader ──────────────

resource "azurerm_role_assignment" "kv_secrets_vm" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.main.principal_id
}

# ── Key Vault Private Endpoint ───────────────────────────────────────────────

resource "azurerm_private_endpoint" "key_vault" {
  name                = "pe-kv-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  subnet_id           = var.subnet_mgmt_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-kv-${var.name_prefix}"
    private_connection_resource_id = azurerm_key_vault.main.id
    subresource_names              = ["vault"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdnszg-kv"
    private_dns_zone_ids = [azurerm_private_dns_zone.key_vault.id]
  }
}

resource "azurerm_private_dns_zone" "key_vault" {
  name                = "privatelink.vaultcore.azure.net"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "key_vault" {
  name                  = "pdnslink-kv-${var.name_prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.key_vault.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
}
