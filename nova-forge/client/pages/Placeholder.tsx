import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="p-8 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-white/10">
        <div className="text-neon-cyan text-6xl">{icon}</div>
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-4xl font-bold text-foreground">{title}</h1>
        <p className="text-foreground/60 text-lg">{description}</p>
      </div>

      <p className="text-foreground/50 text-sm mt-6">
        This module is coming soon. Continue to customize this page with your specific requirements.
      </p>

      <button className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-neon-cyan/50 transition-all duration-200">
        Request Feature
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Placeholder;
