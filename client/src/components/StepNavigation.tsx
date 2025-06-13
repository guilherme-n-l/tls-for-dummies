import React from 'react';
import { motion } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number) => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isAccessible = step.id <= currentStep || isCompleted;
        
        return (
          <motion.div
            key={step.id}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute top-6 left-full w-8 h-0.5 bg-white/30 hidden md:block">
                <motion.div
                  className="h-full bg-green-400"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: completedSteps.includes(step.id) ? 1 : 0 
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            )}
            
            {/* Step Circle */}
            <motion.button
              onClick={() => isAccessible && onStepClick(step.id)}
              disabled={!isAccessible}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300 group
                ${isCompleted 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white shadow-lg animate-pulse' 
                    : isAccessible
                      ? 'bg-white/20 text-white hover:bg-white/30' 
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                }
              `}
              whileHover={isAccessible ? { scale: 1.1 } : {}}
              whileTap={isAccessible ? { scale: 0.95 } : {}}
            >
              {isCompleted ? (
                <Check className="w-6 h-6" />
              ) : (
                <step.icon className="w-6 h-6" />
              )}
              
              {/* Current step indicator */}
              {isCurrent && (
                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.button>
            
            {/* Step Info */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center min-w-max">
              <p className={`text-sm font-medium ${
                isCurrent ? 'text-white' : 'text-blue-100'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-blue-200 max-w-32 mx-auto">
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StepNavigation; 