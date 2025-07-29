import { TranslationKeys } from '@/types/translations';

const en: TranslationKeys = {
  // General
  welcome: "Welcome",
  loading: "Loading...",
  error: "Error",
  appSlogan: "Mark the Map with Your Moments!",

  // Navigation
  leaderboard: "Leaderboard",
  explorer: "Explorer",
  profile: "Profile",

  // Basic
  login: "Login",
  register: "Register",
  logout: "Logout",

  // Explorer
  markersLoading: "Loading markers...",
  searchingNearby: "Searching for interesting places nearby...",

  // Toast Status Messages
  toast: {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
    retry: "Retry"
  },

  // CreatePost
  createPost: {
    title: "Create Post",
    share: "Share",
    permissionsDescription: "Camera and media library permissions are needed to upload images",
    maximumImagesDescription: "You can only upload up to 10 images",
    tooManyImagesDescription: "You can only upload up to 10 images. Only the first images will be added",
    failedToTakePhoto: "Failed to take photo",
    failedToSelectImages: "Failed to select images",
    imageRequiredDescription: "Please select at least one image for your post",
    locationRequiredDescription: "Please select a location for your post",
    invalidLocationDescription: "Please select a valid location for your post",
    invalidCoordinatesDescription: "Invalid location coordinates",
    uploadingDescription: "Uploading your images...",
    successDescription: "Your post has been created successfully!",
    selectImages: "Select up to",
    imagesSelected: "images selected",
    imagesForPost: "images for your post",
    caption: "Caption",
    captionPlaceholder: "Add a caption to your post..."
  },

  // EditProfile
  editProfile: {
    title: "Edit Profile",
    save: "Save",
    saving: "Saving...",
    goBack: "Go Back",
    pleaseLogin: "Please login",
    loadingProfile: "Loading Profile...",
    pleaseWait: "Please wait",
    profileLoadError: "Error loading profile",
    profileNotFound: "Profile not found",
    cannotEditProfile: "You cannot edit this profile.",
    changePhoto: "Change Photo",
    uploading: "Uploading...",
    selectProfilePhoto: "Select Profile Photo",
    selectPhotoDescription: "How would you like to add your profile photo?",
    camera: "Camera",
    gallery: "Gallery",
    cancel: "Cancel",
    galleryPermissionRequired: "Gallery access permission is required to select photos",
    cameraPermissionRequired: "Camera access permission is required to take photos",
    profilePhotoUploadSuccess: "Profile photo uploaded successfully! 📸",
    profilePhotoUploadError: "Error occurred while uploading photo",
    profileUpdateSuccess: "Your profile has been updated successfully!",
    profileUpdateError: "An error occurred while updating profile",
    firstName: "First Name",
    firstNamePlaceholder: "Your first name",
    lastName: "Last Name",
    lastNamePlaceholder: "Your last name",
    username: "Username",
    usernamePlaceholder: "Your username",
    bio: "Bio",
    bioPlaceholder: "Tell us about yourself...",
    email: "Email",
    emailPlaceholder: "Your email address",
    phone: "Phone",
    phonePlaceholder: "Your phone number",
    usernameMinLength: "Username must be at least 3 characters long",
    emailInvalid: "Please enter a valid email address",
    phoneInvalid: "Please enter a valid phone number"
  },

  // Comments
  comments: "Comments",
  addComment: "Add a comment...",
  reply: "Reply",
  noCommentsYet: "No comments yet",
  beTheFirstToComment: "Be the first to comment!",
  loadingComments: "Loading comments",
  failedToLoadComments: "Failed to load comments",
  failedToAddComment: "Failed to add comment",
  failedToLikeComment: "Failed to like comment",
  retry: "Retry",
  showReplies: "Show replies",
  hideReplies: "Hide replies",
  replyingTo: "Replying to",
  writeReply: "Write a reply...",
  loadingMoreComments: "Loading more comments",
  noRepliesYet: "No replies yet",
  replies: "Replies"
};

export default en; 