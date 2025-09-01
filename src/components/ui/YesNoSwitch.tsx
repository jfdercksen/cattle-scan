import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface YesNoSwitchProps {
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
}

export const YesNoSwitch = ({ value, onChange, trueLabel = 'Yes', falseLabel = 'No' }: YesNoSwitchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "px-4 py-1 text-sm",
          value === true
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        )}
      >
        {trueLabel}
      </Button>
      <Button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "px-4 py-1 text-sm",
          value === false
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        )}
      >
        {falseLabel}
      </Button>
    </div>
  );
};
