import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { styles, labels } from './PDFStyles';

interface PDFAttachmentsSectionProps {
  glnDocumentUrl?: string | null;
  affidavitUrl?: string | null;
}

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp)$/i.test(url);

export const PDFAttachmentsSection: React.FC<PDFAttachmentsSectionProps> = ({
  glnDocumentUrl,
  affidavitUrl,
}) => {
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
    </View>
  );
};

