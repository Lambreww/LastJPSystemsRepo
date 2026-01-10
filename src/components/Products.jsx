import './Products.css';
import { images } from '../utils/images';

const Products = () => {
  const products = [
    {
      name: 'Секционни Индустриални Врати',
      description: 'Висококачествени секционни врати за индустриални и складови нужди',
      image: images.products.industrial1,
      category: 'Индустриални врати'
    },
    {
      name: 'Гаражни Секционни Врати', 
      description: 'Модерни и сигурни гаражни врати за дома и бизнеса',
      image: images.products.garage1,
      category: 'Гаражни врати'
    },
    {
      name: 'Бързоролкови Врати',
      description: 'Бързи и ефективни ролкови врати за индустриална употреба',
      image: images.products.roller,
      category: 'Индустриални врати'
    },
    {
      name: 'ПВЦ Врати',
      description: 'Качествени ПВЦ врати с отлична изолация',
      image: images.products.pvc,
      category: 'Гаражни врати'
    },
    {
      name: 'Алуминиеви Врати',
      description: 'Леки и здрави алуминиеви врати с модерен дизайн',
      image: images.products.aluminum,
      category: 'Индустриални врати'
    },
    {
      name: 'Стоманени Врати',
      description: 'Здрави и сигурни стоманени врати за максимална защита',
      image: images.products.steel,
      category: 'Индустриални врати'
    }
  ];

  const categories = ['Всички', 'Индустриални врати', 'Гаражни врати'];

  return (
    <section id="products" className="products">
      <div className="container">
        <h2 className="section-title">Нашите Продукти</h2>
        
        <div className="products-filter">
          {categories.map((category, index) => (
            <button key={index} className="filter-btn">
              {category}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-category">{product.category}</div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <button className="btn product-btn">Научи повече</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;