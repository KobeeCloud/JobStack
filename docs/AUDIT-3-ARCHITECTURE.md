# JobStack — Principal Architect Audit #3

**Scope:** Component Completeness, Multi-Cloud Coverage, Architectural Extensibility, Feature Roadmap
**Date:** 2025-07-14
**Build status:** 0 type errors · 115 tests passing · clean `next build`

---

## Executive Summary

JobStack is a visual IaC designer (Next.js + @xyflow/react) that converts drag-and-drop diagrams into Terraform, Pulumi, CloudFormation, ARM, and CI/CD configs.  The codebase has **158 catalog entries (151 unique IDs)**, **88 Terraform-enabled** components, **5 export generators**, and auxiliary modules for compliance, cost analysis, drift detection, and infrastructure testing.

This audit identifies **7 duplicate IDs**, **67 Terraform-enabled components with no Zod config schema**, **4-way generator mapping divergence**, and a monolithic catalog architecture that blocks plugin-based scaling.  Below are the four deliverables requested.

---

## 1. MISSING PROPERTIES MATRIX

### 1A. Duplicate Component IDs (data-corruption risk)

| ID | Occurrences | Risk |
|:---|:---:|:---|
| `aws-s3` | 2 | Last-write wins in runtime lookup — one definition is dead code |
| `aws-ec2` | 2 | Same |
| `aws-cloudfront` | 2 | Same |
| `aws-route53` | 2 | Same |
| `azure-vm` | 2 | Same |
| `gcp-cloud-storage` | 2 | Same |
| `vercel` | 2 | Same |

**Impact:** `getComponentById()` returns the FIRST match.  The second definition's `terraform.defaultConfig` is unreachable.  This silently breaks code generation if the two definitions differ.

**Fix (P0):** Deduplicate — keep the richer definition, delete the other.

---

### 1B. Terraform-Enabled Components WITHOUT Zod Config Schema (67 / 88 = 76 % uncovered)

The `CONFIG_SCHEMAS` map in `node-config-schemas.ts` covers **only 21** of the 88 Terraform-capable catalog entries.  The remaining 67 fall back to `genericConfigSchema` (replicas + tags only), meaning the Node Config Panel **cannot validate or expose** provider-specific fields.

| Provider | Missing Schema | Count |
|:---|:---|:---:|
| **AWS** | `aws-s3`, `aws-ec2`, `aws-ecs`, `aws-elasticache`, `aws-cloudfront`, `aws-route53`, `aws-sqs`, `aws-sns`, `aws-cognito`, `aws-nat-gateway`, `aws-internet-gateway`, `aws-route-table`, `aws-elastic-ip`, `aws-nlb`, `aws-auto-scaling`, `aws-efs`, `aws-api-gateway`, `aws-secrets-manager`, `aws-kinesis`, `aws-step-functions`, `aws-eventbridge` | 21 |
| **Azure** | `azure-app-gw`, `azure-availability-set`, `azure-bastion`, `azure-ddos-protection`, `azure-express-route`, `azure-file-share`, `azure-firewall`, `azure-front-door`, `azure-landing-zone`, `azure-managed-disk`, `azure-management-group`, `azure-nat-gateway`, `azure-resource-group`, `azure-route-table`, `azure-storage-account`, `azure-subscription`, `azure-traffic-manager`, `azure-vpn-gateway` | 18 |
| **GCP** | `gcp-compute-instance`, `gcp-compute-engine`, `gcp-cloud-run`, `gcp-cloud-sql`, `gcp-cloud-storage`, `gcp-bigquery`, `gcp-cloud-cdn`, `gcp-cloud-lb`, `gcp-cloud-nat`, `gcp-firebase`, `gcp-instance-group`, `gcp-persistent-disk`, `gcp-pubsub` | 13 |
| **Other** | `cdn`, `dynamodb`, `mongodb`, `mysql`, `postgresql`, `redis`, `monitoring`, `dotnet-api`, `nodejs-api`, `ruby-api`, `react-app`, `nextjs-app`, `angular-app`, `vue-app`, `static-site`, `supabase`, `go-api` | 15 (app-framework + DB abstractions) |

**Impact:** Users cannot configure replication factor, SKU, disk type, CIDR, security rules, etc. for the majority of cloud components.  Generated Terraform uses only `defaultConfig` placeholders.

---

### 1C. Generator Mapping Divergence (4-way inconsistency)

Each export generator maintains its **own independently hardcoded** mapping dictionary.  They are NOT derived from the catalog.

| System | Mapping Dict | Entry Count | Source of Truth |
|:---|:---|:---:|:---|
| **Catalog** (`catalog.ts`) | `terraform.resource` field | 73 unique resource types | Component definitions |
| **ARM** (`arm-generator.ts`) | `ARM_MAPPINGS` | ~45 Azure resource types | Standalone dict |
| **CFN** (`cloudformation-generator.ts`) | `CFN_MAPPINGS` | ~37 AWS resource types | Standalone dict |
| **Pulumi** (`pulumi-generator.ts`) | `PULUMI_MAPPINGS` | ~65 resources (multi-cloud) | Standalone dict |
| **TF Import** (`terraform-import.ts`) | `RESOURCE_MAPPINGS` | ~55 resource types | Standalone dict |
| **Drift** (`drift-detection.ts`) | `TF_TO_DIAGRAM_MAP` | ~30 resource types | Standalone dict |

**Problem:** When a new component is added to the catalog, the developer must manually update **6 separate files**.  Omitting any one of them creates a silent gap (e.g., the component appears in the palette but produces no ARM output).

---

### 1D. `canContain` Hierarchy Gaps

| Component | `canContain` | Missing Logical Children |
|:---|:---|:---|
| `azure-vnet` | `['azure-subnet']` | `azure-bastion`, `azure-firewall`, `azure-vpn-gateway` (commonly VNet-scoped) |
| `azure-subscription` | `['azure-resource-group']` | Missing — this is correct, but `azure-resource-group` itself has no `canContain` |
| `azure-resource-group` | *(not set)* | Should contain all Azure scoped resources (VNet, VM, AKS, SQL, etc.) |
| `aws-vpc` | `['aws-subnet']` | `aws-internet-gateway`, `aws-nat-gateway`, `aws-route-table` (VPC-scoped) |
| `gcp-vpc` | `['gcp-subnet']` | `gcp-cloud-nat`, `gcp-firewall` (VPC-scoped) |

---

## 2. ECOSYSTEM GAPS

### 2A. Missing Cloud Providers

| Provider | Status | Market Justification |
|:---|:---|:---|
| **Oracle Cloud (OCI)** | Not supported | Enterprise/government customers; strong database workloads |
| **DigitalOcean** | Not supported | SMB/startup market; simple API, Kubernetes offering |
| **Alibaba Cloud** | Not supported | China/APAC market leader; required for cross-border architectures |
| **IBM Cloud** | Not supported | Hybrid cloud / mainframe modernization |

### 2B. Missing IaC Export Formats

| Format | Priority | Rationale |
|:---|:---|:---|
| **Azure Bicep** | P1-HIGH | Microsoft's recommended replacement for ARM JSON; simpler syntax; Azure is the most mature provider in the catalog |
| **AWS CDK (TypeScript)** | P2-MEDIUM | Increasingly popular; more type-safe than CFN YAML |
| **Terraform CDK (cdktf)** | P2-MEDIUM | Bridges HCL and TypeScript; multi-cloud |
| **Crossplane (K8s CRDs)** | P2-MEDIUM | GitOps-native IaC — manages cloud resources as K8s objects |
| **Kubernetes Manifests** | P1-HIGH | Catalog has `kubernetes`, `helm`, `argocd` components but no K8s YAML generator |
| **Ansible Playbooks** | P3-LOW | Catalog has `ansible` component but no playbook generation |
| **OpenTofu** | P3-LOW | Fork of Terraform; HCL generation already covers it (just rebrand provider block) |

### 2C. Missing Resource Types per Provider

#### AWS (current: ~25 catalog entries)
| Missing Resource | Terraform Type | Priority |
|:---|:---|:---|
| AWS WAF v2 | `aws_wafv2_web_acl` | P1 |
| AWS Aurora Serverless | `aws_rds_cluster` | P1 |
| AWS Redshift | `aws_redshift_cluster` | P2 |
| AWS MSK (Kafka) | `aws_msk_cluster` | P2 |
| AWS OpenSearch | `aws_opensearch_domain` | P2 |
| AWS AppSync | `aws_appsync_graphql_api` | P3 |
| AWS Glue | `aws_glue_job` | P3 |
| AWS SageMaker | `aws_sagemaker_endpoint` | P2 |
| AWS CodePipeline | `aws_codepipeline` | P3 |
| AWS Transit Gateway | `aws_ec2_transit_gateway` | P1 |

#### Azure (current: ~40 catalog entries — most complete)
| Missing Resource | ARM Type | Priority |
|:---|:---|:---|
| Azure Container Apps | `Microsoft.App/containerApps` | P1 |
| Azure OpenAI | `Microsoft.CognitiveServices/accounts` | P1 |
| Azure Databricks | `Microsoft.Databricks/workspaces` | P2 |
| Azure Synapse | `Microsoft.Synapse/workspaces` | P2 |
| Azure Logic App | `Microsoft.Logic/workflows` | P2 |
| Azure API Management | `Microsoft.ApiManagement/service` | P1 |
| Azure App Configuration | `Microsoft.AppConfiguration/configurationStores` | P3 |
| Azure Static Web App | `Microsoft.Web/staticSites` | P2 |
| Azure SignalR | `Microsoft.SignalRService/SignalR` | P3 |
| Azure Purview / Microsoft Fabric | — | P3 |

#### GCP (current: ~15 catalog entries — least complete)
| Missing Resource | Terraform Type | Priority |
|:---|:---|:---|
| GCP Vertex AI | `google_vertex_ai_endpoint` | P2 |
| GCP Cloud Composer (Airflow) | `google_composer_environment` | P2 |
| GCP Memorystore (Redis) | `google_redis_instance` | P1 |
| GCP Cloud Armor | `google_compute_security_policy` | P1 |
| GCP Secret Manager | `google_secret_manager_secret` | P1 |
| GCP Cloud DNS | `google_dns_managed_zone` | P2 |
| GCP Artifact Registry | `google_artifact_registry_repository` | P2 |
| GCP Dataflow | `google_dataflow_job` | P3 |
| GCP Cloud IoT | Deprecated → IoT Core | Skip |
| GCP Anthos | `google_gke_hub_membership` | P3 |

### 2D. Multi-Cloud Agnostic Abstraction Gaps

Current `CLOUD_AGNOSTIC_MAPPINGS` has only **12 entries** covering basic concepts.  Missing:

| Generic Concept | Needed Mappings |
|:---|:---|
| `generic-container-orchestrator` | EKS / AKS / GKE |
| `generic-serverless-function` | Lambda / Functions / Cloud Functions |
| `generic-message-queue` | SQS / Service Bus / Pub/Sub |
| `generic-api-gateway` | API GW / APIM / Cloud Endpoints |
| `generic-container-registry` | ECR / ACR / Artifact Registry |
| `generic-secret-store` | Secrets Manager / Key Vault / Secret Manager |
| `generic-dns` | Route53 / Azure DNS / Cloud DNS |
| `generic-waf` | AWS WAF / Azure Front Door WAF / Cloud Armor |
| `generic-nosql` | DynamoDB / Cosmos DB / Firestore |
| `generic-monitoring` | CloudWatch / Azure Monitor / Cloud Monitoring |

---

## 3. EXTENSIBILITY REFACTOR

### 3A. Problem: Monolithic Catalog Array

[lib/catalog.ts](lib/catalog.ts) is a **2,511-line** TypeScript array with hardcoded Lucide icon imports.  Adding a component requires editing this single file plus up to 5 generator mapping files.

### 3B. Proposed: Schema-Driven Component Registry

Replace the monolithic array with a **JSON/YAML registry** that each generator reads via a shared resolver:

```
lib/
  registry/
    components/
      azure/
        vm.component.json        ← one file per component
        vnet.component.json
        aks.component.json
      aws/
        ec2.component.json
        s3.component.json
      gcp/
        compute-instance.component.json
    schemas/
      component.schema.json      ← JSON Schema for validation
    index.ts                     ← builds COMPONENT_CATALOG at import time
```

**Component file example** (`azure/vm.component.json`):
```json
{
  "$schema": "../schemas/component.schema.json",
  "id": "azure-vm",
  "name": "Virtual Machine",
  "category": "compute",
  "provider": "azure",
  "serviceType": "iaas",
  "generatorType": "terraform",
  "icon": "Server",
  "color": "#3B82F6",
  "description": "Azure Virtual Machine (Linux or Windows)",
  "estimatedCost": { "min": 15, "max": 500 },
  "canContain": [],
  "configurable": {
    "replicas": true,
    "size": true,
    "osImage": true,
    "attachments": ["azure-nsg", "azure-managed-disk"]
  },
  "generators": {
    "terraform": {
      "provider": "azure",
      "resource": "azurerm_linux_virtual_machine",
      "defaultConfig": { "size": "Standard_B2s", "admin_username": "azureuser" }
    },
    "arm": {
      "type": "Microsoft.Compute/virtualMachines",
      "apiVersion": "2023-09-01"
    },
    "pulumi": {
      "package": "@pulumi/azure-native",
      "resource": "compute.VirtualMachine"
    },
    "bicep": {
      "type": "Microsoft.Compute/virtualMachines",
      "apiVersion": "2023-09-01"
    }
  },
  "configSchema": {
    "type": "object",
    "properties": {
      "size": { "type": "string", "enum": ["Standard_B1s", "Standard_B2s", "Standard_D2s_v5"] },
      "osImage": { "type": "string", "default": "ubuntu-2204" },
      "replicas": { "type": "integer", "minimum": 1, "maximum": 100, "default": 1 }
    }
  }
}
```

**Index loader** (`registry/index.ts`):
```typescript
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const COMPONENTS_DIR = path.join(__dirname, 'components')

export async function loadCatalog(): Promise<ComponentConfig[]> {
  const providerDirs = await readdir(COMPONENTS_DIR)
  const catalog: ComponentConfig[] = []
  for (const dir of providerDirs) {
    const files = await readdir(path.join(COMPONENTS_DIR, dir))
    for (const file of files.filter(f => f.endsWith('.component.json'))) {
      const raw = await import(path.join(COMPONENTS_DIR, dir, file))
      catalog.push(resolveIcons(validateSchema(raw)))
    }
  }
  return catalog
}
```

**Benefits:**
- Generators read their mapping from `component.generators[format]` — single source of truth
- New components = new JSON file, zero TypeScript changes
- JSON Schema validates component definitions at build time
- Community contributors can submit components without touching core code
- Supports future plugin marketplace

---

### 3C. Generator Plugin Architecture

Current: each generator is a standalone file with its own mapping dict + switch/if-else logic.

**Proposed: Strategy pattern with per-resource codegen functions:**

```typescript
// lib/generators/core/generator-plugin.ts
export interface GeneratorPlugin {
  format: ExportFormat
  canGenerate(component: ComponentConfig): boolean
  generateResource(node: ResolvedNode, graph: InfraGraph): string
  generateProvider(): string
  fileExtension: string
}

// lib/generators/terraform/azure-vm.plugin.ts
export const azureVmTerraformPlugin: ResourcePlugin = {
  componentId: 'azure-vm',
  generate(node, graph) {
    const config = node.config
    const name = sanitizeName(node.label, 'terraform')
    return `resource "azurerm_linux_virtual_machine" "${name}" {
  name                = "\${var.project_name}-${name}"
  resource_group_name = ${findAncestorRef(node, graph, 'azure-resource-group')}
  location            = var.location
  size                = "${config.size || 'Standard_B2s'}"
  admin_username      = "${config.admin_username || 'azureuser'}"
  ...
}`
  }
}
```

This converts the 1,029-line `terraform.ts` monolith into ~50 small, testable plugin files (~20 lines each).

---

### 3D. Proposed: Unified Config Schema Registry

Replace the separate `node-config-schemas.ts` approach with schemas embedded in component definitions (see 3B).  At runtime, derive Zod schemas from JSON Schema using a converter:

```typescript
import { jsonSchemaToZod } from 'json-schema-to-zod'

export function getConfigSchema(component: ComponentConfig): z.ZodSchema {
  if (component.configSchema) {
    return jsonSchemaToZod(component.configSchema)
  }
  return genericConfigSchema
}
```

This eliminates the need to maintain a separate `CONFIG_SCHEMAS` map.

---

## 4. NEW FEATURES ROADMAP

### Phase 1 — Foundation (Weeks 1-4)

| # | Feature | Effort | Impact |
|:---:|:---|:---:|:---:|
| F-1 | **Deduplicate 7 catalog IDs** | 1h | Critical — data integrity |
| F-2 | **Add `canContain` to `azure-resource-group`** (all Azure scoped resources) and fix VPC hierarchy for AWS/GCP | 2h | High — hierarchy correctness |
| F-3 | **Add Zod schemas for top-20 uncovered components** (EC2, S3, RDS, Lambda, AKS, App GW, Cloud Run, BigQuery…) | 8h | High — enables config panel |
| F-4 | **Single-source generator mappings** — extract ARM/CFN/Pulumi mappings from catalog `generators` field | 16h | Critical — eliminates 4-way divergence |
| F-5 | **Bicep generator** — `lib/export/bicep-generator.ts` using ARM types with simplified syntax | 8h | High — Azure users expect it |

### Phase 2 — Multi-Cloud & AI (Weeks 5-8)

| # | Feature | Effort | Impact |
|:---:|:---|:---:|:---:|
| F-6 | **Expand cloud-agnostic mappings** to 22+ concepts (see §2D) | 4h | Medium — improves cloud migration UX |
| F-7 | **Kubernetes manifest generator** — produce Deployment/Service/Ingress YAML from k8s nodes | 16h | High — fills major gap |
| F-8 | **AI Architecture Suggestions** — integrate `lib/ai/architecture-analyzer.ts` with diagram context to suggest missing components (e.g., "Your VPC has no NAT Gateway") | 12h | High — differentiator |
| F-9 | **Real-time cost estimation** — replace static `estimatedCost` with `cloud-pricing.ts` data + region-aware pricing | 8h | High — already have pricing data |
| F-10 | **Azure OpenAI / AWS Bedrock / GCP Vertex AI** catalog entries | 4h | Medium — AI workloads are top trend |

### Phase 3 — Enterprise (Weeks 9-12)

| # | Feature | Effort | Impact |
|:---:|:---|:---:|:---:|
| F-11 | **Policy-as-Code validation** — extend compliance scanner to check diagram against OPA/Rego policies before export | 16h | High — enterprise requirement |
| F-12 | **Terraform Plan preview** — run `terraform plan` in a sandboxed container and show diff in UI | 20h | Very High — unique differentiator |
| F-13 | **Git integration** — commit generated IaC directly to a repo branch via GitHub/GitLab API | 12h | High — closes the loop |
| F-14 | **Component marketplace** — allow users to publish/install custom component JSON packages | 20h | Very High — ecosystem growth |
| F-15 | **Multi-region diagram support** — region-aware node placement using `lib/regions.ts` coordinates | 8h | Medium — already have region data |

### Phase 4 — Scale & Differentiation (Weeks 13-16)

| # | Feature | Effort | Impact |
|:---:|:---|:---:|:---:|
| F-16 | **Dependency graph visualization** — show Terraform dependency order overlay on diagram | 8h | Medium |
| F-17 | **Drift remediation** — after drift detection, auto-generate `terraform import` commands | 8h | High |
| F-18 | **Cost comparison mode** — side-by-side AWS vs Azure vs GCP cost for identical architecture | 4h | Medium — `compareCostsAcrossProviders()` exists |
| F-19 | **Diagram versioning & rollback** — visual diff between Version N and N-1 | 12h | High |
| F-20 | **SSO / RBAC per project** — use `lib/auth/sso-config.ts` to gate diagram access | 8h | Enterprise |

---

## 5. QUICK WINS (< 2 hours each)

| # | Item | File(s) | Time |
|:---:|:---|:---|:---:|
| QW-1 | Deduplicate 7 component IDs | `catalog.ts` | 30min |
| QW-2 | Add `canContain` to `azure-resource-group` | `catalog.ts` | 15min |
| QW-3 | Expand `canContain` on `aws-vpc` and `gcp-vpc` | `catalog.ts` | 15min |
| QW-4 | Add AWS S3 Zod schema (bucket name, versioning, encryption, lifecycle) | `node-config-schemas.ts` | 30min |
| QW-5 | Add GCP Compute Instance schema (machineType, zone, diskSize, preemptible) | `node-config-schemas.ts` | 30min |
| QW-6 | Fix `tryConvertComponent` to cover containers (EKS→AKS→GKE) | `cloud-mappings.ts` | 20min |
| QW-7 | Add `aws-aurora-serverless` to catalog + CFN mapping | `catalog.ts`, `cloudformation-generator.ts` | 45min |
| QW-8 | Add `azure-container-apps` to catalog + ARM mapping | `catalog.ts`, `arm-generator.ts` | 45min |

---

## 6. METRICS SUMMARY

| Metric | Current | Target (Phase 2) |
|:---|:---:|:---:|
| Catalog entries (unique) | 151 | 180+ |
| Terraform-enabled | 88 | 120+ |
| Zod config schemas | 21 of 88 (24%) | 60+ (50%+) |
| Cloud-agnostic mappings | 12 | 22+ |
| Export formats | 9 | 12 (+ Bicep, K8s YAML, CDK) |
| Compliance frameworks | 5 | 7 (+ NIST 800-53, ISO 27001) |
| Test suites | 4 files / 115 tests | 12+ files / 300+ tests |
| Architecture templates | ~6 | 15+ |
| Duplicate IDs | 7 | 0 |
| Generator mapping sources | 6 (divergent) | 1 (unified) |

---

*End of Audit #3 — Principal Cloud Architect / Product Visionary / Lead DevOps Engineer*
