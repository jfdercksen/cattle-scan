import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFAttachmentsSectionProps {
  glnDocumentUrl?: string | null;
  affidavitUrl?: string | null;
  sellerIdUrl?: string | null;
  sellerBrandMarkUrl?: string | null;
  previousOwnerDeclarationUrls?: string[];
}

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp)$/i.test(url);

export const PDFAttachmentsSection: React.FC<PDFAttachmentsSectionProps> = ({
  glnDocumentUrl,
  affidavitUrl,
  sellerIdUrl,
  sellerBrandMarkUrl,
  previousOwnerDeclarationUrls = [],
}) => {
  const normalizedPreviousOwnerUrls = previousOwnerDeclarationUrls.filter(Boolean);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {labels.en.attachments}
        {'\n'}
        <Text style={styles.sectionTitleBilingual}>{labels.af.attachments}</Text>
      </Text>

      {glnDocumentUrl && (
        <View style={styles.attachmentContainer}>
          <Text style={styles.attachmentLabel}>{labels.en.glnDocument}</Text>
          {isImageUrl(glnDocumentUrl) ? (
            <Image src={glnDocumentUrl} style={styles.attachmentImage} />
          ) : (
            <Text style={styles.tableValue}>{glnDocumentUrl}</Text>
          )}
        </View>
      )}

      {sellerIdUrl && (
        <View style={styles.attachmentContainer}>
          <Text style={styles.attachmentLabel}>{labels.en.sellerIdDocument}</Text>
          {isImageUrl(sellerIdUrl) ? (
            <Image src={sellerIdUrl} style={styles.attachmentImage} />
          ) : (
            <Text style={styles.tableValue}>{sellerIdUrl}</Text>
          )}
        </View>
      )}

      {sellerBrandMarkUrl && (
        <View style={styles.attachmentContainer}>
          <Text style={styles.attachmentLabel}>{labels.en.sellerBrandMark}</Text>
          {isImageUrl(sellerBrandMarkUrl) ? (
            <Image src={sellerBrandMarkUrl} style={styles.attachmentImage} />
          ) : (
            <Text style={styles.tableValue}>{sellerBrandMarkUrl}</Text>
          )}
        </View>
      )}

      {affidavitUrl && (
        <View style={styles.attachmentContainer}>
          <Text style={styles.attachmentLabel}>{labels.en.affidavit}</Text>
          {isImageUrl(affidavitUrl) ? (
            <Image src={affidavitUrl} style={styles.attachmentImage} />
          ) : (
            <Text style={styles.tableValue}>{affidavitUrl}</Text>
          )}
        </View>
      )}

      {normalizedPreviousOwnerUrls.map((url, index) => (
        <View key={`${url}-${index}`} style={styles.attachmentContainer}>
          <Text style={styles.attachmentLabel}>{labels.en.previousOwnerDeclaration}</Text>
          {isImageUrl(url) ? (
            <Image src={url} style={styles.attachmentImage} />
          ) : (
            <Text style={styles.tableValue}>{url}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

