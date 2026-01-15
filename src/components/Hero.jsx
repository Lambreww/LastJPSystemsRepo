import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  const handleSmoothScroll = (targetId) => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section id="home" className="hero">
      <div className="hero-overlay">
        <div className="container">
          <div className="hero-content">
            <h1 className="fade-in-up">Индустриални и Секционни Врати</h1>

            <p className="fade-in-up fade-in-delay-1">
              Висококачествени решения за дома и индустрията с професионален монтаж и гаранция.
            </p>

            {/* ГОРНИ БУТОНИ */}
            <div className="hero-buttons fade-in-up fade-in-delay-2">
              <button
                className="btn hover-lift"
                onClick={() => handleSmoothScroll('gallery')}
              >
                Вижте нашите продукти
              </button>

              <button
                className="btn btn-outline hover-lift"
                onClick={() => handleSmoothScroll('contact')}
              >
                Запитване
              </button>
            </div>

            {/* ДОЛЕН БУТОН */}
            <div
            className="hero-buttons-center fade-in-up fade-in-delay-3"
            style={{ marginTop: "15px" }}
            >
            <button
            className="btn btn-outline hover-lift"
              onClick={() => navigate("/advantages")}
            >
              Нашите предимства
            </button>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
