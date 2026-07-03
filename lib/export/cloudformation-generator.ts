import { Node, Edge } from '@xyflow/react'
import {
  buildNodeMap,
  getNodeComponentId,
  findAncestorName,
  findConnectedNames,
} from '@/lib/generators/core/graph-utils'

/**
 * AWS CloudFormation Generator
 * Converts diagram to CloudFormation YAML/JSON templates
 * Supports parent-child relationships (VPC->Subnet->Instance, etc.)
 */

interface CloudFormationResource {
  Type: string
  Properties: Record<string, unknown>
  DependsOn?: string[]
}

interface CloudFormationTemplate {
  AWSTemplateFormatVersion: string
  Description: string
  Parameters: Record<string, unknown>
  Resources: Record<string, CloudFormationResource>
  Outputs: Record<string, unknown>
}

const CFN_MAPPINGS: Record<string, { type: string; defaultProps: Record<string, unknown> }> = {
  'aws-vpc': {
    type: 'AWS::EC2::VPC',
    defaultProps: { CidrBlock: '10.0.0.0/16', EnableDnsSupport: true, EnableDnsHostnames: true },
  },
  'aws-subnet': { type: 'AWS::EC2::Subnet', defaultProps: { CidrBlock: '10.0.1.0/24' } },
  'aws-security-group': {
    type: 'AWS::EC2::SecurityGroup',
    defaultProps: { GroupDescription: 'Security group created by JobStack' },
  },
  'aws-ec2': {
    type: 'AWS::EC2::Instance',
    defaultProps: {
      InstanceType: 't3.micro',
      ImageId: '{{resolve:ssm:/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2}}',
    },
  },
  'aws-lambda': {
    type: 'AWS::Lambda::Function',
    defaultProps: { Runtime: 'nodejs18.x', Handler: 'index.handler', MemorySize: 128, Timeout: 30 },
  },
  'aws-s3': {
    type: 'AWS::S3::Bucket',
    defaultProps: {
      PublicAccessBlockConfiguration: { BlockPublicAcls: true, BlockPublicPolicy: true },
    },
  },
  'aws-rds': {
    type: 'AWS::RDS::DBInstance',
    defaultProps: { DBInstanceClass: 'db.t3.micro', AllocatedStorage: '20', Engine: 'postgres' },
  },
  'aws-dynamodb': {
    type: 'AWS::DynamoDB::Table',
    defaultProps: {
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    },
  },
  'aws-alb': {
    type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    defaultProps: { Type: 'application', Scheme: 'internet-facing' },
  },
  'aws-nlb': {
    type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    defaultProps: { Type: 'network', Scheme: 'internet-facing' },
  },
  'aws-eks': { type: 'AWS::EKS::Cluster', defaultProps: { Version: '1.28' } },
  'aws-ecs': {
    type: 'AWS::ECS::Cluster',
    defaultProps: { ClusterSettings: [{ Name: 'containerInsights', Value: 'enabled' }] },
  },
  'aws-api-gateway': {
    type: 'AWS::ApiGateway::RestApi',
    defaultProps: { EndpointConfiguration: { Types: ['REGIONAL'] } },
  },
  'aws-cloudfront': { type: 'AWS::CloudFront::Distribution', defaultProps: {} },
  'aws-sqs': {
    type: 'AWS::SQS::Queue',
    defaultProps: { VisibilityTimeout: 30, MessageRetentionPeriod: 345600 },
  },
  'aws-sns': { type: 'AWS::SNS::Topic', defaultProps: {} },
  'aws-cognito': {
    type: 'AWS::Cognito::UserPool',
    defaultProps: { MfaConfiguration: 'OFF', UserPoolName: 'JobStackUserPool' },
  },
  'aws-elasticache': {
    type: 'AWS::ElastiCache::CacheCluster',
    defaultProps: { Engine: 'redis', CacheNodeType: 'cache.t3.micro', NumCacheNodes: 1 },
  },
  'aws-nat-gateway': { type: 'AWS::EC2::NatGateway', defaultProps: {} },
  'aws-internet-gateway': { type: 'AWS::EC2::InternetGateway', defaultProps: {} },
  'aws-eip': { type: 'AWS::EC2::EIP', defaultProps: { Domain: 'vpc' } },
  'aws-route-table': { type: 'AWS::EC2::RouteTable', defaultProps: {} },
  'aws-nacl': { type: 'AWS::EC2::NetworkAcl', defaultProps: {} },
  'aws-ebs': { type: 'AWS::EC2::Volume', defaultProps: { Size: 20, VolumeType: 'gp3' } },
  'aws-efs': {
    type: 'AWS::EFS::FileSystem',
    defaultProps: { PerformanceMode: 'generalPurpose', ThroughputMode: 'bursting' },
  },
  'aws-ecr': {
    type: 'AWS::ECR::Repository',
    defaultProps: { ImageScanningConfiguration: { ScanOnPush: true } },
  },
  'aws-route53': { type: 'AWS::Route53::HostedZone', defaultProps: {} },
  'aws-cloudwatch': { type: 'AWS::CloudWatch::Dashboard', defaultProps: {} },
  'aws-auto-scaling': {
    type: 'AWS::AutoScaling::AutoScalingGroup',
    defaultProps: { MinSize: '1', MaxSize: '3', DesiredCapacity: '1' },
  },
  'aws-waf': {
    type: 'AWS::WAFv2::WebACL',
    defaultProps: { Scope: 'REGIONAL', DefaultAction: { Allow: {} } },
  },
  'aws-kms': {
    type: 'AWS::KMS::Key',
    defaultProps: { KeySpec: 'SYMMETRIC_DEFAULT', EnableKeyRotation: true },
  },
  'aws-secrets-manager': { type: 'AWS::SecretsManager::Secret', defaultProps: {} },
  'aws-iam-role': {
    type: 'AWS::IAM::Role',
    defaultProps: {
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'ec2.amazonaws.com' },
            Action: 'sts:AssumeRole',
          },
        ],
      },
    },
  },
  'aws-aurora': {
    type: 'AWS::RDS::DBCluster',
    defaultProps: { Engine: 'aurora-postgresql', EngineVersion: '15.4' },
  },
  'aws-aurora-serverless': {
    type: 'AWS::RDS::DBCluster',
    defaultProps: {
      Engine: 'aurora-postgresql',
      EngineMode: 'serverless',
      EngineVersion: '15.4',
      ScalingConfiguration: { AutoPause: true, MinCapacity: 2, MaxCapacity: 16 },
    },
  },
  'aws-kinesis': {
    type: 'AWS::Kinesis::Stream',
    defaultProps: { StreamModeDetails: { StreamMode: 'ON_DEMAND' } },
  },
  'aws-step-functions': {
    type: 'AWS::StepFunctions::StateMachine',
    defaultProps: { StateMachineType: 'STANDARD' },
  },
  'aws-eventbridge': { type: 'AWS::Events::EventBus', defaultProps: {} },
}

function sanitizeCfnName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'R$&') || 'Resource'
}

// Removed duplicate getNodeComponentId — now imported from shared core
// Removed duplicate buildNodeMap — now imported from shared core

function findAncestorOfType(
  nodeId: string,
  targetComponentId: string,
  nodeMap: Map<string, Node>,
  nodeIdToName: Map<string, string>
): string | null {
  return findAncestorName(nodeId, targetComponentId, nodeMap, nodeIdToName)
}

function findConnected(
  nodeId: string,
  targetTypes: string[],
  edges: Edge[],
  nodeMap: Map<string, Node>,
  nodeIdToName: Map<string, string>
): string[] {
  return findConnectedNames(nodeId, targetTypes, edges, nodeMap, nodeIdToName)
}

export function generateCloudFormation(
  nodes: Node[],
  edges: Edge[] = [],
  format: 'yaml' | 'json' = 'yaml'
): string {
  const template: CloudFormationTemplate = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: 'Infrastructure template generated by JobStack',
    Parameters: {
      Environment: {
        Type: 'String',
        Default: 'development',
        AllowedValues: ['development', 'staging', 'production'],
        Description: 'Deployment environment',
      },
    },
    Resources: {},
    Outputs: {},
  }

  const nodeMap = buildNodeMap(nodes)
  const nodeIdToName = new Map<string, string>()
  const issuedCfnNames = new Set<string>()

  // First pass: assign collision-safe names (BUG-1 fix)
  for (const node of nodes) {
    if (!CFN_MAPPINGS[getNodeComponentId(node)]) continue
    const baseName = sanitizeCfnName(String(node.data?.label || node.id))
    let name = baseName
    let counter = 1
    while (issuedCfnNames.has(name)) {
      name = `${baseName}${counter++}`
    }
    issuedCfnNames.add(name)
    nodeIdToName.set(node.id, name)
  }

  // Second pass: generate resources with context
  for (const node of nodes) {
    const componentId = getNodeComponentId(node)
    const mapping = CFN_MAPPINGS[componentId]
    if (!mapping) continue

    const resName = nodeIdToName.get(node.id)!
    const cfg = (node.data as any)?.config || {}
    const deps: string[] = []

    const props: Record<string, unknown> = {
      ...mapping.defaultProps,
      ...cfg,
      Tags: [
        { Key: 'Name', Value: node.data?.label || resName },
        { Key: 'Environment', Value: { Ref: 'Environment' } },
        { Key: 'ManagedBy', Value: 'CloudFormation' },
        { Key: 'GeneratedFrom', Value: 'JobStack' },
      ],
    }

    // --- Parent-child context ---
    const vpcRef = findAncestorOfType(node.id, 'aws-vpc', nodeMap, nodeIdToName)
    const subnetRef = findAncestorOfType(node.id, 'aws-subnet', nodeMap, nodeIdToName)

    if (componentId === 'aws-subnet' && vpcRef) {
      props.VpcId = { Ref: vpcRef }
      deps.push(vpcRef)
    }

    if (
      ['aws-security-group', 'aws-route-table', 'aws-nacl', 'aws-internet-gateway'].includes(
        componentId
      )
    ) {
      const vpc = vpcRef || findConnected(node.id, ['aws-vpc'], edges, nodeMap, nodeIdToName)[0]
      if (vpc) {
        props.VpcId = { Ref: vpc }
        deps.push(vpc)
      }
    }

    if (
      [
        'aws-ec2',
        'aws-rds',
        'aws-aurora',
        'aws-aurora-serverless',
        'aws-elasticache',
        'aws-nat-gateway',
      ].includes(componentId) &&
      subnetRef
    ) {
      props.SubnetId = { Ref: subnetRef }
      deps.push(subnetRef)
      if (vpcRef) deps.push(vpcRef)
    }

    if (['aws-alb', 'aws-nlb'].includes(componentId) && subnetRef) {
      props.Subnets = [{ Ref: subnetRef }]
      deps.push(subnetRef)
    }

    if (componentId === 'aws-lambda' && subnetRef) {
      const sgs = findConnected(node.id, ['aws-security-group'], edges, nodeMap, nodeIdToName)
      props.VpcConfig = {
        SubnetIds: [{ Ref: subnetRef }],
        SecurityGroupIds: sgs.map(s => ({ Ref: s })),
      }
      deps.push(subnetRef, ...sgs)
    }

    if (componentId === 'aws-eks' && subnetRef) {
      props.ResourcesVpcConfig = { SubnetIds: [{ Ref: subnetRef }] }
      deps.push(subnetRef)
    }

    // --- Edge-based cross-references ---
    if (
      [
        'aws-ec2',
        'aws-alb',
        'aws-nlb',
        'aws-rds',
        'aws-aurora',
        'aws-aurora-serverless',
        'aws-elasticache',
        'aws-ecs',
        'aws-eks',
      ].includes(componentId)
    ) {
      const sgs = findConnected(node.id, ['aws-security-group'], edges, nodeMap, nodeIdToName)
      if (sgs.length > 0) {
        if (['aws-alb', 'aws-nlb'].includes(componentId))
          props.SecurityGroups = sgs.map(s => ({ Ref: s }))
        else if (['aws-rds', 'aws-aurora', 'aws-aurora-serverless'].includes(componentId))
          props.VPCSecurityGroups = sgs.map(s => ({ Ref: s }))
        else props.SecurityGroupIds = sgs.map(s => ({ Ref: s }))
        deps.push(...sgs)
      }
    }

    if (componentId === 'aws-ec2') {
      const roles = findConnected(node.id, ['aws-iam-role'], edges, nodeMap, nodeIdToName)
      if (roles.length > 0) deps.push(...roles)
    }

    if (componentId === 'aws-nat-gateway') {
      const eips = findConnected(node.id, ['aws-eip'], edges, nodeMap, nodeIdToName)
      if (eips.length > 0) {
        props.AllocationId = { 'Fn::GetAtt': [eips[0], 'AllocationId'] }
        deps.push(eips[0])
      }
    }

    if (componentId === 'aws-cloudfront') {
      const s3s = findConnected(node.id, ['aws-s3'], edges, nodeMap, nodeIdToName)
      if (s3s.length > 0) {
        props.DistributionConfig = {
          Origins: s3s.map(s3 => ({
            DomainName: { 'Fn::GetAtt': [s3, 'DomainName'] },
            Id: `S3-${s3}`,
            S3OriginConfig: { OriginAccessIdentity: '' },
          })),
          DefaultCacheBehavior: {
            TargetOriginId: `S3-${s3s[0]}`,
            ViewerProtocolPolicy: 'redirect-to-https',
            ForwardedValues: { QueryString: false },
          },
          Enabled: true,
        }
        deps.push(...s3s)
      }
    }

    if (componentId === 'aws-api-gateway') {
      const lambdas = findConnected(node.id, ['aws-lambda'], edges, nodeMap, nodeIdToName)
      deps.push(...lambdas)
    }

    if (componentId === 'aws-lambda') {
      const triggers = findConnected(
        node.id,
        [
          'aws-sqs',
          'aws-sns',
          'aws-kinesis',
          'aws-eventbridge',
          'aws-api-gateway',
          'aws-s3',
          'aws-dynamodb',
        ],
        edges,
        nodeMap,
        nodeIdToName
      )
      deps.push(...triggers)
    }

    template.Resources[resName] = {
      Type: mapping.type,
      Properties: props,
      ...(deps.length > 0 && { DependsOn: [...new Set(deps)] }),
    }

    if (
      [
        'aws-vpc',
        'aws-s3',
        'aws-rds',
        'aws-alb',
        'aws-eks',
        'aws-api-gateway',
        'aws-lambda',
        'aws-ecs',
        'aws-cloudfront',
        'aws-aurora',
        'aws-aurora-serverless',
      ].includes(componentId)
    ) {
      template.Outputs[`${resName}Id`] = {
        Description: `ID of ${node.data?.label || resName}`,
        Value: { Ref: resName },
        Export: { Name: { 'Fn::Sub': `\${AWS::StackName}-${resName}Id` } },
      }
    }
  }

  // Add remaining edge deps — only for nodes that exist in the CFN template
  for (const edge of edges) {
    const src = nodeIdToName.get(edge.source),
      tgt = nodeIdToName.get(edge.target)
    if (src && tgt && template.Resources[tgt] && template.Resources[src]) {
      if (!template.Resources[tgt].DependsOn) template.Resources[tgt].DependsOn = []
      if (!template.Resources[tgt].DependsOn!.includes(src))
        template.Resources[tgt].DependsOn!.push(src)
    }
  }

  if (format === 'json') return JSON.stringify(template, null, 2)
  return convertToYaml(template)
}

function convertToYaml(obj: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent)
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') {
    // YAML reserved words and values that need quoting
    const yamlReserved = ['true', 'false', 'yes', 'no', 'on', 'off', 'null', '~', '']
    if (yamlReserved.includes(obj.toLowerCase()) || obj === '') return `"${obj}"`
    // Strings with special chars need quoting
    if (
      obj.includes('\n') ||
      obj.includes(':') ||
      obj.includes('#') ||
      obj.includes('"') ||
      obj.includes("'") ||
      obj.includes('{') ||
      obj.includes('}') ||
      obj.includes('[') ||
      obj.includes(']') ||
      obj.includes('&') ||
      obj.includes('*') ||
      obj.includes('!') ||
      obj.includes('|') ||
      obj.includes('>') ||
      obj.includes('%') ||
      obj.includes('@')
    ) {
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
    }
    return obj
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj
      .map(item => {
        const s = convertToYaml(item, indent + 1)
        return typeof item === 'object' && item !== null
          ? `\n${spaces}- ${s.trim()}`
          : `\n${spaces}- ${s}`
      })
      .join('')
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    // CloudFormation intrinsic functions
    if ('Ref' in obj) return `!Ref ${(obj as Record<string, unknown>).Ref}`
    if ('Fn::Sub' in obj) return `!Sub "${(obj as Record<string, unknown>)['Fn::Sub']}"`
    if ('Fn::GetAtt' in obj)
      return `!GetAtt ${((obj as Record<string, unknown>)['Fn::GetAtt'] as string[]).join('.')}`
    if ('Fn::Join' in obj) {
      const [sep, parts] = (obj as Record<string, unknown>)['Fn::Join'] as [string, unknown[]]
      return `!Join\n${spaces}  - "${sep}"\n${spaces}  - ${convertToYaml(parts, indent + 2)}`
    }
    if ('Fn::Select' in obj)
      return `!Select ${convertToYaml((obj as Record<string, unknown>)['Fn::Select'], indent + 1)}`
    return entries
      .map(([k, v]) => {
        const vs = convertToYaml(v, indent + 1)
        if (typeof v === 'object' && v !== null && !Array.isArray(v))
          return `${k}:\n${spaces}  ${vs.trim()}`
        if (Array.isArray(v)) return `${k}:${vs}`
        return `${k}: ${vs}`
      })
      .join(`\n${spaces}`)
  }
  return String(obj)
}
