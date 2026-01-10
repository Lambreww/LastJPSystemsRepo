import "./Advantages.css";

const Advantages = () => {
  return (
    <section className="advantages-page">
      <div className="container">
        {/* HERO */}
        <header className="advantages-hero">
          <h1>Нашите предимства</h1>
          <p>
            JP Systems е утвърдена компания в областта на индустриалните,
            складовите и гаражните врати. Нашият дългогодишен опит, сертифицирани
            продукти и висок професионализъм ни отличават като надежден партньор
            за всеки проект – от индивидуални клиенти до индустриални обекти.
          </p>
        </header>

        {/* CARDS */}
        <div className="advantages-grid">
          <article className="adv-card">
            <div className="adv-card-head">
              <h2>Сертификати и стандарти</h2>
              <span className="adv-badge">Качество</span>
            </div>

            <ul className="adv-list">
              <li>
                Декларация за съответствие съгласно хармонизираните стандарти БДС
                EN 13241:2003 + A2:2016, БДС EN 16034:2014, БДС EN 13501-2:2016
              </li>
              <li>
                20-годишен опит в консултирането, монтажа и поддръжката на
                предлаганите съоръжения
              </li>
              <li>Гаранционен и извънгаранционен сервиз до 24 часа</li>
              <li>
                Складова база с постоянна наличност на резервни части за всички
                продукти
              </li>
              <li>EN ISO 9001 – управление на качеството, сертифицирано от TÜV (Германия)</li>
              <li>
                EN ISO 50001:2011 – управление на енергията, сертифицирано от
                Transpacific Certification Ltd.
              </li>
            </ul>
          </article>

          <article className="adv-card">
            <div className="adv-card-head">
              <h2>Характеристики на продуктите</h2>
              <span className="adv-badge">Надеждност</span>
            </div>

            <h3 className="adv-subtitle">Изолирани гаражни секционни врати</h3>

            <ul className="adv-list">
              <li>Декларация за съответствие съгласно стандарт EN 13241</li>
              <li>
                Специализиран софтуер за производство, гарантиращ максимална
                функционалност и безопасност
              </li>
              <li>Изработка по индивидуални размери на клиента</li>
              <li>
                Система на отваряне, позволяваща минимално заемане на пространство
              </li>
              <li>
                Панели тип „сандвич“ с дебелина 42 мм, състоящи се от два външни
                слоя дълбокогалванизирана стоманена ламарина (0.5 мм) и вътрешен
                слой от пенополиуретан с прекъснат термичен мост
              </li>
              <li>
                Защита против притискане на пръсти между панелите и пълна
                четиристранна изолация срещу дъжд, прах, пясък и насекоми
              </li>
              <li>
                Метални части от висококачествена дълбокогалванизирана стомана,
                осигуряващи дълъг експлоатационен живот
              </li>
              <li>
                Водещи ролки от високоякостен полиамид за безшумна работа и
                минимално износване
              </li>
            </ul>
          </article>
        </div>

        {/* TABLE */}
        <article className="adv-card adv-table-card">
          <div className="adv-card-head">
            <h2>Технически характеристики</h2>
            <span className="adv-badge">Спецификации</span>
          </div>

          <div className="adv-table-wrap">
            <table className="adv-table">
              <tbody>
                <tr>
                  <td className="adv-td-label">Стандарт на производство</td>
                  <td className="adv-td-value">CE (EN 13241-1)</td>
                </tr>
                <tr>
                  <td className="adv-td-label">Панел</td>
                  <td className="adv-td-value">42 мм</td>
                </tr>
                <tr>
                  <td className="adv-td-label">Релси и профили</td>
                  <td className="adv-td-value">Поцинковани / Алуминиеви</td>
                </tr>
                <tr>
                  <td className="adv-td-label">Ветроустойчивост</td>
                  <td className="adv-td-value">Клас 5</td>
                </tr>
                <tr>
                  <td className="adv-td-label">Въздухопропускливост</td>
                  <td className="adv-td-value">Клас 3</td>
                </tr>
                <tr>
                  <td className="adv-td-label">Водонепроницаемост</td>
                  <td className="adv-td-value">Клас 3</td>
                </tr>
                <tr>
                  <td className="adv-td-label">Коефициент на топлопреминаване</td>
                  <td className="adv-td-value">1.2 W/m²K</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Advantages;
