import { BookOpen, ChevronRight, FileText, Users } from "lucide-react";
import React from "react";
import Button from "./ui/button";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 overflow-hidden bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 lg:pr-12 pt-10 pb-16">
            <div
              className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
                Virtual Classrooms Made{" "}
                <span className="text-blue-400">Simple</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                SCRIBE connects students and faculty in a seamless digital
                learning environment. Create classrooms, share notes, and
                collaborate—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10">
                <Button variant="primary" size="lg">
                  Get Started
                  <ChevronRight size={18} className="ml-2" />
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 sm:gap-8">
                <div className="flex items-center">
                  <div className="mr-3 bg-blue-900/50 p-2 rounded-full">
                    <BookOpen size={20} className="text-blue-400" />
                  </div>
                  <p className="font-medium text-gray-300">
                    Virtual Classrooms
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 bg-blue-900/50 p-2 rounded-full">
                    <Users size={20} className="text-blue-400" />
                  </div>
                  <p className="font-medium text-gray-300">
                    Teacher-Student Connection
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 bg-blue-900/50 p-2 rounded-full">
                    <FileText size={20} className="text-blue-400" />
                  </div>
                  <p className="font-medium text-gray-300">Share Notes</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative overflow-hidden rounded-tl-3xl rounded-bl-3xl lg:h-[600px]">
            <div
              className="w-full h-[300px] sm:h-[400px] lg:h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-tl-3xl rounded-bl-3xl overflow-hidden"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <img
                src="/ClassroomStudents.webp"
                alt="Students studying together"
                className="object-cover object-center w-full h-full mix-blend-overlay opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-900 to-transparent"></div>

              <div className="absolute top-20 right-20 bg-gray-800 rounded-lg shadow-xl p-3 transform rotate-6 animate-float-slow">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-2">
                    S
                  </div>
                  <div>
                    <div className="h-2 w-20 bg-gray-700 rounded"></div>
                    <div className="h-2 w-12 bg-gray-700 rounded mt-1"></div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-40 left-10 bg-gray-800 rounded-lg shadow-xl p-3 transform -rotate-3 animate-float">
                <div className="w-32 h-4 bg-gray-700 rounded mb-2"></div>
                <div className="w-28 h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-900/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;
