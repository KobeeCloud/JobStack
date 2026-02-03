'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CLOUD_AGNOSTIC_MAPPINGS,
  compareCostsAcrossProviders,
  type CloudAgnosticMapping,
} from '@/lib/multi-cloud/cloud-mappings'
import { Cloud, DollarSign, TrendingDown } from 'lucide-react'

interface MultiCloudComparePanelProps {
  onSelectComponent: (genericId: string, provider: 'aws' | 'azure' | 'gcp') => void
}

export function MultiCloudComparePanel({ onSelectComponent }: MultiCloudComparePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    'all',
    ...Array.from(new Set(CLOUD_AGNOSTIC_MAPPINGS.map((m) => m.category))),
  ]

  const filteredMappings =
    selectedCategory === 'all'
      ? CLOUD_AGNOSTIC_MAPPINGS
      : CLOUD_AGNOSTIC_MAPPINGS.filter((m) => m.category === selectedCategory)

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Multi-Cloud Component Comparison
        </h3>
        <p className="text-sm text-muted-foreground">
          Compare costs and select cloud-agnostic components across AWS, Azure, and GCP
        </p>
      </div>

      {/* Category Filters */}
      <div className="p-4 border-b flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Component List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredMappings.map((mapping) => (
            <ComponentComparisonCard
              key={mapping.genericId}
              mapping={mapping}
              onSelect={onSelectComponent}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

interface ComponentComparisonCardProps {
  mapping: CloudAgnosticMapping
  onSelect: (genericId: string, provider: 'aws' | 'azure' | 'gcp') => void
}

function ComponentComparisonCard({ mapping, onSelect }: ComponentComparisonCardProps) {
  const costComparison = compareCostsAcrossProviders(mapping.genericId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{mapping.genericName}</CardTitle>
            <CardDescription className="mt-1">{mapping.description}</CardDescription>
          </div>
          <Badge variant="outline">{mapping.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* AWS */}
          {mapping.providers.aws && (
            <ProviderRow
              provider="AWS"
              providerKey="aws"
              details={mapping.providers.aws}
              isCheapest={costComparison.cheapest === 'aws'}
              onSelect={() => onSelect(mapping.genericId, 'aws')}
            />
          )}

          {/* Azure */}
          {mapping.providers.azure && (
            <ProviderRow
              provider="Azure"
              providerKey="azure"
              details={mapping.providers.azure}
              isCheapest={costComparison.cheapest === 'azure'}
              onSelect={() => onSelect(mapping.genericId, 'azure')}
            />
          )}

          {/* GCP */}
          {mapping.providers.gcp && (
            <ProviderRow
              provider="GCP"
              providerKey="gcp"
              details={mapping.providers.gcp}
              isCheapest={costComparison.cheapest === 'gcp'}
              onSelect={() => onSelect(mapping.genericId, 'gcp')}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProviderRowProps {
  provider: string
  providerKey: 'aws' | 'azure' | 'gcp'
  details: NonNullable<CloudAgnosticMapping['providers'][keyof CloudAgnosticMapping['providers']]>
  isCheapest: boolean
  onSelect: () => void
}

function ProviderRow({ provider, providerKey, details, isCheapest, onSelect }: ProviderRowProps) {
  const avgCost = (details.estimatedCost.min + details.estimatedCost.max) / 2

  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{provider}</span>
          {details.defaultSize && (
            <Badge variant="secondary" className="text-xs">
              {details.defaultSize}
            </Badge>
          )}
          {isCheapest && (
            <Badge variant="default" className="text-xs bg-green-600">
              <TrendingDown className="w-3 h-3 mr-1" />
              Best Price
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          <span>
            ${details.estimatedCost.min} - ${details.estimatedCost.max}/mo (avg: $
            {avgCost.toFixed(2)})
          </span>
        </div>
      </div>
      <Button size="sm" onClick={onSelect}>
        Add
      </Button>
    </div>
  )
}
