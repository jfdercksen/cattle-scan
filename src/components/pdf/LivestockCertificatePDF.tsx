import React from 'react';
import { Document, Page } from '@react-pdf/renderer';
import { styles } from './PDFStyles';
import { PDFHeader } from './PDFHeader';
import { PDFSellerSection } from './PDFSellerSection';
import { PDFLivestockSection } from './PDFLivestockSection';
import { PDFFarmSection } from './PDFFarmSection';
import { PDFMovementSection } from './PDFMovementSection';
import { PDFBiosecuritySection } from './PDFBiosecuritySection';
import { PDFVeterinarySection } from './PDFVeterinarySection';
import { PDFLoadMasterSection } from './PDFLoadMasterSection';
import { PDFSellerSignatureSection } from './PDFSellerSignatureSection';
import { PDFAttachmentsSection } from './PDFAttachmentsSection';
import { PDFFooter } from './PDFFooter';

export interface PDFData {
  company: {
    company_id?: string;
    logo_url?: string | null;
    registered_name: string;
    registration_number?: string | null;
    vat_number?: string | null;
    address: string;
    city: string;
    province: string;
    email: string;
    phone: string;
    disclaimer_text: string;
    disclaimer_text_af: string;
  };
  listing: {
    reference_id: string;
    created_at: string;
    status: string;
    owner_name: string;
    breed?: string | null;
    total_livestock_offered: number;
    number_of_males: number;
    number_of_heifers: number;
    males_castrated: boolean;
    weaned_duration?: string | null;
    growth_implant?: boolean | null;
    growth_implant_type?: string | null;
    gln_num?: string | null;
    gln_document_url?: string | null;
    additional_r25_per_head?: boolean | null;
    loading_points: LoadingPoint[];
    signature_data: string;
    signed_location: string;
    declaration_no_cloven_hooved_animals: boolean;
    declaration_livestock_kept_away: boolean;
    declaration_no_contact_with_non_resident_livestock: boolean;
    declaration_no_animal_origin_feed: boolean;
    declaration_veterinary_products_registered: boolean;
    declaration_no_foot_mouth_disease: boolean;
    declaration_never_vaccinated_against_fmd: boolean;
    declaration_no_foot_mouth_disease_farm: boolean;
    declaration_no_rift_valley_fever_10km_12_months: boolean;
    declaration_livestock_south_africa: boolean;
    declaration_no_gene_editing: boolean;
    number_cattle_loaded?: number | null;
    number_sheep_loaded?: number | null;
    truck_registration_number?: string | null;
  };
  seller: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
  };
  farm?: {
    name: string;
    address?: string;
    city: string;
    province: string;
    has_gln: boolean;
    gln_number?: string;
    gln_document_url?: string | null;
  };
  vet?: {
    first_name: string;
    last_name: string;
    email: string;
    registration_number?: string;
    practice_name?: string;
    signature_data?: string;
    inspection_date?: string;
  };
  loadMaster?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
  verificationUrl: string;
  generatedAt: string;
  documentId: string;
}

interface LoadingPoint {
  birth_address: { farm_name: string; district: string; province: string };
  current_address: { farm_name: string; district: string; province: string };
  loading_address: { farm_name: string; district: string; province: string };
  is_current_same_as_birth: boolean;
  is_loading_same_as_current: boolean;
  details: {
    livestock_type: string;
    breed: string;
    number_of_males: number;
    number_of_females: number;
  };
}

interface LivestockCertificatePDFProps {
  data: PDFData;
}

export const LivestockCertificatePDF: React.FC<LivestockCertificatePDFProps> = ({ data }) => {
  const totalPages = calculateTotalPages(data);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          company={data.company}
          referenceId={data.listing.reference_id}
          dateIssued={data.listing.created_at}
          verificationUrl={data.verificationUrl}
        />
        <PDFSellerSection seller={data.seller} listing={data.listing} />
        <PDFLivestockSection listing={data.listing} loadingPoints={data.listing.loading_points} />
        <PDFFooter company={data.company} pageNumber={1} totalPages={totalPages} />
      </Page>

      <Page size="A4" style={styles.page}>
        <PDFHeader company={data.company} referenceId={data.listing.reference_id} compact />
        <PDFFarmSection farm={data.farm} listing={data.listing} />
        <PDFMovementSection loadingPoints={data.listing.loading_points} />
        <PDFFooter company={data.company} pageNumber={2} totalPages={totalPages} />
      </Page>

      <Page size="A4" style={styles.page}>
        <PDFHeader company={data.company} referenceId={data.listing.reference_id} compact />
        <PDFBiosecuritySection listing={data.listing} />
        <PDFFooter company={data.company} pageNumber={3} totalPages={totalPages} />
      </Page>

      <Page size="A4" style={styles.page}>
        <PDFHeader company={data.company} referenceId={data.listing.reference_id} compact />
        <PDFVeterinarySection vet={data.vet} />
        <PDFLoadMasterSection loadMaster={data.loadMaster} listing={data.listing} />
        <PDFSellerSignatureSection
          listing={data.listing}
          generatedAt={data.generatedAt}
          documentId={data.documentId}
        />
        <PDFFooter company={data.company} pageNumber={4} totalPages={totalPages} showDisclaimer />
      </Page>

      {hasAttachments(data) && (
        <Page size="A4" style={styles.page}>
          <PDFHeader company={data.company} referenceId={data.listing.reference_id} compact />
          <PDFAttachmentsSection
            glnDocumentUrl={data.farm?.gln_document_url || data.listing.gln_document_url}
            previousOwnerDeclarationUrls={(() => {
              if (Array.isArray(data.listing.previous_owner_declaration_url)) {
                return data.listing.previous_owner_declaration_url as string[];
              }
              if (typeof data.listing.previous_owner_declaration_url === 'string') {
                try {
                  const parsed = JSON.parse(data.listing.previous_owner_declaration_url);
                  return Array.isArray(parsed) ? (parsed as string[]) : [];
                } catch {
                  return [];
                }
              }
              return [];
            })()}
          />
          <PDFFooter company={data.company} pageNumber={5} totalPages={totalPages} />
        </Page>
      )}
    </Document>
  );
};

const hasAttachments = (data: PDFData) =>
  Boolean(
    data.farm?.gln_document_url ||
      data.listing.gln_document_url ||
      (data.listing.previous_owner_declaration_url &&
        (Array.isArray(data.listing.previous_owner_declaration_url)
          ? data.listing.previous_owner_declaration_url.length > 0
          : String(data.listing.previous_owner_declaration_url).length > 0))
  );

const calculateTotalPages = (data: PDFData) => {
  let pages = 4;
  if (hasAttachments(data)) pages += 1;
  return pages;
};

export default LivestockCertificatePDF;

