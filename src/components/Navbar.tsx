import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import Button from "./ui/Button";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/95 backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      } py-4`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Logo darkMode />

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Testimonials
            </a>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/login")}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => (window.location.href = "/signup")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>

        <div
          className={`fixed inset-0 bg-gray-900/95 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="h-full flex flex-col justify-center items-center space-y-8 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="#features"
              className="text-xl hover:text-blue-400 transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-xl hover:text-blue-400 transition-colors duration-300"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-xl hover:text-blue-400 transition-colors duration-300"
            >
              Testimonials
            </a>
            <div className="flex flex-col space-y-4 w-64 px-6">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => (window.location.href = "/login")}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => (window.location.href = "/signup")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
