export interface TranslationKeys {
  // Genel / General
  welcome: string;
  loading: string;
  error: string;
  appSlogan: string;

  // Navigasyon / Navigation
  leaderboard: string;
  explorer: string;
  profile: string;

  // Temel / Basic
  login: string;
  register: string;
  logout: string;

  // Explorer
  markersLoading: string;
  searchingNearby: string;

  // Toast Status Messages
  toast: {
    success: string;
    error: string;
    warning: string;
    info: string;
    retry: string;
  };

  // CreatePost (nested)
  createPost: {
    title: string;
    share: string;
    permissionsDescription: string;
    maximumImagesDescription: string;
    tooManyImagesDescription: string;
    failedToTakePhoto: string;
    failedToSelectImages: string;
    imageRequiredDescription: string;
    locationRequiredDescription: string;
    invalidLocationDescription: string;
    invalidCoordinatesDescription: string;
    uploadingDescription: string;
    successDescription: string;
    selectImages: string;
    imagesSelected: string;
    imagesForPost: string;
    caption: string;
    captionPlaceholder: string;
  };

  // EditProfile (nested)
  editProfile: {
    title: string;
    save: string;
    saving: string;
    goBack: string;
    pleaseLogin: string;
    loadingProfile: string;
    pleaseWait: string;
    profileLoadError: string;
    profileNotFound: string;
    cannotEditProfile: string;
    changePhoto: string;
    uploading: string;
    selectProfilePhoto: string;
    selectPhotoDescription: string;
    camera: string;
    gallery: string;
    cancel: string;
    galleryPermissionRequired: string;
    cameraPermissionRequired: string;
    profilePhotoUploadSuccess: string;
    profilePhotoUploadError: string;
    profileUpdateSuccess: string;
    profileUpdateError: string;
    firstName: string;
    firstNamePlaceholder: string;
    lastName: string;
    lastNamePlaceholder: string;
    username: string;
    usernamePlaceholder: string;
    bio: string;
    bioPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    usernameMinLength: string;
    emailInvalid: string;
    phoneInvalid: string;
  };

  // Comments
  comments: string;
  addComment: string;
  reply: string;
  noCommentsYet: string;
  beTheFirstToComment: string;
  loadingComments: string;
  failedToLoadComments: string;
  failedToAddComment: string;
  failedToLikeComment: string;
  retry: string;
  showReplies: string;
  hideReplies: string;
  replyingTo: string;
  writeReply: string;
  loadingMoreComments: string;
  noRepliesYet: string;
  replies: string;

  // Buraya yeni key'ler ekleyebilirsiniz
} 