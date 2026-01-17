'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Send, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApplicationQuestion {
  id: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select';
  options?: string[];
  required: boolean;
  order_index: number;
}

interface QuickApplyProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  questions?: ApplicationQuestion[];
}

export function QuickApply({ jobId, jobTitle, companyName, questions = [] }: QuickApplyProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    yearsExperience: '',
    currentPosition: '',
    coverLetter: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    availableFrom: '',
  });

  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string | boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast({
          title: 'Błąd walidacji',
          description: 'Proszę wypełnić wszystkie wymagane pola',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Validate required custom questions
      for (const question of questions) {
        if (question.required && !questionAnswers[question.id]) {
          toast({
            title: 'Błąd walidacji',
            description: `Proszę odpowiedzieć na pytanie: "${question.question_text}"`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      // Upload CV if provided
      let cvUrl = '';
      if (cvFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', cvFile);
        formDataUpload.append('email', formData.email);

        const uploadResponse = await fetch('/api/upload/cv', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload CV');
        }

        const uploadData = await uploadResponse.json();
        cvUrl = uploadData.url;
      }

      // Submit application
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          ...formData,
          cvUrl,
          questionAnswers,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit application';
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
        } catch (parseError) {
          const text = await response.text().catch(() => '');
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: '✅ Aplikacja wysłana!',
        description: 'Twoja aplikacja została pomyślnie przesłana do pracodawcy.',
      });

      setOpen(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        yearsExperience: '',
        currentPosition: '',
        coverLetter: '',
        expectedSalaryMin: '',
        expectedSalaryMax: '',
        availableFrom: '',
      });
      setQuestionAnswers({});
      setCvFile(null);
    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Nie udało się wysłać aplikacji',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full md:w-auto">
          <Send className="mr-2 h-4 w-4" />
          Aplikuj szybko
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aplikuj na stanowisko</DialogTitle>
          <DialogDescription>
            {jobTitle} w {companyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Podstawowe informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Imię <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Nazwisko <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Doświadczenie zawodowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Obecne stanowisko</Label>
                <Input
                  id="currentPosition"
                  placeholder="np. Senior Full-Stack Developer"
                  value={formData.currentPosition}
                  onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Lata doświadczenia</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedSalaryMin">Oczekiwane wynagrodzenie (od)</Label>
                  <Input
                    id="expectedSalaryMin"
                    type="number"
                    placeholder="PLN"
                    value={formData.expectedSalaryMin}
                    onChange={(e) => setFormData({ ...formData, expectedSalaryMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedSalaryMax">Oczekiwane wynagrodzenie (do)</Label>
                  <Input
                    id="expectedSalaryMax"
                    type="number"
                    placeholder="PLN"
                    value={formData.expectedSalaryMax}
                    onChange={(e) => setFormData({ ...formData, expectedSalaryMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableFrom">Dostępny od</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linki</CardTitle>
              <CardDescription>Portfolio, GitHub, LinkedIn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Questions */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dodatkowe pytania</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label>
                        {question.question_text}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      {question.question_type === 'text' && (
                        <Input
                          required={question.required}
                          value={(questionAnswers[question.id] as string) || ''}
                          onChange={(e) =>
                            setQuestionAnswers({ ...questionAnswers, [question.id]: e.target.value })
                          }
                        />
                      )}

                      {question.question_type === 'textarea' && (
                        <Textarea
                          required={question.required}
                          value={(questionAnswers[question.id] as string) || ''}
                          onChange={(e) =>
                            setQuestionAnswers({ ...questionAnswers, [question.id]: e.target.value })
                          }
                          rows={4}
                        />
                      )}

                      {question.question_type === 'checkbox' && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={question.id}
                            checked={(questionAnswers[question.id] as boolean) || false}
                            onCheckedChange={(checked) =>
                              setQuestionAnswers({ ...questionAnswers, [question.id]: checked })
                            }
                          />
                          <Label htmlFor={question.id} className="font-normal">
                            Tak
                          </Label>
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* CV Upload & Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CV i list motywacyjny</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cv">CV (PDF, max 5MB)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {cvFile && (
                    <span className="text-sm text-muted-foreground">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">List motywacyjny (opcjonalnie)</Label>
                <Textarea
                  id="coverLetter"
                  rows={6}
                  placeholder="Dlaczego jesteś idealnym kandydatem na to stanowisko?"
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Wyślij aplikację
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
