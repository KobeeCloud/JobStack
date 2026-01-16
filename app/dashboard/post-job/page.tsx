'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Plus,
  X,
  Eye,
  Save,
  Sparkles
} from 'lucide-react';
import { JOB_ROLES, TECH_STACKS, VOIVODESHIPS } from '@/lib/constants';

const employmentTypes = [
  { value: 'full-time', label: 'Pełen etat' },
  { value: 'part-time', label: 'Część etatu' },
  { value: 'contract', label: 'B2B / Kontrakt' },
  { value: 'freelance', label: 'Freelance' },
];

const experienceLevels = [
  { value: 'junior', label: 'Junior (0-2 lata)' },
  { value: 'mid', label: 'Mid (2-5 lat)' },
  { value: 'senior', label: 'Senior (5+ lat)' },
  { value: 'lead', label: 'Lead / Architect' },
];

const workTypes = [
  { value: 'remote', label: 'Praca zdalna' },
  { value: 'hybrid', label: 'Hybrydowo' },
  { value: 'onsite', label: 'Stacjonarnie' },
];

export default function PostJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    role: '',
    company: '',
    location: '',
    voivodeship: '',
    workType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: '',
    salaryMax: '',
    currency: 'PLN',
    techStack: [] as string[],
    description: '',
    requirements: '',
    niceToHave: '',
    benefits: '',
  });

  const [techInput, setTechInput] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-suggest tech stack based on role
    if (field === 'role' && value && JOB_ROLES[value as keyof typeof JOB_ROLES]) {
      const suggestedStacks = JOB_ROLES[value as keyof typeof JOB_ROLES].stacks;
      setFormData(prev => ({
        ...prev,
        [field]: value,
        techStack: [...suggestedStacks.slice(0, 5)],
      }));
    }
  };

  const addTech = (tech: string) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech],
      }));
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Redirect to dashboard with success message
    router.push('/dashboard?posted=success');
  };

  const selectedRoleStacks = formData.role && JOB_ROLES[formData.role as keyof typeof JOB_ROLES]
    ? JOB_ROLES[formData.role as keyof typeof JOB_ROLES].stacks
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobStack.pl
              </Link>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <Building2 className="w-3 h-3 mr-1" />
              Pracodawca
            </Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              Dodaj nową ofertę pracy
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Wypełnij formularz, aby opublikować ogłoszenie
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-24 md:w-32 h-1 mx-2 rounded ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle>Podstawowe informacje</CardTitle>
                  <CardDescription>Podaj podstawowe dane o ofercie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tytuł stanowiska *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="np. Senior DevOps Engineer"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Kategoria stanowiska *</Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Wybierz kategorię...</option>
                        {Object.keys(JOB_ROLES).map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Nazwa firmy *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="np. TechCorp Polska"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="workType">Tryb pracy *</Label>
                      <select
                        id="workType"
                        value={formData.workType}
                        onChange={(e) => handleInputChange('workType', e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        {workTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {formData.workType !== 'remote' && (
                      <div className="space-y-2">
                        <Label htmlFor="location">Lokalizacja *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="np. Warszawa"
                          className="rounded-xl"
                          required
                        />
                      </div>
                    )}

                    {formData.workType === 'remote' && (
                      <div className="space-y-2">
                        <Label>Lokalizacja</Label>
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl">
                          <MapPin className="w-4 h-4" />
                          Cała Polska (praca zdalna)
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.workType !== 'remote' && (
                    <div className="space-y-2">
                      <Label htmlFor="voivodeship">Województwo</Label>
                      <select
                        id="voivodeship"
                        value={formData.voivodeship}
                        onChange={(e) => handleInputChange('voivodeship', e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Wybierz województwo...</option>
                        {VOIVODESHIPS.map(voiv => (
                          <option key={voiv} value={voiv}>{voiv}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Dalej
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Requirements & Tech */}
            {step === 2 && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle>Wymagania i technologie</CardTitle>
                  <CardDescription>Określ wymagane umiejętności i technologie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Forma zatrudnienia *</Label>
                      <select
                        id="employmentType"
                        value={formData.employmentType}
                        onChange={(e) => handleInputChange('employmentType', e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        {employmentTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel">Poziom doświadczenia *</Label>
                      <select
                        id="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        {experienceLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Widełki płacowe (miesięcznie, brutto)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                        placeholder="Od"
                        className="rounded-xl"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                        placeholder="Do"
                        className="rounded-xl"
                      />
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PLN">PLN</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Wymagane technologie</Label>

                    {/* Selected tech stack */}
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      {formData.techStack.length === 0 ? (
                        <span className="text-gray-400 text-sm">Wybierz technologie poniżej lub dodaj własne...</span>
                      ) : (
                        formData.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 cursor-pointer hover:bg-red-100 hover:text-red-700"
                            onClick={() => removeTech(tech)}
                          >
                            {tech}
                            <X className="w-3 h-3 ml-2" />
                          </Badge>
                        ))
                      )}
                    </div>

                    {/* Add custom tech */}
                    <div className="flex gap-2">
                      <Input
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech(techInput))}
                        placeholder="Dodaj technologię..."
                        className="rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addTech(techInput)}
                        className="rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Suggested stacks */}
                    {selectedRoleStacks.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          Sugerowane dla {formData.role}:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoleStacks
                            .filter(tech => !formData.techStack.includes(tech))
                            .map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => addTech(tech)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                {tech}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Common tech stacks */}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Popularne technologie:</p>
                      <div className="flex flex-wrap gap-2">
                        {TECH_STACKS
                          .filter(tech => !formData.techStack.includes(tech))
                          .slice(0, 10)
                          .map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              onClick={() => addTech(tech)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {tech}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-xl"
                    >
                      Wstecz
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Dalej
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle>Opis stanowiska</CardTitle>
                  <CardDescription>Dodaj szczegółowy opis oferty</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Opis stanowiska *</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Opisz czym będzie się zajmować osoba na tym stanowisku..."
                      className="w-full min-h-[150px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Wymagania *</Label>
                    <textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Podaj wymagania dla kandydatów (każde w nowej linii)..."
                      className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niceToHave">Mile widziane</Label>
                    <textarea
                      id="niceToHave"
                      value={formData.niceToHave}
                      onChange={(e) => handleInputChange('niceToHave', e.target.value)}
                      placeholder="Dodatkowe umiejętności, które będą atutem..."
                      className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefity i oferujemy</Label>
                    <textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => handleInputChange('benefits', e.target.value)}
                      placeholder="Opisz co oferujesz kandydatom (benefity, rozwój, atmosfera)..."
                      className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="rounded-xl"
                    >
                      Wstecz
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Podgląd
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Publikowanie...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Opublikuj ofertę
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>

          {/* Preview Summary */}
          {(formData.title || formData.company) && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Podgląd oferty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                      {formData.title || 'Tytuł stanowiska'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {formData.company || 'Nazwa firmy'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.location && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {formData.location}
                        </Badge>
                      )}
                      {formData.workType && (
                        <Badge variant="secondary">
                          {workTypes.find(t => t.value === formData.workType)?.label}
                        </Badge>
                      )}
                      {formData.experienceLevel && (
                        <Badge variant="secondary">
                          {experienceLevels.find(l => l.value === formData.experienceLevel)?.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.slice(0, 5).map((tech) => (
                        <Badge key={tech} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {tech}
                        </Badge>
                      ))}
                      {formData.techStack.length > 5 && (
                        <Badge variant="outline">+{formData.techStack.length - 5}</Badge>
                      )}
                    </div>
                  </div>
                  {(formData.salaryMin || formData.salaryMax) && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formData.salaryMin && formData.salaryMax
                          ? `${Number(formData.salaryMin).toLocaleString()} - ${Number(formData.salaryMax).toLocaleString()}`
                          : formData.salaryMin
                            ? `od ${Number(formData.salaryMin).toLocaleString()}`
                            : `do ${Number(formData.salaryMax).toLocaleString()}`
                        }
                      </p>
                      <p className="text-sm text-gray-500">{formData.currency} / mies. brutto</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
