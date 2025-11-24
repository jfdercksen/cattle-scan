export type SupportedLanguage = 'en' | 'af';

type TranslationEntry = Record<SupportedLanguage, string>;
type AdminDashboardStatus = 'approved' | 'pending' | 'suspended' | 'rejected';

const translationsData = {
  common: {
    language: {
      en: 'Language',
      af: 'Taal',
    },
    signIn: {
      en: 'Sign In',
      af: 'Teken In',
    },
    signOut: {
      en: 'Sign Out',
      af: 'Teken Uit',
    },
    backToHome: {
      en: 'Back to Home',
      af: 'Terug na Tuis',
    },
    cancel: {
      en: 'Cancel',
      af: 'Kanselleer',
    },
    close: {
      en: 'Close',
      af: 'Maak toe',
    },
    yes: {
      en: 'Yes',
      af: 'Ja',
    },
    no: {
      en: 'No',
      af: 'Nee',
    },
    submit: {
      en: 'Submit',
      af: 'Indien',
    },
    loading: {
      en: 'Loading...',
      af: 'Laai...',
    },
    success: {
      en: 'Success',
      af: 'Sukses',
    },
    error: {
      en: 'Error',
      af: 'Fout',
    },
    successTitle: {
      en: 'Success',
      af: 'Sukses',
    },
    errorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    email: {
      en: 'Email',
      af: 'E-pos',
    },
    password: {
      en: 'Password',
      af: 'Wagwoord',
    },
    confirmPassword: {
      en: 'Confirm Password',
      af: 'Bevestig Wagwoord',
    },
    firstName: {
      en: 'First Name',
      af: 'Voornaam',
    },
    lastName: {
      en: 'Last Name',
      af: 'Van',
    },
    phoneNumber: {
      en: 'Phone Number',
      af: 'Telefoonnommer',
    },
    companyName: {
      en: 'Company Name',
      af: 'Maatskappy Naam',
    },
    sending: {
      en: 'Sending...',
      af: 'Stuur...',
    },
    signingIn: {
      en: 'Signing In...',
      af: 'Teken in...',
    },
    saving: {
      en: 'Saving...',
      af: 'Stoor...',
    },
    sendingInvitation: {
      en: 'Sending Invitation...',
      af: 'Stuur Uitnodiging...',
    },
    sendInvitation: {
      en: 'Send Invitation',
      af: 'Stuur Uitnodiging',
    },
    inviteUser: {
      en: 'Invite User',
      af: 'Nooi Gebruiker',
    },
    cancelInvitation: {
      en: 'Cancel',
      af: 'Kanselleer',
    },
    notAvailable: {
      en: 'N/A',
      af: 'NVT',
    },
  },
  livestockDetailsSection: {
    basicInformationHeading: {
      en: 'Basic Information',
      af: 'Basiese inligting',
    },
    livestockTypeLabel: {
      en: 'Livestock type',
      af: 'Soort vee',
    },
    livestockTypePlaceholder: {
      en: 'Select a livestock type',
      af: 'Kies ’n veesoort',
    },
    livestockTypeOptionCattleAndSheep: {
      en: 'Cattle and Sheep',
      af: 'Beeste en skape',
    },
    livestockTypeOptionCattle: {
      en: 'Cattle',
      af: 'Beeste',
    },
    livestockTypeOptionSheep: {
      en: 'Sheep',
      af: 'Skape',
    },
    livestockTypeIndicator: {
      en: 'Form fields will be shown based on your livestock type selection',
      af: 'Vormvelde word vertoon volgens jou keuse van veesoort',
    },
    livestockTypeTotals: {
      en: 'Current totals from loading points: {cattle} cattle, {sheep} sheep',
      af: 'Huidige totalen van laaipunte: {cattle} beeste, {sheep} skape',
    },
    bredOrBoughtLabel: {
      en: 'Did the owner breed or buy in the livestock?',
      af: 'Het die eienaar die vee geteel of aangekoop?',
    },
    bredOption: {
      en: 'Bred',
      af: 'Geteel',
    },
    boughtOption: {
      en: 'Bought in',
      af: 'Aangekoop',
    },
    weighingQuestion: {
      en: 'Where is the livestock going to be weighed?',
      af: 'Waar gaan die vee geweeg word?',
    },
    farmNameLabel: {
      en: 'Farm Name',
      af: 'Plaasnaam',
    },
    farmNamePlaceholder: {
      en: 'Enter farm name',
      af: 'Voer plaasnaam in',
    },
    districtLabel: {
      en: 'District',
      af: 'Distrik',
    },
    districtPlaceholder: {
      en: 'Enter district',
      af: 'Voer distrik in',
    },
    provinceLabel: {
      en: 'Province',
      af: 'Provinsie',
    },
    provincePlaceholder: {
      en: 'Enter province',
      af: 'Voer provinsie in',
    },
    breedQuestion: {
      en: 'Breed of the livestock?',
      af: 'Ras van die vee?',
    },
    breedPlaceholder: {
      en: 'Enter breed',
      af: 'Voer ras in',
    },
    estimatedWeightQuestion: {
      en: 'Estimated current average weight of the livestock?',
      af: 'Geskatte huidige gemiddelde gewig van die vee?',
    },
    livestockDetailsHeading: {
      en: 'Livestock Details',
      af: 'Veebesonderhede',
    },
    totalLivestockLabel: {
      en: 'Number of livestock offered',
      af: 'Aantal vee aangebied',
    },
    heifersLabel: {
      en: 'Number of heifers',
      af: 'Aantal verse',
    },
    castratedQuestion: {
      en: 'Have the males been castrated?',
      af: 'Is die bulle gekastreer?',
    },
    mothersStatusQuestion: {
      en: 'Is the livestock with their mothers or have they been weaned?',
      af: 'Is die vee by hul moeders of reeds gespeen?',
    },
    withMothersOption: {
      en: 'With mothers',
      af: 'By moeders',
    },
    alreadyWeanedOption: {
      en: 'Already weaned',
      af: 'Reeds gespeen',
    },
    weanedDurationQuestion: {
      en: 'If already weaned for how long?',
      af: 'Indien reeds gespeen, vir hoe lank?',
    },
    weanedDurationPlaceholder: {
      en: 'Enter weaned duration',
      af: 'Voer speentyd in',
    },
    grazingQuestion: {
      en: 'Is the livestock grazing green feed?',
      af: 'Graas die vee groen voer?',
    },
    growthImplantQuestion: {
      en: 'Did the livestock receive a growth implant?',
      af: 'Het die vee ’n groeimplant ontvang?',
    },
    growthImplantTypeQuestion: {
      en: 'If yes which one?',
      af: 'Indien wel, watter een?',
    },
    growthImplantTypePlaceholder: {
      en: 'Enter growth implant type',
      af: 'Voer groeimplanttipe in',
    },
  },
  loadingPointsSection: {
    heading: {
      en: 'Livestock Location & Loading Points',
      af: 'Vee-ligging en laaipunte',
    },
    herdTitle: {
      en: 'Herd {index}',
      af: 'Kudde {index}',
    },
    copyFromAbove: {
      en: 'Complete From Above',
      af: 'Voltooi vanaf bo',
    },
    herdDetailsHeading: {
      en: 'Herd Livestock Details',
      af: 'Kudde-veebesonderhede',
    },
    herdLivestockTypeLabel: {
      en: 'Herd livestock type',
      af: 'Soort vee in die kudde',
    },
    herdLivestockTypeOptionCattle: {
      en: 'Cattle',
      af: 'Beeste',
    },
    herdLivestockTypeOptionSheep: {
      en: 'Sheep',
      af: 'Skape',
    },
    bredOrBoughtLabel: {
      en: 'Did you breed or buy in?',
      af: 'Het jy self geteel of aangekoop?',
    },
    bredOption: {
      en: 'Bred',
      af: 'Geteel',
    },
    boughtOption: {
      en: 'Bought in',
      af: 'Aangekoop',
    },
    declarationLabel: {
      en: 'Declaration from Previous Owner',
      af: 'Verklaring van vorige eienaar',
    },
    uploadedLabel: {
      en: 'Uploaded:',
      af: 'Opgelaai:',
    },
    breederSellerQuestion: {
      en: 'Is the breeder the seller?',
      af: 'Is die teler ook die verkoper?',
    },
    breederNameLabel: {
      en: 'Breeder Name',
      af: 'Teler se naam',
    },
    breederNamePlaceholder: {
      en: 'Enter breeder name',
      af: 'Voer teler se naam in',
    },
    breedLabel: {
      en: 'Breed',
      af: 'Ras',
    },
    breedPlaceholder: {
      en: 'Enter breed',
      af: 'Voer ras in',
    },
    malesLabel: {
      en: 'Number of males',
      af: 'Aantal manlike diere',
    },
    femalesLabel: {
      en: 'Number of females',
      af: 'Aantal wyfies',
    },
    castratedQuestion: {
      en: 'Have the males been castrated?',
      af: 'Is die bulle gekastreer?',
    },
    birthAddressHeading: {
      en: 'Birth Address - Where was the livestock born?',
      af: 'Geboorteadres - Waar is die vee gebore?',
    },
    currentAddressHeading: {
      en: 'Current Address - Where is the livestock currently located?',
      af: 'Huidige adres - Waar is die vee tans?',
    },
    loadingAddressHeading: {
      en: 'Loading Address - Where will the livestock be loaded?',
      af: 'Laaiadres - Waar gaan die vee gelaai word?',
    },
    useSavedFarmLabel: {
      en: 'Use saved farm',
      af: 'Gebruik gestoorde plaas',
    },
    savedFarmPlaceholderLoading: {
      en: 'Loading saved farms...',
      af: 'Laai gestoorde plase...',
    },
    savedFarmPlaceholderSelect: {
      en: 'Select a saved farm',
      af: 'Kies ’n gestoorde plaas',
    },
    farmNameLabel: {
      en: 'Farm Name',
      af: 'Plaasnaam',
    },
    farmNamePlaceholder: {
      en: 'Enter farm name',
      af: 'Voer plaasnaam in',
    },
    districtLabel: {
      en: 'District',
      af: 'Distrik',
    },
    districtPlaceholder: {
      en: 'Enter district',
      af: 'Voer distrik in',
    },
    provinceLabel: {
      en: 'Province',
      af: 'Provinsie',
    },
    provincePlaceholder: {
      en: 'Enter province',
      af: 'Voer provinsie in',
    },
    countryLabel: {
      en: 'Country',
      af: 'Land',
    },
    countryPlaceholder: {
      en: 'Select country',
      af: 'Kies land',
    },
    currentSameAsBirthLabel: {
      en: 'Current location is the same as birth address',
      af: 'Huidige ligging is dieselfde as die geboorteadres',
    },
    loadingSameAsCurrentLabel: {
      en: 'Loading location is the same as current address',
      af: 'Laailiggings is dieselfde as huidige adres',
    },
    currentCopyAction: {
      en: 'Copy birth address',
      af: 'Kopieer geboorteadres',
    },
    loadingCopyAction: {
      en: 'Copy current address',
      af: 'Kopieer huidige adres',
    },
    herdBiosecurityHeading: {
      en: 'Herd Biosecurity',
      af: 'Kudde-biosekuriteit',
    },
    movedOutQuestion: {
      en: 'Has the livestock been moved out of the property boundaries?',
      af: 'Was die vee buite die eiendomsgrense beweeg?',
    },
    movedFromLabel: {
      en: 'Location where livestock was moved from',
      af: 'Ligging waarvandaan die vee beweeg is',
    },
    movedToLabel: {
      en: 'Location where livestock was moved to',
      af: 'Ligging waarheen die vee beweeg is',
    },
    movedWhenLabel: {
      en: 'When was the livestock moved there?',
      af: 'Wanneer is die vee daarheen beweeg?',
    },
    movedYearLabel: {
      en: 'Year',
      af: 'Jaar',
    },
    movedYearPlaceholder: {
      en: 'Enter year',
      af: 'Voer jaar in',
    },
    movedMonthLabel: {
      en: 'Month',
      af: 'Maand',
    },
    movedMonthPlaceholder: {
      en: 'Enter month',
      af: 'Voer maand in',
    },
    movedHowLabel: {
      en: 'How were they moved?',
      af: 'Hoe is hulle verskuif?',
    },
    movedHowPlaceholder: {
      en: 'Select movement method',
      af: 'Kies verskuiwingsmetode',
    },
    movedHowOptionContractor: {
      en: 'Transport Contractor',
      af: 'Vervoer-kontrakteur',
    },
    movedHowOptionOwnTruck: {
      en: 'Own Truck',
      af: 'Eie vragmotor',
    },
    movedHowOptionOnFoot: {
      en: 'On Foot',
      af: 'Te voet',
    },
    removeButton: {
      en: 'Remove',
      af: 'Verwyder',
    },
    addAnotherButton: {
      en: 'Add Another Herd',
      af: 'Voeg nog ’n kudde by',
    },
    copyBirthToCurrent: {
      en: 'Copy birth address to current',
      af: 'Kopieer geboorte na huidige',
    },
    copyCurrentToLoading: {
      en: 'Copy current address to loading',
      af: 'Kopieer huidige na laai',
    },
  },
  index: {
    heroTitle: {
      en: 'Cattle Scan, Biosecurity Tracking and Traceability',
      af: 'Cattle Scan, Biosékuriteit Opsporing en Naspeurbaarheid',
    },
    signInCta: {
      en: 'Sign In',
      af: 'Teken In',
    },
    registerCta: {
      en: 'Register',
      af: 'Registreer',
    },
    contactDialogTitle: {
      en: 'Register',
      af: 'Registreer',
    },
    contactDialogDescription: {
      en: "We'd love to hear from you. Please fill in the form below and we'll get back to you.",
      af: 'Ons hoor graag van jou. Voltooi asseblief die vorm hieronder en ons sal jou kontak.',
    },
    contactNameLabel: {
      en: 'Name',
      af: 'Naam',
    },
    contactEmailLabel: {
      en: 'Email',
      af: 'E-pos',
    },
    contactMessageLabel: {
      en: 'Message',
      af: 'Boodskap',
    },
    contactMessagePlaceholder: {
      en: 'How can we help?',
      af: 'Hoe kan ons help?',
    },
    footerCompany: {
      en: 'Powered By Workbalance',
      af: 'Aangedryf Deur Workbalance',
    },
    footerPrivacy: {
      en: 'Privacy Policy',
      af: 'Privaatheidsbeleid',
    },
    footerTerms: {
      en: 'Terms of Service',
      af: 'Diensbepalings',
    },
    missingInfoTitle: {
      en: 'Missing information',
      af: 'Inligting ontbreek',
    },
    missingInfoDescription: {
      en: 'Please fill in your name, email, and message.',
      af: 'Voltooi asseblief jou naam, e-pos en boodskap.',
    },
    messageSentTitle: {
      en: 'Message sent',
      af: 'Boodskap gestuur',
    },
    messageSentDescription: {
      en: "Thanks for reaching out. We'll get back to you soon.",
      af: 'Dankie dat jy ons kontak. Ons sal gou terugkom.',
    },
  },
  auth: {
    signIn: {
      en: 'Sign In',
      af: 'Teken In',
    },
    signInTitle: {
      en: 'Welcome Back',
      af: 'Welkom Terug',
    },
    signInDescription: {
      en: 'Sign in to your Cattle Scan account',
      af: 'Teken in by jou Cattle Scan-rekening',
    },
    forgotPassword: {
      en: 'Forgot Password?',
      af: 'Wagwoord Vergeet?',
    },
    resetPassword: {
      en: 'Reset Password',
      af: 'Herstel Wagwoord',
    },
    resetPasswordTitle: {
      en: 'Reset Your Password',
      af: 'Herstel Jou Wagwoord',
    },
    resetPasswordDescription: {
      en: "Enter your email address and we'll send you a link to reset your password",
      af: "Voer jou e-pos adres in en ons sal jou 'n skakel stuur om jou wagwoord te herstel",
    },
    sendResetLink: {
      en: 'Send Reset Link',
      af: 'Stuur Herstel Skakel',
    },
    backToSignIn: {
      en: 'Back to Sign In',
      af: 'Terug na Teken In',
    },
    invalidEmailDescription: {
      en: 'Please enter a valid email address',
      af: 'Voer asseblief \'n geldige e-pos adres in',
    },
    unexpectedErrorDescription: {
      en: 'An unexpected error occurred',
      af: 'n Onverwagte fout het voorgekom',
    },
    resetPasswordSuccess: {
      en: 'Password reset link sent! Check your email.',
      af: 'Wagwoord-herstel skakel gestuur! Kyk jou e-pos.',
    },
  },
  inviteSignup: {
    signUp: {
      en: 'Sign Up',
      af: 'Registreer',
    },
    signUpTitle: {
      en: 'Create Account',
      af: 'Skep Rekening',
    },
    signUpDescription: {
      en: 'Join the Cattle Scan platform via your invitation',
      af: 'Sluit aan by die Cattle Scan platform via jou uitnodiging',
    },
    buyerSignUpTitle: {
      en: 'Buyer Registration',
      af: 'Koper Registrasie',
    },
    buyerSignUpDescription: {
      en: 'Register as a buyer to access the platform',
      af: 'Registreer as koper om toegang tot die platform te kry',
    },
    creatingAccount: {
      en: 'Creating Account...',
      af: 'Skep Rekening...',
    },
    invitationRequired: {
      en: 'Signup requires an invitation',
      af: 'Registrasie vereis ’n uitnodiging',
    },
    passwordsNoMatch: {
      en: 'Passwords do not match',
      af: 'Wagwoorde stem nie ooreen nie',
    },
    passwordTooShort: {
      en: 'Password must be at least 6 characters long',
      af: 'Wagwoord moet minstens 6 karakters lank wees',
    },
    invalidPhoneNumber: {
      en: 'Please enter a valid phone number',
      af: 'Voer asseblief ’n geldige telefoonnommer in',
    },
    missingName: {
      en: 'First name and last name are required',
      af: 'Voornaam en van is vereis',
    },
    invitationNoticePrefix: {
      en: "You've been invited to join",
      af: 'Jy is uitgenooi om aan te sluit by',
    },
    invitationNoticeSuffix: {
      en: 'as a',
      af: 'as ’n',
    },
    successBuyer: {
      en: 'Account created successfully! You are now the super admin.',
      af: 'Rekening suksesvol geskep! Jy is nou die super administrateur.',
    },
    successDefault: {
      en: 'Account created successfully! Please wait for approval.',
      af: 'Rekening suksesvol geskep! Wag asseblief vir goedkeuring.',
    },
    invalidEmail: {
      en: 'Please enter a valid email address',
      af: 'Voer asseblief ’n geldige e-pos adres in',
    },
  },
  header: {
    brand: {
      en: 'Cattle Scan',
      af: 'Cattle Scan',
    },
    signInCta: {
      en: 'Sign In',
      af: 'Teken In',
    },
    signOutCta: {
      en: 'Sign Out',
      af: 'Teken Uit',
    },
  },
  adminOffers: {
    title: {
      en: 'My Offers',
      af: 'My Aanbiedinge',
    },
    description: {
      en: "View all offers you've created for livestock listings",
      af: 'Sien al die aanbiedinge wat jy vir veelysings gemaak het',
    },
    loading: {
      en: 'Loading offers...',
      af: 'Laai aanbiedinge...',
    },
    empty: {
      en: 'No offers found',
      af: 'Geen aanbiedinge gevind nie',
    },
    listingColumn: {
      en: 'Listing',
      af: 'Lys',
    },
    offerAmountColumn: {
      en: 'Offer Amount',
      af: 'Aanbiedingsbedrag',
    },
    validUntilColumn: {
      en: 'Valid Until',
      af: 'Geldig Tot',
    },
    statusColumn: {
      en: 'Status',
      af: 'Status',
    },
    responseDateColumn: {
      en: 'Response Date',
      af: 'Antwoorddatum',
    },
    createdColumn: {
      en: 'Created',
      af: 'Geskep',
    },
    actionsColumn: {
      en: 'Actions',
      af: 'Aksies',
    },
    viewDetails: {
      en: 'View Details',
      af: 'Sien Besonderhede',
    },
    dialogTitle: {
      en: 'Offer Details',
      af: 'Aanbiedingsbesonderhede',
    },
    listingInfoHeading: {
      en: 'Listing Information',
      af: 'Lysinligting',
    },
    listingOwnerLabel: {
      en: 'Owner',
      af: 'Eienaar',
    },
    offerTermsHeading: {
      en: 'Offer Terms',
      af: 'Aanbiedingsvoorwaardes',
    },
    chalmarOfferLabel: {
      en: 'Chalmar Beef Offer',
      af: 'Chalmar-beesaanbod',
    },
    toWeightLabel: {
      en: 'To Weight',
      af: 'Tot gewig',
    },
    thenPenalizationLabel: {
      en: 'Then Penalization',
      af: 'Dan boete',
    },
    andFromLabel: {
      en: 'And From',
      af: 'En vanaf',
    },
    penalizationLabel: {
      en: 'Penalization',
      af: 'Boete',
    },
    percentHeifersAllowedLabel: {
      en: '% Heifers Allowed',
      af: '% verse toegelaat',
    },
    additionalHeifersPenaltyLabel: {
      en: 'Additional Heifers Penalty',
      af: 'Bykomende verse-boete',
    },
    validUntilLabel: {
      en: 'Valid Until',
      af: 'Geldig tot',
    },
    additionalPaymentNote: {
      en: 'Additional R25 per calf payment for turnover of less than R10 million',
      af: 'Bykomende betaling van R25 per kalf vir omset onder R10 miljoen',
    },
    affidavitNote: {
      en: 'Attached sworn affidavit must be completed and submitted',
      af: 'Aangehegte beëdigde verklaring moet voltooi en ingedien word',
    },
    sellerResponseHeading: {
      en: 'Seller Response',
      af: 'Verkoper se reaksie',
    },
    responseDateLabel: {
      en: 'Response Date',
      af: 'Reaksiedatum',
    },
    sellerNotesLabel: {
      en: 'Seller Notes',
      af: 'Verkoper se notas',
    },
    noteTitle: {
      en: 'Note',
      af: 'Let wel',
    },
    noteDescription: {
      en: 'This offer is subject to biosecurity terms and evaluation of biosecurity and traceability assessment as well as the veterinary declaration. If Chalmar Beef is placed under quarantine before the livestock is offloaded, the offer is withdrawn.',
      af: 'Hierdie aanbod is onderhewig aan biosekuriteitsbepalings en evaluering van biosekuriteit- en naspeurbaarheidsassesserings sowel as die veearts se verklaring. As Chalmar Beef onder kwarantyn geplaas word voordat die vee afgelaai word, word die aanbod teruggetrek.',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusAccepted: {
      en: 'Accepted',
      af: 'Aanvaar',
    },
    statusDeclined: {
      en: 'Declined',
      af: 'Afgewys',
    },
    failedToLoad: {
      en: 'Failed to load offers',
      af: 'Kon nie aanbiedinge laai nie',
    },
    offerAmountSuffix: {
      en: '/KG',
      af: '/KG',
    },
    currencyPrefix: {
      en: 'R',
      af: 'R',
    },
    kgUnit: {
      en: 'KG',
      af: 'KG',
    },
    centSuffix: {
      en: 'c',
      af: 'c',
    },
  },
  sellerOffers: {
    title: {
      en: 'Livestock Offers',
      af: 'Veelys-aanbiedinge',
    },
    description: {
      en: 'Review and respond to offers for your livestock listings',
      af: 'Hersien en reageer op aanbiedinge vir jou veelysings',
    },
    loading: {
      en: 'Loading offers...',
      af: 'Laai aanbiedinge...',
    },
    empty: {
      en: 'No offers found',
      af: 'Geen aanbiedinge gevind nie',
    },
    referenceColumn: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    listingColumn: {
      en: 'Listing',
      af: 'Lys',
    },
    offerAmountColumn: {
      en: 'Offer Amount',
      af: 'Aanbiedingsbedrag',
    },
    validUntilColumn: {
      en: 'Valid Until',
      af: 'Geldig Tot',
    },
    statusColumn: {
      en: 'Status',
      af: 'Status',
    },
    createdColumn: {
      en: 'Created',
      af: 'Geskep',
    },
    actionsColumn: {
      en: 'Actions',
      af: 'Aksies',
    },
    viewDetails: {
      en: 'View Details',
      af: 'Sien Besonderhede',
    },
    currencyPrefix: {
      en: 'R',
      af: 'R',
    },
    offerAmountSuffix: {
      en: '/KG',
      af: '/KG',
    },
    failedToLoad: {
      en: 'Failed to load offers',
      af: 'Kon nie aanbiedinge laai nie',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusAccepted: {
      en: 'Accepted',
      af: 'Aanvaar',
    },
    statusDeclined: {
      en: 'Declined',
      af: 'Afgewys',
    },
  },
  sellerFarms: {
    title: {
      en: 'Farms',
      af: 'Plase',
    },
    description: {
      en: 'Capture your main farm and additional grazing locations.',
      af: 'Lê jou hoofplaas en addisionele weidingsplekke vas.',
    },
    farmNameLabel: {
      en: 'Farm Name',
      af: 'Plaasnaam',
    },
    farmNamePlaceholder: {
      en: 'e.g. My Farm Name',
      af: 'bv. My Farm Name',
    },
    addressFieldsLabel: {
      en: 'Address Fields',
      af: 'Adresvelde',
    },
    addressFarmNameLabel: {
      en: 'Farm Name',
      af: 'Plaasnaam',
    },
    addressFarmNamePlaceholder: {
      en: 'e.g. My Farm Name',
      af: 'bv. My Farm Name',
    },
    districtLabel: {
      en: 'District',
      af: 'Distrik',
    },
    districtPlaceholder: {
      en: 'e.g. Sandton',
      af: 'bv. Sandton',
    },
    provinceLabel: {
      en: 'Province',
      af: 'Provinsie',
    },
    provincePlaceholder: {
      en: 'e.g. Gauteng',
      af: 'bv. Gauteng',
    },
    countryLabel: {
      en: 'Country',
      af: 'Land',
    },
    countryPlaceholder: {
      en: 'Select country',
      af: 'Kies land',
    },
    countrySouthAfrica: {
      en: 'South Africa',
      af: 'Suid-Afrika',
    },
    countryBotswana: {
      en: 'Botswana',
      af: 'Botswana',
    },
    countryNamibia: {
      en: 'Namibia',
      af: 'Namibië',
    },
    addGrazingLocation: {
      en: 'Add Grazing Location',
      af: 'Voeg weidingsplek by',
    },
    cardCapturedTitle: {
      en: 'Captured Farms',
      af: 'Vasgelegde plase',
    },
    cardCapturedDescription: {
      en: 'Your saved farms and grazing locations.',
      af: 'Jou gestoorde plase en weidingsplekke.',
    },
    loading: {
      en: 'Loading farms...',
      af: 'Laai plase...',
    },
    emptyState: {
      en: 'No farms captured yet.',
      af: 'Geen plase nog vasgelê nie.',
    },
    tableName: {
      en: 'Name',
      af: 'Naam',
    },
    tableAddress: {
      en: 'Address',
      af: 'Adres',
    },
    tableCreated: {
      en: 'Created',
      af: 'Geskep',
    },
    tableActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    deleteActionLabel: {
      en: 'Delete farm',
      af: 'Skrap plaas',
    },
    confirmDelete: {
      en: 'Delete farm "{name}"? This cannot be undone.',
      af: 'Skrap plaas "{name}"? Dit kan nie ongedaan gemaak word nie.',
    },
    toastMissingInfoTitle: {
      en: 'Missing info',
      af: 'Ontbrekende inligting',
    },
    toastMissingNameDescription: {
      en: 'Please provide Farm Name.',
      af: 'Verskaf asseblief Plaasnaam.',
    },
    toastMissingAddressDescription: {
      en: 'Please fill all address fields.',
      af: 'Vul asseblief al die adresvelde in.',
    },
    toastSaveSuccessTitle: {
      en: 'Saved',
      af: 'Gestoor',
    },
    toastSaveSuccessDescription: {
      en: 'Farm captured successfully.',
      af: 'Plaas suksesvol vasgelê.',
    },
    toastSaveErrorDescription: {
      en: 'Failed to save farm.',
      af: 'Kon nie plaas stoor nie.',
    },
    toastLoadErrorDescription: {
      en: 'Failed to load your farms.',
      af: 'Kon nie jou plase laai nie.',
    },
    toastDeleteSuccessTitle: {
      en: 'Deleted',
      af: 'Verwyder',
    },
    toastDeleteSuccessDescription: {
      en: 'Farm removed.',
      af: 'Plaas verwyder.',
    },
    toastDeleteErrorDescription: {
      en: 'Failed to delete farm.',
      af: 'Kon nie plaas verwyder nie.',
    },
  },
  adminListings: {
    loading: {
      en: 'Loading livestock listings...',
      af: 'Laai veelysings...',
    },
    title: {
      en: 'Livestock Listings',
      af: 'Veelysings',
    },
    description: {
      en: 'Manage livestock listings from sellers',
      af: 'Bestuur veelysings van verkopers',
    },
    empty: {
      en: 'No livestock listings found',
      af: 'Geen veelysings gevind nie',
    },
    tableReferenceId: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    tableOwnerName: {
      en: 'Owner Name',
      af: 'Eienaar se naam',
    },
    tableLocation: {
      en: 'Location',
      af: 'Ligging',
    },
    tableBreed: {
      en: 'Breed',
      af: 'Ras',
    },
    tableTotalLivestock: {
      en: 'Total Livestock',
      af: 'Totale vee',
    },
    tableStatus: {
      en: 'Status',
      af: 'Status',
    },
    tableCreated: {
      en: 'Created',
      af: 'Geskep',
    },
    tableActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    viewDetails: {
      en: 'View Details',
      af: 'Sien besonderhede',
    },
    loadErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    loadErrorDescription: {
      en: 'Failed to load livestock listings',
      af: 'Kon nie veelysings laai nie',
    },
    dialogTitle: {
      en: 'Livestock Listing Details',
      af: 'Veelysingsbesonderhede',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusApproved: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    statusRejected: {
      en: 'Rejected',
      af: 'Afgewys',
    },
    responsibleSectionTitle: {
      en: 'Responsible Person Information',
      af: 'Verantwoordelike persoon inligting',
    },
    responsibleNameLabel: {
      en: 'Name',
      af: 'Naam',
    },
    responsibleDesignationLabel: {
      en: 'Designation',
      af: 'Aanwysing',
    },
    basicSectionTitle: {
      en: 'Basic Information',
      af: 'Basiese inligting',
    },
    ownerNameLabel: {
      en: 'Owner Name',
      af: 'Eienaar se naam',
    },
    formTitle: {
      en: 'Create Offer for {owner}',
      af: 'Skep aanbod vir {owner}',
    },
    formDescription: {
      en: 'Complete the offer form for the livestock listing',
      af: 'Voltooi die aanbiedingsvorm vir die veelysing',
    },
    listingDetailsHeading: {
      en: 'Listing Details',
      af: 'Lysbesonderhede',
    },
    listingLocationLabel: {
      en: 'Location',
      af: 'Ligging',
    },
    listingBreedLabel: {
      en: 'Breed',
      af: 'Ras',
    },
    listingTotalLivestockLabel: {
      en: 'Total Livestock',
      af: 'Totale vee',
    },
    listingHeifersLabel: {
      en: 'Heifers',
      af: 'Verse',
    },
    referenceIdLabel: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    offerValidDateLabel: {
      en: 'Offer Valid Until (Date)',
      af: 'Aanbod geldig tot (datum)',
    },
    offerValidTimeLabel: {
      en: 'Offer Valid Until (Time)',
      af: 'Aanbod geldig tot (tyd)',
    },
    additionalPaymentLabel: {
      en: 'Additional R25 per calf payment for turnover of less than R10 million',
      af: 'Bykomende betaling van R25 per kalf vir omset onder R10 miljoen',
    },
    affidavitRequiredLabel: {
      en: 'Attached sworn affidavit must be completed and submitted',
      af: 'Aangehegte beëdigde verklaring moet voltooi en ingedien word',
    },
    cancelButton: {
      en: 'Cancel',
      af: 'Kanselleer',
    },
    submitButton: {
      en: 'Submit Offer',
      af: 'Dien aanbod in',
    },
    submittingButton: {
      en: 'Submitting Offer...',
      af: 'Dien aanbod in...',
    },
    successTitle: {
      en: 'Success',
      af: 'Sukses',
    },
    successDescription: {
      en: 'Offer submitted successfully!',
      af: 'Aanbod suksesvol ingedien!',
    },
    errorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    errorDescription: {
      en: 'Failed to submit offer. Please try again.',
      af: 'Kon nie aanbod indien nie. Probeer asseblief weer.',
    },
    validationPositiveOffer: {
      en: 'Offer amount must be positive',
      af: 'Aanbodbedrag moet positief wees',
    },
    validationPositiveWeight: {
      en: 'Weight must be positive',
      af: 'Gewig moet positief wees',
    },
    validationPositivePenalization: {
      en: 'Penalization amount must be positive',
      af: 'Boetebedrag moet positief wees',
    },
    validationPercentRange: {
      en: 'Percentage must be between 0 and 100',
      af: 'Persentasie moet tussen 0 en 100 wees',
    },
    validationDateRequired: {
      en: 'Date is required',
      af: 'Datum word vereis',
    },
    validationTimeRequired: {
      en: 'Time is required',
      af: 'Tyd word vereis',
    },
    authError: {
      en: 'Not authenticated',
      af: 'Nie geverifieer nie',
    },
  },
  agentDashboard: {
    loading: {
      en: 'Loading dashboard...',
      af: 'Laai paneelbord...',
    },
    pageTitle: {
      en: 'Agent Dashboard',
      af: 'Agentpaneelbord',
    },
    welcomeMessage: {
      en: 'Welcome back, {name}!',
      af: 'Welkom terug, {name}!',
    },
    clientCardTitle: {
      en: 'Client Management',
      af: 'Kliëntbestuur',
    },
    clientCardDescription: {
      en: 'Manage your client relationships and transactions',
      af: 'Bestuur jou kliëntverhoudings en transaksies',
    },
    clientCardButton: {
      en: 'View Clients',
      af: 'Bekyk kliënte',
    },
    profileStatusTitle: {
      en: 'Profile Status',
      af: 'Profielstatus',
    },
    profileStatusDescription: {
      en: 'Your account status: {status}',
      af: 'Jou rekeningstatus: {status}',
    },
    statusLabelPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusLabelApproved: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    statusLabelSuspended: {
      en: 'Suspended',
      af: 'Geskors',
    },
    statusLabelUnknown: {
      en: 'Unknown',
      af: 'Onbekend',
    },
    statusPendingMessage: {
      en: 'Your account is pending approval',
      af: 'Jou rekening wag vir goedkeuring',
    },
    statusApprovedMessage: {
      en: 'Your account is approved and active',
      af: 'Jou rekening is goedgekeur en aktief',
    },
    statusSuspendedMessage: {
      en: 'Your account has been suspended',
      af: 'Jou rekening is geskors',
    },
    statusUnknownMessage: {
      en: 'Account status is currently unavailable',
      af: 'Rekeningstatus is tans nie beskikbaar nie',
    },
  },
  loadMasterLoading: {
    title: {
      en: 'Loading Details - {reference}',
      af: 'Laadbesonderhede - {reference}',
    },
    livestockSummaryHeading: {
      en: 'Livestock Summary',
      af: 'Vee-opsomming',
    },
    totalCattleLabel: {
      en: 'Total Cattle:',
      af: 'Totale beeste:',
    },
    totalSheepLabel: {
      en: 'Total Sheep:',
      af: 'Totale skape:',
    },
    livestockTypeCattle: {
      en: 'Cattle',
      af: 'Beeste',
    },
    livestockTypeSheep: {
      en: 'Sheep',
      af: 'Skape',
    },
    livestockTypeMixed: {
      en: 'Cattle and Sheep',
      af: 'Beeste en skape',
    },
    noLivestockBadge: {
      en: 'No livestock',
      af: 'Geen vee',
    },
    loadingPointsHeading: {
      en: 'Loading Points',
      af: 'Laaipunte',
    },
    loadingPointLabel: {
      en: 'Loading Point {number}',
      af: 'Laaipunt {number}',
    },
    countsLabel: {
      en: 'Counts:',
      af: 'Getalle:',
    },
    countsSummary: {
      en: 'Males {males} • Females {females}',
      af: 'Manlik {males} • Vroulik {females}',
    },
    loadingAddressLabel: {
      en: 'Loading Address:',
      af: 'Laaiadres:',
    },
    loadingAddressSame: {
      en: 'Same as current address',
      af: 'Dieselfde as huidige adres',
    },
    locationSectionHeading: {
      en: 'Location Verification',
      af: 'Liggingverifikasie',
    },
    locationCapturePrompt: {
      en: 'Capture your current location to verify loading completion',
      af: 'Neem jou huidige ligging vas om die voltooiing van die laai te bevestig',
    },
    locationCapturedStatus: {
      en: 'Location captured: {latitude}, {longitude}',
      af: 'Ligging vasgevang: {latitude}, {longitude}',
    },
    locationCapturedDetails: {
      en: 'Accuracy: {accuracy}m | {timestamp}',
      af: 'Akkuraatheid: {accuracy}m | {timestamp}',
    },
    locationNotCaptured: {
      en: 'Location not captured',
      af: 'Ligging nie vasgevang nie',
    },
    captureLocationButton: {
      en: 'Capture Location',
      af: 'Neem ligging vas',
    },
    updateLocationButton: {
      en: 'Update Location',
      af: 'Werk ligging by',
    },
    capturingLocation: {
      en: 'Capturing...',
      af: 'Besig om vas te vang...',
    },
    truckRegistrationLabel: {
      en: 'Truck Registration Number *',
      af: 'Vragmotor-registrasienommer *',
    },
    truckRegistrationPlaceholder: {
      en: 'Enter truck registration number',
      af: 'Voer vragmotorregistrasienommer in',
    },
    actualLoadingTimeLabel: {
      en: 'Actual Loading Time',
      af: 'Werklike laaityd',
    },
    livestockConditionLabel: {
      en: 'Livestock Condition',
      af: 'Veetoestand',
    },
    livestockConditionPlaceholder: {
      en: 'Describe the condition of the livestock during loading...',
      af: 'Beskryf die toestand van die vee tydens laai...',
    },
    loadingNotesLabel: {
      en: 'Loading Notes',
      af: 'Laainotas',
    },
    loadingNotesPlaceholder: {
      en: 'Any additional notes about the loading process...',
      af: 'Enige bykomende notas oor die laaiproses...',
    },
    submitButton: {
      en: 'Complete Loading',
      af: 'Voltooi laai',
    },
    submittingLabel: {
      en: 'Completing Loading...',
      af: 'Besig om laai te voltooi...',
    },
    validationTruckRegistrationRequired: {
      en: 'Truck registration number is required',
      af: 'Vragmotorregistrasienommer is verpligtend',
    },
    toastLocationCapturedTitle: {
      en: 'Location captured',
      af: 'Ligging vasgevang',
    },
    toastLocationCapturedDescription: {
      en: 'Location captured with {accuracy}m accuracy',
      af: 'Ligging met {accuracy}m akkuraatheid vasgevang',
    },
    toastLocationErrorTitle: {
      en: 'Location error',
      af: 'Liggingfout',
    },
    toastLocationErrorDescription: {
      en: 'Failed to capture location. You can still complete the loading without location data.',
      af: 'Kon nie ligging vasvang nie. Jy kan steeds die laai sonder liggingdata voltooi.',
    },
    toastSuccessDescription: {
      en: 'Loading completed successfully. All parties have been notified.',
      af: 'Laai suksesvol voltooi. Alle partye is in kennis gestel.',
    },
    toastErrorDescription: {
      en: 'Failed to complete loading. Please try again.',
      af: 'Kon nie laai voltooi nie. Probeer asseblief weer.',
    },
    badgeLivestockCountCattle: {
      en: '{count} cattle',
      af: '{count} beeste',
    },
    badgeLivestockCountSheep: {
      en: '{count} sheep',
      af: '{count} skape',
    },
    unknownCompany: {
      en: 'Unknown Company',
      af: 'Onbekende maatskappy',
    },
  },
  vetSelection: {
    heading: {
      en: 'Assign Veterinarian',
      af: 'Wys veearts toe',
    },
    selectLabel: {
      en: 'Select a Veterinarian',
      af: 'Kies ’n veearts',
    },
    selectPlaceholder: {
      en: 'Select a vet',
      af: 'Kies ’n veearts',
    },
    loadingOption: {
      en: 'Loading...',
      af: 'Laai...',
    },
    noVetsOption: {
      en: 'No vets available to select.',
      af: 'Geen veeartse beskikbaar om te kies nie.',
    },
    unnamedVet: {
      en: 'Unnamed Vet',
      af: 'Naamlose veearts',
    },
    inviteToggleInvite: {
      en: 'Invite a New Vet',
      af: 'Nooi ’n nuwe veearts',
    },
    inviteToggleCancel: {
      en: 'Cancel Invitation',
      af: 'Kanselleer uitnodiging',
    },
    inviteSectionTitle: {
      en: 'Invite New Vet by Email',
      af: 'Nooi nuwe veearts per e-pos',
    },
    emailPlaceholder: {
      en: "Enter vet's email",
      af: 'Voer die veearts se e-pos in',
    },
    sendInviteButton: {
      en: 'Send Invite',
      af: 'Stuur uitnodiging',
    },
    invitationSentButton: {
      en: 'Invitation Sent',
      af: 'Uitnodiging gestuur',
    },
    invitationSentMessage: {
      en: 'Invitation sent successfully to {email}',
      af: 'Uitnodiging suksesvol gestuur na {email}',
    },
    loadVetsErrorDescription: {
      en: 'Failed to load veterinarians.',
      af: 'Kon nie veeartse laai nie.',
    },
    missingEmailDescription: {
      en: 'Please enter a valid email and ensure you are logged in with a company selected.',
      af: 'Voer asseblief ’n geldige e-pos in en maak seker jy is aangemeld met ’n maatskappy gekies.',
    },
    inviteSuccessDescription: {
      en: 'Vet invitation sent successfully.',
      af: 'Veeartsuitnodiging suksesvol gestuur.',
    },
    inviteErrorDescription: {
      en: 'Failed to send vet invitation. Please try again.',
      af: 'Kon nie veeartsuitnodiging stuur nie. Probeer asseblief weer.',
    },
  },
  signatureSection: {
    heading: {
      en: 'Digital Signature',
      af: 'Digitale handtekening',
    },
    locationLabel: {
      en: 'Location of Signing',
      af: 'Ondertekeningsligging',
    },
    locationPlaceholder: {
      en: 'Enter location or get GPS',
      af: 'Voer ligging in of kry GPS',
    },
    getLocationButton: {
      en: 'Get Location',
      af: 'Kry ligging',
    },
    locationFetchingTitle: {
      en: 'Getting location...',
      af: 'Kry tans ligging...',
    },
    locationFetchingDescription: {
      en: 'Please wait while we pinpoint your location.',
      af: 'Wag asseblief terwyl ons jou ligging vasstel.',
    },
    locationSuccessDescription: {
      en: 'Location captured successfully.',
      af: 'Ligging suksesvol vasgevang.',
    },
    locationErrorDefault: {
      en: 'Could not get location. Please enter it manually.',
      af: 'Kon nie ligging kry nie. Voer dit asseblief handmatig in.',
    },
    locationErrorPermission: {
      en: 'Please allow location access in your browser settings.',
      af: 'Laat liggingtoegang in jou blaaierinstellings toe.',
    },
    locationErrorUnavailable: {
      en: 'Location is unavailable. Please check your network connection or try again from a different location.',
      af: 'Ligging is nie beskikbaar nie. Kontroleer jou netwerkverbinding of probeer weer vanaf ’n ander plek.',
    },
    locationErrorTimeout: {
      en: 'Getting location timed out. Please try again.',
      af: 'Liggingbepaling het uitgetel. Probeer asseblief weer.',
    },
    geolocationUnsupportedDescription: {
      en: 'Geolocation is not supported by your browser.',
      af: 'Liggingopsporing word nie deur jou blaaier ondersteun nie.',
    },
  },
  signaturePad: {
    cardTitle: {
      en: 'Digital Signature',
      af: 'Digitale handtekening',
    },
    mobileBadge: {
      en: 'Touch optimized',
      af: 'Aanraak-geoptimaliseer',
    },
    touchTip: {
      en: '💡 Tip: Touch accuracy has been calibrated for your device. Sign naturally - your signature will be saved automatically.',
      af: '💡 Wenk: Aanraak-akkuraatheid is vir jou toestel gekalibreer. Teken natuurlik – jou handtekening sal outomaties gestoor word.',
    },
    qualityLabel: {
      en: 'Signature quality: {quality}',
      af: 'Handtekeningkwaliteit: {quality}',
    },
    qualityPoorNote: {
      en: ' - Consider signing again for better clarity',
      af: ' - Oorweeg om weer te teken vir beter duidelikheid',
    },
    qualityExcellent: {
      en: 'Excellent',
      af: 'Uitstekend',
    },
    qualityGood: {
      en: 'Good',
      af: 'Goed',
    },
    qualityFair: {
      en: 'Fair',
      af: 'Redelik',
    },
    qualityPoor: {
      en: 'Poor',
      af: 'Swak',
    },
    currentSignatureLabel: {
      en: 'Current Signature:',
      af: 'Huidige handtekening:',
    },
    signatureAlt: {
      en: 'Signature',
      af: 'Handtekening',
    },
    clearButton: {
      en: 'Clear Signature',
      af: 'Vee handtekening uit',
    },
    saveButton: {
      en: 'Save Signature',
      af: 'Stoor handtekening',
    },
    testCalibrationButton: {
      en: 'Test Calibration',
      af: 'Toets kalibrasie',
    },
    debugInfoTitle: {
      en: 'Debug Info',
      af: 'Ontfoutingsinligting',
    },
    debugMobileLabel: {
      en: 'Mobile: {value}',
      af: 'Mobiel: {value}',
    },
    debugTouchSupportLabel: {
      en: 'Touch Support: {value}',
      af: 'Aanraakondersteuning: {value}',
    },
    debugPixelRatioLabel: {
      en: 'Device Pixel Ratio: {value}',
      af: 'Toestel-pixelverhouding: {value}',
    },
    debugCanvasSizeLabel: {
      en: 'Canvas Size: {width}x{height}',
      af: 'Doekgrootte: {width}x{height}',
    },
  },
  veterinaryDeclarationForm: {
    title: {
      en: 'Veterinary Declaration',
      af: 'Veeartsenyverklaring',
    },
    description: {
      en: 'I Dr. {fullName}, a veterinarian registered with the South African Veterinary Council with registration number {registrationNumber}, declare that I inspected the following livestock at {location}.',
      af: 'Ek, dr. {fullName}, ’n veearts geregistreer by die Suid-Afrikaanse Veeartsenyraad met registrasienommer {registrationNumber}, verklaar dat ek die volgende vee by {location} ondersoek het.',
    },
    listingInfoHeading: {
      en: 'Listing Information',
      af: 'Lysinligting',
    },
    ownerLabel: {
      en: 'Owner',
      af: 'Eienaar',
    },
    locationLabel: {
      en: 'Location',
      af: 'Ligging',
    },
    referenceLabel: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    inspectionLocationLabel: {
      en: 'Inspection Location',
      af: 'Inspeksieligging',
    },
    locationPlaceholder: {
      en: 'Lat: -26.00000, Lon: 28.00000',
      af: 'Lat: -26.00000, Lon: 28.00000',
    },
    distanceLabel: {
      en: 'Distance from plotted location (if no cell coverage)',
      af: 'Afstand vanaf geplotte ligging (indien geen selfoonsein)',
    },
    distancePlaceholder: {
      en: 'e.g., 2km north of plotted location',
      af: 'bv. 2 km noord van geplotte ligging',
    },
    readOnlyNotice: {
      en: 'This declaration has already been submitted and is view-only.',
      af: 'Hierdie verklaring is reeds ingedien en is slegs-lees.',
    },
    livestockSectionHeading: {
      en: 'Livestock to be Loaded',
      af: 'Vee wat gelaai moet word',
    },
    editTotalsButton: {
      en: 'Edit totals',
      af: 'Wysig totale',
    },
    saveTotalsButton: {
      en: 'Save totals',
      af: 'Stoor totale',
    },
    totalCattleLabel: {
      en: 'Total Cattle',
      af: 'Totale beeste',
    },
    totalSheepLabel: {
      en: 'Total Sheep',
      af: 'Totale skape',
    },
    noLivestock: {
      en: 'No livestock',
      af: 'Geen vee',
    },
    loadingPointsHeading: {
      en: 'Loading Points Breakdown',
      af: 'Ontleding van laaipunte',
    },
    loadingPointLabel: {
      en: 'Loading Point {index}',
      af: 'Laaipunt {index}',
    },
    loadingPointCattleBadge: {
      en: '{count} Cattle',
      af: '{count} beeste',
    },
    loadingPointSheepBadge: {
      en: '{count} Sheep',
      af: '{count} skape',
    },
    birthLabel: {
      en: 'Birth:',
      af: 'Geboorte:',
    },
    currentLabel: {
      en: 'Current:',
      af: 'Huidig:',
    },
    loadingLabel: {
      en: 'Loading:',
      af: 'Lading:',
    },
    sameAsBirth: {
      en: 'Same as birth address',
      af: 'Selfde as geboortadres',
    },
    sameAsCurrent: {
      en: 'Same as current address',
      af: 'Selfde as huidige adres',
    },
    livestockTypeCattle: {
      en: 'Cattle',
      af: 'Beeste',
    },
    livestockTypeSheep: {
      en: 'Sheep',
      af: 'Skape',
    },
    livestockTypeBoth: {
      en: 'Cattle and Sheep',
      af: 'Beeste en skape',
    },
    livestockTypeNone: {
      en: 'No livestock',
      af: 'Geen vee',
    },
    cattleInspectionHeading: {
      en: 'Cattle Physical Inspection Requirements',
      af: 'Fisiese inspeksiebehoeftes vir beeste',
    },
    cattleInspectionText: {
      en: 'Have {count} cattle physically been inspected (Mouth & feet)',
      af: 'Is {count} beeste fisies geïnspekteer (mond en pote)',
    },
    sheepInspectionHeading: {
      en: 'Sheep Physical Inspection Requirements',
      af: 'Fisiese inspeksiebehoeftes vir skape',
    },
    sheepInspectionText: {
      en: 'Have {count} sheep physically been inspected (Mouth & feet)',
      af: 'Is {count} skape fisies geïnspekteer (mond en pote)',
    },
    cattleVisualQuestion: {
      en: 'Have {count} cattle visually been inspected?',
      af: 'Is {count} beeste visueel geïnspekteer?',
    },
    cattlePhysicalQuestion: {
      en: 'Have {count} cattle physically been inspected (Mouth & feet)?',
      af: 'Is {count} beeste fisies geïnspekteer (mond en pote)?',
    },
    sheepVisualQuestion: {
      en: 'Have {count} sheep been visually inspected?',
      af: 'Is {count} skape visueel geïnspekteer?',
    },
    sheepPhysicalQuestion: {
      en: 'Have {count} sheep physically been inspected (Mouth & feet)?',
      af: 'Is {count} skape fisies geïnspekteer (mond en pote)?',
    },
    footAndMouthQuestion: {
      en: 'Were there any symptoms or lesions (old or new) typical of Foot and Mouth Disease observed during the inspection of the livestock?',
      af: 'Is daar enige simptome of letsels (oud of nuut) tipies van bek-en-klouseer waargeneem tydens die inspeksie van die vee?',
    },
    lumpySkinQuestion: {
      en: 'Were there any symptoms or lesions (old or new) typical of Lumpy Skin Disease observed during the inspection of the livestock?',
      af: 'Is daar enige simptome of letsels (oud of nuut) tipies van knopvelsiekte waargeneem tydens die inspeksie van die vee?',
    },
    footAndMouthAreaQuestion: {
      en: 'According to my knowledge there has been no case of Foot and Mouth disease within 10 km from the livestock inspection point.',
      af: 'Volgens my kennis was daar geen geval van bek-en-klouseer binne 10 km vanaf die vee-inspeksiepunt nie.',
    },
    riftValleyAreaQuestion: {
      en: 'According to my knowledge there has been no case of Rift Valley Fever within 10 km from the livestock inspection point.',
      af: 'Volgens my kennis was daar geen geval van Riftdalkoors binne 10 km vanaf die vee-inspeksiepunt nie.',
    },
    alreadySubmittedTitle: {
      en: 'Already Submitted',
      af: 'Reeds ingedien',
    },
    alreadySubmittedDescription: {
      en: 'This declaration has already been submitted and cannot be edited.',
      af: 'Hierdie verklaring is reeds ingedien en kan nie gewysig word nie.',
    },
    loadListingErrorDescription: {
      en: 'Failed to fetch listing data.',
      af: 'Kon nie lysdata bekom nie.',
    },
    loadVetProfileErrorDescription: {
      en: 'Failed to fetch vet profile.',
      af: 'Kon nie veeartsprofiel bekom nie.',
    },
    missingReferenceDescription: {
      en: 'Reference ID is missing.',
      af: 'Verwysings-ID ontbreek.',
    },
    submissionSuccessDescription: {
      en: 'Veterinary declaration submitted successfully.',
      af: 'Veeartsenyverklaring suksesvol ingedien.',
    },
    submissionFailedTitle: {
      en: 'Submission Failed',
      af: 'Indiening het misluk',
    },
    submissionFailedDescription: {
      en: 'Could not submit the declaration. Reason: {reason}',
      af: 'Kon nie die verklaring indien nie. Rede: {reason}',
    },
    formReviewTitle: {
      en: 'Please review the form',
      af: 'Hersien asseblief die vorm',
    },
    formReviewDescription: {
      en: 'Complete all required questions before submitting.',
      af: 'Voltooi alle vereiste vrae voordat jy indien.',
    },
    invalidCattleTotalTitle: {
      en: 'Invalid cattle total',
      af: 'Ongeldige bees-totaal',
    },
    invalidCattleTotalDescription: {
      en: 'Please enter a non-negative number.',
      af: 'Voer asseblief ’n nie-negatiewe getal in.',
    },
    invalidSheepTotalTitle: {
      en: 'Invalid sheep total',
      af: 'Ongeldige skaap-totaal',
    },
    invalidSheepTotalDescription: {
      en: 'Please enter a non-negative number.',
      af: 'Voer asseblief ’n nie-negatiewe getal in.',
    },
    totalsUpdatedTitle: {
      en: 'Totals updated',
      af: 'Totale opgedateer',
    },
    totalsUpdatedDescription: {
      en: 'Livestock totals have been updated.',
      af: 'Vee-totale is opgedateer.',
    },
    updateFailedDescription: {
      en: 'Unable to update totals.',
      af: 'Kon nie totale opdateer nie.',
    },
    locationCaptureTitle: {
      en: 'Capturing Location',
      af: 'Ligging word vasgelê',
    },
    locationCaptureDescription: {
      en: 'Attempting to retrieve your GPS coordinates.',
      af: 'Probeer om jou GPS-koördinate te verkry.',
    },
    locationCapturedTitle: {
      en: 'Location Captured',
      af: 'Ligging vasgelê',
    },
    locationCapturedDescription: {
      en: 'Coordinates: {coordinates}',
      af: 'Koördinate: {coordinates}',
    },
    locationErrorTitle: {
      en: 'Location Error',
      af: 'Liggingfout',
    },
    locationErrorDescription: {
      en: 'Unable to retrieve your location. Please enter it manually.',
      af: 'Kon nie jou ligging verkry nie. Voer dit asseblief handmatig in.',
    },
    declarationSubmittedLabel: {
      en: 'Declaration Submitted',
      af: 'Verklaring ingedien',
    },
    submittingLabel: {
      en: 'Submitting...',
      af: 'Dien tans in...',
    },
    submitButtonLabel: {
      en: 'Submit Declaration',
      af: 'Dien verklaring in',
    },
  },
  offerTermsSection: {
    heading: {
      en: 'Premiums',
      af: 'Premies',
    },
    entityTerm: {
      en: 'entity',
      af: 'entiteit',
    },
    defaultCompanyName: {
      en: 'Chalmar Beef',
      af: 'Chalmar Beef',
    },
    glnSwitchLabel: {
      en: 'If the {entity} selling the livestock has a GLN Number, it could mean an additional R 25 per head payment. Apply?',
      af: 'Indien die {entity} wat die vee verkoop ’n GLN-nommer het, kan dit ’n bykomende R 25 per kop betaling beteken. Aanvaar U dit so?',
    },
    glnInfo: {
      en: 'To qualify for the additional payment, a GLN number is required. Please upload the GLN registration document.',
      af: 'Om vir die bykomende betaling te kwalifiseer, is ’n GLN-nommer nodig. Laai asseblief die GLN-registrasiedokument op.',
    },
    glnNumberLabel: {
      en: 'GLN Number',
      af: 'GLN-nommer',
    },
    glnNumberPlaceholder: {
      en: 'Enter GLN number',
      af: 'Voer GLN-nommer in',
    },
    glnDocumentLabel: {
      en: 'GLN Registration Document',
      af: 'GLN-registrasiedokument',
    },
    glnUploadLabel: {
      en: 'Upload GLN Registration',
      af: 'Laai GLN-registrasie op',
    },
    turnoverSwitchLabel: {
      en: 'If the {entity} selling the livestock has a turnover of less than R 10 million, it could mean an additional R 25 per calf payment. Apply?',
      af: 'Indien die {entity} wat die vee verkoop ’n omset van minder as R 10 miljoen het, kan dit ’n bykomende R 25 per kalf betaling beteken. Aanvaar U dit so?',
    },
    affidavitInfo: {
      en: 'To qualify for the additional payment, a sworn affidavit must be completed and submitted.',
      af: 'Om vir die bykomende betaling te kwalifiseer, moet ’n beëdigde verklaring voltooi en ingedien word.',
    },
    affidavitDownloadLabel: {
      en: 'Download BEE Affidavit Form',
      af: 'Laai BEE-beëdigde verklaringvorm af',
    },
    affidavitUploadLabel: {
      en: 'Upload Completed Affidavit',
      af: 'Laai voltooide beëdigde verklaring op',
    },
    noteTitle: {
      en: 'Note:',
      af: 'Let wel:',
    },
    noteDescription: {
      en: 'This offer is subject to biosecurity terms and evaluation of biosecurity and traceability assessment as well as the veterinary declaration. If {company} is placed under quarantine before the livestock is offloaded, the offer is withdrawn.',
      af: 'Hierdie aanbod is onderhewig aan biosekuriteitsbepalings en evaluering van biosekuriteit- en naspeurbaarheidsassesserings sowel as die veearts se verklaring. As {company} onder kwarantyn geplaas word voordat die vee afgelaai word, word die aanbod teruggetrek.',
    },
  },
  biosecuritySection: {
    heading: {
      en: 'Supplier Identity & Location',
      af: 'Verskafferidentiteit en ligging',
    },
    breederSellerLabel: {
      en: 'Is the breeder the seller?',
      af: 'Is die teler die verkoper?',
    },
    breederNameLabel: {
      en: 'Breeder Name',
      af: 'Teler se naam',
    },
    breederNamePlaceholder: {
      en: 'Enter breeder name',
      af: 'Voer teler se naam in',
    },
    movedOutLabel: {
      en: 'Has livestock been moved out of property boundaries?',
      af: 'Is vee buite die eiendomsgrense verskuif?',
    },
    movedFromHeading: {
      en: 'Location where livestock was moved from',
      af: 'Ligging vanwaar die vee verskuif is',
    },
    movedToHeading: {
      en: 'Location where livestock was moved to',
      af: 'Ligging waarna die vee verskuif is',
    },
    farmNameLabel: {
      en: 'Farm Name',
      af: 'Plaasnaam',
    },
    farmNamePlaceholder: {
      en: 'Enter farm name',
      af: 'Voer plaasnaam in',
    },
    districtLabel: {
      en: 'District',
      af: 'Distrik',
    },
    districtPlaceholder: {
      en: 'Enter district',
      af: 'Voer distrik in',
    },
    provinceLabel: {
      en: 'Province',
      af: 'Provinsie',
    },
    provincePlaceholder: {
      en: 'Enter province',
      af: 'Voer provinsie in',
    },
    movedWhenHeading: {
      en: 'When was the livestock moved there?',
      af: 'Wanneer is die vee daarheen verskuif?',
    },
    yearLabel: {
      en: 'Year',
      af: 'Jaar',
    },
    yearPlaceholder: {
      en: 'Enter year',
      af: 'Voer jaar in',
    },
    monthLabel: {
      en: 'Month',
      af: 'Maand',
    },
    monthPlaceholder: {
      en: 'Enter month',
      af: 'Voer maand in',
    },
  },
  declarationsSection: {
    heading: {
      en: 'Responsible Person Declarations',
      af: 'Verantwoordelike persoon se verklarings',
    },
    intro: {
      en: 'I, {name}, the responsible person, hereby declare and affirm that:',
      af: 'Ek, {name}, die verantwoordelike persoon, verklaar en bevestig hiermee dat:',
    },
    switchTrueLabel: {
      en: 'Correct',
      af: 'Korrek',
    },
    switchFalseLabel: {
      en: 'Wrong',
      af: 'Verkeerd',
    },
    declarationNoClovenHoovedAnimals: {
      en: 'No cloven hooved animals have been introduced onto the farm or gained access to the farm in the 30 days preceding the loading of livestock to {company}',
      af: 'Geen gesplete hoefdiere is in die 30 dae voor die laai van vee na {company} op die plaas ingebring of het toegang tot die plaas verkry nie',
    },
    declarationLivestockKeptAway: {
      en: 'All resident cloven hooved livestock were kept away from boundary camps in the 30 days preceding the loading of livestock to {company}',
      af: 'Alle inwonende gesplete hoefvee is in die 30 dae voor die laai van vee na {company} van grenskampe weggehou',
    },
    declarationNoContactWithNonResidentLivestock: {
      en: 'Resident cloven hooved livestock were in no way in contact with non-resident cloven hooved animals in the 30 days preceding the loading of livestock to {company}.',
      af: 'Inwonende gesplete hoefvee was op geen wyse in kontak met nie-inwonende gesplete hoefdiere in die 30 dae voor die laai van vee na {company} nie.',
    },
    declarationNoAnimalOriginFeed: {
      en: 'No feed of animal origin (for instance chicken litter, bone meal, carcass meal, blood meal, etc.) has ever been fed to the livestock sold to {company}.',
      af: 'Geen voer van dierlike oorsprong (byvoorbeeld hoenderskuur, beenmeel, karkasmeel, bloedmeel, ens.) is ooit aan die vee wat aan {company} verkoop word gevoer nie.',
    },
    declarationVeterinaryProductsRegistered: {
      en: 'All veterinary products used on the farm are registered for use in South Africa and are used according to label directions',
      af: 'Alle veeartsenykundige produkte wat op die plaas gebruik word, is vir gebruik in Suid-Afrika geregistreer en word volgens etiketaanwysings gebruik',
    },
    declarationNoFootMouthDisease: {
      en: 'There has never been a case of Foot and Mouth Disease on the farm',
      af: 'Daar was nog nooit ’n geval van bek-en-klouseer op die plaas nie',
    },
    declarationNoFootMouthDiseaseFarm: {
      en: 'There has been no Foot and Mouth Disease case within a radius of 10 km around the farm in the past 12 months',
      af: 'Daar was die afgelope 12 maande geen bek-en-klouseer-geval binne ’n radius van 10 km rondom die plaas nie',
    },
    declarationNoRiftValleyFever: {
      en: 'There has been no Rift Valley Fever case within a radius of 10 km around the farm in the past 12 months',
      af: 'Daar was die afgelope 12 maande geen Vallei-koors-geval binne ’n radius van 10 km rondom die plaas nie',
    },
    declarationLivestockSouthAfrica: {
      en: 'The livestock sold to {company} were all born in the Republic of South Africa',
      af: 'Die vee wat aan {company} verkoop word, is almal in die Republiek van Suid-Afrika gebore',
    },
    declarationNeverVaccinatedAgainstFmd: {
      en: 'The livestock on the farm have never been vaccinated against Foot and Mouth Disease',
      af: 'Die vee op die plaas is nog nooit teen bek-en-klouseer ingeënt nie',
    },
    declarationNoGeneEditing: {
      en: 'No livestock on the farm has been subjected to gene editing, gene therapy or has been genetically modified by unnatural means',
      af: 'Geen vee op die plaas is aan geenbewerking, geenterapie onderwerp of op onnaturlike wyse geneties verander nie',
    },
    defaultCompanyName: {
      en: 'Chalmar Beef',
      af: 'Chalmar Beef',
    },
  },
  formStepper: {
    prevButton: {
      en: 'Prev',
      af: 'Vorige',
    },
    nextButton: {
      en: 'Next',
      af: 'Volgende',
    },
    stepIndicator: {
      en: 'Step {current} of {total}',
      af: 'Stap {current} van {total}',
    },
  },
  livestockListingForm: {
    loadingMessage: {
      en: 'Loading form...',
      af: 'Laai vorm...',
    },
    toastProfileLoadErrorDescription: {
      en: 'Could not load your profile.',
      af: 'Kon nie jou profiel laai nie.',
    },
    toastInvitationLoadErrorDescription: {
      en: 'Failed to load invitation data.',
      af: 'Kon nie uitnodigingsdata laai nie.',
    },
    toastListingLoadErrorDescription: {
      en: 'Failed to load existing listing data.',
      af: 'Kon nie bestaande lysdata laai nie.',
    },
    toastInitialDataErrorDescription: {
      en: 'Failed to load initial listing data.',
      af: 'Kon nie aanvanklike lysdata laai nie.',
    },
    toastIncompleteTitle: {
      en: 'Incomplete Form',
      af: 'Onvoltooide vorm',
    },
    toastIncompleteDescription: {
      en: 'Please go back through the steps and make sure all required fields are completed.',
      af: 'Gaan asseblief terug deur die stappe en maak seker alle vereiste velde is voltooi.',
    },
    toastUserProfileNotFoundDescription: {
      en: 'User profile not found.',
      af: 'Gebruikersprofiel nie gevind nie.',
    },
    toastSignatureRequiredTitle: {
      en: 'Signature Required',
      af: 'Handtekening vereis',
    },
    toastSignatureRequiredDescription: {
      en: 'Please provide your digital signature.',
      af: 'Verskaf asseblief jou digitale handtekening.',
    },
    toastSubmissionErrorDescription: {
      en: 'There was an error submitting the form. Please try again.',
      af: 'Daar was ’n fout met die indiening van die vorm. Probeer asseblief weer.',
    },
    toastAuthenticationErrorTitle: {
      en: 'Authentication Error',
      af: 'Magtigingsfout',
    },
    toastAuthenticationErrorDescription: {
      en: 'You must be logged in to create a listing.',
      af: 'Jy moet aangemeld wees om ’n lys te skep.',
    },
    toastSuccessDescriptionCreated: {
      en: 'Livestock listing created successfully.',
      af: 'Veelysinskrywing suksesvol geskep.',
    },
    toastSuccessDescriptionUpdated: {
      en: 'Livestock listing updated successfully.',
      af: 'Veelysinskrywing suksesvol bygewerk.',
    },
    cardTitleCreate: {
      en: 'Create Livestock Listing',
      af: 'Skep veelysinskrywing',
    },
    cardTitleEdit: {
      en: 'Edit Livestock Listing',
      af: 'Wysig veelysinskrywing',
    },
    cardDescription: {
      en: 'Submit your livestock details and biosecurity attestation to sell to Chalmar.',
      af: 'Dien jou veebesonderhede en biosekuriteitsertifikaat in om aan Chalmar te verkoop.',
    },
    referenceIdLabel: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    referenceIdDescription: {
      en: 'This is the unique reference for your listing invitation.',
      af: 'Dit is die unieke verwysing vir jou lysuitnodiging.',
    },
    responsiblePersonHeading: {
      en: 'Responsible Person Information',
      af: 'Inligting oor verantwoordelike persoon',
    },
    nameLabel: {
      en: 'Name',
      af: 'Naam',
    },
    designationLabel: {
      en: 'Designation',
      af: 'Aanstelling',
    },
    companyLabel: {
      en: 'Company',
      af: 'Maatskappy',
    },
    companyFallback: {
      en: 'Not specified',
      af: 'Nie gespesifiseer nie',
    },
    movementTrackerTitle: {
      en: 'Movement Tracker',
      af: 'Bewegingsopsporing',
    },
    veterinarianTitle: {
      en: 'Veterinarian',
      af: 'Veearts',
    },
    backButton: {
      en: 'Back',
      af: 'Terug',
    },
    nextButton: {
      en: 'Next',
      af: 'Volgende',
    },
    submitButton: {
      en: 'Submit Listing',
      af: 'Dien lys in',
    },
    updateButton: {
      en: 'Update Listing',
      af: 'Werk lys by',
    },
    submittingLabel: {
      en: 'Submitting...',
      af: 'Dien in...',
    },
    updatingLabel: {
      en: 'Updating...',
      af: 'Werk by...',
    },
  },
  adminDashboard: {
    failedToLoad: {
      en: 'Failed to load dashboard data',
      af: 'Kon nie paneelborddata laai nie',
    },
    failedToLoadInvitations: {
      en: 'Failed to refresh invitations',
      af: 'Kon nie uitnodigings verfris nie',
    },
    loading: {
      en: 'Loading dashboard...',
      af: 'Laai paneelbord...',
    },
    welcomeTitle: {
      en: 'Welcome to Cattle Secure Trace',
      af: 'Welkom by Cattle Secure Trace',
    },
    welcomeDescription: {
      en: 'You need to be associated with a company to access the admin dashboard. Please contact your system administrator.',
      af: 'Jy moet aan ’n maatskappy gekoppel wees om die adminpaneel te gebruik. Kontak asseblief jou stelseladministrateur.',
    },
    superAdminHeading: {
      en: 'Super Admin Dashboard',
      af: 'Super Admin Paneelbord',
    },
    adminHeading: {
      en: 'Admin Dashboard',
      af: 'Admin Paneelbord',
    },
    superAdminSubheading: {
      en: 'Platform-wide management',
      af: 'Platform-wye bestuur',
    },
    adminSubheading: {
      en: 'Company management',
      af: 'Maatskappybestuur',
    },
    overviewTab: {
      en: 'Overview',
      af: 'Oorsig',
    },
    companiesTab: {
      en: 'Companies',
      af: 'Maatskappye',
    },
    invitationsTab: {
      en: 'Invitations',
      af: 'Uitnodigings',
    },
    profileTab: {
      en: 'Profile',
      af: 'Profiel',
    },
    totalCompanies: {
      en: 'Total Companies',
      af: 'Totale Maatskappye',
    },
    totalCompaniesDescription: {
      en: 'Active companies on platform',
      af: 'Aktiewe maatskappye op die platform',
    },
    totalListings: {
      en: 'Total Listings',
      af: 'Totale Lysings',
    },
    totalListingsFrom: {
      en: 'From {company}',
      af: 'Van {company}',
    },
    totalListingsAll: {
      en: 'All companies',
      af: 'Alle maatskappye',
    },
    pendingInvitations: {
      en: 'Pending Invitations',
      af: 'Hangende Uitnodigings',
    },
    pendingInvitationsDescription: {
      en: 'Awaiting response',
      af: 'Wag op antwoord',
    },
    recentUsers: {
      en: 'Recent Users',
      af: 'Onlangse Gebruikers',
    },
    recentUsersDescription: {
      en: 'Latest user registrations',
      af: 'Nuuste gebruikersregistrasies',
    },
    noRecentRegistrations: {
      en: 'No recent registrations',
      af: 'Geen onlangse registrasies nie',
    },
    manageAllUsers: {
      en: 'Manage All Users',
      af: 'Bestuur Alle Gebruikers',
    },
    companyManagement: {
      en: 'Company Management',
      af: 'Maatskappybestuur',
    },
    companyManagementDescription: {
      en: 'Manage companies and relationships',
      af: 'Bestuur maatskappye en verhoudings',
    },
    manageAllCompanies: {
      en: 'Manage All Companies',
      af: 'Bestuur Alle Maatskappye',
    },
    createNewCompany: {
      en: 'Create New Company',
      af: 'Skep Nuwe Maatskappy',
    },
    manageCompanyUsers: {
      en: 'Manage Company Users',
      af: 'Bestuur Maatskappygebruikers',
    },
    statusApproved: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusSuspended: {
      en: 'Suspended',
      af: 'Geskors',
    },
    statusRejected: {
      en: 'Rejected',
      af: 'Afgewys',
    },
    roleSuperAdmin: {
      en: 'Super Admin',
      af: 'Super Administrateur',
    },
    roleAdmin: {
      en: 'Admin',
      af: 'Administrateur',
    },
    roleSeller: {
      en: 'Seller',
      af: 'Verkoper',
    },
    roleVet: {
      en: 'Veterinarian',
      af: 'Veearts',
    },
    roleAgent: {
      en: 'Agent',
      af: 'Agent',
    },
    roleDriver: {
      en: 'Driver',
      af: 'Bestuurder',
    },
    roleLoadMaster: {
      en: 'Load Master',
      af: 'Laaimeester',
    },
    unknownRole: {
      en: 'Unknown role',
      af: 'Onbekende rol',
    },
  },
  adminUsers: {
    toastSuccessTitle: {
      en: 'Success',
      af: 'Sukses',
    },
    toastErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    toastLoadUsersError: {
      en: 'Failed to load users',
      af: 'Kon nie gebruikers laai nie',
    },
    toastInviteSuccess: {
      en: 'User invited successfully',
      af: 'Gebruiker suksesvol genooi',
    },
    toastInviteError: {
      en: 'Failed to invite user',
      af: 'Kon nie gebruiker nooi nie',
    },
    toastRemoveSuccess: {
      en: 'User removed from company',
      af: 'Gebruiker uit maatskappy verwyder',
    },
    toastRemoveError: {
      en: 'Failed to remove user',
      af: 'Kon nie gebruiker verwyder nie',
    },
    toastApproveSuccess: {
      en: 'User approved successfully',
      af: 'Gebruiker suksesvol goedgekeur',
    },
    toastApproveError: {
      en: 'Failed to approve user',
      af: 'Kon nie gebruiker goedkeur nie',
    },
    backToDashboard: {
      en: 'Back to Dashboard',
      af: 'Terug na paneelbord',
    },
    pageTitle: {
      en: 'Company Users',
      af: 'Maatskappygebruikers',
    },
    cardTitleWithCount: {
      en: 'Company Users ({count})',
      af: 'Maatskappygebruikers ({count})',
    },
    systemWideDescription: {
      en: 'Manage users across the entire platform',
      af: 'Bestuur gebruikers oor die hele platform',
    },
    companyDescription: {
      en: 'Manage users for {company}',
      af: 'Bestuur gebruikers vir {company}',
    },
    inviteUserButton: {
      en: 'Invite User',
      af: 'Nooi gebruiker',
    },
    noCompanyAccessTitle: {
      en: 'No Company Access',
      af: 'Geen maatskappytoegang nie',
    },
    noCompanyAccessDescription: {
      en: "You don't have access to any companies. Please contact your administrator.",
      af: 'Jy het nie toegang tot enige maatskappye nie. Kontak asseblief jou administrateur.',
    },
    approvedLabel: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    pendingLabel: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    cardDescription: {
      en: 'Manage users and their roles within your company',
      af: 'Bestuur gebruikers en hul rolle binne jou maatskappy',
    },
    tableUser: {
      en: 'User',
      af: 'Gebruiker',
    },
    tableRole: {
      en: 'Role',
      af: 'Rol',
    },
    tableStatus: {
      en: 'Status',
      af: 'Status',
    },
    tableJoined: {
      en: 'Joined',
      af: 'Aangesluit',
    },
    tableActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    actionApprove: {
      en: 'Approve',
      af: 'Keur goed',
    },
    actionRemove: {
      en: 'Remove',
      af: 'Verwyder',
    },
    ownerBadge: {
      en: 'Owner',
      af: 'Eienaar',
    },
    noUsersFound: {
      en: 'No users found',
      af: 'Geen gebruikers gevind nie',
    },
    inviteDialogTitle: {
      en: 'Invite User',
      af: 'Nooi gebruiker',
    },
    inviteDialogDescription: {
      en: 'Invite a new user to join your company by email.',
      af: 'Nooi ’n nuwe gebruiker om per e-pos by jou maatskappy aan te sluit.',
    },
    emailLabel: {
      en: 'Email address',
      af: 'E-posadres',
    },
    emailPlaceholder: {
      en: 'user@example.com',
      af: 'gebruiker@voorbeeld.com',
    },
    roleLabel: {
      en: 'Role',
      af: 'Rol',
    },
    rolePlaceholder: {
      en: 'Select a role',
      af: 'Kies ’n rol',
    },
    sendingLabel: {
      en: 'Sending...',
      af: 'Stuur...',
    },
    sendInvitationButton: {
      en: 'Send Invitation',
      af: 'Stuur uitnodiging',
    },
  },
  adminInvitations: {
    formTitle: {
      en: 'Create Listing Invitation',
      af: 'Skep Lysuitnodiging',
    },
    formDescription: {
      en: 'Invite a seller to list their livestock. A unique reference ID will be generated.',
      af: 'Nooi ’n verkoper om hul vee te lys. ’n Unieke verwysings-ID sal gegenereer word.',
    },
    referenceLabel: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    selectExistingSellerLabel: {
      en: 'Select an Existing Seller',
      af: 'Kies ’n bestaande verkoper',
    },
    selectSellerPlaceholder: {
      en: 'Select a registered seller',
      af: 'Kies ’n geregistreerde verkoper',
    },
    inviteByEmailLabel: {
      en: 'Invite a New Seller by Email',
      af: 'Nooi ’n nuwe verkoper per e-pos',
    },
    emailPlaceholder: {
      en: "Enter seller's email address",
      af: 'Voer die verkoper se e-posadres in',
    },
    orSeparator: {
      en: 'OR',
      af: 'OF',
    },
    submitButton: {
      en: 'Send Invitation',
      af: 'Stuur uitnodiging',
    },
    submittingLabel: {
      en: 'Sending Invitation...',
      af: 'Stuur uitnodiging...',
    },
    loadSellersError: {
      en: 'Failed to load sellers.',
      af: 'Kon nie verkopers laai nie.',
    },
    loading: {
      en: 'Loading invitations...',
      af: 'Laai uitnodigings...',
    },
    title: {
      en: 'Listing Invitations',
      af: 'Lysuitnodigings',
    },
    description: {
      en: 'Manage and track all listing invitations sent to sellers.',
      af: 'Bestuur en volg alle lysuitnodigings wat aan verkopers gestuur is.',
    },
    searchPlaceholder: {
      en: 'Search by reference, seller, or company...',
      af: 'Soek volgens verwysing, verkoper of maatskappy...',
    },
    invitationFilterLabel: {
      en: 'Invitation Status',
      af: 'Uitnodigingstatus',
    },
    invitationFilterPlaceholder: {
      en: 'Filter by invitation status',
      af: 'Filter volgens uitnodigingstatus',
    },
    listingFilterLabel: {
      en: 'Listing Status',
      af: 'Lysstatus',
    },
    listingFilterPlaceholder: {
      en: 'Filter by listing status',
      af: 'Filter volgens lysstatus',
    },
    allOption: {
      en: 'All',
      af: 'Almal',
    },
    rowsLabel: {
      en: 'Rows',
      af: 'Rye',
    },
    rowsOption: {
      en: '{count} rows',
      af: '{count} rye',
    },
    tableReferenceId: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    tableSeller: {
      en: 'Seller',
      af: 'Verkoper',
    },
    tableInvitationStatus: {
      en: 'Invitation Status',
      af: 'Uitnodigingstatus',
    },
    tableListingStatus: {
      en: 'Listing Status',
      af: 'Lysstatus',
    },
    tableDateSent: {
      en: 'Date Sent',
      af: 'Datum Gestuur',
    },
    tableActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    viewButton: {
      en: 'View',
      af: 'Bekyk',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusAccepted: {
      en: 'Accepted',
      af: 'Aanvaar',
    },
    statusDeclined: {
      en: 'Declined',
      af: 'Afgekeur',
    },
    statusCancelled: {
      en: 'Cancelled',
      af: 'Gekanselleer',
    },
    statusExpired: {
      en: 'Expired',
      af: 'Verstryk',
    },
    listingStatusNotStarted: {
      en: 'Not Started',
      af: 'Nie Begin Nie',
    },
    listingStatusDraft: {
      en: 'Draft',
      af: 'Konsep',
    },
    listingStatusSubmittedToVet: {
      en: 'Submitted to Vet',
      af: 'Ingedien by Veearts',
    },
    listingStatusInProgress: {
      en: 'In Progress',
      af: 'Aan die Gang',
    },
    listingStatusCompleted: {
      en: 'Completed',
      af: 'Voltooi',
    },
    listingStatusApproved: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    listingStatusRejected: {
      en: 'Rejected',
      af: 'Afgekeur',
    },
  },
  loadMasterDashboard: {
    heading: {
      en: 'Load Master Dashboard',
      af: 'Laai-meesterpaneelbord',
    },
    welcomeMessage: {
      en: 'Welcome back, {name}!',
      af: 'Welkom terug, {name}!',
    },
    assignedCardTitle: {
      en: 'Assigned Listings',
      af: 'Toegewysde lysings',
    },
    assignedCardDescription: {
      en: 'Listings ready for loading',
      af: 'Lysings gereed vir laai',
    },
    assignedCardFooter: {
      en: 'Ready for loading',
      af: 'Gereed vir laai',
    },
    completedCardTitle: {
      en: 'Completed Loadings',
      af: 'Voltooide laaiings',
    },
    completedCardDescription: {
      en: 'Successfully completed loadings',
      af: 'Suksesvol voltooide laaiings',
    },
    completedCardFooter: {
      en: 'Completed this period',
      af: 'Voltooi in hierdie periode',
    },
    profileCardTitle: {
      en: 'Profile Status',
      af: 'Profielstatus',
    },
    profileCardDescription: {
      en: 'Your account status: {status}',
      af: 'Jou rekeningstatus: {status}',
    },
    profileStatusPending: {
      en: 'Your account is pending approval',
      af: 'Jou rekening wag op goedkeuring',
    },
    profileStatusApproved: {
      en: 'Your account is approved and active',
      af: 'Jou rekening is goedgekeur en aktief',
    },
    profileStatusSuspended: {
      en: 'Your account has been suspended',
      af: 'Jou rekening is geskors',
    },
    assignedSectionTitle: {
      en: 'Assigned Listings - Ready for Loading',
      af: 'Toegewysde lysings - gereed vir laai',
    },
    assignedSectionDescription: {
      en: 'Livestock listings that have been vet-approved and assigned to you for loading',
      af: 'Veelysings wat deur die veearts goedgekeur is en aan jou vir laai toegewys is',
    },
    refreshButton: {
      en: 'Refresh',
      af: 'Verfris',
    },
    loadingAssignedMessage: {
      en: 'Loading assigned listings...',
      af: 'Laai tans toegewysde lysings...',
    },
    emptyAssignedMessage: {
      en: 'No listings currently assigned for loading',
      af: 'Geen lysings tans vir laai toegewys nie',
    },
    tableReference: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    tableSeller: {
      en: 'Seller',
      af: 'Verkoper',
    },
    tableCompany: {
      en: 'Company',
      af: 'Maatskappy',
    },
    tableLivestock: {
      en: 'Livestock',
      af: 'Vee',
    },
    tableStatus: {
      en: 'Status',
      af: 'Status',
    },
    tableCreated: {
      en: 'Created',
      af: 'Geskep',
    },
    tableActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    livestockCountCattle: {
      en: '{count} Cattle',
      af: '{count} beeste',
    },
    livestockCountSheep: {
      en: '{count} Sheep',
      af: '{count} skape',
    },
    startLoadingButton: {
      en: 'Start Loading',
      af: 'Begin laai',
    },
    completedSectionTitle: {
      en: 'Completed Loadings',
      af: 'Voltooide laaiings',
    },
    completedSectionDescription: {
      en: 'Recently completed loading operations',
      af: 'Onlangs voltooide laaiings',
    },
    emptyCompletedMessage: {
      en: 'No completed loadings yet',
      af: 'Geen laaiings nog voltooi nie',
    },
    tableTruckRegistration: {
      en: 'Truck Registration',
      af: 'Vragmotorregistrasie',
    },
    tableCompleted: {
      en: 'Completed',
      af: 'Voltooi',
    },
    dialogTitle: {
      en: 'Complete Loading Details',
      af: 'Voltooi laadbesonderhede',
    },
    toastLoadErrorDescription: {
      en: 'Failed to load assigned listings. Please try again.',
      af: 'Kon nie toegewysde lysings laai nie. Probeer asseblief weer.',
    },
    toastSuccessDescription: {
      en: 'Loading completed successfully!',
      af: 'Laai suksesvol voltooi!',
    },
    statusReadyBadge: {
      en: 'Ready for Loading',
      af: 'Gereed vir laai',
    },
    statusAvailableBadge: {
      en: 'Available for Loading',
      af: 'Beskikbaar vir laai',
    },
    statusAssignedBadge: {
      en: 'Assigned to You',
      af: 'Aan jou toegewys',
    },
    statusCompletedBadge: {
      en: 'Loading Completed',
      af: 'Laai voltooi',
    },
    pointSummary: {
      en: 'Point {index}: {count} {animal}',
      af: 'Punt {index}: {count} {animal}',
    },
    pointSummaryZero: {
      en: 'Point {index}: 0',
      af: 'Punt {index}: 0',
    },
    pointLabelCattle: {
      en: 'cattle',
      af: 'beeste',
    },
    pointLabelSheep: {
      en: 'sheep',
      af: 'skape',
    },
    noLoadingPoints: {
      en: 'No loading points',
      af: 'Geen laaipunte nie',
    },
  },
  vetDashboard: {
    title: {
      en: 'Veterinary Dashboard',
      af: 'Veearts Paneelbord',
    },
    description: {
      en: 'Manage livestock declarations and inspections',
      af: 'Bestuur veeverklarings en inspeksies',
    },
    tabDashboard: {
      en: 'Dashboard',
      af: 'Paneelbord',
    },
    tabProfile: {
      en: 'Profile',
      af: 'Profiel',
    },
    statsPendingTitle: {
      en: 'Pending Declarations',
      af: 'Hangende verklarings',
    },
    statsPendingDescription: {
      en: 'Awaiting completion',
      af: 'Wag op voltooiing',
    },
    statsCompletedTitle: {
      en: 'Completed',
      af: 'Voltooi',
    },
    statsCompletedDescription: {
      en: 'This month',
      af: 'Hierdie maand',
    },
    statsTotalAssignmentsTitle: {
      en: 'Total Assignments',
      af: 'Totale toewysings',
    },
    statsTotalAssignmentsDescriptionAll: {
      en: 'All companies',
      af: 'Alle maatskappye',
    },
    statsTotalAssignmentsDescriptionCompany: {
      en: 'From {company}',
      af: 'Van {company}',
    },
    statsActiveCompaniesTitle: {
      en: 'Active Companies',
      af: 'Aktiewe maatskappye',
    },
    statsActiveCompaniesDescription: {
      en: 'Associated companies',
      af: 'Gekoppelde maatskappye',
    },
    cardPendingTitle: {
      en: 'Pending Declarations',
      af: 'Hangende verklarings',
    },
    cardPendingDescription: {
      en: 'Livestock listings requiring your veterinary declaration.',
      af: 'Veelysings wat jou veeartsenyverklaring benodig.',
    },
    tableReferenceId: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    tableOwner: {
      en: 'Owner',
      af: 'Eienaar',
    },
    tableLocation: {
      en: 'Location',
      af: 'Ligging',
    },
    tableActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    buttonCompleteDeclaration: {
      en: 'Complete Declaration',
      af: 'Voltooi verklaring',
    },
    emptyStateTitle: {
      en: 'No pending declarations',
      af: 'Geen hangende verklarings nie',
    },
    emptyStateSubtitleCompany: {
      en: 'No assignments from {company}',
      af: 'Geen toewysings van {company} nie',
    },
    emptyStateSubtitleAll: {
      en: 'No assignments available',
      af: 'Geen toewysings beskikbaar nie',
    },
    toastErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    toastAssignmentsError: {
      en: 'Failed to load assignments',
      af: 'Kon nie toewysings laai nie',
    },
    toastDashboardError: {
      en: 'Failed to load dashboard data',
      af: 'Kon nie paneelborddata laai nie',
    },
  },
  createListingPage: {
    title: {
      en: 'Create Livestock Listing',
      af: 'Skep Veelys',
    },
    description: {
      en: 'Complete the form below to create your listing for reference:',
      af: 'Voltooi die onderstaande vorm om jou lys vir verwysing te skep:',
    },
    fetchError: {
      en: 'Failed to fetch invitation details.',
      af: 'Kon nie uitnodigingsbesonderhede kry nie.',
    },
    invitationNotFound: {
      en: 'Invitation not found or you do not have permission to view it.',
      af: 'Uitnodiging nie gevind nie of jy het nie toestemming om dit te sien nie.',
    },
    invitationMissing: {
      en: 'Invitation not found.',
      af: 'Uitnodiging nie gevind nie.',
    },
  },
  fileUploadManager: {
    chooseFileButton: {
      en: 'Choose File',
      af: 'Kies Lêer',
    },
    takePhotoButton: {
      en: 'Take Photo',
      af: 'Neem Foto',
    },
    uploadSuccessTitle: {
      en: 'Upload Successful',
      af: 'Oplaai Suksesvol',
    },
    uploadSuccessDescription: {
      en: 'File uploaded successfully',
      af: 'Lêer suksesvol opgelaai',
    },
    uploadErrorTitle: {
      en: 'Upload Failed',
      af: 'Oplaai het misluk',
    },
    uploadErrorGeneric: {
      en: 'Upload failed',
      af: 'Oplaai het misluk',
    },
    invalidFileType: {
      en: 'Invalid file type. Allowed types: {types}',
      af: 'Ongeldige lêertipe. Toegelate tipes: {types}',
    },
    fileSizeTooLarge: {
      en: 'File size too large. Maximum size: {size}',
      af: 'Lêer is te groot. Maksimum grootte: {size}',
    },
    uploadedFileLabel: {
      en: 'Uploaded file',
      af: 'Opgelaaide lêer',
    },
    uploadedStatus: {
      en: 'Uploaded',
      af: 'Opgelaai',
    },
    uploadingProgress: {
      en: 'Uploading... {progress}%',
      af: 'Laai tans op... {progress}%',
    },
    uploadButton: {
      en: 'Upload File',
      af: 'Laai Lêer Op',
    },
    viewFileButton: {
      en: 'View File',
      af: 'Sien Lêer',
    },
    acceptedFormats: {
      en: 'Accepted formats: {formats}',
      af: 'Aanvaarde formate: {formats}',
    },
    maxSize: {
      en: 'Maximum size: {size}',
      af: 'Maksimum grootte: {size}',
    },
  },
  livestockListingDialog: {
    triggerLabel: {
      en: 'Add Livestock Listing',
      af: 'Voeg veelys by',
    },
  },
  sellerLivestockDialog: {
    title: {
      en: 'My Livestock Listings',
      af: 'My veelysings',
    },
  },
  sellerLivestockTable: {
    loadingMessage: {
      en: 'Loading livestock listings...',
      af: 'Laai veelysings...',
    },
    title: {
      en: 'My Livestock Listings',
      af: 'My veelysings',
    },
    description: {
      en: 'View and manage your livestock listings',
      af: 'Bekyk en bestuur jou veelysings',
    },
    emptyState: {
      en: 'No livestock listings found. Create your first listing to get started.',
      af: 'Geen veelysings gevind nie. Skep jou eerste lys om te begin.',
    },
    columnOwner: {
      en: 'Owner Name',
      af: 'Eienaar se naam',
    },
    columnLocation: {
      en: 'Location',
      af: 'Ligging',
    },
    columnBreed: {
      en: 'Breed',
      af: 'Ras',
    },
    columnTotalLivestock: {
      en: 'Total Livestock',
      af: 'Totale vee',
    },
    columnStatus: {
      en: 'Status',
      af: 'Status',
    },
    columnCreated: {
      en: 'Created',
      af: 'Geskep',
    },
    columnActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    viewButton: {
      en: 'View',
      af: 'Bekyk',
    },
    editButton: {
      en: 'Edit',
      af: 'Wysig',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusApproved: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    statusRejected: {
      en: 'Rejected',
      af: 'Afgewys',
    },
    statusDefault: {
      en: 'Unknown',
      af: 'Onbekend',
    },
    toastErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    toastErrorDescription: {
      en: 'Failed to load livestock listings',
      af: 'Kon nie veelysings laai nie',
    },
    toastCannotEditTitle: {
      en: 'Cannot Edit',
      af: 'Kan nie wysig nie',
    },
    toastCannotEditDescription: {
      en: 'This listing cannot be edited because it has received offers',
      af: 'Hierdie lys kan nie gewysig word nie omdat dit aanbiedinge ontvang het',
    },
  },
  offerDetailsDialog: {
    title: {
      en: 'Offer Details',
      af: 'Aanbodbesonderhede',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusAccepted: {
      en: 'Accepted',
      af: 'Aanvaar',
    },
    statusDeclined: {
      en: 'Declined',
      af: 'Afgekeur',
    },
    listingSectionTitle: {
      en: 'Listing Information',
      af: 'Lysinligting',
    },
    listingOwnerLabel: {
      en: 'Owner',
      af: 'Eienaar',
    },
    listingLocationLabel: {
      en: 'Location',
      af: 'Ligging',
    },
    listingBreedLabel: {
      en: 'Breed',
      af: 'Ras',
    },
    listingTotalLivestockLabel: {
      en: 'Total Livestock',
      af: 'Totale vee',
    },
    termsSectionTitle: {
      en: 'Offer Terms',
      af: 'Aanbodvoorwaardes',
    },
    chalmarOfferLabel: {
      en: 'Chalmar Beef Offer',
      af: 'Chalmar Beef-aanbod',
    },
    toWeightLabel: {
      en: 'To Weight',
      af: 'Tot gewig',
    },
    thenPenalizationLabel: {
      en: 'Then Penalization',
      af: 'Dan boete',
    },
    andFromLabel: {
      en: 'And From',
      af: 'En van',
    },
    penalizationLabel: {
      en: 'Penalization',
      af: 'Boete',
    },
    percentHeifersAllowedLabel: {
      en: '% Heifers Allowed',
      af: '% Verse toegelaat',
    },
    additionalHeifersPenaltyLabel: {
      en: 'Additional Heifers Penalty',
      af: 'Bykomende verse boete',
    },
    validUntilLabel: {
      en: 'Valid Until',
      af: 'Geldig tot',
    },
    additionalR25Text: {
      en: 'Additional R25 per calf payment for turnover of less than R10 million',
      af: 'Bykomende R25 per kalf-betaling vir omset van minder as R10 miljoen',
    },
    affidavitRequiredText: {
      en: 'Attached sworn affidavit must be completed and submitted',
      af: 'Aangehegte beëdigde verklaring moet voltooi en ingedien word',
    },
    responseNotesLabel: {
      en: 'Response Notes (Optional)',
      af: 'Antwoordnotas (Opsioneel)',
    },
    responseNotesPlaceholder: {
      en: 'Add any notes or comments about your response...',
      af: 'Voeg enige notas of kommentaar oor jou antwoord by...',
    },
    declineButton: {
      en: 'Decline Offer',
      af: 'Wys aanbod af',
    },
    acceptButton: {
      en: 'Accept Offer',
      af: 'Aanvaar aanbod',
    },
    responseDetailsTitle: {
      en: 'Response Details',
      af: 'Antwoordbesonderhede',
    },
    responseDateLabel: {
      en: 'Response Date',
      af: 'Antwoorddatum',
    },
    notesLabel: {
      en: 'Notes',
      af: 'Notas',
    },
    noteHeading: {
      en: 'Note:',
      af: 'Let wel:',
    },
    noteDescription: {
      en: 'This offer is subject to biosecurity terms and evaluation of biosecurity and trace-ability assessment as well as the veterinary declaration. If Chalmar Beef is placed under quarantine before the livestock is offloaded, the offer is withdrawn.',
      af: 'Hierdie aanbod is onderhewig aan biosekuriteitsbepalings en evaluering van biosekuriteit en naspeurbaarheid asook die veeartsenykundige verklaring. As Chalmar Beef onder kwarantyn geplaas word voordat die vee afgelaai word, word die aanbod teruggetrek.',
    },
    closeButton: {
      en: 'Close',
      af: 'Maak toe',
    },
    toastSuccessTitle: {
      en: 'Success',
      af: 'Sukses',
    },
    toastSuccessDescription: {
      en: 'Offer {status} successfully!',
      af: 'Aanbod is suksesvol {status}!',
    },
    toastErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    toastErrorDescription: {
      en: 'Failed to update offer. Please try again.',
      af: 'Kon nie aanbod bywerk nie. Probeer asseblief weer.',
    },
    statusUnknown: {
      en: 'Unknown',
      af: 'Onbekend',
    },
    biosecurityNoteTitle: {
      en: 'Biosecurity Notice',
      af: 'Biosekuriteitskennisgewing',
    },
  },
  profileCompletionForm: {
    sellerTitle: {
      en: 'Seller Profile',
      af: 'Verkoperprofiel',
    },
    agentTitle: {
      en: 'Agent Profile',
      af: 'Agentprofiel',
    },
    vetTitle: {
      en: 'Vet Profile',
      af: 'Veeartsprofiel',
    },
    loadMasterTitle: {
      en: 'Load Master Profile',
      af: 'Laai-meester-profiel',
    },
    defaultTitle: {
      en: 'Profile Completion',
      af: 'Profielvoltooiing',
    },
    cardDescription: {
      en: 'Please complete your profile to proceed with account verification',
      af: 'Voltooi asseblief jou profiel om met rekeningverifikasie voort te gaan',
    },
    userInfoHeading: {
      en: 'Your Information',
      af: 'Jou inligting',
    },
    nameLabel: {
      en: 'Name',
      af: 'Naam',
    },
    emailLabel: {
      en: 'Email',
      af: 'E-pos',
    },
    phoneLabel: {
      en: 'Phone',
      af: 'Telefoon',
    },
    sellerSectionTitle: {
      en: 'Livestock Owner Information',
      af: 'Veebesitter-inligting',
    },
    ownershipQuestion: {
      en: 'The livestock is owned by a:',
      af: 'Die vee word besit deur:',
    },
    ownershipSoleProprietor: {
      en: 'Sole Proprietor',
      af: 'Alleeneienaar',
    },
    ownershipPartnership: {
      en: 'Partnership',
      af: 'Vennootskap',
    },
    ownershipTrust: {
      en: 'Trust',
      af: 'Trust',
    },
    ownershipCompany: {
      en: 'Company',
      af: 'Maatskappy',
    },
    entityNameLabel: {
      en: 'Name of Entity *',
      af: 'Naam van entiteit *',
    },
    responsibleTitleLabel: {
      en: 'Title of the responsible person:',
      af: 'Titel van die verantwoordelike persoon:',
    },
    selectTitlePlaceholder: {
      en: 'Select title',
      af: 'Kies titel',
    },
    titleSoleProprietor: {
      en: 'Sole Proprietor',
      af: 'Alleeneienaar',
    },
    titlePartner: {
      en: 'Partner',
      af: 'Vennoot',
    },
    titleTrustee: {
      en: 'Trustee',
      af: 'Trustee',
    },
    titleDirector: {
      en: 'Director',
      af: 'Direkteur',
    },
    titleHerdManager: {
      en: 'Herd Manager',
      af: 'Kuddebestuurder',
    },
    idUploadLabelSeller: {
      en: 'Photo of I.D. or drivers licence of person offering livestock',
      af: 'Foto van ID of bestuurslisensie van die persoon wat vee aanbied',
    },
    brandMarkUploadLabel: {
      en: 'Photo of brand mark of livestock owner',
      af: 'Foto van die vee-eienaar se brandmerk',
    },
    idUploadLabel: {
      en: 'Photo of I.D. or drivers licence',
      af: 'Foto van ID of bestuurslisensie',
    },
    appointmentLetterUploadLabel: {
      en: 'Photo of agency appointment letter',
      af: 'Foto van agentskap-aanstellingsbrief',
    },
    apacUploadLabel: {
      en: 'Photo of APAC registration',
      af: 'Foto van APAC-registrasie',
    },
    agencyRepresentedLabel: {
      en: 'Agency Represented *',
      af: 'Agentskap verteenwoordig *',
    },
    registrationNumberLabel: {
      en: 'Registration Number *',
      af: 'Registrasienommer *',
    },
    practiceLetterheadUploadLabel: {
      en: 'Photo of practice letter head',
      af: 'Foto van die praktyk se briefhoof',
    },
    biosecuritySectionTitle: {
      en: 'Responsible Person Declaration',
      af: 'Verklaring deur verantwoordelike persoon',
    },
    declarationResponsiblePerson: {
      en: 'The responsible person is directly involved in the daily management of the farming enterprise and can attest to the required information. The responsible person must be 18 years or older.',
      af: 'Die verantwoordelike persoon is direk betrokke by die daaglikse bestuur van die boerdery en kan die vereiste inligting bevestig. Die verantwoordelike persoon moet 18 jaar of ouer wees.',
    },
    loadProfileError: {
      en: 'Could not load profile. Please try again.',
      af: 'Kon nie profiel laai nie. Probeer asseblief weer.',
    },
    toastSignatureRequired: {
      en: 'Digital signature is required to complete your profile.',
      af: 'Digitale handtekening is nodig om jou profiel te voltooi.',
    },
    toastIdRequired: {
      en: 'ID document upload is required.',
      af: 'ID-dokumentoplaai is verpligtend.',
    },
    toastBrandMarkRequired: {
      en: 'Brand mark photo upload is required for sellers.',
      af: 'Brandmerk-foto is verpligtend vir verkopers.',
    },
    toastVetLetterheadRequired: {
      en: 'Practice letterhead upload is required for veterinarians.',
      af: 'Oplaai van praktyk-briefhoof is verpligtend vir veeartse.',
    },
    toastAgentDocumentsRequired: {
      en: 'Appointment letter and APAC registration uploads are required for agents.',
      af: 'Aanstellingsbrief en APAC-registrasie moet deur agente opgelaai word.',
    },
    toastSuccessDescription: {
      en: 'Profile completed successfully! Redirecting to your dashboard...',
      af: 'Profiel suksesvol voltooi! Neem jou na jou paneelbord...',
    },
    toastErrorDescription: {
      en: 'Failed to complete profile. Please try again.',
      af: 'Kon nie profiel voltooi nie. Probeer asseblief weer.',
    },
    buttonSubmitting: {
      en: 'Submitting...',
      af: 'Dien tans in...',
    },
    buttonSubmit: {
      en: 'Complete Profile',
      af: 'Voltooi profiel',
    },
  },
  sellerDashboard: {
    title: {
      en: 'Seller Dashboard',
      af: 'Verkoper Paneelbord',
    },
    description: {
      en: 'Manage your livestock listings and sales',
      af: 'Bestuur jou veelysings en verkope',
    },
    tabDashboard: {
      en: 'Dashboard',
      af: 'Paneelbord',
    },
    tabFarms: {
      en: 'Farms',
      af: 'Plase',
    },
    tabProfile: {
      en: 'Profile',
      af: 'Profiel',
    },
    toastErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    toastDashboardError: {
      en: 'Failed to load dashboard data',
      af: 'Kon nie paneelborddata laai nie',
    },
  },
  adminViewListing: {
    backButtonLabel: {
      en: 'Back to Dashboard',
      af: 'Terug na paneelbord',
    },
    loadingMessage: {
      en: 'Loading listing details...',
      af: 'Laai lysbesonderhede...',
    },
    errorMessage: {
      en: 'Failed to load listing details.',
      af: 'Kon nie lysbesonderhede laai nie.',
    },
    notFoundMessage: {
      en: 'Listing not found.',
      af: 'Lys nie gevind nie.',
    },
    cardTitle: {
      en: 'Listing Details',
      af: 'Lysbesonderhede',
    },
    cardReference: {
      en: 'Reference ID: {reference}',
      af: 'Verwysings-ID: {reference}',
    },
    cardCompany: {
      en: 'Company: {company}',
      af: 'Maatskappy: {company}',
    },
    unknownCompany: {
      en: 'Unknown Company',
      af: 'Onbekende maatskappy',
    },
    statusFallback: {
      en: 'Status',
      af: 'Status',
    },
    statusDraft: {
      en: 'Draft',
      af: 'Konsep',
    },
    statusSubmittedToVet: {
      en: 'Submitted to Vet',
      af: 'Ingedien by veearts',
    },
    statusVetCompleted: {
      en: 'Vet Completed',
      af: 'Veearts voltooi',
    },
    statusAvailableForLoading: {
      en: 'Available for Loading',
      af: 'Beskikbaar vir laai',
    },
    statusAssignedToLoadMaster: {
      en: 'Assigned to Load Master',
      af: 'Aan laai-meester toegewys',
    },
    statusLoadingCompleted: {
      en: 'Loading Completed',
      af: 'Laai voltooi',
    },
    statusCompleted: {
      en: 'Completed',
      af: 'Voltooi',
    },
    statusApproved: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    statusRejected: {
      en: 'Rejected',
      af: 'Afgewys',
    },
    statusCancelled: {
      en: 'Cancelled',
      af: 'Gekanselleer',
    },
    statusExpired: {
      en: 'Expired',
      af: 'Verval',
    },
    statusInProgress: {
      en: 'In Progress',
      af: 'Aan die gang',
    },
    statusNotStarted: {
      en: 'Not Started',
      af: 'Nog nie begin nie',
    },
    accordionGeneralTitle: {
      en: 'General Information',
      af: 'Algemene inligting',
    },
    accordionLivestockTitle: {
      en: 'Livestock Details',
      af: 'Veebesonderhede',
    },
    accordionLocationTitle: {
      en: 'Location & Loading Points',
      af: 'Ligging en laaipunte',
    },
    accordionDeclarationsTitle: {
      en: 'Declarations',
      af: 'Verklarings',
    },
    accordionLoadingTitle: {
      en: 'Loading Information',
      af: 'Laai-inligting',
    },
    accordionVeterinaryTitle: {
      en: 'Veterinary Declaration',
      af: 'Veeartsenyverklaring',
    },
    ownerNameLabel: {
      en: 'Owner Name',
      af: 'Eienaar se naam',
    },
    livestockTypeLabel: {
      en: 'Livestock Type',
      af: 'Soort vee',
    },
    bredOrBoughtLabel: {
      en: 'Bred or Bought',
      af: 'Geteel of aangekoop',
    },
    breederNameLabel: {
      en: 'Breeder Name',
      af: 'Teler se naam',
    },
    breederSellerLabel: {
      en: 'Is Breeder the Seller?',
      af: 'Is die teler die verkoper?',
    },
    totalLivestockLabel: {
      en: 'Total Livestock',
      af: 'Totale vee',
    },
    numberOfMalesLabel: {
      en: 'Number of Males',
      af: 'Aantal manlike diere',
    },
    numberOfFemalesLabel: {
      en: 'Number of Females',
      af: 'Aantal wyfies',
    },
    malesCastratedLabel: {
      en: 'Males Castrated',
      af: 'Manlike diere gekastreer',
    },
    locationLabel: {
      en: 'Location',
      af: 'Ligging',
    },
    movedOutOfBoundariesLabel: {
      en: 'Livestock Moved Out of Boundaries',
      af: 'Vee buite grense verskuif',
    },
    movedFromLabel: {
      en: 'Moved Location From',
      af: 'Verskuif vanaf ligging',
    },
    movedToLabel: {
      en: 'Moved Location To',
      af: 'Verskuif na ligging',
    },
    loadingSummaryHeading: {
      en: 'Livestock Loading Summary',
      af: 'Opsomming van veelaai',
    },
    totalCattleLabel: {
      en: 'Total Cattle:',
      af: 'Totale beeste:',
    },
    totalSheepLabel: {
      en: 'Total Sheep:',
      af: 'Totale skape:',
    },
    noLivestockLabel: {
      en: 'No livestock',
      af: 'Geen vee',
    },
    loadingPointsHeading: {
      en: 'Loading Points Breakdown',
      af: 'Uiteensetting van laaipunte',
    },
    loadingPointTitle: {
      en: 'Loading Point {index}',
      af: 'Laaipunt {index}',
    },
    loadingPointCattleBadge: {
      en: '{count} Cattle',
      af: '{count} beeste',
    },
    loadingPointSheepBadge: {
      en: '{count} Sheep',
      af: '{count} skape',
    },
    birthLabel: {
      en: 'Birth:',
      af: 'Geboorte:',
    },
    currentLabel: {
      en: 'Current:',
      af: 'Huidig:',
    },
    loadingLabel: {
      en: 'Loading:',
      af: 'Laai:',
    },
    sameAsBirthAddress: {
      en: 'Same as birth address',
      af: 'Dieselfde as geboorteadres',
    },
    sameAsCurrentAddress: {
      en: 'Same as current address',
      af: 'Dieselfde as huidige adres',
    },
    maleFemaleLabel: {
      en: 'Male/Female:',
      af: 'Manlik/Wyfie:',
    },
    malesCastratedInlineLabel: {
      en: 'Males Castrated:',
      af: 'Manlike diere gekastreer:',
    },
    mixedValue: {
      en: 'Mixed',
      af: 'Gemeng',
    },
    declarationNoClovenHoovedLabel: {
      en: 'No other cloven-hooved animals on the truck',
      af: 'Geen ander gesplete hoewe-diere op die vragmotor nie',
    },
    declarationLivestockKeptAwayLabel: {
      en: 'Livestock kept away from others',
      af: 'Vee weg van ander gehou',
    },
    declarationNoAnimalFeedLabel: {
      en: 'No animal origin feed',
      af: 'Geen voer van dierlike oorsprong nie',
    },
    declarationProductsRegisteredLabel: {
      en: 'Veterinary products registered',
      af: 'Veeartsenyprodukte geregistreer',
    },
    declarationNoFootMouthSymptomsLabel: {
      en: 'No Foot and Mouth Disease symptoms',
      af: 'Geen bek-en-klouseer simptome nie',
    },
    declarationNoFootMouthFarmLabel: {
      en: 'No Foot and Mouth Disease on farm',
      af: 'Geen bek-en-klouseer op die plaas nie',
    },
    declarationSouthAfricaLabel: {
      en: 'Livestock from South Africa',
      af: 'Vee afkomstig uit Suid-Afrika',
    },
    declarationNoGeneEditingLabel: {
      en: 'No gene editing or cloning',
      af: 'Geen geenwysiging of kloning nie',
    },
    loadingCattleLoadedLabel: {
      en: 'Number of Cattle Loaded',
      af: 'Aantal beeste gelaai',
    },
    loadingSheepLoadedLabel: {
      en: 'Number of Sheep Loaded',
      af: 'Aantal skape gelaai',
    },
    loadingTruckRegistrationLabel: {
      en: 'Truck Registration Number',
      af: 'Vragmotorregistrasienommer',
    },
    loadingSignatureLabel: {
      en: 'Signature',
      af: 'Handtekening',
    },
    vetNameLabel: {
      en: 'Veterinarian Name',
      af: 'Veearts se naam',
    },
    vetRegistrationLabel: {
      en: 'Registration Number',
      af: 'Registrasienommer',
    },
    vetCattleVisuallyInspectedLabel: {
      en: 'Cattle Visually Inspected',
      af: 'Beeste visueel geïnspekteer',
    },
    vetCattleMouthedLabel: {
      en: 'Cattle Mouthed',
      af: 'Beeste se monde ondersoek',
    },
    vetSheepVisuallyInspectedLabel: {
      en: 'Sheep Visually Inspected',
      af: 'Skape visueel geïnspekteer',
    },
    vetSheepMouthedLabel: {
      en: 'Sheep Mouthed',
      af: 'Skape se monde ondersoek',
    },
    vetFootMouthSymptomsLabel: {
      en: 'Foot and Mouth Symptoms',
      af: 'Bek-en-klouseer simptome',
    },
    vetLumpySkinSymptomsLabel: {
      en: 'Lumpy Skin Disease Symptoms',
      af: 'Lumpy Skin-siekte simptome',
    },
    vetFootMouth10kmLabel: {
      en: 'No Foot and Mouth case in 10km',
      af: 'Geen bek-en-klouseer geval binne 10 km nie',
    },
    vetRiftValley10kmLabel: {
      en: 'No Rift Valley Fever case in 10km',
      af: 'Geen Rifvalkoors geval binne 10 km nie',
    },
    vetDeclarationMissingMessage: {
      en: 'No veterinary declaration has been submitted for this listing yet.',
      af: 'Geen veeartsenyverklaring is nog vir hierdie lys ingedien nie.',
    },
  },
  companyManagement: {
    loading: {
      en: 'Loading companies...',
      af: 'Laai maatskappye...',
    },
    title: {
      en: 'Company Management',
      af: 'Maatskappybestuur',
    },
    superAdminSubtitle: {
      en: 'Manage all companies on the platform',
      af: 'Bestuur alle maatskappye op die platform',
    },
    adminSubtitle: {
      en: 'Manage your companies',
      af: 'Bestuur jou maatskappye',
    },
    createCompany: {
      en: 'Create Company',
      af: 'Skep Maatskappy',
    },
    createCompanyTitle: {
      en: 'Create New Company',
      af: 'Skep Nuwe Maatskappy',
    },
    createCompanyDescription: {
      en: 'Set up a new livestock trading company on the platform.',
      af: 'Stel ’n nuwe veehandelemaatskappy op die platform op.',
    },
    companyUsers: {
      en: '{count} users',
      af: '{count} gebruikers',
    },
    createdOn: {
      en: 'Created on {date}',
      af: 'Geskep op {date}',
    },
    phoneLabel: {
      en: 'Phone:',
      af: 'Telefoon:',
    },
    registrationLabel: {
      en: 'Reg #:',
      af: 'Reg #:',
    },
    manageButton: {
      en: 'Manage',
      af: 'Bestuur',
    },
    noDescription: {
      en: 'No description provided',
      af: 'Geen beskrywing verskaf nie',
    },
    noCompaniesTitle: {
      en: 'No companies found',
      af: 'Geen maatskappye gevind nie',
    },
    noCompaniesSuperAdmin: {
      en: 'Create your first company to get started with the platform.',
      af: 'Skep jou eerste maatskappy om met die platform te begin.',
    },
    noCompaniesAdmin: {
      en: 'You are not associated with any companies yet.',
      af: 'Jy is nog nie met enige maatskappye geassosieer nie.',
    },
    createFirstCompany: {
      en: 'Create First Company',
      af: 'Skep Eerste Maatskappy',
    },
    dialogTitle: {
      en: 'Manage company settings and user relationships',
      af: 'Bestuur maatskappyinstellings en gebruikersverhoudings',
    },
    tabsUsers: {
      en: 'Users',
      af: 'Gebruikers',
    },
    tabsSettings: {
      en: 'Settings',
      af: 'Instellings',
    },
    companyUsersHeading: {
      en: 'Company Users',
      af: 'Maatskappygebruikers',
    },
    inviteUser: {
      en: 'Invite User',
      af: 'Nooi Gebruiker',
    },
    statusActive: {
      en: 'Active',
      af: 'Aktief',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusInactive: {
      en: 'Inactive',
      af: 'Onaktief',
    },
    unknownStatus: {
      en: 'Unknown status',
      af: 'Onbekende status',
    },
    companyInfoHeading: {
      en: 'Company Information',
      af: 'Maatskappyinligting',
    },
    infoName: {
      en: 'Name:',
      af: 'Naam:',
    },
    infoCreated: {
      en: 'Created:',
      af: 'Geskep:',
    },
    infoAddress: {
      en: 'Address:',
      af: 'Adres:',
    },
    infoDescription: {
      en: 'Description:',
      af: 'Beskrywing:',
    },
    inviteDialogTitle: {
      en: 'Invite User to {company}',
      af: 'Nooi gebruiker na {company}',
    },
    inviteDialogDescription: {
      en: 'Invite an existing user to join this company. The user must already be registered.',
      af: 'Nooi ’n bestaande gebruiker om by hierdie maatskappy aan te sluit. Die gebruiker moet reeds geregistreer wees.',
    },
    emailLabel: {
      en: 'Email Address',
      af: 'E-posadres',
    },
    emailPlaceholder: {
      en: 'user@example.com',
      af: 'gebruiker@voorbeeld.com',
    },
    roleLabel: {
      en: 'Role',
      af: 'Rol',
    },
    roleAdmin: {
      en: 'Admin',
      af: 'Administrateur',
    },
    roleSeller: {
      en: 'Seller',
      af: 'Verkoper',
    },
    roleVet: {
      en: 'Veterinarian',
      af: 'Veearts',
    },
    roleLoadMaster: {
      en: 'Load Master',
      af: 'Laaimeester',
    },
    cancel: {
      en: 'Cancel',
      af: 'Kanselleer',
    },
    sending: {
      en: 'Sending...',
      af: 'Stuur...',
    },
    sendInvitation: {
      en: 'Send Invitation',
      af: 'Stuur Uitnodiging',
    },
    toastErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    toastErrorLoadCompanies: {
      en: 'Failed to load companies',
      af: 'Kon nie maatskappye laai nie',
    },
    toastSuccessTitle: {
      en: 'Success',
      af: 'Sukses',
    },
    toastCompanyCreated: {
      en: 'Company created successfully',
      af: 'Maatskappy suksesvol geskep',
    },
    toastFillRequired: {
      en: 'Please fill in all required fields',
      af: 'Vul asseblief al die vereiste velde in',
    },
    toastInvitationExisting: {
      en: 'Invitation sent to existing user {email}',
      af: 'Uitnodiging aan bestaande gebruiker {email} gestuur',
    },
    toastInvitationNew: {
      en: 'Invitation sent to {email}. They will be added to the company when they register.',
      af: 'Uitnodiging na {email} gestuur. Hulle sal by die maatskappy gevoeg word wanneer hulle registreer.',
    },
    toastSendFailed: {
      en: 'Failed to send invitation. Please try again.',
      af: 'Kon nie uitnodiging stuur nie. Probeer asseblief weer.',
    },
  },
  companyUsers: {
    heading: {
      en: 'Company Users',
      af: 'Maatskappygebruikers',
    },
    subheading: {
      en: 'Manage user relationships for {company}',
      af: 'Bestuur gebruikersverhoudings vir {company}',
    },
    inviteButton: {
      en: 'Invite User',
      af: 'Nooi gebruiker',
    },
    inviteDialogTitle: {
      en: 'Invite User to {company}',
      af: 'Nooi gebruiker na {company}',
    },
    inviteDialogDescription: {
      en: 'Invite a new user or add an existing user to this company.',
      af: 'Nooi ’n nuwe gebruiker of voeg ’n bestaande gebruiker by hierdie maatskappy.',
    },
    emailLabel: {
      en: 'Email Address',
      af: 'E-posadres',
    },
    emailPlaceholder: {
      en: 'user@example.com',
      af: 'gebruiker@voorbeeld.com',
    },
    roleLabel: {
      en: 'Role',
      af: 'Rol',
    },
    rolePlaceholder: {
      en: 'Select a role',
      af: 'Kies ’n rol',
    },
    roleSuperAdmin: {
      en: 'Super Admin',
      af: 'Superadmin',
    },
    roleAdmin: {
      en: 'Admin',
      af: 'Admin',
    },
    roleSeller: {
      en: 'Seller',
      af: 'Verkoper',
    },
    roleVet: {
      en: 'Veterinarian',
      af: 'Veearts',
    },
    roleAgent: {
      en: 'Agent',
      af: 'Agent',
    },
    roleLoadMaster: {
      en: 'Load Master',
      af: 'Laaimeester',
    },
    sending: {
      en: 'Sending...',
      af: 'Stuur...',
    },
    sendInvitation: {
      en: 'Send Invitation',
      af: 'Stuur uitnodiging',
    },
    alreadyAssociated: {
      en: 'This user is already associated with this company.',
      af: 'Hierdie gebruiker is reeds met hierdie maatskappy geassosieer.',
    },
    userAdded: {
      en: 'User added to {company}.',
      af: 'Gebruiker by {company} gevoeg.',
    },
    inviteFailed: {
      en: 'Failed to invite user.',
      af: 'Kon nie gebruiker nooi nie.',
    },
    relationshipActivated: {
      en: 'Relationship activated.',
      af: 'Verhouding geaktiveer.',
    },
    relationshipDeactivated: {
      en: 'Relationship deactivated.',
      af: 'Verhouding gedeaktiveer.',
    },
    statusUpdateFailed: {
      en: 'Failed to update relationship status.',
      af: 'Kon nie verhoudingstatus opdateer nie.',
    },
    loadingRelationships: {
      en: 'Loading relationships...',
      af: 'Laai verhoudings...',
    },
    invitedOn: {
      en: 'Invited {date}',
      af: 'Genooid {date}',
    },
    statusActive: {
      en: 'Active',
      af: 'Aktief',
    },
    statusPending: {
      en: 'Pending',
      af: 'Hangend',
    },
    statusInactive: {
      en: 'Inactive',
      af: 'Onaktief',
    },
    activateButton: {
      en: 'Activate',
      af: 'Aktiveer',
    },
    deactivateButton: {
      en: 'Deactivate',
      af: 'Deaktiveer',
    },
    emptyHeading: {
      en: 'No users yet',
      af: 'Nog geen gebruikers nie',
    },
    emptyDescription: {
      en: 'Start building your team by inviting users to join {company}.',
      af: 'Begin jou span bou deur gebruikers te nooi om by {company} aan te sluit.',
    },
    emptyCta: {
      en: 'Invite First User',
      af: 'Nooi eerste gebruiker',
    },
  },
  profileSection: {
    loadingTitle: {
      en: 'Loading profile information...',
      af: 'Laai profielinligting...',
    },
    loadingDescription: {
      en: 'Please wait while we fetch your profile details.',
      af: 'Wag asseblief terwyl ons jou profielbesonderhede haal.',
    },
    loadingField: {
      en: 'Loading...',
      af: 'Laai...',
    },
    profileCardTitle: {
      en: 'Profile Information',
      af: 'Profielinligting',
    },
    profileCardDescription: {
      en: 'Update your personal information and preferences',
      af: 'Werk jou persoonlike inligting en voorkeure by',
    },
    labelFirstName: {
      en: 'First Name *',
      af: 'Voornaam *',
    },
    labelLastName: {
      en: 'Last Name *',
      af: 'Van *',
    },
    labelEmail: {
      en: 'Email',
      af: 'E-pos',
    },
    emailHint: {
      en: 'Email cannot be changed',
      af: 'E-pos kan nie verander word nie',
    },
    labelPhone: {
      en: 'Phone Number',
      af: 'Telefoonnommer',
    },
    labelCompany: {
      en: 'Company Name',
      af: 'Maatskappynaam',
    },
    labelAddress: {
      en: 'Address',
      af: 'Adres',
    },
    labelCity: {
      en: 'City',
      af: 'Stad',
    },
    labelProvince: {
      en: 'Province',
      af: 'Provinsie',
    },
    labelPostalCode: {
      en: 'Postal Code',
      af: 'Poskode',
    },
    labelLanguage: {
      en: 'Language Preference',
      af: 'Taalkeuse',
    },
    languageEnglish: {
      en: 'English',
      af: 'Engels',
    },
    languageAfrikaans: {
      en: 'Afrikaans',
      af: 'Afrikaans',
    },
    buttonUpdateProfile: {
      en: 'Update Profile',
      af: 'Werk profiel by',
    },
    buttonUpdating: {
      en: 'Updating...',
      af: 'Besig om by te werk...',
    },
    passwordCardTitle: {
      en: 'Change Password',
      af: 'Verander wagwoord',
    },
    passwordCardDescription: {
      en: 'Update your account password',
      af: 'Werk jou rekeningwagwoord by',
    },
    labelNewPassword: {
      en: 'New Password',
      af: 'Nuwe wagwoord',
    },
    labelConfirmPassword: {
      en: 'Confirm New Password',
      af: 'Bevestig nuwe wagwoord',
    },
    buttonUpdatePassword: {
      en: 'Update Password',
      af: 'Werk wagwoord by',
    },
    buttonUpdatingPassword: {
      en: 'Updating...',
      af: 'Besig om by te werk...',
    },
    errorMissingNames: {
      en: 'First name and last name are required',
      af: 'Voornaam en van is verpligtend',
    },
    errorUnexpected: {
      en: 'An unexpected error occurred',
      af: '’n Onverwagte fout het voorgekom',
    },
    errorPasswordShort: {
      en: 'New password must be at least 6 characters long',
      af: 'Nuwe wagwoord moet minstens 6 karakters lank wees',
    },
    errorPasswordMismatch: {
      en: 'New passwords do not match',
      af: 'Nuwe wagwoorde stem nie ooreen nie',
    },
    toastProfileSuccess: {
      en: 'Profile updated successfully',
      af: 'Profiel suksesvol bygewerk',
    },
    toastPasswordSuccess: {
      en: 'Password updated successfully',
      af: 'Wagwoord suksesvol bygewerk',
    },
  },
  companyRegistration: {
    loginRequired: {
      en: 'You must be logged in to create a company.',
      af: 'Jy moet aangemeld wees om ’n maatskappy te skep.',
    },
    nameRequired: {
      en: 'Company name is required.',
      af: 'Maatskappynaam is verpligtend.',
    },
    createFailed: {
      en: 'Failed to create company.',
      af: 'Kon nie maatskappy skep nie.',
    },
    successDescription: {
      en: 'Company "{company}" has been created successfully.',
      af: 'Maatskappy "{company}" is suksesvol geskep.',
    },
    firstTimeTitle: {
      en: 'Welcome! Set up your company',
      af: 'Welkom! Stel jou maatskappy op',
    },
    defaultTitle: {
      en: 'Create New Company',
      af: 'Skep nuwe maatskappy',
    },
    firstTimeDescription: {
      en: "As the first user, you'll become a super admin. Let's set up your company to get started.",
      af: 'As die eerste gebruiker word jy ’n super admin. Kom ons stel jou maatskappy op om te begin.',
    },
    defaultDescription: {
      en: 'Create a new livestock trading company and become its administrator.',
      af: 'Skep ’n nuwe veehandelemaatskappy en word die administrateur daarvan.',
    },
    companyNameLabel: {
      en: 'Company Name',
      af: 'Maatskappynaam',
    },
    companyNamePlaceholder: {
      en: 'e.g., Chalmar Beef, Sparta Beef Master',
      af: 'bv. Chalmar Beef, Sparta Beef Master',
    },
    descriptionLabel: {
      en: 'Description',
      af: 'Beskrywing',
    },
    descriptionPlaceholder: {
      en: 'Brief description of your livestock trading company',
      af: 'Kort beskrywing van jou veehandelemaatskappy',
    },
    phoneLabel: {
      en: 'Phone Number',
      af: 'Telefoonnommer',
    },
    phonePlaceholder: {
      en: '+27 XX XXX XXXX',
      af: '+27 XX XXX XXXX',
    },
    registrationLabel: {
      en: 'Registration Number',
      af: 'Registrasienommer',
    },
    registrationPlaceholder: {
      en: 'Company registration number',
      af: 'Maatskappyregistrasienommer',
    },
    addressLabel: {
      en: 'Business Address',
      af: 'Besigheidsadres',
    },
    addressPlaceholder: {
      en: 'Full business address including city and postal code',
      af: 'Volledige besigheidsadres insluitend dorp en poskode',
    },
    submitSetup: {
      en: 'Set Up Company',
      af: 'Stel maatskappy op',
    },
    submitCreate: {
      en: 'Create Company',
      af: 'Skep maatskappy',
    },
  },
  companySelector: {
    title: {
      en: 'Company Context',
      af: 'Maatskappykonteks',
    },
    singleCompanyDescription: {
      en: 'You are associated with one company',
      af: 'Jy is met een maatskappy geassosieer',
    },
    multipleCompaniesDescription: {
      en: 'Switch between your {count} companies',
      af: 'Skakel tussen jou {count} maatskappye',
    },
    yourRole: {
      en: 'Your role: {role}',
      af: 'Jou rol: {role}',
    },
    selectPlaceholder: {
      en: 'Select a company',
      af: 'Kies ’n maatskappy',
    },
    activeLabel: {
      en: 'Active: {company}',
      af: 'Aktief: {company}',
    },
    selectCompactPlaceholder: {
      en: 'Select company',
      af: 'Kies maatskappy',
    },
    roleSuperAdmin: {
      en: 'Super Admin',
      af: 'Super Admin',
    },
    roleAdmin: {
      en: 'Admin',
      af: 'Administrateur',
    },
    roleSeller: {
      en: 'Seller',
      af: 'Verkoper',
    },
    roleVet: {
      en: 'Veterinarian',
      af: 'Veearts',
    },
    roleAgent: {
      en: 'Agent',
      af: 'Agent',
    },
    roleLoadMaster: {
      en: 'Load Master',
      af: 'Laaimeester',
    },
  },
  sellerInvitations: {
    loading: {
      en: 'Loading invitations...',
      af: 'Laai uitnodigings...',
    },
    title: {
      en: 'Livestock Invitations',
      af: 'Veelysuitnodigings',
    },
    description: {
      en: 'Manage your invitations to list livestock.',
      af: 'Bestuur jou uitnodigings om vee te lys.',
    },
    tableReference: {
      en: 'Reference ID',
      af: 'Verwysings-ID',
    },
    tableDateSent: {
      en: 'Date Sent',
      af: 'Datum Gestuur',
    },
    tableStatus: {
      en: 'Status',
      af: 'Status',
    },
    tableActions: {
      en: 'Actions',
      af: 'Aksies',
    },
    acceptInvitation: {
      en: 'Accept Invitation',
      af: 'Aanvaar Uitnodiging',
    },
    viewListing: {
      en: 'View Listing',
      af: 'Bekyk Lys',
    },
    editListing: {
      en: 'Edit Listing',
      af: 'Wysig Lys',
    },
    toastSuccessTitle: {
      en: 'Success',
      af: 'Sukses',
    },
    toastSuccessDescription: {
      en: 'Invitation accepted. Please complete the livestock listing.',
      af: 'Uitnodiging aanvaar. Voltooi asseblief die veelys.',
    },
    toastErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    toastErrorDescription: {
      en: 'Failed to accept the invitation.',
      af: 'Kon nie die uitnodiging aanvaar nie.',
    },
    fetchErrorTitle: {
      en: 'Error',
      af: 'Fout',
    },
    fetchErrorDescription: {
      en: 'Failed to load invitations.',
      af: 'Kon nie uitnodigings laai nie.',
    },
    statusPending: {
      en: 'Pending',
      af: 'Aanhangig',
    },
    statusAccepted: {
      en: 'Accepted',
      af: 'Aanvaar',
    },
    statusDeclined: {
      en: 'Declined',
      af: 'Afgekeur',
    },
    statusCancelled: {
      en: 'Cancelled',
      af: 'Gekanselleer',
    },
    statusExpired: {
      en: 'Expired',
      af: 'Verstryk',
    },
    listingStatusNotStarted: {
      en: 'Not Started',
      af: 'Nie Begin Nie',
    },
    listingStatusDraft: {
      en: 'Draft',
      af: 'Konsep',
    },
    listingStatusSubmittedToVet: {
      en: 'Submitted to Vet',
      af: 'Ingedien by Veearts',
    },
    listingStatusInProgress: {
      en: 'In Progress',
      af: 'Aan die Gang',
    },
    listingStatusCompleted: {
      en: 'Completed',
      af: 'Voltooi',
    },
    listingStatusApproved: {
      en: 'Approved',
      af: 'Goedgekeur',
    },
    listingStatusRejected: {
      en: 'Rejected',
      af: 'Afgewys',
    },
  },
  notFound: {
    title: {
      en: '404',
      af: '404',
    },
    message: {
      en: 'Oops! Page not found',
      af: 'Oeps! Bladsy nie gevind nie',
    },
    backToHome: {
      en: 'Return to Home',
      af: 'Keer terug huis toe',
    },
  }
};

const translations: Record<string, Record<string, TranslationEntry>> = translationsData;

export { translations };

export type TranslationSections = typeof translations;

export type TranslationKey<Section extends keyof TranslationSections> = keyof TranslationSections[Section];
