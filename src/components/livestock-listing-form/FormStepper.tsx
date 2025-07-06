import { Button } from '@/components/ui/button';

interface FormStepperProps {
  steps: { title: string }[];
  currentStep: number;
  goToStep: (step: number) => void;
}

export const FormStepper = ({ steps, currentStep, goToStep }: FormStepperProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <Button
          key={index}
          variant={currentStep === index ? 'default' : 'outline'}
          type="button"
          onClick={() => goToStep(index)}
          className="whitespace-nowrap"
        >
          {step.title}
        </Button>
      ))}
    </div>
  );
};
