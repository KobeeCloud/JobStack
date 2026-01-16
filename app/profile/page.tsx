'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Github, Linkedin, Globe, Upload } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    title: '',
    yearsExperience: '',
    currentPosition: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    availableFrom: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    skills: [] as string[],
    cvUrl: '',
    publicProfile: false,
  });

  const [newSkill, setNewSkill] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setEditing(false);
      alert('✅ Profil został zaktualizowany!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Błąd podczas aktualizacji profilu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      setProfile({ ...profile, cvUrl: url });
      alert('✅ CV zostało przesłane!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Błąd podczas przesyłania CV');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </a>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => router.push('/jobs')}>
                Browse Jobs
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mój Profil</h1>
              <p className="text-muted-foreground">
                Uzupełnij swój profil, aby pracodawcy mogli Cię znaleźć
              </p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Anuluj
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Zapisywanie...' : 'Zapisz'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  Edytuj profil
                </Button>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Podstawowe informacje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Imię</label>
                  {editing ? (
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  ) : (
                    <p className="p-2">{profile.firstName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nazwisko</label>
                  {editing ? (
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  ) : (
                    <p className="p-2">{profile.lastName || '-'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                {editing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                ) : (
                  <p className="p-2">{profile.email || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon
                </label>
                {editing ? (
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                ) : (
                  <p className="p-2">{profile.phone || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Lokalizacja
                </label>
                {editing ? (
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="np. Gdańsk, Polska"
                  />
                ) : (
                  <p className="p-2">{profile.location || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">O mnie</label>
                {editing ? (
                  <textarea
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Opowiedz o sobie..."
                  />
                ) : (
                  <p className="p-2 whitespace-pre-wrap">{profile.bio || '-'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Doświadczenie zawodowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Obecne stanowisko</label>
                {editing ? (
                  <Input
                    value={profile.currentPosition}
                    onChange={(e) => setProfile({ ...profile, currentPosition: e.target.value })}
                    placeholder="np. Senior Full-Stack Developer"
                  />
                ) : (
                  <p className="p-2">{profile.currentPosition || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tytuł zawodowy</label>
                {editing ? (
                  <Input
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    placeholder="np. Full-Stack Developer"
                  />
                ) : (
                  <p className="p-2">{profile.title || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Lata doświadczenia</label>
                {editing ? (
                  <Input
                    type="number"
                    value={profile.yearsExperience}
                    onChange={(e) => setProfile({ ...profile, yearsExperience: e.target.value })}
                  />
                ) : (
                  <p className="p-2">{profile.yearsExperience || '-'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Oczekiwane wynagrodzenie (od)
                  </label>
                  {editing ? (
                    <Input
                      type="number"
                      value={profile.expectedSalaryMin}
                      onChange={(e) => setProfile({ ...profile, expectedSalaryMin: e.target.value })}
                      placeholder="PLN"
                    />
                  ) : (
                    <p className="p-2">{profile.expectedSalaryMin ? `${profile.expectedSalaryMin} PLN` : '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Oczekiwane wynagrodzenie (do)</label>
                  {editing ? (
                    <Input
                      type="number"
                      value={profile.expectedSalaryMax}
                      onChange={(e) => setProfile({ ...profile, expectedSalaryMax: e.target.value })}
                      placeholder="PLN"
                    />
                  ) : (
                    <p className="p-2">{profile.expectedSalaryMax ? `${profile.expectedSalaryMax} PLN` : '-'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dostępny od
                </label>
                {editing ? (
                  <Input
                    type="date"
                    value={profile.availableFrom}
                    onChange={(e) => setProfile({ ...profile, availableFrom: e.target.value })}
                  />
                ) : (
                  <p className="p-2">{profile.availableFrom || '-'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Umiejętności</CardTitle>
              <CardDescription>Dodaj technologie i narzędzia, które znasz</CardDescription>
            </CardHeader>
            <CardContent>
              {editing && (
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="np. TypeScript, React, Node.js"
                  />
                  <Button onClick={handleAddSkill}>Dodaj</Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                      {editing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">Brak dodanych umiejętności</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links & CV */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Linki i dokumenty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </label>
                {editing ? (
                  <Input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                ) : (
                  <p className="p-2">
                    {profile.linkedinUrl ? (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.linkedinUrl}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </label>
                {editing ? (
                  <Input
                    type="url"
                    value={profile.githubUrl}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                ) : (
                  <p className="p-2">
                    {profile.githubUrl ? (
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.githubUrl}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Portfolio
                </label>
                {editing ? (
                  <Input
                    type="url"
                    value={profile.portfolioUrl}
                    onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                    placeholder="https://..."
                  />
                ) : (
                  <p className="p-2">
                    {profile.portfolioUrl ? (
                      <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.portfolioUrl}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  CV / Resume
                </label>
                {editing ? (
                  <div>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCVUpload}
                      className="mb-2"
                    />
                    {profile.cvUrl && (
                      <p className="text-sm text-green-600">✅ CV przesłane</p>
                    )}
                  </div>
                ) : (
                  <p className="p-2">
                    {profile.cvUrl ? (
                      <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Pobierz CV
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <input
                  type="checkbox"
                  id="publicProfile"
                  checked={profile.publicProfile}
                  onChange={(e) => setProfile({ ...profile, publicProfile: e.target.checked })}
                  disabled={!editing}
                  className="h-4 w-4"
                />
                <label htmlFor="publicProfile" className="text-sm cursor-pointer">
                  Udostępnij mój profil publicznie (pracodawcy będą mogli Cię znaleźć)
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
