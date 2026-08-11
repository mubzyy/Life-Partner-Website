import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureGrid from "../components/FeatureGrid";
import HowItWorks from "../components/HowItWorks";
import FeaturedProfiles from "../components/FeaturedProfiles";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <FeaturedProfiles />
      <Testimonials />
      <Pricing />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
