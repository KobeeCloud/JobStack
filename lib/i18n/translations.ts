export type Locale = 'pl' | 'en';

export const translations = {
  pl: {
    // Navigation
    nav: {
      home: 'Strona główna',
      jobs: 'Oferty pracy',
      forEmployers: 'Dla pracodawców',
      pricing: 'Cennik',
      about: 'O nas',
      contact: 'Kontakt',
      login: 'Zaloguj się',
      register: 'Zarejestruj się',
      dashboard: 'Panel',
      profile: 'Profil',
      logout: 'Wyloguj',
      savedJobs: 'Zapisane',
    },

    // Common
    common: {
      search: 'Szukaj',
      filter: 'Filtruj',
      all: 'Wszystkie',
      loading: 'Ładowanie...',
      error: 'Wystąpił błąd',
      retry: 'Spróbuj ponownie',
      save: 'Zapisz',
      cancel: 'Anuluj',
      delete: 'Usuń',
      edit: 'Edytuj',
      view: 'Zobacz',
      back: 'Wróć',
      next: 'Dalej',
      previous: 'Wstecz',
      submit: 'Wyślij',
      apply: 'Aplikuj',
      remote: 'Zdalnie',
      hybrid: 'Hybrydowo',
      onsite: 'Stacjonarnie',
      perMonth: '/mies.',
      free: 'Za darmo',
      new: 'Nowe',
    },

    // Home page
    home: {
      badge: '🚀 Agregujemy 50,000+ ofert z 5+ portali',
      title: 'Znajdź wymarzoną pracę',
      subtitle: 'w jednym miejscu',
      description: 'Przestań tracić czas na przeglądanie wielu portali. Agregujemy tysiące ofert z NoFluffJobs, Pracuj.pl, Bulldogjob i innych.',
      searchButton: 'Szukaj ofert',
      postJobButton: 'Dodaj ofertę',
      trustedBy: 'Zbieramy oferty z najlepszych portali pracy',
      featuresLabel: 'Funkcje',
      whyJobStack: 'Dlaczego JobStack?',
      featuresSubtitle: 'Wszystko czego potrzebujesz do znalezienia idealnej pracy IT',
      ctaTitle: 'Gotowy na wymarzoną pracę?',
      ctaSubtitle: 'Dołącz do tysięcy specjalistów IT korzystających z JobStack',
      getStartedFree: 'Zacznij za darmo',
      browseJobs: 'Przeglądaj oferty',
      hero: {
        title: 'Znajdź wymarzoną pracę w IT',
        subtitle: 'Agregujemy oferty z NoFluffJobs, Pracuj.pl, Bulldogjob i innych portali w jednym miejscu',
        searchPlaceholder: 'Stanowisko, technologia lub firma...',
        cta: 'Szukaj ofert',
      },
      stats: {
        jobs: 'aktywnych ofert',
        boards: 'portali pracy',
        users: 'użytkowników',
        companies: 'firm',
        sources: 'źródeł',
      },
      features: {
        title: 'Dlaczego JobStack?',
        aggregation: {
          title: 'Wszystko w jednym miejscu',
          desc: 'Koniec z przeskakiwaniem między portalami. Znajdziesz tu oferty z NoFluffJobs, Pracuj.pl, Bulldogjob i innych.',
        },
        realtime: {
          title: 'Aktualizacje w czasie rzeczywistym',
          desc: 'Nowe oferty są dodawane codziennie. Bądź pierwszy, który zobaczy najnowsze możliwości.',
        },
        filters: {
          title: 'Inteligentne filtry',
          desc: 'Filtruj po technologii, lokalizacji, wynagrodzeniu, pracy zdalnej i więcej. Znajdź dokładnie to, czego szukasz.',
        },
        api: {
          title: 'API dla automatyzacji',
          desc: 'Zautomatyzuj proces publikacji ofert z naszym RESTful API. Idealne dla zespołów HR i integracji ATS.',
        },
        alerts: {
          title: 'Powiadomienia email',
          desc: 'Otrzymuj powiadomienia o nowych ofertach pasujących do Twoich kryteriów. Nigdy nie przegap okazji.',
        },
        employers: {
          title: 'Dla pracodawców',
          desc: 'Publikuj oferty łatwo przez dashboard lub API. Dotrzej do tysięcy wykwalifikowanych kandydatów.',
        },
        free: {
          title: '100% Za darmo',
          desc: 'Bez opłat dla kandydatów i pracodawców',
        },
        fast: {
          title: 'Szybkie wyszukiwanie',
          desc: 'Zaawansowane filtry i sortowanie',
        },
      },
      freeBanner: {
        title: '100% Darmowe na start!',
        subtitle: 'Dla kandydatów i pracodawców. Bez ukrytych opłat.',
      },
    },

    // Jobs page
    jobs: {
      title: 'Oferty pracy',
      subtitle: 'Przejrzyj najnowsze oferty pracy IT w Polsce',
      filters: {
        location: 'Lokalizacja',
        salary: 'Wynagrodzenie',
        experience: 'Doświadczenie',
        technology: 'Technologia',
        remote: 'Tylko zdalne',
        salaryFrom: 'Od',
        salaryTo: 'Do',
      },
      sort: {
        newest: 'Najnowsze',
        salary: 'Wg wynagrodzenia',
        relevance: 'Wg trafności',
      },
      noResults: 'Nie znaleziono ofert spełniających kryteria',
      resultsCount: 'Znaleziono {count} ofert',
      applyNow: 'Aplikuj teraz',
      viewDetails: 'Zobacz szczegóły',
      savedJobs: 'Zapisane oferty',
      source: 'Źródło',
      published: 'Opublikowano',
      expires: 'Wygasa',
    },

    // Job details
    jobDetails: {
      description: 'Opis stanowiska',
      requirements: 'Wymagania',
      techStack: 'Technologie',
      benefits: 'Benefity',
      aboutCompany: 'O firmie',
      salary: 'Wynagrodzenie',
      location: 'Lokalizacja',
      applyExternal: 'Aplikuj na stronie pracodawcy',
      applyHere: 'Aplikuj przez JobStack',
      shareJob: 'Udostępnij ofertę',
      saveJob: 'Zapisz ofertę',
      similarJobs: 'Podobne oferty',
    },

    // Auth
    auth: {
      welcomeBack: 'Witaj ponownie!',
      signIn: 'Zaloguj się',
      signInDescription: 'Wpisz swoje dane, aby się zalogować',
      signUp: 'Zarejestruj się',
      signUpDescription: 'Wybierz rolę i stwórz konto',
      email: 'Adres email',
      password: 'Hasło',
      confirmPassword: 'Potwierdź hasło',
      forgotPassword: 'Zapomniałeś hasła?',
      orContinueWith: 'lub kontynuuj z',
      continueWithGoogle: 'Kontynuuj z Google',
      noAccount: 'Nie masz konta?',
      hasAccount: 'Masz już konto?',
      signingIn: 'Logowanie...',
      creatingAccount: 'Tworzenie konta...',
      createAccount: 'Stwórz konto',
      accountCreated: 'Konto utworzone!',
      checkEmail: 'Sprawdź swoją skrzynkę email, aby zweryfikować konto.',
      redirectingToLogin: 'Przekierowywanie do logowania...',
      iAm: 'Jestem...',
      jobSeeker: 'Szukający pracy',
      lookingForJobs: 'Szukam pracy',
      employer: 'Pracodawca',
      postingJobs: 'Publikuję oferty',
      passwordMinLength: 'Minimum 6 znaków',
      login: {
        title: 'Zaloguj się',
        email: 'Adres email',
        password: 'Hasło',
        submit: 'Zaloguj się',
        noAccount: 'Nie masz konta?',
        register: 'Zarejestruj się',
        forgotPassword: 'Zapomniałeś hasła?',
        orContinueWith: 'lub kontynuuj z',
        google: 'Google',
        github: 'GitHub',
      },
      register: {
        title: 'Zarejestruj się',
        name: 'Imię i nazwisko',
        email: 'Adres email',
        password: 'Hasło',
        confirmPassword: 'Potwierdź hasło',
        role: 'Jestem',
        candidate: 'Kandydatem',
        employer: 'Pracodawcą',
        submit: 'Utwórz konto',
        hasAccount: 'Masz już konto?',
        login: 'Zaloguj się',
        agreeTerms: 'Akceptuję',
        terms: 'regulamin',
        and: 'i',
        privacy: 'politykę prywatności',
      },
    },

    // Employers
    employers: {
      hero: {
        title: 'Dotrzej do tysięcy kandydatów IT',
        subtitle: 'Publikuj oferty pracy za darmo i znajdź najlepszych specjalistów',
        cta: 'Dodaj ofertę za darmo',
      },
      features: {
        reach: {
          title: 'Szeroki zasięg',
          desc: 'Twoje oferty obok NoFluffJobs i Pracuj.pl',
        },
        free: {
          title: 'Bez opłat',
          desc: 'Nielimitowane oferty za darmo na start',
        },
        api: {
          title: 'Integracja API',
          desc: 'Automatyzuj publikację ofert',
        },
      },
      pricing: {
        title: 'Wszystko za darmo',
        subtitle: 'Na start oferujemy pełny dostęp bez opłat',
        features: [
          'Nielimitowane oferty pracy',
          '30 dni wyświetlania',
          'Logo firmy',
          'Dostęp do API',
          'Podstawowa analityka',
        ],
      },
    },

    // Pricing
    pricing: {
      title: 'Cennik',
      subtitle: 'Wszystko za darmo na start',
      freeBanner: '100% Darmowe na start!',
      freeDesc: 'JobStack jest obecnie całkowicie darmowy dla kandydatów i pracodawców',
      candidates: {
        title: 'Dla kandydatów',
        price: 'GRATIS',
        desc: 'Zawsze będzie darmowe',
        features: [
          'Wyszukiwanie ofert',
          'Zapisywanie ulubionych',
          'Powiadomienia email',
          'Śledzenie aplikacji',
        ],
      },
      employers: {
        title: 'Dla pracodawców',
        price: 'GRATIS',
        desc: 'Darmowe na start',
        features: [
          'Nielimitowane oferty',
          '30 dni wyświetlania',
          'Logo firmy',
          'Dostęp do API',
        ],
      },
      future: {
        title: 'W przyszłości',
        desc: 'Planujemy wprowadzić opcjonalne płatne funkcje premium',
      },
    },

    // Footer
    footer: {
      description: 'Agregator ofert pracy IT w Polsce',
      links: {
        title: 'Linki',
        jobs: 'Oferty pracy',
        employers: 'Dla pracodawców',
        pricing: 'Cennik',
        about: 'O nas',
      },
      legal: {
        title: 'Prawne',
        terms: 'Regulamin',
        privacy: 'Polityka prywatności',
        cookies: 'Cookies',
      },
      contact: {
        title: 'Kontakt',
        email: 'kontakt@jobstack.pl',
      },
      copyright: '© {year} JobStack. Wszystkie prawa zastrzeżone.',
    },

    // Errors
    errors: {
      notFound: 'Strona nie znaleziona',
      serverError: 'Błąd serwera',
      unauthorized: 'Brak autoryzacji',
      forbidden: 'Brak dostępu',
    },
  },

  en: {
    // Navigation
    nav: {
      home: 'Home',
      jobs: 'Jobs',
      forEmployers: 'For Employers',
      pricing: 'Pricing',
      about: 'About',
      contact: 'Contact',
      login: 'Sign In',
      register: 'Sign Up',
      dashboard: 'Dashboard',
      profile: 'Profile',
      logout: 'Sign Out',
      savedJobs: 'Saved',
    },

    // Common
    common: {
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Try again',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      apply: 'Apply',
      remote: 'Remote',
      hybrid: 'Hybrid',
      onsite: 'On-site',
      perMonth: '/month',
      free: 'Free',
      new: 'New',
    },

    // Home page
    home: {
      badge: '🚀 Aggregating 50,000+ jobs from 5+ boards',
      title: 'Find Your Dream Job',
      subtitle: 'in One Place',
      description: 'Stop wasting time checking multiple job boards. We aggregate thousands of opportunities from NoFluffJobs, Pracuj.pl, Bulldogjob and more.',
      searchButton: 'Search Jobs',
      postJobButton: 'Post a Job',
      trustedBy: 'Aggregating jobs from top job boards',
      featuresLabel: 'Features',
      whyJobStack: 'Why JobStack?',
      featuresSubtitle: 'Everything you need to find the perfect IT job',
      ctaTitle: 'Ready for your dream job?',
      ctaSubtitle: 'Join thousands of IT professionals using JobStack',
      getStartedFree: 'Get Started Free',
      browseJobs: 'Browse Jobs',
      hero: {
        title: 'Find Your Dream IT Job',
        subtitle: 'We aggregate jobs from NoFluffJobs, Pracuj.pl, Bulldogjob and more in one place',
        searchPlaceholder: 'Position, technology or company...',
        cta: 'Search Jobs',
      },
      stats: {
        jobs: 'active jobs',
        boards: 'job boards',
        users: 'users',
        companies: 'companies',
        sources: 'sources',
      },
      features: {
        title: 'Why JobStack?',
        aggregation: {
          title: 'All in One Place',
          desc: 'Stop switching between job boards. Find everything from NoFluffJobs, Pracuj.pl, Bulldogjob and more.',
        },
        realtime: {
          title: 'Real-time Updates',
          desc: 'New jobs are added daily. Be first to see the latest opportunities.',
        },
        filters: {
          title: 'Smart Filtering',
          desc: 'Filter by technology, location, salary, remote work and more. Find exactly what you\'re looking for.',
        },
        api: {
          title: 'API for Automation',
          desc: 'Automate your job posting process with our RESTful API. Perfect for HR teams and ATS integrations.',
        },
        alerts: {
          title: 'Email Alerts',
          desc: 'Get notified when new jobs matching your criteria are posted. Never miss an opportunity.',
        },
        employers: {
          title: 'For Employers',
          desc: 'Post jobs easily with our dashboard or API. Reach thousands of qualified candidates.',
        },
        free: {
          title: '100% Free',
          desc: 'No fees for candidates and employers',
        },
        fast: {
          title: 'Fast Search',
          desc: 'Advanced filters and sorting',
        },
      },
      freeBanner: {
        title: '100% Free to Start!',
        subtitle: 'For candidates and employers. No hidden fees.',
      },
    },

    // Jobs page
    jobs: {
      title: 'Job Offers',
      subtitle: 'Browse the latest IT jobs in Poland',
      filters: {
        location: 'Location',
        salary: 'Salary',
        experience: 'Experience',
        technology: 'Technology',
        remote: 'Remote only',
        salaryFrom: 'From',
        salaryTo: 'To',
      },
      sort: {
        newest: 'Newest',
        salary: 'By salary',
        relevance: 'By relevance',
      },
      noResults: 'No jobs found matching your criteria',
      resultsCount: 'Found {count} jobs',
      applyNow: 'Apply Now',
      viewDetails: 'View Details',
      savedJobs: 'Saved Jobs',
      source: 'Source',
      published: 'Published',
      expires: 'Expires',
    },

    // Job details
    jobDetails: {
      description: 'Job Description',
      requirements: 'Requirements',
      techStack: 'Technologies',
      benefits: 'Benefits',
      aboutCompany: 'About Company',
      salary: 'Salary',
      location: 'Location',
      applyExternal: 'Apply on employer website',
      applyHere: 'Apply via JobStack',
      shareJob: 'Share Job',
      saveJob: 'Save Job',
      similarJobs: 'Similar Jobs',
    },

    // Auth
    auth: {
      welcomeBack: 'Welcome back!',
      signIn: 'Sign In',
      signInDescription: 'Enter your details to sign in',
      signUp: 'Sign Up',
      signUpDescription: 'Choose your role and create an account',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      forgotPassword: 'Forgot password?',
      orContinueWith: 'or continue with',
      continueWithGoogle: 'Continue with Google',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      createAccount: 'Create Account',
      accountCreated: 'Account Created!',
      checkEmail: 'Please check your email to verify your account.',
      redirectingToLogin: 'Redirecting to login...',
      iAm: 'I am a...',
      jobSeeker: 'Job Seeker',
      lookingForJobs: 'Looking for jobs',
      employer: 'Employer',
      postingJobs: 'Posting jobs',
      passwordMinLength: 'At least 6 characters',
      login: {
        title: 'Sign In',
        email: 'Email address',
        password: 'Password',
        submit: 'Sign In',
        noAccount: "Don't have an account?",
        register: 'Sign Up',
        forgotPassword: 'Forgot password?',
        orContinueWith: 'or continue with',
        google: 'Google',
        github: 'GitHub',
      },
      register: {
        title: 'Sign Up',
        name: 'Full name',
        email: 'Email address',
        password: 'Password',
        confirmPassword: 'Confirm password',
        role: 'I am a',
        candidate: 'Job Seeker',
        employer: 'Employer',
        submit: 'Create Account',
        hasAccount: 'Already have an account?',
        login: 'Sign In',
        agreeTerms: 'I agree to the',
        terms: 'Terms of Service',
        and: 'and',
        privacy: 'Privacy Policy',
      },
    },

    // Employers
    employers: {
      hero: {
        title: 'Reach Thousands of IT Candidates',
        subtitle: 'Post jobs for free and find the best specialists',
        cta: 'Post a Job for Free',
      },
      features: {
        reach: {
          title: 'Wide Reach',
          desc: 'Your jobs alongside NoFluffJobs and Pracuj.pl',
        },
        free: {
          title: 'No Fees',
          desc: 'Unlimited free job posts to start',
        },
        api: {
          title: 'API Integration',
          desc: 'Automate your job publishing',
        },
      },
      pricing: {
        title: 'Everything Free',
        subtitle: 'Full access at no cost to start',
        features: [
          'Unlimited job posts',
          '30 days listing',
          'Company logo',
          'API access',
          'Basic analytics',
        ],
      },
    },

    // Pricing
    pricing: {
      title: 'Pricing',
      subtitle: 'Everything free to start',
      freeBanner: '100% Free to Start!',
      freeDesc: 'JobStack is currently completely free for candidates and employers',
      candidates: {
        title: 'For Candidates',
        price: 'FREE',
        desc: 'Always will be free',
        features: [
          'Search all jobs',
          'Save favorites',
          'Email notifications',
          'Track applications',
        ],
      },
      employers: {
        title: 'For Employers',
        price: 'FREE',
        desc: 'Free to start',
        features: [
          'Unlimited job posts',
          '30 days listing',
          'Company logo',
          'API access',
        ],
      },
      future: {
        title: 'Coming Soon',
        desc: 'We plan to introduce optional premium features',
      },
    },

    // Footer
    footer: {
      description: 'IT Job Aggregator in Poland',
      links: {
        title: 'Links',
        jobs: 'Jobs',
        employers: 'For Employers',
        pricing: 'Pricing',
        about: 'About',
      },
      legal: {
        title: 'Legal',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        cookies: 'Cookies',
      },
      contact: {
        title: 'Contact',
        email: 'contact@jobstack.pl',
      },
      copyright: '© {year} JobStack. All rights reserved.',
    },

    // Errors
    errors: {
      notFound: 'Page not found',
      serverError: 'Server error',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
    },
  },
} as const;

export type Translations = typeof translations.pl;
