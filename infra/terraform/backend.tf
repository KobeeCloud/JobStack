# --------------------------------------------------------------------------
# Remote state backend — Azure Storage
# --------------------------------------------------------------------------
# Before first use, create the storage account and container:
#
#   az group create -n rg-jobstack-tfstate -l westeurope
#   az storage account create -n stjobstacktfstate -g rg-jobstack-tfstate \
#       -l westeurope --sku Standard_LRS --min-tls-version TLS1_2
#   az storage container create -n tfstate \
#       --account-name stjobstacktfstate
#
# Then init:
#   terraform init -backend-config="environments/dev.backend.hcl"
# --------------------------------------------------------------------------

terraform {
  backend "azurerm" {
    resource_group_name  = "rg-jobstack-tfstate"
    storage_account_name = "stjobstacktfstate"
    container_name       = "tfstate"
    key                  = "jobstack.tfstate"
    use_oidc             = true # GitHub Actions OIDC — no secrets stored
  }
}
