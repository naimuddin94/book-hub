
class WishlistService {
  constructor() {
    this.storageKey = "gutendex-wishlist";
    this.wishlist = this.loadWishlist();
  }

  loadWishlist() {
    const storedWishlist = localStorage.getItem(this.storageKey);
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  }


  saveWishlist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist));
  }

  addToWishlist(bookId) {
    if (!this.isInWishlist(bookId)) {
      this.wishlist.push(bookId);
      this.saveWishlist();
    }
  }


  removeFromWishlist(bookId) {
    this.wishlist = this.wishlist.filter((id) => id !== bookId);
    this.saveWishlist();
  }


  toggleWishlist(bookId) {
    if (this.isInWishlist(bookId)) {
      this.removeFromWishlist(bookId);
      return false;
    } else {
      this.addToWishlist(bookId);
      return true;
    }
  }


  isInWishlist(bookId) {
    return this.wishlist.includes(bookId);
  }


  getWishlist() {
    return this.wishlist;
  }


  getWishlistCount() {
    return this.wishlist.length;
  }
}

window.wishlistService = new WishlistService();
