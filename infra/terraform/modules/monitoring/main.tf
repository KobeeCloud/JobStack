# --------------------------------------------------------------------------
# Monitoring module — Log Analytics, Application Insights, Metric Alerts
# --------------------------------------------------------------------------

# ── Log Analytics Workspace ─────────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days
  tags                = var.tags
}

# ── Application Insights ────────────────────────────────────────────────────

resource "azurerm_application_insights" "main" {
  name                = "appi-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  tags                = var.tags
}

# ── Action Group (alerts → email) ───────────────────────────────────────────

resource "azurerm_monitor_action_group" "main" {
  name                = "ag-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  short_name          = "jobstack"
  tags                = var.tags

  email_receiver {
    name                    = "admin"
    email_address           = var.alert_email
    use_common_alert_schema = true
  }
}

# ── Metric Alerts ───────────────────────────────────────────────────────────
# These reference resource IDs provided as variables to keep the module
# generic and avoid circular dependencies.

resource "azurerm_monitor_metric_alert" "pg_connections" {
  count               = var.pg_server_id != "" ? 1 : 0
  name                = "alert-pg-connections-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  scopes              = [var.pg_server_id]
  description         = "PostgreSQL active connections above 80% of max_connections"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"
  tags                = var.tags

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "active_connections"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }
}

resource "azurerm_monitor_metric_alert" "redis_memory" {
  count               = var.redis_cache_id != "" ? 1 : 0
  name                = "alert-redis-memory-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  scopes              = [var.redis_cache_id]
  description         = "Redis used memory above 80%"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"
  tags                = var.tags

  criteria {
    metric_namespace = "Microsoft.Cache/Redis"
    metric_name      = "usedmemorypercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }
}
