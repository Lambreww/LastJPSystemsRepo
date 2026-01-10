import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Зареждане...</p>
    </div>
  );
};

export default LoadingSpinner;