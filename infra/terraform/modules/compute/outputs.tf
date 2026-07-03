output "vm_public_ips" {
  description = "Public IPs of application VMs"
  value       = azurerm_public_ip.vm[*].ip_address
}

output "vm_private_ips" {
  description = "Private IPs of application VMs"
  value       = azurerm_network_interface.vm[*].private_ip_address
}

output "lb_public_ip" {
  description = "Load Balancer public IP"
  value       = azurerm_public_ip.lb.ip_address
}

output "vm_ids" {
  value = azurerm_linux_virtual_machine.vm[*].id
}

output "user_assigned_identity_id" {
  value = azurerm_user_assigned_identity.vm.id
}

output "user_assigned_identity_principal_id" {
  value = azurerm_user_assigned_identity.vm.principal_id
}
