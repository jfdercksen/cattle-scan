import { pdf } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';
import { LivestockCertificatePDF, type PDFData } from '@/components/pdf/LivestockCertificatePDF';

export async function generateAndStorePDF(listingIdOrReference: string): Promise<string> {
  const listingId = await resolveListingId(listingIdOrReference);
  const data = await fetchPDFData(listingId);

  const pdfBlob = await pdf(<LivestockCertificatePDF data={data} />).toBlob();

  const fileName = `${data.listing.reference_id}.pdf`;
  const companyFolder = data.listing.company_id ?? data.company.company_id ?? 'unknown-company';
  const filePath = `${companyFolder}/${data.listing.reference_id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('listing-pdfs')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('listing-pdfs').getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('livestock_listings')
    .update({
      pdf_url: urlData.publicUrl,
      pdf_generated_at: new Date().toISOString(),
    })
    .eq('id', listingId);

  if (updateError) throw updateError;

  return urlData.publicUrl;
}

export async function previewPDF(listingIdOrReference: string): Promise<Blob> {
  const data = await fetchPDFData(listingIdOrReference);
  return pdf(<LivestockCertificatePDF data={data} />).toBlob();
}

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

async function resolveListingId(listingIdOrReference: string): Promise<string> {
  if (isUuid(listingIdOrReference)) {
    return listingIdOrReference;
  }

  const { data, error } = await supabase
    .from('livestock_listings')
    .select('id')
    .eq('reference_id', listingIdOrReference)
    .single();

  if (error) throw error;
  return data.id;
}

async function fetchPDFData(listingIdOrReference: string): Promise<PDFData> {
  const listingId = await resolveListingId(listingIdOrReference);
  const { data: listing, error: listingError } = await supabase
    .from('livestock_listings')
    .select(`
      *,
      veterinary_declarations (*)
    `)
    .eq('id', listingId)
    .single();

  if (listingError) throw listingError;

  const { data: companySettings, error: companyError } = await supabase
    .from('company_settings')
    .select('*')
    .eq('company_id', listing.company_id)
    .single();

  if (companyError) throw companyError;

  let vetProfile = null;
  if (listing.assigned_vet_id) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', listing.assigned_vet_id)
      .single();
    vetProfile = data;
  }

  let loadMasterProfile = null;
  if (listing.assigned_load_master_id) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', listing.assigned_load_master_id)
      .single();
    loadMasterProfile = data;
  }

  const { data: sellerProfile, error: sellerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', listing.seller_id)
    .single();

  if (sellerError) throw sellerError;

  const normalizedLoadingPoints = normalizeLoadingPoints(listing.loading_points);
  const livestockTotals = extractLivestockTotals(normalizedLoadingPoints);
  const pdfData: PDFData = {
    company: {
      ...companySettings,
      company_id: listing.company_id,
    },
    listing: {
      ...listing,
      loading_points: normalizedLoadingPoints,
      total_livestock_offered: listing.total_livestock_offered || livestockTotals.total,
      number_of_males: listing.number_of_males || livestockTotals.totalMales,
      number_of_heifers: listing.number_of_heifers || livestockTotals.totalFemales,
      breed: listing.breed || livestockTotals.breed || null,
      males_castrated:
        listing.males_castrated !== null && listing.males_castrated !== undefined
          ? listing.males_castrated
          : livestockTotals.castrated,
    },
    seller: {
      ...sellerProfile,
      phone: sellerProfile.phone || (sellerProfile as any).phone_number || undefined,
      company_name:
        sellerProfile.company_name ||
        sellerProfile.seller_entity_name ||
        sellerProfile.entity_name ||
        undefined,
    },
    farm: extractFarmFromLoadingPoints(normalizedLoadingPoints),
    vet: vetProfile
      ? {
          first_name: vetProfile.first_name,
          last_name: vetProfile.last_name,
          email: vetProfile.email,
          registration_number: vetProfile.registration_number,
          practice_name: vetProfile.company_name || vetProfile.entity_name || undefined,
          signature_data: listing.veterinary_declarations?.[0]?.signature_data,
          inspection_date: listing.veterinary_declarations?.[0]?.created_at,
        }
      : undefined,
    loadMaster: loadMasterProfile
      ? {
          first_name: loadMasterProfile.first_name,
          last_name: loadMasterProfile.last_name,
          phone: loadMasterProfile.phone,
        }
      : undefined,
    verificationUrl: `${window.location.origin}/verify/${listing.reference_id}`,
    generatedAt: new Date().toISOString(),
    documentId: crypto.randomUUID(),
  };

  return pdfData;
}

function normalizeLoadingPoints(loadingPoints: unknown): any[] {
  if (!loadingPoints) return [];
  if (Array.isArray(loadingPoints)) return loadingPoints;
  if (typeof loadingPoints === 'string') {
    try {
      const parsed = JSON.parse(loadingPoints);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function extractLivestockTotals(loadingPoints: any[]) {
  let totalMales = 0;
  let totalFemales = 0;
  let breed = '';
  let castrated = false;

  loadingPoints.forEach((point) => {
    if (point?.details) {
      totalMales += Number(point.details.number_of_males || 0);
      totalFemales += Number(point.details.number_of_females || 0);

      if (!breed && point.details.breed) {
        breed = point.details.breed;
      }

      if (point.details.males_castrated) {
        castrated = true;
      }
    }
  });

  return {
    totalMales,
    totalFemales,
    total: totalMales + totalFemales,
    breed,
    castrated,
  };
}

function extractFarmFromLoadingPoints(loadingPoints: any[]): PDFData['farm'] {
  if (!loadingPoints || loadingPoints.length === 0) return undefined;
  const firstPoint = loadingPoints[0] ?? {};
  const current = firstPoint.current_address ?? {};
  const birth = firstPoint.birth_address ?? {};
  const loading = firstPoint.loading_address ?? {};
  const address = current.farm_name ? current : birth.farm_name ? birth : loading;

  return {
    name: address.farm_name,
    city: address.district,
    province: address.province,
    has_gln: firstPoint.selected_farm_has_gln || false,
    gln_number: firstPoint.selected_farm_gln_number,
    gln_document_url: firstPoint.selected_farm_gln_document_url,
  };
}

