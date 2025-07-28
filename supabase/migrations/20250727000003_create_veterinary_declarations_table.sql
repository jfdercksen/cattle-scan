-- Create veterinary_declarations table
-- This table stores veterinary health declarations for livestock listings

CREATE TABLE public.veterinary_declarations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_id TEXT NOT NULL,
    veterinarian_name TEXT NOT NULL,
    veterinarian_registration_number TEXT NOT NULL,
    owner_of_livestock TEXT NOT NULL,
    farm_address TEXT NOT NULL,
    farm_name TEXT,
    farm_district TEXT,
    farm_province TEXT,
    cattle_visually_inspected BOOLEAN,
    cattle_mouthed BOOLEAN,
    sheep_visually_inspected BOOLEAN,
    sheep_mouthed BOOLEAN,
    foot_and_mouth_symptoms BOOLEAN,
    lumpy_skin_disease_symptoms BOOLEAN,
    foot_and_mouth_case_in_10km BOOLEAN,
    rift_valley_fever_case_in_10km BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to reference_id in livestock_listings if it doesn't exist
ALTER TABLE public.livestock_listings 
ADD CONSTRAINT unique_livestock_listings_reference_id 
UNIQUE (reference_id);

-- Add foreign key constraint to link with livestock listings
ALTER TABLE public.veterinary_declarations 
ADD CONSTRAINT fk_veterinary_declarations_reference_id 
FOREIGN KEY (reference_id) REFERENCES public.livestock_listings(reference_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_veterinary_declarations_reference_id 
ON public.veterinary_declarations(reference_id);

-- Enable Row Level Security
ALTER TABLE public.veterinary_declarations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Veterinarians can view and insert their own declarations
CREATE POLICY "Veterinarians can view their own declarations" 
  ON public.veterinary_declarations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'vet' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Veterinarians can create declarations" 
  ON public.veterinary_declarations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'vet' 
      AND status = 'approved'
    )
  );

-- Admins can view all declarations
CREATE POLICY "Admins can view all declarations" 
  ON public.veterinary_declarations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND status = 'approved'
    )
  );

-- Load Masters can view declarations for their assigned listings
CREATE POLICY "Load Masters can view declarations for assigned listings" 
  ON public.veterinary_declarations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.livestock_listings ll ON ll.assigned_load_master_id = p.id
      WHERE p.id = auth.uid() 
      AND p.role = 'load_master' 
      AND p.status = 'approved'
      AND ll.reference_id = veterinary_declarations.reference_id
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.veterinary_declarations IS 'Veterinary health declarations for livestock listings';
COMMENT ON COLUMN public.veterinary_declarations.reference_id IS 'Reference ID linking to the livestock listing';
COMMENT ON COLUMN public.veterinary_declarations.veterinarian_name IS 'Name of the veterinarian making the declaration';
COMMENT ON COLUMN public.veterinary_declarations.veterinarian_registration_number IS 'Professional registration number of the veterinarian';
COMMENT ON COLUMN public.veterinary_declarations.owner_of_livestock IS 'Name of the livestock owner';
COMMENT ON COLUMN public.veterinary_declarations.farm_address IS 'Address of the farm where livestock is located';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_veterinary_declarations_updated_at 
    BEFORE UPDATE ON public.veterinary_declarations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();