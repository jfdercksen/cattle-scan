import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFSellerSignatureSectionProps {
  listing: {
    signature_data: string;
    signed_location: string;
  };
  generatedAt: string;
  documentId: string;
}

export const PDFSellerSignatureSection: React.FC<PDFSellerSignatureSectionProps> = ({
  listing,
  generatedAt,
  documentId,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.sellerSignature}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.sellerSignature}</Text>
      </Text>
      <Text style={{ fontSize: 9, marginBottom: 10 }}>{labels.en.sellerDeclarationText}</Text>
      <View style={styles.signatureBox}>
        {listing.signature_data && (
          <Image src={listing.signature_data} style={styles.signatureImage} />
        )}
        <Text style={styles.signatureLabel}>
          {labels.en.signedAt}: {listing.signed_location || labels.en.notApplicable}
        </Text>
        <Text style={styles.signatureLabel}>
          {labels.en.signedDate}: {new Date(generatedAt).toLocaleDateString()}
        </Text>
        <Text style={styles.signatureLabel}>
          {labels.en.documentId}: {documentId}
        </Text>
      </View>
    </View>
  );
};

