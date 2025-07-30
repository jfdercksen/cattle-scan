
-- Create offers table to store livestock offers from admins
CREATE TABLE public.livestock_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.livestock_listings(id) ON DELETE CASCADE,
  created_by UUID NOT NULL, -- admin who created the offer
  chalmar_beef_offer DECIMAL(10,2) NOT NULL,
  to_weight INTEGER NOT NULL,
  then_penilazation_of DECIMAL(10,2) NOT NULL,
  and_from INTEGER NOT NULL,
  penilazation_of DECIMAL(10,2) NOT NULL,
  percent_heifers_allowed INTEGER NOT NULL,
  penilazation_for_additional_heifers DECIMAL(10,2) NOT NULL,
  offer_valid_until_date DATE NOT NULL,
  offer_valid_until_time TIME NOT NULL,
  additional_r25_per_calf BOOLEAN DEFAULT FALSE,
  affidavit_required BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  seller_response_date TIMESTAMP WITH TIME ZONE,
  seller_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.livestock_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for livestock_offers
-- Admins can create and view all offers
CREATE POLICY "Admins can create offers"
  ON public.livestock_offers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins can view all offers"
  ON public.livestock_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND status = 'approved'
    )
  );

-- Sellers can view offers for their listings
CREATE POLICY "Sellers can view their offers"
  ON public.livestock_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.livestock_listings ll
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE ll.id = livestock_offers.listing_id
      AND ll.seller_id = auth.uid()
      AND p.role = 'seller'
      AND p.status = 'approved'
    )
  );

-- Sellers can update offers for their listings (to accept/decline)
CREATE POLICY "Sellers can update their offers"
  ON public.livestock_offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.livestock_listings ll
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE ll.id = livestock_offers.listing_id
      AND ll.seller_id = auth.uid()
      AND p.role = 'seller'
      AND p.status = 'approved'
    )
  );
