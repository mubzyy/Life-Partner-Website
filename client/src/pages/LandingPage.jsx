import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureGrid from "../components/FeatureGrid";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

// FeaturedProfiles and Testimonials were removed — both showed fabricated
// people (fake names/photos/professions, fake "success story" couples) that
// were never backed by real data. A public marketing page can't ethically
// show real members' photos/names without consent, so there's no real-data
// replacement here — the sections are simply gone.
const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <Pricing />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
