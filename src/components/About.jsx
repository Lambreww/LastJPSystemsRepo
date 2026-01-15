import './About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2 className="section-title">За JP Systems</h2>
            <p>
              С над 20 години опит в производството и монтажа на индустриални и гаражни врати, 
              JP Systems е вашият надежден партньор за качествени решения.
            </p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">✅</span>
                <div>
                  <h4>Високо качество</h4>
                  <p>Използваме само сертифицирани материали и компоненти</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <div>
                  <h4>Бърз монтаж</h4>
                  <p>Професионален монтаж от опитни специалисти</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🛠️</span>
                <div>
                  <h4>Гаранция</h4>
                  <p>Предоставяме дългосрочна гаранция за всички наши продукти</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img 
              src="https://armyofdavidsgaragedoors.com/wp-content/uploads/2020/01/csm_Home_Carousel_Teaser01_1400x513_2c6c608e4d.jpg" 
              alt="Производство на врати" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;