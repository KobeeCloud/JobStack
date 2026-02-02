'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Boxes, ArrowLeft, Building2, Users, Settings, Crown, Shield, User,
  Plus, Trash2, Mail, Loader2, Copy, Check
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  subscription_tier: string
  max_members: number
  created_at: string
}

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
  profiles: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface Invite {
  id: string
  email: string
  role: string
  token: string
  expires_at: string
  created_at: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrganizationManagePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Invite form state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('member')
  const [inviting, setInviting] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    loadOrganizationData()
  }, [resolvedParams.id])

  const loadOrganizationData = async () => {
    try {
      setLoading(true)

      // Load organization details
      const orgRes = await fetchWithTimeout(`/api/organizations/${resolvedParams.id}`, {}, 10000)
      if (!orgRes.ok) {
        if (orgRes.status === 404) {
          toast({ title: 'Error', description: 'Organization not found' })
          router.push('/organizations')
          return
        }
        throw new Error('Failed to load organization')
      }
      const orgData = await orgRes.json()
      setOrganization(orgData.organization)
      setMembers(orgData.members || [])
      setUserRole(orgData.userRole)

      // Load pending invites
      if (orgData.userRole === 'owner' || orgData.userRole === 'admin') {
        const invitesRes = await fetchWithTimeout(`/api/organizations/${resolvedParams.id}/invites`, {}, 10000)
        if (invitesRes.ok) {
          const invitesData = await invitesRes.json()
          setInvites(invitesData.invites || [])
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load organization',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return

    setInviting(true)
    try {
      const res = await fetchWithTimeout(`/api/organizations/${resolvedParams.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      }, 10000)

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send invite')
      }

      const data = await res.json()
      toast({ title: 'Invite sent', description: `Invitation sent to ${inviteEmail}` })
      setInviteEmail('')
      setInviteDialogOpen(false)
      setInvites([...invites, data.invite])
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invite',
      })
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const res = await fetchWithTimeout(`/api/organizations/${resolvedParams.id}/invites/${inviteId}`, {
        method: 'DELETE',
      }, 10000)

      if (!res.ok) {
        throw new Error('Failed to delete invite')
      }

      toast({ title: 'Invite cancelled', description: 'Invitation has been cancelled' })
      setInvites(invites.filter(i => i.id !== inviteId))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel invite',
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetchWithTimeout(`/api/organizations/${resolvedParams.id}/members/${memberId}`, {
        method: 'DELETE',
      }, 10000)

      if (!res.ok) {
        throw new Error('Failed to remove member')
      }

      toast({ title: 'Member removed', description: 'Member has been removed from the organization' })
      setMembers(members.filter(m => m.id !== memberId))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
      })
    }
  }

  const copyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/invites/accept/${token}`
    await navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
    toast({ title: 'Copied', description: 'Invite link copied to clipboard' })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      default: return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const canManageMembers = userRole === 'owner' || userRole === 'admin'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!organization) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">JobStack</span>
          </Link>
          <Link href="/organizations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizations
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Organization Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{organization.name}</CardTitle>
                  <CardDescription>@{organization.slug}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {organization.subscription_tier}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {userRole}
                </Badge>
              </div>
            </div>
          </CardHeader>
          {organization.description && (
            <CardContent>
              <p className="text-muted-foreground">{organization.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Members Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({members.length}/{organization.max_members})
                </CardTitle>
                <CardDescription>
                  Manage team members and their roles
                </CardDescription>
              </div>
              {canManageMembers && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join this organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {userRole === 'owner' && (
                              <SelectItem value="owner">Owner</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                        {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invite
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageMembers && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {member.profiles.avatar_url ? (
                            <img
                              src={member.profiles.avatar_url}
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.profiles.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.profiles.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                    {canManageMembers && (
                      <TableCell>
                        {member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {canManageMembers && invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pending Invites ({invites.length})
              </CardTitle>
              <CardDescription>
                Invitations waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell className="capitalize">{invite.role}</TableCell>
                      <TableCell>
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyInviteLink(invite.token)}
                          >
                            {copiedToken === invite.token ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvite(invite.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
