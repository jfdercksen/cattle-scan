import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from '@/i18n/useTranslation';

interface YesNoSwitchProps {
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
  disabled?: boolean;
}

export const YesNoSwitch = (props: YesNoSwitchProps) => {
  const { t } = useTranslation();
  const { value, onChange, trueLabel, falseLabel, disabled = false } = props;
  const resolvedTrueLabel = trueLabel ?? t('common', 'yes');
  const resolvedFalseLabel = falseLabel ?? t('common', 'no');

  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        onClick={() => onChange(true)}
        disabled={disabled}
        className={cn(
          "px-4 py-1 text-sm",
          value === true
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        )}
      >
        {resolvedTrueLabel}
      </Button>
      <Button
        type="button"
        onClick={() => onChange(false)}
        disabled={disabled}
        className={cn(
          "px-4 py-1 text-sm",
          value === false
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        )}
      >
        {resolvedFalseLabel}
      </Button>
    </div>
  );
};
