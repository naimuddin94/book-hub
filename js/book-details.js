
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const bookDetailsContainer = document.getElementById("book-details");

  // Get book ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  // Load and display book details
  async function loadBookDetails() {
    if (!bookId) {
      bookDetailsContainer.innerHTML =
        '<div class="error">No book ID provided.</div>';
      return;
    }

    try {
      bookDetailsContainer.innerHTML =
        '<div class="loading">Loading book details...</div>';

      const book = await window.apiService.getBookById(bookId);
      displayBookDetails(book);
    } catch (error) {
      bookDetailsContainer.innerHTML = `<div class="error">Error loading book details: ${error.message}</div>`;
    }
  }

  // Display book details with updated design
  function displayBookDetails(book) {
    // Get cover image URL or use placeholder
    const coverUrl =
      book.formats["image/jpeg"] || "/placeholder.svg?height=500&width=300";

    // Check if book is in wishlist
    const isWishlisted = window.wishlistService.isInWishlist(book.id);

    // Create HTML for book details
    const bookDetailsHTML = `
            <div class="book-details">
                <div class="book-details-header">
                    <div class="book-details-cover">
                        <img src="${coverUrl}" alt="${
      book.title
    }" onerror="this.src='/placeholder.svg?height=500&width=300'">
                    </div>
                    <div class="book-details-info">
                        <h1 class="book-details-title">${book.title}</h1>
                        <p class="book-details-author">By ${
                          book.authors
                            .map((author) => author.name)
                            .join(", ") || "Unknown"
                        }</p>
                        <div class="book-details-genres">
                            ${book.subjects
                              .map(
                                (subject) =>
                                  `<span class="book-details-genre">${subject}</span>`
                              )
                              .join("")}
                        </div>
                        <p class="book-details-id">ID: ${book.id}</p>
                        <div class="book-details-actions">
                            <button id="wishlist-btn" class="btn ${
                              isWishlisted ? "btn-secondary" : ""
                            }">
                                <i class="fas fa-heart"></i> 
                                ${
                                  isWishlisted
                                    ? "Remove from Wishlist"
                                    : "Add to Wishlist"
                                }
                            </button>
                            <a href="index.html" class="btn btn-secondary">Back to Books</a>
                        </div>
                    </div>
                </div>
                <div class="book-details-content">
                    <h2>Download Options</h2>
                    <div class="book-download-options">
                        ${Object.entries(book.formats)
                          .filter(([format]) => !format.includes("image"))
                          .map(([format, url]) => {
                            const formatName = format
                              .replace("application/", "")
                              .replace("text/", "");
                            return `<a href="${url}" class="btn btn-secondary" target="_blank">${formatName}</a>`;
                          })
                          .join("")}
                    </div>
                </div>
            </div>
        `;

    bookDetailsContainer.innerHTML = bookDetailsHTML;

    // Add event listener to wishlist button
    const wishlistBtn = document.getElementById("wishlist-btn");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        const isNowWishlisted = window.wishlistService.toggleWishlist(book.id);

        if (isNowWishlisted) {
          wishlistBtn.innerHTML =
            '<i class="fas fa-heart"></i> Remove from Wishlist';
          wishlistBtn.classList.add("btn-secondary");
        } else {
          wishlistBtn.innerHTML =
            '<i class="fas fa-heart"></i> Add to Wishlist';
          wishlistBtn.classList.remove("btn-secondary");
        }
      });
    }
  }

  // Initialize
  loadBookDetails();
});
