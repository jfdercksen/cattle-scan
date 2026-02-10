import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFHeaderProps {
  company: {
    logo_url?: string | null;
    registered_name: string;
    registration_number?: string | null;
    vat_number?: string | null;
  };
  referenceId: string;
  dateIssued?: string;
  verificationUrl?: string;
  compact?: boolean;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({
  company,
  referenceId,
  dateIssued,
  compact = false,
}) => {
  return (
    <View>
      <View style={styles.header}>
        <View>
          {company.logo_url ? (
            <Image src={company.logo_url} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{company.registered_name}</Text>
          )}
          {!compact && (
            <Text style={{ fontSize: 8, color: '#718096', marginTop: 3 }}>
              Reg: {company.registration_number || 'N/A'} | VAT: {company.vat_number || 'N/A'}
            </Text>
          )}
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.headerTitle}>{labels.en.title}</Text>
          <Text style={styles.headerSubtitle}>{labels.af.title}</Text>
        </View>
      </View>

      {!compact && (
        <View style={styles.referenceBox}>
          <Text style={{ fontSize: 9, marginBottom: 3 }}>
            {labels.en.reference} / {labels.af.reference}
          </Text>
          <Text style={styles.referenceNumber}>{referenceId}</Text>
          {dateIssued && (
            <Text style={{ fontSize: 8, marginTop: 5 }}>
              {labels.en.dateIssued}: {new Date(dateIssued).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {compact && (
        <Text style={{ fontSize: 9, textAlign: 'right', marginTop: -10, marginBottom: 10 }}>
          Ref: {referenceId}
        </Text>
      )}
    </View>
  );
};

