import { Clock3 } from "lucide-react";
import Container from "./Container";

const PlaceholderPage = ({ title, description }) => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.1),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#faf8f4_100%)] py-8 text-slate-900">
    <Container>


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


      </div>
    </Container>
  </main>
);

export default PlaceholderPage;
