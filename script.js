document.addEventListener('DOMContentLoaded', () => {
    const hardshipForm = document.getElementById('hardship-form');
    const hardshipInput = document.getElementById('hardship-input');
    const categorySelect = document.getElementById('category-select');
    const hardshipContainer = document.getElementById('hardship-container');
    const filterSelect = document.getElementById('filter-select');
    const sortSelect = document.getElementById('sort-select');
    const loadMoreBtn = document.getElementById('load-more');
    const charCount = document.querySelector('.char-count');
    const myHardshipsBtn = document.getElementById('my-hardships-btn');

    // Modal elements for home, about, and contact
    const modalContainer = document.getElementById('modal-container');
    const homeModal = document.getElementById('home-modal');
    const aboutModal = document.getElementById('about-modal');
    const contactModal = document.getElementById('contact-modal');
    const homeIcon = document.getElementById('home-icon');
    const aboutIcon = document.getElementById('about-icon');
    const contactIcon = document.getElementById('contact-icon');
    const closeHomeModal = document.getElementById('close-home-modal');
    const closeAboutModal = document.getElementById('close-about-modal');
    const closeContactModal = document.getElementById('close-contact-modal');

    const MAX_CHARS = 1000; 
    let hardships = JSON.parse(localStorage.getItem('hardships')) || [];
    let visibleHardships = 6;
    let currentUserId = 1;
    let showOnlyMyHardships = false;

    // Render hardships initially when the page loads
    renderHardships();

    // Smooth scrolling for navigation
    document.querySelectorAll('.nav-link, .home-icon, .footer-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    function saveHardships() {
        // Save hardships array to localStorage
        localStorage.setItem('hardships', JSON.stringify(hardships));
    }

    function renderHardships() {
        // Clear the current displayed hardships
        hardshipContainer.innerHTML = '';

        // Filter hardships based on filter options
        let filteredHardships = filterHardships(hardships, filterSelect.value);

        if (showOnlyMyHardships) {
            // Show only the current user's hardships if toggled
            filteredHardships = filteredHardships.filter(hardship => hardship.userId === currentUserId);
        }

        // Sort hardships by the number of comments (ascending order)
        const sortedHardships = sortHardshipsByComments(filteredHardships);
        const hardshipsToShow = sortedHardships.slice(0, visibleHardships);

        // Render each hardship on the screen
        hardshipsToShow.forEach(hardship => renderHardship(hardship));

        // Handle "Load More" button visibility
        if (visibleHardships >= sortedHardships.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    // Sort hardships by number of comments, least first
    function sortHardshipsByComments(hardships) {
        return hardships.sort((a, b) => a.comments.length - b.comments.length); // Ascending order
    }

    function renderHardship(hardship) {
        // Create a hardship card to display on the page
        const hardshipCard = document.createElement('div');
        hardshipCard.classList.add('hardship-card');
        hardshipCard.dataset.id = hardship.id;
        hardshipCard.innerHTML = `
            <div class="category-tag category-${hardship.category}">${hardship.category}</div>
            <p class="hardship-text">${hardship.text}</p>
            <p class="hardship-meta">
                Posted: ${formatDate(hardship.createdAt)}
                ${hardship.lastEdited ? `<br>Last edited: ${formatDate(hardship.lastEdited)}` : ''}
            </p>
            <div class="hardship-actions">
                <button class="like-btn${hardship.isLiked ? ' liked' : ''}" onclick="toggleLike(${hardship.id})">
                    <i class="fas fa-heart"></i> <span class="like-count">${hardship.likes}</span>
                </button>
                <button class="comment-btn" onclick="toggleComments(${hardship.id})">
                    <i class="fas fa-comment"></i> ${hardship.comments.length}
                </button>
            </div>
            <div class="comments-section" id="comments-section-${hardship.id}" style="display: none;">
                <div class="comments-list">
                    ${hardship.comments.map(comment => `
                        <div class="comment">
                            <p>${comment.text}</p>
                            <small>${formatDate(comment.createdAt)}</small>
                        </div>
                    `).join('')}
                </div>
                <form class="comment-form" onsubmit="addComment(event, ${hardship.id})">
                    <textarea placeholder="Add a comment..." required></textarea>
                    <button type="submit">Submit Comment</button>
                </form>
            </div>
        `;
        hardshipContainer.appendChild(hardshipCard);
    }

    function filterHardships(hardships, category) {
        // Filter hardships based on selected category
        if (category === 'all') return hardships;
        return hardships.filter(h => h.category === category);
    }

    function submitHardship(e) {
        e.preventDefault(); // Prevent form from refreshing the page

        const hardshipText = hardshipInput.value.trim();
        const category = categorySelect.value;

        // Validate input and category selection
        if (hardshipText && hardshipText.length <= MAX_CHARS && category) {
            // Create a new hardship object
            const newHardship = {
                id: Date.now(), // Unique ID for each hardship
                userId: currentUserId,
                text: hardshipText,
                category: category,
                comments: [],
                likes: 0,
                isLiked: false,
                createdAt: new Date().toISOString(),
                lastEdited: null
            };

            // Add the new hardship to the array and save it
            hardships.unshift(newHardship); // Add to the beginning of the list
            saveHardships(); // Save to localStorage

            // Re-render hardships to include the new one
            renderHardships();

            // Clear the form
            hardshipInput.value = '';
            categorySelect.value = '';
            updateCharCount();
        } else {
            alert(`Please enter a valid hardship (1-${MAX_CHARS} characters) and select a category.`);
        }
    }

    // Event listener for form submission
    hardshipForm.addEventListener('submit', submitHardship);

    function updateCharCount() {
        // Update the character count in the form
        const currentLength = hardshipInput.value.length;
        charCount.textContent = `${currentLength} / ${MAX_CHARS}`;
        if (currentLength > MAX_CHARS) {
            charCount.style.color = 'red';
        } else {
            charCount.style.color = '';
        }
    }

    // Event listener for input character count update
    hardshipInput.addEventListener('input', updateCharCount);

    // Event listener for filter and sort select
    filterSelect.addEventListener('change', renderHardships);
    sortSelect.addEventListener('change', renderHardships);

    // Load more hardships
    loadMoreBtn.addEventListener('click', () => {
        visibleHardships += 6;
        renderHardships();
    });

    // Toggle between all submissions and my submissions
    myHardshipsBtn.addEventListener('click', () => {
        showOnlyMyHardships = !showOnlyMyHardships;
        renderHardships();
        myHardshipsBtn.textContent = showOnlyMyHardships ? 'All Submissions' : 'My Submissions';
    });

    window.toggleLike = (id) => {
        const hardship = hardships.find(h => h.id === id);
        if (hardship) {
            hardship.isLiked = !hardship.isLiked;
            hardship.likes += hardship.isLiked ? 1 : -1;
            saveHardships();
            renderHardships();
        }
    };

    window.toggleComments = (id) => {
        const commentsSection = document.getElementById(`comments-section-${id}`);
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    };

    window.addComment = (e, hardshipId) => {
        e.preventDefault();
        const hardship = hardships.find(h => h.id === hardshipId);
        const commentText = e.target.querySelector('textarea').value.trim();
        if (hardship && commentText) {
            const newComment = {
                id: Date.now(),
                text: commentText,
                createdAt: new Date().toISOString()
            };
            hardship.comments.push(newComment);
            saveHardships();
            renderHardships();  // Re-render to reflect the new comment and re-sort
        }
    };

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Modal functionality
    function openModal(modal) {
        modalContainer.style.display = 'flex';
        modal.style.display = 'block';

        // Ensure all other modals are hidden
        [homeModal, aboutModal, contactModal].forEach(m => {
            if (m !== modal) {
                m.style.display = 'none';
            }
        });
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        modalContainer.style.display = 'none';
    }

    homeIcon.addEventListener('click', () => openModal(homeModal));
    aboutIcon.addEventListener('click', () => openModal(aboutModal));
    contactIcon.addEventListener('click', () => openModal(contactModal));

    closeHomeModal.addEventListener('click', () => closeModal(homeModal));
    closeAboutModal.addEventListener('click', () => closeModal(aboutModal));
    closeContactModal.addEventListener('click', () => closeModal(contactModal));

    // Initial render
    renderHardships();
    updateCharCount();
});

