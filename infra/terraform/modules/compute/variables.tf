variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "name_prefix" { type = string }
variable "subnet_app_id" { type = string }
variable "vm_size" { type = string }
variable "vm_count" { type = number }
variable "admin_username" { type = string }
variable "ssh_public_key_path" { type = string }
variable "key_vault_id" { type = string }
variable "log_analytics_workspace_id" { type = string }
variable "log_analytics_workspace_key" {
  type      = string
  sensitive = true
}
variable "user_assigned_identity_id" { type = string }
variable "tags" { type = map(string) }
