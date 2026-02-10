import React from 'react';
import { View, Text, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { labels } from './PDFStyles';

const styles = StyleSheet.create({
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
    backgroundColor: '#f7fafc',
    padding: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1a365d',
  },
  sectionTitleAf: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#4a5568',
  },
  declarationList: {
    paddingHorizontal: 5,
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'flex-start',
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkYesBg: {
    backgroundColor: '#38a169',
  },
  checkNoBg: {
    backgroundColor: '#e53e3e',
  },
  checkText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  declarationTextContainer: {
    flex: 1,
  },
  declarationTextEn: {
    fontSize: 9,
    color: '#2d3748',
    lineHeight: 1.4,
    marginBottom: 2,
  },
  declarationTextAf: {
    fontSize: 8,
    color: '#718096',
    fontStyle: 'italic',
    lineHeight: 1.3,
  },
});

const declarations = [
  {
    key: 'declaration_no_cloven_hooved_animals',
    en: 'No cloven-hoofed animals other than cattle, sheep, or goats have been on the farm in the last 12 months.',
    af: 'Geen kloofhoewige diere behalwe beeste, skape of bokke was die afgelope 12 maande op die plaas nie.',
  },
  {
    key: 'declaration_livestock_kept_away',
    en: 'Livestock has been kept away from any quarantine areas.',
    af: 'Vee is weggehou van enige kwarantyngebiede.',
  },
  {
    key: 'declaration_no_contact_with_non_resident_livestock',
    en: 'No contact with non-resident livestock in the last 28 days.',
    af: 'Geen kontak met nie-inwonende vee in die afgelope 28 dae nie.',
  },
  {
    key: 'declaration_no_animal_origin_feed',
    en: 'No animal origin feed has been given to livestock.',
    af: 'Geen voer van dierlike oorsprong is aan vee gegee nie.',
  },
  {
    key: 'declaration_veterinary_products_registered',
    en: 'All veterinary products used are registered and approved.',
    af: 'Alle veeartsenyprodukte gebruik is geregistreer en goedgekeur.',
  },
  {
    key: 'declaration_no_foot_mouth_disease',
    en: 'No Foot and Mouth Disease (FMD) in the herd.',
    af: 'Geen Bek-en-Klouseer (BKS) in die kudde nie.',
  },
  {
    key: 'declaration_never_vaccinated_against_fmd',
    en: 'Livestock has never been vaccinated against FMD.',
    af: 'Vee is nog nooit teen BKS ingeënt nie.',
  },
  {
    key: 'declaration_no_foot_mouth_disease_farm',
    en: 'No FMD on the farm or within 10km in the last 12 months.',
    af: 'Geen BKS op die plaas of binne 10km in die afgelope 12 maande nie.',
  },
  {
    key: 'declaration_no_rift_valley_fever_10km_12_months',
    en: 'No Rift Valley Fever within 10km in the last 12 months.',
    af: 'Geen Riftvallei-koors binne 10km in die afgelope 12 maande nie.',
  },
  {
    key: 'declaration_livestock_south_africa',
    en: 'Livestock was born and raised in South Africa.',
    af: 'Vee is in Suid-Afrika gebore en grootgemaak.',
  },
  {
    key: 'declaration_no_gene_editing',
    en: 'No gene editing or genetic modification has been done.',
    af: 'Geen geenredigering of genetiese modifikasie is gedoen nie.',
  },
];

interface PDFBiosecuritySectionProps {
  listing: Record<string, any>;
}

export const PDFBiosecuritySection: React.FC<PDFBiosecuritySectionProps> = ({ listing }) => {
  const isAccepted = (value: unknown) => value === true || value === 'true' || value === 1;

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <Text>{labels.en.biosecurity}</Text>
        <Text style={styles.sectionTitleAf}>{labels.af.biosecurity}</Text>
      </View>
      <View style={styles.declarationList}>
        {declarations.map((decl) => {
          const value = listing[decl.key];
          const isTrue = isAccepted(value);
          return (
            <View key={decl.key} style={styles.declarationItem}>
              <View style={[styles.checkIconContainer, isTrue ? styles.checkYesBg : styles.checkNoBg]}>
                {isTrue ? <CheckmarkIcon /> : <XIcon />}
              </View>
              <View style={styles.declarationTextContainer}>
                <Text style={styles.declarationTextEn}>{decl.en}</Text>
                <Text style={styles.declarationTextAf}>{decl.af}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default PDFBiosecuritySection;

const CheckmarkIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24">
    <Path
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
      fill="#ffffff"
    />
  </Svg>
);

const XIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      fill="#ffffff"
    />
  </Svg>
);

