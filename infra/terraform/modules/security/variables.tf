variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "name_prefix" { type = string }
variable "environment" { type = string }
variable "subnet_mgmt_id" { type = string }
variable "vnet_id" { type = string }
variable "tags" { type = map(string) }
