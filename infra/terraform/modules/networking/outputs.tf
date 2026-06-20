output "vnet_id" {
  value = azurerm_virtual_network.main.id
}

output "vnet_name" {
  value = azurerm_virtual_network.main.name
}

output "subnet_app_id" {
  value = azurerm_subnet.app.id
}

output "subnet_data_id" {
  value = azurerm_subnet.data.id
}

output "subnet_mgmt_id" {
  value = azurerm_subnet.mgmt.id
}

output "private_dns_zone_pg_id" {
  value = azurerm_private_dns_zone.postgresql.id
}

output "private_dns_zone_redis_id" {
  value = azurerm_private_dns_zone.redis.id
}
