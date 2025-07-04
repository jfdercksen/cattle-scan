import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface YesNoSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const YesNoSwitch = ({ value, onChange }: YesNoSwitchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "px-4 py-1 text-sm",
          value
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        )}
      >
        Yes
      </Button>
      <Button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "px-4 py-1 text-sm",
          !value
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        )}
      >
        No
      </Button>
    </div>
  );
};
