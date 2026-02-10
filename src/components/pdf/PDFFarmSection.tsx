import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFFarmSectionProps {
  farm?: {
    name?: string;
    city?: string;
    province?: string;
    has_gln?: boolean;
    gln_number?: string | null;
  };
  listing: {
    gln_num?: string | null;
    additional_r25_per_head?: boolean | null;
  };
}

export const PDFFarmSection: React.FC<PDFFarmSectionProps> = ({ farm, listing }) => {
  const glnNumber = farm?.gln_number || listing.gln_num || labels.en.notApplicable;
  const glnQualified = listing.additional_r25_per_head ? labels.en.yes : labels.en.no;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.farmInfo}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.farmInfo}</Text>
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.farmName}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.farmName}</Text>
          </Text>
          <Text style={styles.tableValue}>{farm?.name || labels.en.notApplicable}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.district}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.district}</Text>
          </Text>
          <Text style={styles.tableValue}>{farm?.city || labels.en.notApplicable}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.province}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.province}</Text>
          </Text>
          <Text style={styles.tableValue}>{farm?.province || labels.en.notApplicable}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.glnNumber}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.glnNumber}</Text>
          </Text>
          <Text style={styles.tableValue}>{glnNumber}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.glnQualified}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.glnQualified}</Text>
          </Text>
          <Text style={styles.tableValue}>{glnQualified}</Text>
        </View>
      </View>
    </View>
  );
};

