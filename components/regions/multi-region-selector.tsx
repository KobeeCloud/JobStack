'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CloudRegion, 
  ALL_REGIONS, 
  getRegionsByProvider, 
  getPairedRegion,
  estimateLatency 
} from '@/lib/regions'
import { Globe, MapPin, Search, X, ArrowRight, Clock, Shield } from 'lucide-react'

interface MultiRegionSelectorProps {
  selectedRegions: string[]
  onRegionsChange: (regions: string[]) => void
  primaryRegion?: string
  onPrimaryChange?: (region: string) => void
  onClose: () => void
}

const continentLabels: Record<string, string> = {
  'north-america': 'North America',
  'south-america': 'South America',
  'europe': 'Europe',
  'asia-pacific': 'Asia Pacific',
  'middle-east': 'Middle East',
  'africa': 'Africa',
}

const providerColors: Record<string, string> = {
  azure: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  aws: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  gcp: 'bg-green-500/10 text-green-600 border-green-500/20',
}

export function MultiRegionSelector({
  selectedRegions,
  onRegionsChange,
  primaryRegion,
  onPrimaryChange,
  onClose,
}: MultiRegionSelectorProps) {
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [continentFilter, setContinentFilter] = useState<string>('all')

  const filteredRegions = useMemo(() => {
    return ALL_REGIONS.filter(region => {
      const matchesSearch = search === '' || 
        region.name.toLowerCase().includes(search.toLowerCase()) ||
        region.displayName.toLowerCase().includes(search.toLowerCase()) ||
        region.id.toLowerCase().includes(search.toLowerCase())
      
      const matchesProvider = providerFilter === 'all' || region.provider === providerFilter
      const matchesContinent = continentFilter === 'all' || region.continent === continentFilter
      
      return matchesSearch && matchesProvider && matchesContinent
    })
  }, [search, providerFilter, continentFilter])

  const groupedByContinent = useMemo(() => {
    const groups: Record<string, CloudRegion[]> = {}
    filteredRegions.forEach(region => {
      if (!groups[region.continent]) {
        groups[region.continent] = []
      }
      groups[region.continent].push(region)
    })
    return groups
  }, [filteredRegions])

  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      onRegionsChange(selectedRegions.filter(r => r !== regionId))
      if (primaryRegion === regionId && onPrimaryChange) {
        const remaining = selectedRegions.filter(r => r !== regionId)
        onPrimaryChange(remaining[0] || '')
      }
    } else {
      onRegionsChange([...selectedRegions, regionId])
      if (selectedRegions.length === 0 && onPrimaryChange) {
        onPrimaryChange(regionId)
      }
    }
  }

  const suggestDRRegion = () => {
    if (!primaryRegion) return
    const paired = getPairedRegion(primaryRegion)
    if (paired && !selectedRegions.includes(paired.id)) {
      onRegionsChange([...selectedRegions, paired.id])
    }
  }

  const selectedRegionObjects = selectedRegions
    .map(id => ALL_REGIONS.find(r => r.id === id))
    .filter(Boolean) as CloudRegion[]

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <CardTitle>Multi-Region Deployment</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Select multiple regions for high availability and disaster recovery
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="sr-only">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search regions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
              <SelectItem value="aws">AWS</SelectItem>
              <SelectItem value="gcp">GCP</SelectItem>
            </SelectContent>
          </Select>
          <Select value={continentFilter} onValueChange={setContinentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Continent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Continents</SelectItem>
              <SelectItem value="north-america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
              <SelectItem value="south-america">South America</SelectItem>
              <SelectItem value="middle-east">Middle East</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Region List */}
          <div className="border rounded-lg">
            <div className="p-2 border-b bg-muted/50">
              <h3 className="text-sm font-medium">Available Regions</h3>
            </div>
            <ScrollArea className="h-[350px]">
              <div className="p-2 space-y-4">
                {Object.entries(groupedByContinent).map(([continent, regions]) => (
                  <div key={continent}>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                      {continentLabels[continent] || continent}
                    </h4>
                    <div className="space-y-1">
                      {regions.map(region => (
                        <div
                          key={region.id}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                            selectedRegions.includes(region.id)
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleRegion(region.id)}
                        >
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{region.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{region.id}</p>
                          </div>
                          <Badge variant="outline" className={providerColors[region.provider]}>
                            {region.provider.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Regions */}
          <div className="border rounded-lg">
            <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Selected Regions ({selectedRegions.length})
              </h3>
              {primaryRegion && getPairedRegion(primaryRegion) && (
                <Button variant="ghost" size="sm" onClick={suggestDRRegion}>
                  <Shield className="h-3 w-3 mr-1" />
                  Add DR Region
                </Button>
              )}
            </div>
            <ScrollArea className="h-[350px]">
              <div className="p-2 space-y-2">
                {selectedRegionObjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No regions selected</p>
                    <p className="text-xs">Click regions to add them</p>
                  </div>
                ) : (
                  selectedRegionObjects.map(region => {
                    const isPrimary = region.id === primaryRegion
                    const latency = primaryRegion && primaryRegion !== region.id
                      ? estimateLatency(primaryRegion, region.id)
                      : null

                    return (
                      <div
                        key={region.id}
                        className={`p-3 rounded-md border ${
                          isPrimary ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">{region.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={providerColors[region.provider]}>
                              {region.provider.toUpperCase()}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRegion(region.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{region.id}</span>
                          {latency !== null && (
                            <>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>~{latency}ms from primary</span>
                            </>
                          )}
                        </div>

                        {!isPrimary && onPrimaryChange && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => onPrimaryChange(region.id)}
                          >
                            Set as Primary
                          </Button>
                        )}

                        {isPrimary && (
                          <Badge className="mt-2" variant="default">
                            Primary Region
                          </Badge>
                        )}

                        {region.paired && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            <span>DR pair: {region.paired}</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Summary */}
        {selectedRegions.length > 1 && primaryRegion && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Deployment Summary</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {ALL_REGIONS.find(r => r.id === primaryRegion)?.name}
              </span>
              <ArrowRight className="h-4 w-4" />
              {selectedRegions
                .filter(r => r !== primaryRegion)
                .map((r, i) => (
                  <span key={r}>
                    {i > 0 && ', '}
                    {ALL_REGIONS.find(region => region.id === r)?.name}
                  </span>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
