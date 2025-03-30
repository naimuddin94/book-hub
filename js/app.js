
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const booksContainer = document.getElementById("books-container");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const genreFilter = document.getElementById("genre-filter");

  // State
  let allGenres = [];
  let currentSearchTerm = "";
  let currentGenreFilter = "";
  let isFirstLoad = true;

  // Load user preferences from localStorage
  function loadUserPreferences() {
    const savedSearch = localStorage.getItem("gutendex-search");
    const savedGenre = localStorage.getItem("gutendex-genre");

    if (savedSearch) {
      searchInput.value = savedSearch;
      currentSearchTerm = savedSearch;
    }

    if (savedGenre) {
      currentGenreFilter = savedGenre;
      // We'll set the select value after populating genres
    }
  }

  // Save user preferences to localStorage
  function saveUserPreferences() {
    localStorage.setItem("gutendex-search", currentSearchTerm);
    localStorage.setItem("gutendex-genre", currentGenreFilter);
  }

  // Fetch and display books
  async function fetchBooks() {
    try {
      booksContainer.innerHTML = '<div class="loading">Loading books...</div>';

      const params = {};

      // Only add parameters if they have values
      if (currentSearchTerm) {
        params.search = currentSearchTerm;
      }

      if (currentGenreFilter) {
        params.topic = currentGenreFilter;
      }

      // If we're using pagination, add the offset
      if (window.paginationService) {
        const offset = window.paginationService.getOffset();
        
      }

      try {
        const data = await window.apiService.getBooks(params);

        // Initialize pagination only on first load or when search/filter changes
        if (window.paginationService && data.count) {
          // Only reset to page 1 if this is the first load or if search/filter changed
          const preserveCurrentPage = !isFirstLoad;
          window.paginationService.initialize(data.count, preserveCurrentPage);
        }

        // Extract genres if this is the first load
        if (allGenres.length === 0 && data.results.length > 0) {
          allGenres = window.apiService.extractGenres(data.results);
          populateGenreFilter();

          // Set the saved genre filter if it exists
          if (currentGenreFilter && genreFilter) {
            genreFilter.value = currentGenreFilter;
          }
        }

        displayBooks(data.results);
        isFirstLoad = false;
      } catch (error) {
        console.error("Error in API call:", error);
        booksContainer.innerHTML = `
            <div class="error">
              <p>Error loading books: ${error.message}</p>
              <p>Please check your internet connection and try again.</p>
              <button id="retry-button" class="btn">Retry</button>
            </div>
          `;

        // Add retry button functionality
        const retryButton = document.getElementById("retry-button");
        if (retryButton) {
          retryButton.addEventListener("click", fetchBooks);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      booksContainer.innerHTML = `<div class="error">An unexpected error occurred. Please refresh the page and try again.</div>`;
    }
  }

  // Display books in the container
  function displayBooks(books) {
    if (!books || books.length === 0) {
      booksContainer.innerHTML =
        '<div class="error">No books found matching your criteria.</div>';
      return;
    }

    booksContainer.innerHTML = "";


    books.forEach((book) => {
      const bookCard = createBookCard(book);
      booksContainer.appendChild(bookCard);

      // Add animation with slight delay for each card
      setTimeout(() => {
        bookCard.style.opacity = "1";
        bookCard.style.transform = "translateY(0)";
      }, 50 * booksContainer.children.length);
    });
  }

  // Create a book card element with updated design
  function createBookCard(book) {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";
    bookCard.style.opacity = "0";
    bookCard.style.transform = "translateY(10px)";

    // Get cover image URL or use placeholder
    const coverUrl =
      book.formats["image/jpeg"] || "/placeholder.svg?height=300&width=200";

    // Get primary genre/subject or use default
    const primaryGenre =
      book.subjects && book.subjects.length > 0 ? book.subjects[0] : "Unknown";

    // Get secondary genre if available
    const secondaryGenre =
      book.subjects && book.subjects.length > 1 ? book.subjects[1] : null;

    // Create wishlist button
    const isWishlisted = window.wishlistService.isInWishlist(book.id);

    bookCard.innerHTML = `
            <button class="wishlist-btn ${
              isWishlisted ? "active" : ""
            }" data-id="${book.id}">
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
      const isNowWishlisted = window.wishlistService.toggleWishlist(bookId);

      if (isNowWishlisted) {
        wishlistBtn.classList.add("active");
      } else {
        wishlistBtn.classList.remove("active");
      }
    });

    return bookCard;
  }

  // Populate genre filter dropdown
  function populateGenreFilter() {
    if (!genreFilter) return;

    // Keep the first option (All Genres)
    genreFilter.innerHTML = '<option value="">All Genres</option>';

    // Add top genres (limit to 20 to avoid overwhelming the dropdown)
    const topGenres = allGenres.slice(0, 20);

    topGenres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      genreFilter.appendChild(option);
    });
  }

  // Event Listeners
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      currentSearchTerm = searchInput.value.trim();
      saveUserPreferences();
      // Reset to first page when search changes
      if (window.paginationService) {
        window.paginationService.setPage(1);
      }
      fetchBooks();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        currentSearchTerm = searchInput.value.trim();
        saveUserPreferences();
        // Reset to first page when search changes
        if (window.paginationService) {
          window.paginationService.setPage(1);
        }
        fetchBooks();
      }
    });
  }

  if (genreFilter) {
    genreFilter.addEventListener("change", () => {
      currentGenreFilter = genreFilter.value;
      saveUserPreferences();
      // Reset to first page when filter changes
      if (window.paginationService) {
        window.paginationService.setPage(1);
      }
      fetchBooks();
    });
  }

  // Listen for pagination events
  document.addEventListener("pagination:change", (event) => {
    console.log("Pagination change event received:", event.detail);
    fetchBooks();
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Initialize
  loadUserPreferences();
  fetchBooks();
});
