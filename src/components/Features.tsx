import React from "react";
import {
  UserPlus,
  FileText,
  Presentation,
  MessageSquare,
  Calendar,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: <UserPlus size={24} className="text-blue-400" />,
    title: "Easy Classroom Creation",
    description:
      "Faculty can create virtual classrooms in seconds, customize settings, and instantly invite students.",
  },
  {
    icon: <FileText size={24} className="text-blue-400" />,
    title: "Seamless Note Sharing",
    description:
      "Upload and organize lecture notes, reading materials, and assignments for easy student access.",
  },
  {
    icon: <Presentation size={24} className="text-blue-400" />,
    title: "Interactive Learning",
    description:
      "Engage with multimedia content, interactive presentations, and real-time discussions.",
  },
  {
    icon: <MessageSquare size={24} className="text-blue-400" />,
    title: "Collaborative Discussion",
    description:
      "Foster student participation through threaded discussions and group collaboration tools.",
  },
  {
    icon: <Calendar size={24} className="text-blue-400" />,
    title: "Schedule Management",
    description:
      "Keep track of class schedules, assignment deadlines, and important academic dates.",
  },
  {
    icon: <Clock size={24} className="text-blue-400" />,
    title: "Anytime Access",
    description:
      "Access course materials, discussions, and resources 24/7 from any device.",
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need For Virtual Learning
          </h2>
          <p className="text-lg text-gray-300">
            SCRIBE provides a comprehensive suite of tools for creating engaging
            virtual classroom experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700"
              data-aos="fade-up"
              data-aos-delay={100 + index * 50}
            >
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="inline-block bg-blue-900/50 text-blue-300 font-medium rounded-full px-4 py-1 text-sm">
            Coming Soon
          </p>
          <h3 className="text-xl md:text-2xl font-semibold text-white mt-2">
            Mobile Apps for iOS and Android
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mt-2">
            Access your virtual classroom on the go with our upcoming mobile
            applications.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
