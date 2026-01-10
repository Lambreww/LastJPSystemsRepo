import { useEffect } from "react";
import { initializeSmoothScroll } from "../utils/smoothScroll";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Gallery from "../components/Gallery";
import CallToAction from "../components/CallToAction";
import Contact from "../components/Contact";

function HomePage() {
  useEffect(() => {
    initializeSmoothScroll();
  }, []);

  return (
    <>
      <Hero />
      <About />
      <Services />
      <Gallery />
      <CallToAction />
      <Contact />
    </>
  );
}

export default HomePage;