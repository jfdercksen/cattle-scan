import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface FormStepperProps {
  steps: { title: string }[];
  currentStep: number;
  goToStep: (step: number) => void;
}

export const FormStepper = ({ steps, currentStep, goToStep }: FormStepperProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Desktop: Horizontal tabs */}
      <div className="hidden md:flex items-center justify-center space-x-2 mb-8 flex-wrap gap-2">
        {steps.map((step, index) => (
          <Button
            key={index}
            variant={currentStep === index ? 'default' : 'outline'}
            type="button"
            onClick={() => goToStep(index)}
            className="whitespace-nowrap text-xs px-3 py-2"
            size="sm"
          >
            {step.title}
          </Button>
        ))}
      </div>

      {/* Mobile: Current step indicator with navigation */}
      <div className="md:hidden mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => goToStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('formStepper', 'prevButton')}
          </Button>
          
          <div className="text-center">
            <div className="text-sm font-medium">
              {t('formStepper', 'stepIndicator')
                .replace('{current}', String(currentStep + 1))
                .replace('{total}', String(steps.length))}
            </div>
            <div className="text-xs text-muted-foreground">
              {steps[currentStep].title}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => goToStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-1"
          >
            {t('formStepper', 'nextButton')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
};
