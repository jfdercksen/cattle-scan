import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFSellerSectionProps {
  seller: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
  };
  listing: {
    owner_name: string;
  };
}

export const PDFSellerSection: React.FC<PDFSellerSectionProps> = ({ seller, listing }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.sellerInfo}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.sellerInfo}</Text>
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.ownerName}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.ownerName}</Text>
          </Text>
          <Text style={styles.tableValue}>{listing.owner_name}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.company}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.company}</Text>
          </Text>
          <Text style={styles.tableValue}>{seller.company_name || 'N/A'}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.email}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.email}</Text>
          </Text>
          <Text style={styles.tableValue}>{seller.email}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.phone}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.phone}</Text>
          </Text>
          <Text style={styles.tableValue}>{seller.phone || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
};

