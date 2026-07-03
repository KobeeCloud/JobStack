# --------------------------------------------------------------------------
# Compute module — 2× Ubuntu VMs, Azure Load Balancer, Availability Set
# --------------------------------------------------------------------------

locals {
  vm_list = [for i in range(var.vm_count) : {
    index = i
    name  = "vm-${var.name_prefix}-${format("%02d", i + 1)}"
    nic   = "nic-${var.name_prefix}-${format("%02d", i + 1)}"
    pip   = "pip-${var.name_prefix}-vm-${format("%02d", i + 1)}"
  }]
}

# ── Public IPs for individual VMs (for Ansible/SSH access) ──────────────────

resource "azurerm_public_ip" "vm" {
  count               = var.vm_count
  name                = "pip-${var.name_prefix}-vm-${format("%02d", count.index + 1)}"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = var.tags
}

# ── Load Balancer Public IP ──────────────────────────────────────────────────

resource "azurerm_public_ip" "lb" {
  name                = "pip-${var.name_prefix}-lb"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = var.tags
}

# ── Load Balancer ────────────────────────────────────────────────────────────

resource "azurerm_lb" "main" {
  name                = "lb-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Standard"
  tags                = var.tags

  frontend_ip_configuration {
    name                 = "frontend"
    public_ip_address_id = azurerm_public_ip.lb.id
  }
}

resource "azurerm_lb_backend_address_pool" "main" {
  loadbalancer_id = azurerm_lb.main.id
  name            = "backend-pool"
}

resource "azurerm_lb_probe" "http" {
  loadbalancer_id     = azurerm_lb.main.id
  name                = "health-probe"
  protocol            = "Http"
  port                = 3000
  request_path        = "/api/health"
  interval_in_seconds = 15
  number_of_probes    = 2
}

resource "azurerm_lb_rule" "http" {
  loadbalancer_id                = azurerm_lb.main.id
  name                           = "LBRuleHTTP"
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 80
  frontend_ip_configuration_name = "frontend"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  idle_timeout_in_minutes = 4
  tcp_reset_enabled       = true
}

resource "azurerm_lb_rule" "https" {
  loadbalancer_id                = azurerm_lb.main.id
  name                           = "LBRuleHTTPS"
  protocol                       = "Tcp"
  frontend_port                  = 443
  backend_port                   = 443
  frontend_ip_configuration_name = "frontend"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  idle_timeout_in_minutes = 4
  tcp_reset_enabled       = true
}

# ── Availability Set ────────────────────────────────────────────────────────

resource "azurerm_availability_set" "main" {
  name                         = "avset-${var.name_prefix}"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  platform_fault_domain_count  = 2
  platform_update_domain_count = 5
  managed                      = true
  tags                         = var.tags
}

# ── User-Assigned Managed Identity ──────────────────────────────────────────
# Allows VMs to pull secrets from Key Vault without stored credentials.

resource "azurerm_user_assigned_identity" "vm" {
  name                = "id-${var.name_prefix}-vm"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
}

# ── Network Interface Cards ──────────────────────────────────────────────────

resource "azurerm_network_interface" "vm" {
  count               = var.vm_count
  name                = "nic-${var.name_prefix}-${format("%02d", count.index + 1)}"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_app_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm[count.index].id
  }
}

# ── Associate NICs with LB backend pool ────────────────────────────────────

resource "azurerm_network_interface_backend_address_pool_association" "vm" {
  count                   = var.vm_count
  network_interface_id    = azurerm_network_interface.vm[count.index].id
  ip_configuration_name   = "internal"
  backend_address_pool_id = azurerm_lb_backend_address_pool.main.id
}

# ── Virtual Machines ────────────────────────────────────────────────────────

resource "azurerm_linux_virtual_machine" "vm" {
  count               = var.vm_count
  name                = "vm-${var.name_prefix}-${format("%02d", count.index + 1)}"
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.vm_size
  admin_username      = var.admin_username
  availability_set_id = azurerm_availability_set.main.id
  tags                = var.tags

  # SSH key auth only — no password
  disable_password_authentication = true

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  network_interface_ids = [azurerm_network_interface.vm[count.index].id]

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.vm.id]
  }

  os_disk {
    name                 = "osdisk-${var.name_prefix}-${format("%02d", count.index + 1)}"
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 64
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  # Boot diagnostics for troubleshooting
  boot_diagnostics {}

  # Cloud-init: configure swap, timezone, hostname
  custom_data = base64encode(templatefile("${path.module}/cloud-init.yaml.tpl", {
    hostname = "vm-${var.name_prefix}-${format("%02d", count.index + 1)}"
  }))
}

# ── Log Analytics extension ─────────────────────────────────────────────────

resource "azurerm_virtual_machine_extension" "oms" {
  count                      = var.vm_count
  name                       = "OmsAgentForLinux"
  virtual_machine_id         = azurerm_linux_virtual_machine.vm[count.index].id
  publisher                  = "Microsoft.EnterpriseCloud.Monitoring"
  type                       = "OmsAgentForLinux"
  type_handler_version       = "1.21"
  auto_upgrade_minor_version = true
  tags                       = var.tags

  settings = jsonencode({
    workspaceId = var.log_analytics_workspace_id
  })

  protected_settings = jsonencode({
    workspaceKey = var.log_analytics_workspace_key
  })
}
