import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './PDFStyles';

interface PDFFooterProps {
  company: {
    registered_name: string;
    address: string;
    city: string;
    province: string;
    email: string;
    phone: string;
    disclaimer_text: string;
    disclaimer_text_af: string;
  };
  pageNumber: number;
  totalPages: number;
  showDisclaimer?: boolean;
}

export const PDFFooter: React.FC<PDFFooterProps> = ({
  company,
  pageNumber,
  totalPages,
  showDisclaimer = false,
}) => {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {company.registered_name} | {company.address}, {company.city}, {company.province}
      </Text>
      <Text style={styles.footerText}>
        {company.email} | {company.phone}
      </Text>
      {showDisclaimer && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.footerDisclaimer}>{company.disclaimer_text}</Text>
          <Text style={[styles.footerDisclaimer, { marginTop: 3 }]}>{company.disclaimer_text_af}</Text>
        </View>
      )}
      <Text style={styles.pageNumber}>
        Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
};

