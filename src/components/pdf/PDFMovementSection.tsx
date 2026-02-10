import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface Address {
  farm_name?: string;
  district?: string;
  province?: string;
}

interface LoadingPoint {
  birth_address: Address;
  current_address: Address;
  loading_address: Address;
  is_current_same_as_birth: boolean;
  is_loading_same_as_current: boolean;
}

interface PDFMovementSectionProps {
  loadingPoints: LoadingPoint[];
}

const formatAddress = (addr?: Address) => {
  if (!addr) return labels.en.notApplicable;
  return [addr.farm_name, addr.district, addr.province].filter(Boolean).join(', ') || labels.en.notApplicable;
};

export const PDFMovementSection: React.FC<PDFMovementSectionProps> = ({ loadingPoints }) => {
  const point = loadingPoints?.[0];
  if (!point) return null;

  const birth = formatAddress(point.birth_address);
  const current = point.is_current_same_as_birth ? labels.en.sameAsBirth : formatAddress(point.current_address);
  const loading = point.is_loading_same_as_current ? labels.en.sameAsCurrent : formatAddress(point.loading_address);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.movementTracker}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.movementTracker}</Text>
      </Text>
      <View style={styles.movementFlow}>
        <View style={styles.movementBox}>
          <Text style={styles.movementLabel}>{labels.en.birthAddress}</Text>
          <Text style={styles.movementValue}>{birth}</Text>
        </View>
        <Text style={styles.movementArrow}>→</Text>
        <View style={styles.movementBox}>
          <Text style={styles.movementLabel}>{labels.en.currentAddress}</Text>
          <Text style={styles.movementValue}>{current}</Text>
        </View>
        <Text style={styles.movementArrow}>→</Text>
        <View style={styles.movementBox}>
          <Text style={styles.movementLabel}>{labels.en.loadingAddress}</Text>
          <Text style={styles.movementValue}>{loading}</Text>
        </View>
      </View>
    </View>
  );
};

