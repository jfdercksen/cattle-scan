import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFLoadMasterSectionProps {
  loadMaster?: {
    first_name: string;
    last_name: string;
    phone?: string;
  };
  listing: {
    number_cattle_loaded?: number | null;
    number_sheep_loaded?: number | null;
    truck_registration_number?: string | null;
  };
}

export const PDFLoadMasterSection: React.FC<PDFLoadMasterSectionProps> = ({ loadMaster, listing }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.loadMaster}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.loadMaster}</Text>
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.loadMasterName}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.loadMasterName}</Text>
          </Text>
          <Text style={styles.tableValue}>
            {loadMaster ? `${loadMaster.first_name} ${loadMaster.last_name}` : labels.en.notApplicable}
          </Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.truckReg}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.truckReg}</Text>
          </Text>
          <Text style={styles.tableValue}>{listing.truck_registration_number || labels.en.notApplicable}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.cattleLoaded}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.cattleLoaded}</Text>
          </Text>
          <Text style={styles.tableValue}>{listing.number_cattle_loaded ?? 0}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.sheepLoaded}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.sheepLoaded}</Text>
          </Text>
          <Text style={styles.tableValue}>{listing.number_sheep_loaded ?? 0}</Text>
        </View>
      </View>
    </View>
  );
};

