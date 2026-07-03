variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "name_prefix" { type = string }
variable "log_retention_days" { type = number }
variable "alert_email" { type = string }
variable "tags" { type = map(string) }

# Optional resource IDs for alert scopes (pass empty string to skip)
variable "pg_server_id" {
  type    = string
  default = ""
}

variable "redis_cache_id" {
  type    = string
  default = ""
}
