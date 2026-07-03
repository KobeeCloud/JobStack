# --------------------------------------------------------------------------
# CDN module — Azure Front Door Standard + WAF + Custom Domain
# --------------------------------------------------------------------------

resource "azurerm_cdn_frontdoor_profile" "main" {
  name                     = "afd-${var.name_prefix}"
  resource_group_name      = var.resource_group_name
  sku_name                 = "Standard_AzureFrontDoor"
  response_timeout_seconds = 60
  tags                     = var.tags
}

# ── Origin Group ────────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_origin_group" "app" {
  name                     = "og-app"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id

  load_balancing {
    sample_size                        = 4
    successful_samples_required        = 3
    additional_latency_in_milliseconds = 50
  }

  health_probe {
    interval_in_seconds = 30
    path                = "/api/health"
    protocol            = "Http"
    request_type        = "GET"
  }

  session_affinity_enabled = false
}

# ── Origin (Load Balancer public IP) ────────────────────────────────────────

resource "azurerm_cdn_frontdoor_origin" "lb" {
  name                          = "origin-lb"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.app.id

  enabled                        = true
  host_name                      = var.lb_public_ip
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = var.domain_name
  priority                       = 1
  weight                         = 1000
  certificate_name_check_enabled = false
}

# ── Endpoint ────────────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_endpoint" "main" {
  name                     = "ep-${var.name_prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id
  tags                     = var.tags
}

# ── Routes ──────────────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_route" "main" {
  name                          = "route-app"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.main.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.app.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.lb.id]
  enabled                       = true

  https_redirect_enabled = true
  patterns_to_match      = ["/*"]
  supported_protocols    = ["Http", "Https"]
  forwarding_protocol    = "HttpOnly"

  cache {
    query_string_caching_behavior = "IgnoreQueryString"
    compression_enabled           = true
    content_types_to_compress     = ["text/html", "text/css", "application/javascript", "application/json"]
  }
}

# Static asset caching rule — Next.js build output
resource "azurerm_cdn_frontdoor_route" "static" {
  name                          = "route-static"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.main.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.app.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.lb.id]
  enabled                       = true

  https_redirect_enabled = true
  patterns_to_match      = ["/_next/static/*", "/public/*"]
  supported_protocols    = ["Http", "Https"]
  forwarding_protocol    = "HttpOnly"

  cache {
    query_string_caching_behavior = "IgnoreQueryString"
    compression_enabled           = true
    content_types_to_compress = ["text/css", "application/javascript"]
  }
}

# ── WAF Policy ──────────────────────────────────────────────────────────────

resource "azurerm_cdn_frontdoor_firewall_policy" "main" {
  name                              = "waf${replace(var.name_prefix, "-", "")}"
  resource_group_name               = var.resource_group_name
  sku_name                          = azurerm_cdn_frontdoor_profile.main.sku_name
  enabled                           = true
  mode                              = "Prevention"
  redirect_url                      = "https://${var.domain_name}/error"
  custom_block_response_status_code = 403
  tags                              = var.tags

  # OWASP 3.2 managed ruleset
  managed_rule {
    type    = "Microsoft_DefaultRuleSet"
    version = "2.1"
    action  = "Block"
  }

  managed_rule {
    type    = "Microsoft_BotManagerRuleSet"
    version = "1.1"
    action  = "Block"
  }
}

resource "azurerm_cdn_frontdoor_security_policy" "main" {
  name                     = "sp-${var.name_prefix}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id

  security_policies {
    firewall {
      cdn_frontdoor_firewall_policy_id = azurerm_cdn_frontdoor_firewall_policy.main.id

      association {
        domain {
          cdn_frontdoor_domain_id = azurerm_cdn_frontdoor_endpoint.main.id
        }
        patterns_to_match = ["/*"]
      }
    }
  }
}
