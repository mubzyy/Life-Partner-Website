import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Crown,
  EyeOff,
  Heart,
  HeartHandshake,
  LockKeyhole,
  MessageSquareMore,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  CircleGauge,
  UserRound,
} from 'lucide-react'

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#why' },
  { label: 'Success Stories', href: '#stories' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
]

export const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Profiles',
    description: 'Every profile is designed to feel trustworthy, with identity and community verification cues.',
  },
  {
    icon: LockKeyhole,
    title: 'Privacy First',
    description: 'Sensitive details are shown in a respectful, controlled way that reflects real matrimonial expectations.',
  },
  {
    icon: Workflow,
    title: 'Smart Matching',
    description: 'A curated, compatibility-driven flow helps families and individuals move with clarity.',
  },
  {
    icon: MessageSquareMore,
    title: 'Secure Messaging',
    description: 'Conversation moments are presented in a polished chat experience built around confidence and ease.',
  },
  {
    icon: HeartHandshake,
    title: 'Faith-Based Community',
    description: 'The product language stays respectful, family-oriented, and aligned with Islamic values.',
  },
  {
    icon: CircleGauge,
    title: 'Trusted Platform',
    description: 'Membership health, profile completeness, and trust signals guide users through the journey.',
  },
]

export const journeySteps = [
  {
    step: '01',
    title: 'Register',
    description: 'Create a profile with the essentials your family would expect to see first.',
    icon: UserRound,
  },
  {
    step: '02',
    title: 'Complete Profile',
    description: 'Add preferences, education, profession, and values in a calm guided flow.',
    icon: CheckCircle2,
  },
  {
    step: '03',
    title: 'Find Matches',
    description: 'Browse curated cards and filters that emphasize suitability over volume.',
    icon: Search,
  },
  {
    step: '04',
    title: 'Start Your Journey',
    description: 'Connect with intention and continue only when both sides feel aligned.',
    icon: Heart,
  },
]

export const featuredProfiles = [
  {
    name: 'Ayesha Khan',
    age: 27,
    location: 'Lahore, Pakistan',
    profession: 'Product Designer',
    education: 'BBA, Lahore University',
    verified: true,
    faith: 'Muslim',
    values: 'Family-oriented',
    matchScore: 94,
  },
  {
    name: 'Hassan Malik',
    age: 29,
    location: 'Karachi, Pakistan',
    profession: 'Civil Engineer',
    education: 'BSc Civil Engineering',
    verified: true,
    faith: 'Muslim',
    values: 'Respectful',
    matchScore: 91,
  },
  {
    name: 'Maryam Siddiqui',
    age: 26,
    location: 'Islamabad, Pakistan',
    profession: 'Physiotherapist',
    education: 'Doctor of Physical Therapy',
    verified: true,
    faith: 'Muslim',
    values: 'Home-centered',
    matchScore: 96,
  },
  {
    name: 'Zain Ahmed',
    age: 28,
    location: 'Dubai, UAE',
    profession: 'Software Engineer',
    education: 'BS Computer Science',
    verified: true,
    faith: 'Muslim',
    values: 'Balanced lifestyle',
    matchScore: 89,
  },
]

export const testimonials = [
  {
    quote: 'The platform feels respectful and premium. It makes the search process calmer for families and more focused on the right fit.',
    name: 'Dr. Samina Rahman',
    role: 'Mother of a matched member',
    location: 'Karachi',
  },
  {
    quote: 'I appreciated that the experience felt composed and serious. It reflects the values I wanted in a matrimonial platform.',
    name: 'Bilal Qureshi',
    role: 'Verified member',
    location: 'Lahore',
  },
  {
    quote: 'The presentation is clean, reassuring, and easy to navigate. It communicates trust without feeling busy or noisy.',
    name: 'Amina Shah',
    role: 'Family reviewer',
    location: 'Islamabad',
  },
]

export const membershipPlans = [
  {
    name: 'Free',
    price: 'PKR 0',
    description: 'A clean introduction to the platform with core browsing and profile visibility.',
    cta: 'Start Free',
    highlighted: false,
    features: ['Profile preview', 'Basic search', 'Limited matches', 'Community updates'],
  },
  {
    name: 'Premium',
    price: 'PKR 1,499',
    description: 'For users who want stronger visibility and a more guided discovery journey.',
    cta: 'Choose Premium',
    highlighted: true,
    features: ['Unlimited likes', 'Enhanced filters', 'Priority visibility', 'Secure conversations'],
  },
  {
    name: 'Premium Plus',
    price: 'PKR 2,499',
    description: 'The most complete membership experience with extra trust and attention signals.',
    cta: 'Go Premium Plus',
    highlighted: false,
    features: ['Profile boost', 'Featured placement', 'Family sharing', 'Advanced support'],
  },
]

export const faqItems = [
  {
    question: 'Is Life Partner a dating app?',
    answer: 'No. The experience is intentionally designed as a premium matrimonial platform with a respectful, family-friendly tone.',
  },
  {
    question: 'Are the profiles real?',
    answer: 'For now, the website uses realistic dummy profiles to simulate the final product experience without backend data.',
  },
  {
    question: 'How does matching work?',
    answer: 'The UI demonstrates a compatibility-led flow with trust signals, filters, and curated profile recommendations.',
  },
  {
    question: 'Can families help review profiles?',
    answer: 'Yes. The design language is intentionally family-oriented and supports a review-first decision style.',
  },
  {
    question: 'Is private data exposed publicly?',
    answer: 'No backend is implemented, so the current frontend only simulates controlled visibility and privacy-first presentation.',
  },
]

export const footerLinks = {
  quick: [
    { label: 'Home', href: '#home' },
    { label: 'How It Works', href: '#how' },
    { label: 'Featured Profiles', href: '#profiles' },
    { label: 'Pricing', href: '#pricing' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#contact' },
    { label: 'Terms of Service', href: '#contact' },
    { label: 'Community Guidelines', href: '#contact' },
  ],
  social: [
    { label: 'Instagram', href: 'https://instagram.com', icon: Sparkles },
    { label: 'Facebook', href: 'https://facebook.com', icon: Users },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: BadgeCheck },
  ],
}

export const highlightMetrics = [
  { label: 'Verified Members', value: '12.4k' },
  { label: 'Successful Matches', value: '9.8k' },
  { label: 'Profile Completion', value: '94%' },
]

export const trustSignals = [
  { label: 'Identity checks', icon: BadgeCheck },
  { label: 'Family review flow', icon: CalendarDays },
  { label: 'Privacy controls', icon: EyeOff },
  { label: 'Guided onboarding', icon: Crown },
]

export const profileInterests = ['Reading', 'Travel', 'Cooking', 'Islamic History']
