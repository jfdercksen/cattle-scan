import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFLivestockSectionProps {
  listing: {
    breed?: string | null;
    total_livestock_offered?: number | null;
    number_of_males?: number | null;
    number_of_heifers?: number | null;
    males_castrated?: boolean | null;
    weaned_duration?: string | null;
    growth_implant?: boolean | null;
    growth_implant_type?: string | null;
  };
  loadingPoints?: Array<{
    details?: {
      breed?: string | null;
      number_of_males?: number | null;
      number_of_females?: number | null;
      males_castrated?: boolean | null;
    } | null;
  }>;
}

export const PDFLivestockSection: React.FC<PDFLivestockSectionProps> = ({ listing, loadingPoints }) => {
  const firstDetails = loadingPoints?.[0]?.details || {};
  const breed = listing.breed || firstDetails.breed || labels.en.notApplicable;
  const males = listing.number_of_males ?? firstDetails.number_of_males ?? 0;
  const females = listing.number_of_heifers ?? firstDetails.number_of_females ?? 0;
  const castrated = listing.males_castrated ?? firstDetails.males_castrated ?? false;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.livestockDetails}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.livestockDetails}</Text>
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.breed}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.breed}</Text>
          </Text>
          <Text style={styles.tableValue}>{breed}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.totalOffered}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.totalOffered}</Text>
          </Text>
          <Text style={styles.tableValue}>{listing.total_livestock_offered ?? 0}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.males}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.males}</Text>
          </Text>
          <Text style={styles.tableValue}>{males}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.females}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.females}</Text>
          </Text>
          <Text style={styles.tableValue}>{females}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.castrated}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.castrated}</Text>
          </Text>
          <Text style={styles.tableValue}>
            {castrated ? labels.en.yes : labels.en.no}
          </Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.weanedDuration}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.weanedDuration}</Text>
          </Text>
          <Text style={styles.tableValue}>{listing.weaned_duration || labels.en.notApplicable}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.growthImplant}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.growthImplant}</Text>
          </Text>
          <Text style={styles.tableValue}>
            {listing.growth_implant ? labels.en.yes : labels.en.no}
            {listing.growth_implant_type ? ` (${listing.growth_implant_type})` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
};

