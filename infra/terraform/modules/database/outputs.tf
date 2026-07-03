output "postgresql_fqdn" {
  value     = azurerm_postgresql_flexible_server.main.fqdn
  sensitive = true
}

output "postgresql_server_id" {
  value = azurerm_postgresql_flexible_server.main.id
}

output "postgresql_server_name" {
  value = azurerm_postgresql_flexible_server.main.name
}

output "postgresql_database_name" {
  value = azurerm_postgresql_flexible_server_database.jobstack.name
}
