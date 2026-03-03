import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface Address {
  farm_name?: string;
  district?: string;
  province?: string;
}

interface BiosecurityMovement {
  livestock_moved_out_of_boundaries?: boolean;
  livestock_moved_location?: Address;
  livestock_moved_location_to?: Address;
  livestock_moved_year?: number;
  livestock_moved_month?: number;
  livestock_moved_how?: string;
}

interface LoadingPoint {
  birth_address: Address;
  current_address: Address;
  loading_address: Address;
  is_current_same_as_birth: boolean;
  is_loading_same_as_current: boolean;
  biosecurity?: BiosecurityMovement;
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

  const biosecurity = point.biosecurity || {};
  const birth = formatAddress(point.birth_address);
  const current = point.is_current_same_as_birth ? labels.en.sameAsBirth : formatAddress(point.current_address);
  const loading = point.is_loading_same_as_current ? labels.en.sameAsCurrent : formatAddress(point.loading_address);
  const movedOut = biosecurity.livestock_moved_out_of_boundaries;
  const movedFrom = formatAddress(biosecurity.livestock_moved_location);
  const movedTo = formatAddress(biosecurity.livestock_moved_location_to);
  const movedWhen =
    biosecurity.livestock_moved_year || biosecurity.livestock_moved_month
      ? `${biosecurity.livestock_moved_month ?? ''}${biosecurity.livestock_moved_month ? '/' : ''}${biosecurity.livestock_moved_year ?? ''}`
      : labels.en.notApplicable;
  const movedHow = biosecurity.livestock_moved_how || labels.en.notApplicable;
  const yesNo = (value?: boolean) =>
    value === true ? labels.en.yes : value === false ? labels.en.no : labels.en.notApplicable;

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

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.movedOutOfBoundaries}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.movedOutOfBoundaries}</Text>
          </Text>
          <Text style={styles.tableValue}>{yesNo(movedOut)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.movedFromLabel}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.movedFromLabel}</Text>
          </Text>
          <Text style={styles.tableValue}>{movedFrom}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.movedToLabel}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.movedToLabel}</Text>
          </Text>
          <Text style={styles.tableValue}>{movedTo}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.movedWhenLabel}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.movedWhenLabel}</Text>
          </Text>
          <Text style={styles.tableValue}>{movedWhen}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>
            {labels.en.movedHowLabel}
            {'\n'}
            <Text style={styles.tableLabelBilingual}>{labels.af.movedHowLabel}</Text>
          </Text>
          <Text style={styles.tableValue}>{movedHow}</Text>
        </View>
      </View>
    </View>
  );
};

