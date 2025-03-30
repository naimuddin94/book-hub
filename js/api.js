class ApiService {
  constructor() {
    this.baseUrl = "https://gutendex.com/books";
  }

  async getBooks(params = {}) {
    try {
      let url = this.baseUrl;

      // Add query parameters if provided
      if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value);
          }
        }

        url += `?${queryParams.toString()}`;
      }

      console.log("Fetching books from URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  }


  async getBookById(id) {
    try {
      const response = await fetch(`${this.baseUrl}?ids=${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0];
      } else {
        throw new Error("Book not found");
      }
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      throw error;
    }
  }


  extractGenres(books) {
    const genresSet = new Set();

    books.forEach((book) => {
      if (book.subjects && Array.isArray(book.subjects)) {
        book.subjects.forEach((subject) => {
          genresSet.add(subject);
        });
      }
    });

    return Array.from(genresSet).sort();
  }
}

// Create a singleton instance and make it globally available
window.apiService = new ApiService();
