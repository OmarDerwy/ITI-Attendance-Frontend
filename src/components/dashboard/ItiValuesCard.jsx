
import React, { useState, useEffect } from 'react';
import { CardTitle } from '@/components/ui/card';
import { Star, Heart, Lightbulb, Award, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const ItiValuesCard = ({ className }) => {
  const [activeValue, setActiveValue] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  
  const values = [
    {
      letter: "P",
      title: "Professionalism",
      description: "We build-up a highly professional, effective, dynamic work environment, whereby we are mindful of creating value while embracing the profession standards.",
      icon: <Star className="h-5 w-5" />,
      color: "from-emerald-500 to-teal-600"
    },
    {
      letter: "E",
      title: "Elation",
      description: "We work in a highly demanding industry and a vibrant work environment. We are consistently challenged and motivated to fulfill & excel beyond our capabilities & allocated resources.",
      icon: <Zap className="h-5 w-5" />,
      color: "from-amber-500 to-orange-600"
    },
    {
      letter: "O",
      title: "Openness",
      description: "We believe in a world with no borders where ideas and knowledge have no limits. We believe in the power of a diversified group of people united by one vision. We adopt an open window to all possibilities and anticipations.",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      letter: "P",
      title: "Passion",
      description: "We are driven by passion, committed in heart and mind. We do what we love and we love what we do. Self satisfaction and elation embrace our life with ITI as interns, staff, as well as, graduates and partners.",
      icon: <Heart className="h-5 w-5" />,
      color: "from-rose-500 to-red-600"
    },
    {
      letter: "L",
      title: "Loyalty",
      description: "We are loyal to our identity, community, industry and country. We are committed by the ITI's heritage to create a valuable impact enabling and empowering our beneficiaries, partners and the ICT ecosystem in Egypt and the world.",
      icon: <Award className="h-5 w-5" />,
      color: "from-purple-500 to-violet-600"
    },
    {
      letter: "E",
      title: "Extra Mile",
      description: "We believe in going the extra mile stamping our work with excellence, leaving our fingure-prints flavoring our work. We believe in the magic created when everyone brings along their personal flavor to the table.",
      icon: <Zap className="h-5 w-5" />,
      color: "from-cyan-500 to-blue-600"
    }
  ];
  
  // Set up autoplay
  useEffect(() => {
    let interval;
    if (autoplayEnabled) {
      interval = setInterval(() => {
        setActiveValue((prev) => (prev === values.length - 1 ? 0 : prev + 1));
      }, 20000); // 20 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplayEnabled, values.length]);
  
  // When user interacts, pause autoplay temporarily
  const handleManualChange = (index) => {
    setActiveValue(index);
    setAutoplayEnabled(false);
    
    // Resume autoplay after 1 minute of inactivity
    setTimeout(() => {
      setAutoplayEnabled(true);
    }, 60000);
  };

  return (
    <div className={cn("h-full", className)}>
      <p className="text-lg font-bold tracking-tight text-primary">
        People develop countries, <br />We develop <span className="inline-flex tracking-wider">
          {values.map((value, index) => (
            <button 
              key={index}
              onClick={() => handleManualChange(index)}
              className={cn(
                "transition-colors hover:scale-110 transform duration-200",
                index === activeValue 
                  ? cn("text-transparent bg-clip-text bg-gradient-to-br", value.color)
                  : "hover:text-primary/80"
              )}
            >
              {value.letter}
            </button>
          ))}
        </span>
      </p>
      
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "p-1.5 rounded-full bg-gradient-to-br",
            values[activeValue].color,
            "text-white"
          )}>
            {values[activeValue].icon}
          </div>
          <h3 className="text-sm font-semibold flex items-center gap-1">
            <span className={cn(
              "text-transparent bg-clip-text bg-gradient-to-r",
              values[activeValue].color
            )}>
              {values[activeValue].letter}
            </span>
            {values[activeValue].title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">{values[activeValue].description}</p>
      </div>
    </div>
  );
};

export default ItiValuesCard;
