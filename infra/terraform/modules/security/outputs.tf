output "key_vault_id" {
  value = azurerm_key_vault.main.id
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  value = azurerm_key_vault.main.vault_uri
}

output "user_assigned_identity_id" {
  value = azurerm_user_assigned_identity.main.id
}

output "user_assigned_identity_principal_id" {
  value = azurerm_user_assigned_identity.main.principal_id
}

output "user_assigned_identity_client_id" {
  value = azurerm_user_assigned_identity.main.client_id
}
