import { TranslationKeys } from '@/types/translations';

const tr: TranslationKeys = {
  // Genel
  welcome: "Hoş geldiniz",
  loading: "Yükleniyor...",
  error: "Hata",
  appSlogan: "Haritada Anılarınızı İşaretleyin!",

  // Navigasyon
  leaderboard: "Liderlik Tablosu",
  explorer: "Keşfet",
  profile: "Profil",

  // Temel
  login: "Giriş Yap",
  register: "Kayıt Ol",
  logout: "Çıkış Yap",

  // Explorer
  markersLoading: "Markerlar yükleniyor...",
  searchingNearby: "Yakınındaki ilginç yerler aranıyor...",

  // Toast Status Messages
  toast: {
    success: "Başarılı",
    error: "Hata",
    warning: "Uyarı",
    info: "Bilgi",
    retry: "Tekrar Dene"
  },

  // CreatePost
  createPost: {
    title: "Gönderi Oluştur",
    share: "Paylaş",
    permissionsDescription: "Fotoğraf yüklemek için kamera ve medya kütüphanesi izinleri gerekli",
    maximumImagesDescription: "En fazla 10 fotoğraf yükleyebilirsiniz",
    tooManyImagesDescription: "En fazla 10 fotoğraf yükleyebilirsiniz. Sadece ilk fotoğraflar eklenecek",
    failedToTakePhoto: "Fotoğraf çekme başarısız",
    failedToSelectImages: "Fotoğraf seçme başarısız",
    imageRequiredDescription: "Gönderiniz için en az bir fotoğraf seçin",
    locationRequiredDescription: "Gönderiniz için bir konum seçin",
    invalidLocationDescription: "Gönderiniz için geçerli bir konum seçin",
    invalidCoordinatesDescription: "Geçersiz konum koordinatları",
    uploadingDescription: "Fotoğraflarınız yükleniyor...",
    successDescription: "Gönderiniz başarıyla oluşturuldu!",
    selectImages: "Gönderiniz için en fazla",
    imagesSelected: "fotoğraf seçildi",
    imagesForPost: "fotoğraf seçin",
    caption: "Açıklama",
    captionPlaceholder: "Gönderinize açıklama ekleyin..."
  },

  // EditProfile
  editProfile: {
    title: "Profili Düzenle",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    goBack: "Geri Dön",
    pleaseLogin: "Lütfen giriş yapın",
    loadingProfile: "Profil Yükleniyor...",
    pleaseWait: "Lütfen bekleyin",
    profileLoadError: "Profil yüklenirken hata oluştu",
    profileNotFound: "Profil bulunamadı",
    cannotEditProfile: "Bu profili düzenleyemezsiniz.",
    changePhoto: "Fotoğrafı Değiştir",
    uploading: "Yükleniyor...",
    selectProfilePhoto: "Profil Fotoğrafı Seç",
    selectPhotoDescription: "Profil fotoğrafınızı nasıl eklemek istiyorsunuz?",
    camera: "Kamera",
    gallery: "Galeri",
    cancel: "İptal",
    galleryPermissionRequired: "Fotoğraf seçmek için galeri erişim izni gerekli",
    cameraPermissionRequired: "Fotoğraf çekmek için kamera erişim izni gerekli",
    profilePhotoUploadSuccess: "Profil fotoğrafı başarıyla yüklendi! 📸",
    profilePhotoUploadError: "Fotoğraf yüklenirken hata oluştu",
    profileUpdateSuccess: "Profiliniz başarıyla güncellendi!",
    profileUpdateError: "Profil güncellenirken bir hata oluştu",
    firstName: "Ad",
    firstNamePlaceholder: "Adınız",
    lastName: "Soyad",
    lastNamePlaceholder: "Soyadınız",
    username: "Kullanıcı Adı",
    usernamePlaceholder: "Kullanıcı adınız",
    bio: "Biyografi",
    bioPlaceholder: "Kendinizi tanıtın...",
    email: "E-posta",
    emailPlaceholder: "E-posta adresiniz",
    phone: "Telefon",
    phonePlaceholder: "Telefon numaranız",
    usernameMinLength: "Kullanıcı adı en az 3 karakter olmalıdır",
    emailInvalid: "Lütfen geçerli bir e-posta adresi girin",
    phoneInvalid: "Lütfen geçerli bir telefon numarası girin"
  },

  // Comments
  comments: "Yorumlar",
  addComment: "Yorum ekle...",
  reply: "Yanıtla",
  noCommentsYet: "Henüz yorum yok",
  beTheFirstToComment: "İlk yorumu sen yap!",
  loadingComments: "Yorumlar yükleniyor",
  failedToLoadComments: "Yorumlar yüklenemedi",
  failedToAddComment: "Yorum eklenemedi",
  failedToLikeComment: "Yorum beğenilemedi",
  retry: "Tekrar dene",
  showReplies: "Yanıtları göster",
  hideReplies: "Yanıtları gizle",
  replyingTo: "Yanıtlanıyor:",
  writeReply: "Yanıt yaz...",
  loadingMoreComments: "Daha fazla yorum yükleniyor",
  noRepliesYet: "Henüz yanıt yok",
  replies: "Yanıtlar"
};

export default tr; 