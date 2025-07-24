/**
 * Debug component to show field visibility status
 * Only shown in development mode or for admin users
 */

import { defaultFieldVisibility, FormSection } from '@/lib/fieldVisibility';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FieldVisibilityDebugProps {
  show?: boolean;
}

export const FieldVisibilityDebug = ({ show = false }: FieldVisibilityDebugProps) => {
  if (!show && process.env.NODE_ENV === 'production') {
    return null;
  }

  const hiddenFields = defaultFieldVisibility.getHiddenFields();
  const isInitialLaunch = !defaultFieldVisibility.showAdvancedFields();

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-sm">Field Visibility Debug</CardTitle>
        <CardDescription className="text-xs">
          Development tool - shows which fields are currently hidden
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Mode:</span>
            <Badge variant={isInitialLaunch ? "destructive" : "default"}>
              {isInitialLaunch ? "Initial Launch" : "Full Features"}
            </Badge>
          </div>
          
          {hiddenFields.length > 0 && (
            <div>
              <span className="text-xs font-medium">Hidden Fields:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {hiddenFields.map((field) => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-600 mt-2">
            These fields remain in the database schema and can be re-enabled by updating the field visibility configuration.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};