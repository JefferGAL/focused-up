import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Star, Crown, Zap } from 'lucide-react';

interface MotivationalCoachProps {
  durationSeconds: number;
}

// Pre-defined badges and messages to use locally without API
const BADGES = [
  { min: 0, title: "Focus Spark", message: "Great start! Every second counts.", icon: Star },
  { min: 5, title: "Mind Rookie", message: "You're getting the hang of this! Keep it up!", icon: Sparkles },
  { min: 15, title: "Focus Ninja", message: "Wow! That was some serious concentration.", icon: Zap },
  { min: 30, title: "Time Wizard", message: "Incredible! You are mastering your mind.", icon: Crown },
  { min: 45, title: "Zen Master", message: "Unstoppable! Pure focus achieved.", icon: Trophy },
  { min: 60, title: "Focus Legend", message: "A full hour? You are a superhero!", icon: Trophy },
];

const FUN_TITLES = ["Super Star", "Champion", "Hero", "Genius", "Rockstar"];

const MotivationalCoach: React.FC<MotivationalCoachProps> = ({ durationSeconds }) => {
  const [data, setData] = useState<{title: string, message: string, Icon: React.ElementType}>({ 
    title: '', 
    message: '',
    Icon: Star 
  });

  useEffect(() => {
    const minutes = Math.floor(durationSeconds / 60);
    
    // Find the highest tier achieved
    let achieved = BADGES[0];
    for (const badge of BADGES) {
        if (minutes >= badge.min) {
            achieved = badge;
        }
    }

    // Add a little randomness to the title sometimes for variety
    let finalTitle = achieved.title;
    if (Math.random() > 0.7) {
        finalTitle = FUN_TITLES[Math.floor(Math.random() * FUN_TITLES.length)];
    }

    setData({
        title: finalTitle,
        message: achieved.message,
        Icon: achieved.icon
    });

  }, [durationSeconds]);

  const { Icon } = data;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-4 w-full h-full flex flex-col items-center justify-center transform transition-all duration-500 animate-bounce-slow border-4 border-yellow-300">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="bg-yellow-100 p-3 rounded-full shadow-inner">
            <Icon className="w-10 h-10 text-yellow-500" />
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge Earned</h3>
          <h2 className="text-xl font-black text-indigo-600 mt-1 flex items-center justify-center gap-2">
             <Sparkles className="w-4 h-4 text-yellow-400" />
             {data.title}
             <Sparkles className="w-4 h-4 text-yellow-400" />
          </h2>
        </div>

        <div className="bg-indigo-50 rounded-xl p-3 w-full">
            <p className="text-gray-700 font-medium text-sm leading-relaxed">
                "{data.message}"
            </p>
        </div>
      </div>
    </div>
  );
};

export default MotivationalCoach;