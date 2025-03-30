
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const wishlistContainer = document.getElementById("wishlist-container");
  const emptyWishlist = document.getElementById("empty-wishlist");
  const wishlistCount = document.getElementById("wishlist-count");

  // Load and display wishlist
  async function loadWishlist() {
    const wishlist = window.wishlistService.getWishlist();

    // Update wishlist count
    if (wishlistCount) {
      const count = wishlist.length;
      wishlistCount.textContent = `${count} book${
        count !== 1 ? "s" : ""
      } in your wishlist`;
    }

    // Show/hide empty wishlist message
    if (wishlist.length === 0) {
      if (emptyWishlist) emptyWishlist.style.display = "block";
      return;
    } else {
      if (emptyWishlist) emptyWishlist.style.display = "none";
    }

    // Clear container except for empty wishlist message
    if (wishlistContainer) {
      Array.from(wishlistContainer.children).forEach((child) => {
        if (child.id !== "empty-wishlist") {
          child.remove();
        }
      });
    }

    // Fetch and display each book in the wishlist
    try {
      for (const bookId of wishlist) {
        try {
          const book = await window.apiService.getBookById(bookId);
          const bookCard = createBookCard(book);
          wishlistContainer.appendChild(bookCard);
        } catch (error) {
          console.error(`Error fetching book ${bookId}:`, error);
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      wishlistContainer.innerHTML += `<div class="error">Error loading wishlist: ${error.message}</div>`;
    }
  }

  // Create a book card element with updated design
  function createBookCard(book) {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";

    // Get cover image URL or use placeholder
    const coverUrl =
      book.formats["image/jpeg"] || "/placeholder.svg?height=300&width=200";

    // Get primary genre/subject or use default
    const primaryGenre =
      book.subjects && book.subjects.length > 0 ? book.subjects[0] : "Unknown";

    // Get secondary genre if available
    const secondaryGenre =
      book.subjects && book.subjects.length > 1 ? book.subjects[1] : null;

    bookCard.innerHTML = `
            <button class="wishlist-btn active" data-id="${book.id}">
                <i class="fas fa-heart"></i>
            </button>
            <a href="book-details.html?id=${book.id}" class="book-cover">
                <img src="${coverUrl}" alt="${
      book.title
    }" onerror="this.src='/placeholder.svg?height=300&width=200'">
            </a>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${
                  book.authors.map((author) => author.name).join(", ") ||
                  "Unknown"
                }</p>
                <div class="book-genres">
                    <span class="book-genre">${primaryGenre}</span>
                    ${
                      secondaryGenre
                        ? `<span class="book-genre">${secondaryGenre}</span>`
                        : ""
                    }
                </div>
                <p class="book-id">ID: ${book.id}</p>
            </div>
        `;

    // Add event listener to wishlist button
    const wishlistBtn = bookCard.querySelector(".wishlist-btn");
    wishlistBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const bookId = Number.parseInt(wishlistBtn.dataset.id);
      window.wishlistService.removeFromWishlist(bookId);

      // Remove the card with animation
      bookCard.style.opacity = "0";
      bookCard.style.transform = "translateY(10px)";

      setTimeout(() => {
        bookCard.remove();

        // Reload wishlist to update count and empty state
        loadWishlist();
      }, 300);
    });

    return bookCard;
  }

  // Initialize
  loadWishlist();
});
