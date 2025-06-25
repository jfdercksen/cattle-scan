
-- Create livestock_listings table based on the form requirements
CREATE TABLE public.livestock_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users NOT NULL,
  owner_name TEXT NOT NULL,
  bred_or_bought TEXT NOT NULL CHECK (bred_or_bought IN ('BRED', 'BOUGHT IN')),
  location TEXT NOT NULL,
  weighing_location TEXT NOT NULL,
  loading_points_1 INTEGER DEFAULT 0,
  loading_points_2 INTEGER DEFAULT 0,
  loading_points_3 INTEGER DEFAULT 0,
  loading_points_4 INTEGER DEFAULT 0,
  loading_points_5 INTEGER DEFAULT 0,
  livestock_at_loading_point_1 INTEGER DEFAULT 0,
  livestock_at_loading_point_2 INTEGER DEFAULT 0,
  livestock_at_loading_point_3 INTEGER DEFAULT 0,
  livestock_at_loading_point_4 INTEGER DEFAULT 0,
  livestock_at_loading_point_5 INTEGER DEFAULT 0,
  total_livestock_offered INTEGER NOT NULL,
  number_of_heifers INTEGER DEFAULT 0,
  males_castrated BOOLEAN DEFAULT false,
  mothers_status TEXT CHECK (mothers_status IN ('WITH MOTHERS', 'ALREADY WEANED')),
  weaned_duration TEXT,
  grazing_green_feed BOOLEAN DEFAULT false,
  growth_implant BOOLEAN DEFAULT false,
  growth_implant_type TEXT,
  estimated_average_weight INTEGER,
  breed TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.livestock_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for livestock_listings
CREATE POLICY "Sellers can view their own listings" 
  ON public.livestock_listings 
  FOR SELECT 
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create their own listings" 
  ON public.livestock_listings 
  FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings" 
  ON public.livestock_listings 
  FOR UPDATE 
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all listings" 
  ON public.livestock_listings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can update all listings" 
  ON public.livestock_listings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin') 
      AND status = 'approved'
    )
  );
