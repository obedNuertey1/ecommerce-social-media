import { useState, useEffect } from 'react';
import { ArrowUpIcon } from 'lucide-react';

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when scrolled more than 300px down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-3 bg-primary text-primary-content rounded-full shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="size-6" />
    </button>
  );
}

export default ScrollToTopButton;
