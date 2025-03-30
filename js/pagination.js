
class PaginationService {
  constructor() {
    this.currentPage = 1;
    this.totalPages = 1;
    this.itemsPerPage = 32;
    this.paginationElement = document.getElementById("pagination");
    this.isInitialized = false;
  }


  initialize(totalCount, preserveCurrentPage = true) {
    const oldTotalPages = this.totalPages;
    this.totalPages = Math.ceil(totalCount / this.itemsPerPage);

    // Only reset to page 1 on first initialization or if explicitly told not to preserve
    if (!this.isInitialized || !preserveCurrentPage) {
      this.currentPage = 1;
    } else {
      // Make sure current page is still valid with new total
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    }

    this.isInitialized = true;
    
    this.render();
  }


  setPage(page) {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.render();
  }


  getCurrentPage() {
    return this.currentPage;
  }


  getOffset() {
    const offset = (this.currentPage - 1) * this.itemsPerPage;
    return offset;
  }


  render() {
    if (!this.paginationElement) {
      return;
    }

    this.paginationElement.innerHTML = "";

    // Previous button
    const prevButton = document.createElement("button");
    prevButton.innerHTML = "&laquo; Previous";
    prevButton.disabled = this.currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.setPage(this.currentPage - 1);
        document.dispatchEvent(
          new CustomEvent("pagination:change", {
            detail: { page: this.currentPage },
          })
        );
      }
    });
    this.paginationElement.appendChild(prevButton);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button if not visible
    if (startPage > 1) {
      const firstPageBtn = document.createElement("button");
      firstPageBtn.textContent = "1";
      firstPageBtn.addEventListener("click", () => {
        this.setPage(1);
        document.dispatchEvent(
          new CustomEvent("pagination:change", {
            detail: { page: 1 },
          })
        );
      });
      this.paginationElement.appendChild(firstPageBtn);

      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.className = "pagination-ellipsis";
        this.paginationElement.appendChild(ellipsis);
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      if (i === this.currentPage) {
        pageBtn.className = "active";
      }

      pageBtn.addEventListener("click", () => {
        this.setPage(i);
        document.dispatchEvent(
          new CustomEvent("pagination:change", {
            detail: { page: i },
          })
        );
      });

      this.paginationElement.appendChild(pageBtn);
    }

    // Last page button if not visible
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.className = "pagination-ellipsis";
        this.paginationElement.appendChild(ellipsis);
      }

      const lastPageBtn = document.createElement("button");
      lastPageBtn.textContent = this.totalPages;
      lastPageBtn.addEventListener("click", () => {
        this.setPage(this.totalPages);
        document.dispatchEvent(
          new CustomEvent("pagination:change", {
            detail: { page: this.totalPages },
          })
        );
      });
      this.paginationElement.appendChild(lastPageBtn);
    }

    // Next button
    const nextButton = document.createElement("button");
    nextButton.innerHTML = "Next &raquo;";
    nextButton.disabled = this.currentPage === this.totalPages;
    nextButton.addEventListener("click", () => {
      if (this.currentPage < this.totalPages) {
        this.setPage(this.currentPage + 1);
        document.dispatchEvent(
          new CustomEvent("pagination:change", {
            detail: { page: this.currentPage },
          })
        );
      }
    });
    this.paginationElement.appendChild(nextButton);
  }
}

window.paginationService = new PaginationService();
