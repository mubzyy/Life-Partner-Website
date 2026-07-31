import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Container from "./Container";
import BrandMark from "./BrandMark";

const placeholderCards = [
  {
    icon: Sparkles,
    title: "Premium-ready UI",
    description:
      "The route is already wired into the app shell and ready for future product work.",
  },
  {
    icon: ShieldCheck,
    title: "Safe placeholder state",
    description:
      "No errors, no broken navigation, and no backend dependencies are required yet.",
  },
  {
    icon: LayoutDashboard,
    title: "Scalable structure",
    description:
      "The page layout is designed so a real data-backed screen can slot in later.",
  },
];

const PlaceholderPage = ({ title, description }) => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.1),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#faf8f4_100%)] py-8 text-slate-900">
    <Container>
      <div className="flex items-center justify-between gap-6">
        <BrandMark compact />
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back Home
        </Link>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl flex-col justify-center py-16">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          <Clock3 className="h-4 w-4" />
          Coming soon
        </div>

        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          {description}
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {placeholderCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <card.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {card.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Search className="h-4 w-4" />
            Explore Search
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            <BadgeCheck className="h-4 w-4" />
            View Dashboard Placeholder
          </Link>
        </div>
      </div>
    </Container>
  </main>
);

export default PlaceholderPage;
