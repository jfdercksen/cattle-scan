import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFVeterinarySectionProps {
  vet?: {
    first_name: string;
    last_name: string;
    email: string;
    registration_number?: string;
    practice_name?: string;
    signature_data?: string;
    inspection_date?: string;
  };
}

export const PDFVeterinarySection: React.FC<PDFVeterinarySectionProps> = ({ vet }) => {
  if (!vet) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {labels.en.vetDeclaration}
          {'\n'}
          <Text style={styles.sectionTitleBilingual}>{labels.af.vetDeclaration}</Text>
        </Text>
        <Text>{labels.en.notApplicable}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.vetDeclaration}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.vetDeclaration}</Text>
      </Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.vetName}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.vetName}</Text>
          </Text>
          <Text style={styles.tableValue}>
            {vet.first_name} {vet.last_name}
          </Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.savcNumber}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.savcNumber}</Text>
          </Text>
          <Text style={styles.tableValue}>{vet.registration_number || labels.en.notApplicable}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.practiceName}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.practiceName}</Text>
          </Text>
          <Text style={styles.tableValue}>{vet.practice_name || labels.en.notApplicable}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <Text style={styles.tableLabel}>
            {labels.en.inspectionDate}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.inspectionDate}</Text>
          </Text>
          <Text style={styles.tableValue}>
            {vet.inspection_date ? new Date(vet.inspection_date).toLocaleDateString() : labels.en.notApplicable}
          </Text>
        </View>
      </View>
      {vet.signature_data && (
        <View style={styles.signatureBox}>
          <Image src={vet.signature_data} style={styles.signatureImage} />
          <Text style={styles.signatureLabel}>{labels.en.vetSignature}</Text>
        </View>
      )}
    </View>
  );
};

