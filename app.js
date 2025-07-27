// Security utility functions
function sanitizeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sanitizeUrl(url) {
    if (!url) return '';
    // Only allow http, https, and relative URLs
    if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) {
        return '';
    }
    return url;
}

function createSecureElement(tagName, textContent = '', className = '') {
    const element = document.createElement(tagName);
    if (textContent) element.textContent = textContent;
    if (className) element.className = className;
    return element;
}

// Initialize Lucide icons
lucide.createIcons();

// Search functionality
const searchInput = document.querySelector('.search-container input');
const searchButton = document.querySelector('.search-button');

function handleSearch() {
    const allDiscountsButton = document.querySelector('.filter-bubble[data-filter="all"]');
if (allDiscountsButton) {
    allDiscountsButton.classList.remove('active');
}
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        // Handle search - for now just console log
        console.log('Searching for:', searchTerm);
    }

    // Add scrolling at the end
    const discountsSection = document.getElementById('discounts');
    if (discountsSection) {
        discountsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Desktop search button click
if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
}

// Handle enter key press in search input
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Mobile search icon click - using event delegation (works reliably)
document.body.addEventListener('click', (e) => {
    // Check if clicked element is the search icon
    if (e.target.classList.contains('search-icon') || 
        e.target.id === 'search-icon' ||
        e.target.closest('.search-icon') ||
        e.target.closest('#search-icon')) {
        
        // Only handle search functionality on mobile screens
        if (window.innerWidth <= 480) {
            console.log('Mobile search - icon clicked');
            handleSearch();
        }
        // On desktop (>480px), this icon is just decorative, so do nothing
    }
});

// Function to create star rating HTML - SECURED
function createStarRating(rating) {
    const stars = [];
    const numRating = parseFloat(rating) || 0; // Sanitize rating input
    
    for (let i = 1; i <= 5; i++) {
        if (numRating >= i) {
            stars.push('<i data-lucide="star" class="star-filled"></i>');
        } else if (numRating >= i - 0.5) {
            stars.push('<i data-lucide="star-half" class="star-half"></i>');
        } 
    }
    return stars.join('');
}

document.addEventListener('DOMContentLoaded', function () {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
  
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('show');
        });
      
        document.addEventListener('click', function (e) {
            if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('show');
            }
        });
    }

    document.querySelectorAll('.rating[data-rating]').forEach(function(ratingEl) {
        const rating = parseFloat(ratingEl.getAttribute('data-rating'));
        ratingEl.innerHTML = createStarRating(rating);
    });
    lucide.createIcons(); // re-render icons

    // Filter state management
const filterState = {
    sort: 'null',
    location: 'all',
};

// Function to apply filters to your existing discounts
function applyDiscountFilters() {
    const allDiscountsButton = document.querySelector('.filter-bubble[data-filter="all"]');
if (allDiscountsButton) {
    allDiscountsButton.classList.remove('active');
}
    // Start with the base filtered discounts (from search/category)
    // Need to re-apply category and search filters first
    let discountsToShow = allDiscounts.filter(discount => {
        const matchesCategory = !selectedCategory || discount.category === selectedCategory;
        const matchesSearch = !searchTerm ||
            discount.title.toLowerCase().includes(searchTerm) ||
            (discount.keywords && discount.keywords.some(k => k.toLowerCase().includes(searchTerm)));
        return matchesCategory && matchesSearch;
    });

    // Apply location filter
    if (filterState.location !== 'all') {
        discountsToShow = discountsToShow.filter(discount => {
            const location = discount.location.toLowerCase();
            const filterLocation = filterState.location.toLowerCase();
            
            // Check for different location formats
            return location.includes(filterLocation) || 
                   location.includes(filterLocation.replace('mts', '').trim()) ||
                   location.includes(filterLocation.replace('.', '').trim());
        });
    }

    // Apply sorting only if a sort filter is selected
    if (filterState.sort) {
        discountsToShow.sort((a, b) => {
            switch (filterState.sort) {
                case 'highest-discount':
                    const discountA = parseFloat(a.discount_amount.replace('%', ''));
                    const discountB = parseFloat(b.discount_amount.replace('%', ''));
                    return discountB - discountA;
                    
                case 'highest-rating':
                    return parseFloat(b.rating) - parseFloat(a.rating);
                    
                default:
                    return 0;
            }
        });
    }

    // Update the global filteredDiscounts array
    filteredDiscounts = discountsToShow;
    
    // Reset visible count and re-render
    visibleCount = 3;
    renderDiscounts();
    
    console.log(`Filtered discounts: ${discountsToShow.length} results for location: ${filterState.location}, sort: ${filterState.sort}`);
}

// Desktop filter integration (enhanced version)
const sortSelect = document.getElementById('sort');
const regionSelect = document.getElementById('region');

if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        // Remove active from "Bütün endirimlar" button when desktop filter is used
        const allDiscountsButton = document.querySelector('.filter-bubble[data-filter="all"]');
        if (allDiscountsButton) {
            allDiscountsButton.classList.remove('active');
        }
        
        filterState.sort = this.value;
        applyDiscountFilters();
    });
}

if (regionSelect) {
    regionSelect.addEventListener('change', function() {
        // Check if "Hamısı" (All) option is selected
        if (this.value === 'all' || this.value === 'hamısı' || this.value === '') {
            clearAllFilters();
            return;
        }
        // Remove active from "Bütün endirimlar" button when desktop filter is used
        const allDiscountsButton = document.querySelector('.filter-bubble[data-filter="all"]');
        if (allDiscountsButton) {
            allDiscountsButton.classList.remove('active');
        }
        
        // Map desktop dropdown values to mobile filter values
        const locationMap = {
            'nizami': 'nizami',
            '28-may': '28 may',
            'nasimi': 'nəsimi',
            'narimanov': 'nərimanov',
            'all': 'all'
        };
        
        filterState.location = locationMap[this.value] || this.value;
        applyDiscountFilters();
    });
}

function clearAllFilters() {
    // Reset all filter states
    filterState.sort = null;
    filterState.location = 'all';
    selectedCategory = '';
    searchTerm = '';
    
    // Reset desktop dropdowns
    if (sortSelect) sortSelect.selectedIndex = 0;
    if (regionSelect) regionSelect.selectedIndex = 0;
    
    // Clear search input
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Remove active class from all filter elements
    document.querySelectorAll('.filter-bubble').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
    
    // Activate "Bütün endirimlar" button
    const allDiscountsButton = document.querySelector('.filter-bubble[data-filter="all"]');
    if (allDiscountsButton) {
        allDiscountsButton.classList.add('active');
    }
    
    // Reset to show all discounts
    filteredDiscounts = [...allDiscounts];
    visibleCount = 3;
    renderDiscounts();
    
    console.log('All filters cleared from desktop');
}

// --- Updated Mobile filter bubbles logic ---//
document.querySelectorAll('.filter-bubble:not(.has-dropdown)').forEach(bubble => {
    bubble.addEventListener('click', function() {
        // Remove active class from non-dropdown bubbles
        document.querySelectorAll('.filter-bubble:not(.has-dropdown)').forEach(b => b.classList.remove('active'));
        // Add active class to clicked bubble
        this.classList.add('active');
        
        // Update filter state
        const filterType = this.getAttribute('data-filter');
        filterState.sort = filterType;
        
        // Apply filters
        applyDiscountFilters();
        
        console.log('Filter selected:', filterType);
    });
});

// Handle "Bütün endirimlar" - clear all filters
document.querySelectorAll('.filter-bubble').forEach(bubble => {
    const filterType = bubble.getAttribute('data-filter');
    
    if (filterType === 'all' || bubble.textContent.trim() === 'Bütün endirimlar') {
        bubble.addEventListener('click', function() {
            // Clear all filter states
            filterState.sort = null;
            filterState.location = 'all';
            selectedCategory = '';
            searchTerm = '';
            
            // Clear search input
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Remove active class from all filter elements
            document.querySelectorAll('.filter-bubble').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
            
            // Set "Bütün ərazilər" as selected in dropdown
            const allAreasItem = document.querySelector('.dropdown-item[data-value="all"]');
            if (allAreasItem) {
                allAreasItem.classList.add('selected');
                
                // Reset dropdown bubble text
                const bubbleTextNode = dropdownBubble.firstChild;
                bubbleTextNode.textContent = 'Məkan ';
            }
            
            // Add active class to this button
            this.classList.add('active');
            
            // Reset to show all discounts
            filteredDiscounts = [...allDiscounts];
            visibleCount = 3;
            renderDiscounts();
            
            console.log('All filters cleared - showing all discounts');
        });
    }
});

const dropdownBubble = document.querySelector('.has-dropdown');
const dropdown = document.querySelector('.dropdown-menu');

if (dropdownBubble && dropdown) {
    dropdownBubble.addEventListener('click', function(e) {
        e.stopPropagation();
        const rect = this.getBoundingClientRect();
        
        // Position dropdown below the bubble
        dropdown.style.top = (rect.bottom + 4) + 'px';
        dropdown.style.left = rect.left + 'px';
        
        dropdown.classList.toggle('show');
        this.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdown.classList.remove('show');
        dropdownBubble.classList.remove('active');
    });
    
    // Handle dropdown item selection
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Update selected state
            document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update bubble text (preserve the icon) - SECURED
            const bubbleTextNode = dropdownBubble.firstChild;
            bubbleTextNode.textContent = this.textContent + ' ';
            
            // Update filter state
            const selectedValue = this.getAttribute('data-value');
            
            // Map the data-value to actual location names in your JSON
            const locationMap = {
                'nizami': 'nizami',
                '28-may': '28 may',
                'nasimi': 'nəsimi',
                'narimanov': 'nərimanov',
                'all': 'all'
            };
            
            filterState.location = locationMap[selectedValue] || selectedValue;
            
            // Apply filters
            applyDiscountFilters();
            
            // Close dropdown
            dropdown.classList.remove('show');
            dropdownBubble.classList.remove('active');
            
            console.log('Location filter selected:', filterState.location);
        });
    });

}
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        const dropdown = document.querySelector('.dropdown-menu');
        const bubble = document.querySelector('.has-dropdown');
        dropdown.classList.remove('show');
        bubble.classList.remove('active');
    });
    
    // Handle dropdown item selection
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Update selected state
            document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update bubble text - SECURED
            const bubble = document.querySelector('.has-dropdown');
            bubble.firstChild.textContent = this.textContent;
            
            // Close dropdown
            document.querySelector('.dropdown-menu').classList.remove('show');
            bubble.classList.remove('active');
        });
    });

    // --- Discount logic ---
    const DISCOUNTS_URL = 'public/data/discounts.json';
    const discountsGrid = document.querySelector('.discounts-grid');
    const showMoreBtn = document.querySelector('.show-more-button');
    const searchInput = document.querySelector('.search-container input');
    
    const categoryItems = document.querySelectorAll('.category-item');

    let allDiscounts = [];
    let filteredDiscounts = [];
    let visibleCount = 3;
    let selectedCategory = '';
    let searchTerm = '';

    // Render Icon Based on Category 
    function getCategoryIcon(category) {
        const icons = {
            geyim: "shopping-bag",
            idman: "dumbbell",
            kofe: "coffee",
            kitab: "book-open",
            texnologiya: "laptop",
            tehsil: "school",
            yemək: "hamburger"
        };
        return icons[category.toLowerCase()] || "tag"; // fallback icon
    }

    // Render Color Based on Category
    function getCategoryClass(category) {
        const classes = {
          "geyim": "geyim",
          "idman": "idman",
          "kofe": "kofe",
          "kitab": "kitab",
          "texnologiya": "texnologiya",
          "təhsil": "tehsil",
          "yemək": "yemek",
          "əyləncə": "eylence"
        };
        return classes[category.toLowerCase()] || "default-category";
    }

    // Fetch discounts
    if (discountsGrid) {
        fetch(DISCOUNTS_URL)
            .then(res => res.json())
            .then(data => {
                allDiscounts = data;
                applyFilters();
            })
            .catch(error => {
                console.error('Error loading discounts:', error);
            });
    }

    // Render discounts - SECURED
    function renderDiscounts() {
        if (!discountsGrid) return;
        
        discountsGrid.innerHTML = '';
        const toShow = filteredDiscounts.slice(0, visibleCount);
        toShow.forEach(discount => {
            const card = document.createElement('div');
            card.className = 'discount-card';
            card.setAttribute('data-modal-id', sanitizeText(discount.id));
            
            // Create card structure securely
            const cardImage = document.createElement('div');
            cardImage.className = 'card-image';
            
            const img = document.createElement('img');
            img.src = sanitizeUrl(discount.image_url);
            img.alt = sanitizeText(discount.title);
            img.onerror = function() {
                this.onerror = null; // prevent infinite loop
                this.src = `https://placehold.co/300x200?text=${encodeURIComponent(discount.title)}`;
            };
            
            const discountBadge = createSecureElement('div', `${sanitizeText(discount.discount_amount)} ENDİRİM`, 'discount-badge');
            
            cardImage.appendChild(img);
            cardImage.appendChild(discountBadge);
            
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            
            // Title row
            const cardTitleRow = document.createElement('div');
            cardTitleRow.className = 'card-title-row';
            
            const title = createSecureElement('h3', sanitizeText(discount.title));
            const rating = document.createElement('div');
            rating.className = 'rating';
            rating.setAttribute('data-rating', parseFloat(discount.rating) || 0);
            
            cardTitleRow.appendChild(title);
            cardTitleRow.appendChild(rating);
            
            // Tags
            const cardTags = document.createElement('div');
            cardTags.className = 'card-tags';
            
            const categoryTag = document.createElement('span');
            categoryTag.className = `tag tag-category ${getCategoryClass(discount.category)}`;
            
            const categoryIcon = document.createElement('i');
            categoryIcon.className = 'tag-category-icon';
            categoryIcon.setAttribute('data-lucide', getCategoryIcon(discount.category));
            
            categoryTag.appendChild(categoryIcon);
            categoryTag.appendChild(document.createTextNode(' ' + capitalize(sanitizeText(discount.category))));
            
            const locationTag = document.createElement('span');
            locationTag.className = 'tag tag-location';
            
            const locationIcon = document.createElement('i');
            locationIcon.className = 'tag-location-icon';
            locationIcon.setAttribute('data-lucide', 'map-pin');
            
            locationTag.appendChild(locationIcon);
            locationTag.appendChild(document.createTextNode(' ' + sanitizeText(discount.location)));
            
            cardTags.appendChild(categoryTag);
            cardTags.appendChild(locationTag);
            
            // Descriptions
            const mobileDescription = createSecureElement('div', sanitizeText(discount.mobile_description), 'mobile-card-description');
            const desktopDescription = createSecureElement('p', sanitizeText(discount.desktop_description), 'description');
            
            // Footer
            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';
            
            const requirement = document.createElement('span');
            requirement.className = 'requirement';
            
            const reqIconDesktop = document.createElement('i');
            reqIconDesktop.setAttribute('data-lucide', 'check-circle-2');
            reqIconDesktop.className = 'requirement-icon-desktop';
            
            const reqIconMobile = document.createElement('i');
            reqIconMobile.setAttribute('data-lucide', 'ticket');
            reqIconMobile.className = 'requirement-icon-mobile';
            
            // Determine requirement text based on telebe+ property
            const requirementText = discount['telebe+'] === true ? 
            'Tələbə+ kartı tələb olunur' : 
            'Tələbə kartı tələb olunur';

            requirement.appendChild(reqIconDesktop);
            requirement.appendChild(reqIconMobile);
            requirement.appendChild(document.createTextNode(requirementText));
            
            const detailsButton = document.createElement('a');
            detailsButton.href = '#';
            detailsButton.className = 'details-button';
            detailsButton.setAttribute('data-modal-id', sanitizeText(discount.id));
            detailsButton.textContent = 'Ətraflı';
            
            const mapLinkMobile = document.createElement('a');
            mapLinkMobile.href = '#';
            mapLinkMobile.className = 'map-link-mobile';
            mapLinkMobile.textContent = 'Ətraflı Bax';
            
            const mapLinkIcon = document.createElement('i');
            mapLinkIcon.setAttribute('data-lucide', 'chevron-right');
            mapLinkIcon.className = 'map-link-mobile-icon';
            mapLinkMobile.appendChild(mapLinkIcon);
            
            cardFooter.appendChild(requirement);
            cardFooter.appendChild(detailsButton);
            cardFooter.appendChild(mapLinkMobile);
            
            // Assemble card
            cardContent.appendChild(cardTitleRow);
            cardContent.appendChild(cardTags);
            cardContent.appendChild(mobileDescription);
            cardContent.appendChild(desktopDescription);
            cardContent.appendChild(cardFooter);
            
            card.appendChild(cardImage);
            card.appendChild(cardContent);
            
            discountsGrid.appendChild(card);
        });
        
        // Render stars and icons
        discountsGrid.querySelectorAll('.rating[data-rating]').forEach(function(ratingEl) {
            const rating = parseFloat(ratingEl.getAttribute('data-rating'));
            ratingEl.innerHTML = createStarRating(rating);
        });
        lucide.createIcons();
        
        // Show/hide show more button
        if (showMoreBtn) {
            if (visibleCount >= filteredDiscounts.length) {
                showMoreBtn.style.display = 'none';
            } else {
                showMoreBtn.style.display = 'block';
            }
        }
    }

    function capitalize(str) {
        return sanitizeText(str).charAt(0).toUpperCase() + sanitizeText(str).slice(1);
    }

    // Filtering logic
    function applyFilters() {
        const allDiscountsButton = document.querySelector('.filter-bubble[data-filter="all"]');
if (allDiscountsButton) {
    allDiscountsButton.classList.remove('active');
}
        filteredDiscounts = allDiscounts.filter(discount => {
            const matchesCategory = !selectedCategory || discount.category === selectedCategory;
            const matchesSearch = !searchTerm ||
                discount.title.toLowerCase().includes(searchTerm) ||
                (discount.keywords && discount.keywords.some(k => k.toLowerCase().includes(searchTerm)));
            return matchesCategory && matchesSearch;
        });
        
        // Only apply mobile filters if they are active
        if (filterState.sort || filterState.location !== 'all') {
            applyDiscountFilters();
        } else {
            visibleCount = 3;
            renderDiscounts();
        }
    }

    // Show more button
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            visibleCount += 6;
            renderDiscounts();
        });
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchTerm = e.target.value.trim().toLowerCase();
            applyFilters();
        });
    }

    // Category filter (if clickable)
    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const clickedCategory = item.textContent.trim().toLowerCase();
            
            
                selectedCategory = clickedCategory;
                categoryItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            
            
            applyFilters();
            
            // Scroll to discounts section after filtering
            const discountsSection = document.getElementById('discounts');
            if (discountsSection) {
                discountsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Modal functionality - moved outside of DOMContentLoaded to avoid conflicts
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('discountModal');
    
    if (!modal) {
        console.error('Modal element with id "discountModal" not found');
        return;
    }
    
    const closeBtn = modal.querySelector('.discount-modal-close');
    const modalImg = modal.querySelector('.discount-modal-img');

    let modalsData = null;
    
    // Load modals data
    fetch('public/data/modals.json')
        .then(r => r.json())
        .then(data => { 
            modalsData = data; 
            console.log('Modals data loaded:', data);
        })
        .catch(error => {
            console.error('Error loading modals data:', error);
        });

    // SECURED modal filling function
    function fillModalFromData(modalData) {
        function getCategoryClass(category) {
            const classes = {
                "geyim": "geyim",
                "idman": "idman",
                "kofe": "kofe",
                "kitab": "kitab",
                "texnologiya": "texnologiya",
                "təhsil": "tehsil",
                "yemək": "yemek",
                "əyləncə": "eylence"
            };
            return classes[category.toLowerCase()] || "default-category";
        }
        
        function getCategoryIcon(category) {
            const icons = {
                geyim: "shopping-bag",
                idman: "dumbbell",
                kofe: "coffee",
                kitab: "book-open",
                texnologiya: "laptop",
                tehsil: "school",
                yemək: "hamburger"
            };
            return icons[category.toLowerCase()] || "tag";
        }
        
        if (!modalData) return;
        
        // Fill modal fields with null checks and sanitization
        const modalImgEl = modal.querySelector('.discount-modal-img');
        const modalTitleEl = modal.querySelector('.discount-modal-title');
        const modalBadgeEl = modal.querySelector('.discount-modal-badge');
        const modalLocationEl = modal.querySelector('.discount-modal-location');
        const modalStarEl = modal.querySelector('.discount-modal-star');
        const modalRatingEl = modal.querySelector('.discount-modal-rating-value');
        const modalReviewsEl = modal.querySelector('.discount-modal-reviews');
        const modalDescEl = modal.querySelector('.discount-modal-desc');
        const modalNoteEl = modal.querySelector('.discount-modal-note');
        const modalMapEl = modal.querySelector('.discount-modal-map');
        
        if (modalImgEl) modalImgEl.src = sanitizeUrl(modalData.image_url);
        if (modalTitleEl) modalTitleEl.textContent = sanitizeText(modalData.title);
        if (modalBadgeEl) modalBadgeEl.textContent = sanitizeText(modalData.discount_amount) + ' ENDİRİM';
        if (modalLocationEl) modalLocationEl.textContent = sanitizeText((modalData.locations && modalData.locations[0]) || '');
        if (modalStarEl) modalStarEl.textContent = '★';
        if (modalRatingEl) modalRatingEl.textContent = sanitizeText(modalData.rating);
        if (modalReviewsEl) modalReviewsEl.textContent = '';
        if (modalDescEl) modalDescEl.textContent = sanitizeText(modalData.desciption);
        if (modalNoteEl) modalNoteEl.textContent = sanitizeText(modalData['sub-description'] || '');
        if (modalMapEl) modalMapEl.src = sanitizeUrl(modalData.map_url);
        
        // Set category icon and class - SECURED
        const catClass = getCategoryClass(modalData.category);
        const catIcon = getCategoryIcon(modalData.category);
        const catTag = modal.querySelector('.discount-modal-category');
        if (catTag) {
            catTag.className = `discount-modal-category ${catClass}`;
            
            // Create category content securely
            catTag.innerHTML = '';
            const categoryIcon = document.createElement('i');
            categoryIcon.className = 'tag-category-icon';
            categoryIcon.setAttribute('data-lucide', catIcon);
            catTag.appendChild(categoryIcon);
            catTag.appendChild(document.createTextNode(' ' + sanitizeText(modalData.category.charAt(0).toUpperCase() + modalData.category.slice(1))));
        }
        
        // Requirements - SECURED
        const rulesList = modal.querySelector('.discount-modal-rules ul');
        if (rulesList) {
            rulesList.innerHTML = '';
            if (modalData.requirements) {
                modalData.requirements.forEach(req => {
                    const li = document.createElement('li');
                    const checkIcon = createSecureElement('span', '✔️', 'discount-modal-rule-icon');
                    li.appendChild(checkIcon);
                    li.appendChild(document.createTextNode(' ' + sanitizeText(req)));
                    rulesList.appendChild(li);
                });
            }
        }

        // Contact Information - SECURED
        const contactList = modal.querySelector('.discount-modal-contact ul');
        if (contactList && modalData.contact_info) {
            contactList.innerHTML = '';
            modalData.contact_info.forEach(contact => {
                const li = document.createElement('li');
                const icon = getContactIcon(contact.type);
                const iconSpan = createSecureElement('span', icon, 'discount-modal-contact-icon');
                
                li.appendChild(iconSpan);
                li.appendChild(document.createTextNode(' '));
                
                if (contact.type === 'website') {
                    const link = document.createElement('a');
                    link.href = sanitizeUrl(contact.value);
                    link.target = '_blank';
                    link.textContent = sanitizeText(contact.value.replace('https://', '').replace('http://', ''));
                    li.appendChild(link);
                } else if (contact.type === 'email') {
                    const link = document.createElement('a');
                    link.href = `mailto:${sanitizeText(contact.value)}`;
                    link.textContent = sanitizeText(contact.value);
                    li.appendChild(link);
                } else if (contact.type === 'phone') {
                    // Continuing from where the first part left off...

                    const link = document.createElement('a');
                    link.href = `tel:${sanitizeText(contact.value)}`;
                    link.textContent = sanitizeText(contact.value);
                    li.appendChild(link);
                } else {
                    const contactSpan = createSecureElement('span', sanitizeText(contact.value), 'discount-modal-contact-text');
                    li.appendChild(contactSpan);
                }
                
                contactList.appendChild(li);
            });
        }

        // Validity - SECURED
        const validityEl = modal.querySelector('.discount-modal-validity-dates');
        if (validityEl && modalData.valid_from_until) {
            validityEl.textContent = modalData.valid_from_until.map(date => sanitizeText(date)).join(' – ');
        }
        
        // Branches - SECURED
        const branchList = modal.querySelector('.discount-modal-branches ul');
        if (branchList && modalData.locations) {
            branchList.innerHTML = '';
            modalData.locations.forEach(loc => {
                const li = document.createElement('li');
                const branchIcon = createSecureElement('span', '📍', 'discount-modal-branch-icon');
                li.appendChild(branchIcon);
                li.appendChild(document.createTextNode(' ' + sanitizeText(loc)));
                branchList.appendChild(li);
            });
        }
        
        lucide.createIcons();
    }

    function getContactIcon(type) {
        const icons = {
            phone: '📞',
            website: '🌐',
            email: '✉️',
            address: '📍',
            social: '📱',
            whatsapp: '💬',
            instagram: '📷',
            facebook: '👥',
            telegram: '✈️'
        };
        return icons[sanitizeText(type)] || '📞';
    }

    // SECURED modal opening function
    function openModal(imgSrc) {
        console.log('Opening modal with image:', imgSrc);
        if (imgSrc && modalImg) {
            modalImg.src = sanitizeUrl(imgSrc);
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            modal.classList.add('open');
        }, 10);
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        console.log('=== CLOSING MODAL ===');
        
        // Reset scroll position before closing
        const modalCard = document.querySelector('.discount-modal-content');
        console.log('Modal card found on close:', !!modalCard);
        
        if (modalCard) {
            console.log('Modal card scrollTop before reset:', modalCard.scrollTop);
            modalCard.scrollTop = 0;
            console.log('Modal card scrollTop after reset:', modalCard.scrollTop);
        }
        
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.classList.remove('open');
        
        console.log('=== MODAL CLOSED ===');
    }

    // Store the default modal content for the featured card - SECURED
    const defaultModalContent = {};
    
    // Populate default content if elements exist - SECURED
    const defaultImg = modal.querySelector('.discount-modal-img');
    const defaultTitle = modal.querySelector('.discount-modal-title');
    const defaultBadge = modal.querySelector('.discount-modal-badge');
    const defaultCategory = modal.querySelector('.discount-modal-category');
    const defaultLocation = modal.querySelector('.discount-modal-location');
    const defaultStar = modal.querySelector('.discount-modal-star');
    const defaultRating = modal.querySelector('.discount-modal-rating-value');
    const defaultReviews = modal.querySelector('.discount-modal-reviews');
    const defaultDesc = modal.querySelector('.discount-modal-desc');
    const defaultNote = modal.querySelector('.discount-modal-note');
    const defaultRules = modal.querySelector('.discount-modal-rules ul');
    const defaultTags = modal.querySelector('.discount-modal-tag-list');
    const defaultValidity = modal.querySelector('.discount-modal-validity-dates');
    const defaultBranches = modal.querySelector('.discount-modal-branches ul');

    if (defaultImg) defaultModalContent.img = sanitizeUrl(defaultImg.src);
    if (defaultTitle) defaultModalContent.title = sanitizeText(defaultTitle.textContent);
    if (defaultBadge) defaultModalContent.badge = sanitizeText(defaultBadge.textContent);
    if (defaultCategory) {
        defaultModalContent.category = defaultCategory.innerHTML; // This contains icons, keep as is but validate on use
        defaultModalContent.categoryClass = sanitizeText(defaultCategory.className);
    }
    if (defaultLocation) defaultModalContent.location = sanitizeText(defaultLocation.textContent);
    if (defaultStar) defaultModalContent.star = sanitizeText(defaultStar.textContent);
    if (defaultRating) defaultModalContent.rating = sanitizeText(defaultRating.textContent);
    if (defaultReviews) defaultModalContent.reviews = sanitizeText(defaultReviews.textContent);
    if (defaultDesc) defaultModalContent.desc = sanitizeText(defaultDesc.textContent);
    if (defaultNote) defaultModalContent.note = sanitizeText(defaultNote.textContent);
    if (defaultRules) defaultModalContent.rules = defaultRules.innerHTML; // Contains list structure, keep as is
    if (defaultTags) defaultModalContent.tags = defaultTags.innerHTML; // Contains tag structure, keep as is
    if (defaultValidity) defaultModalContent.validity = sanitizeText(defaultValidity.textContent);
    if (defaultBranches) defaultModalContent.branches = defaultBranches.innerHTML; // Contains list structure, keep as is

    // SECURED modal reset function
    function resetModalToDefault() {
        if (defaultImg && defaultModalContent.img) defaultImg.src = defaultModalContent.img;
        if (defaultTitle && defaultModalContent.title) defaultTitle.textContent = defaultModalContent.title;
        if (defaultBadge && defaultModalContent.badge) defaultBadge.textContent = defaultModalContent.badge;
        if (defaultCategory && defaultModalContent.category) {
            defaultCategory.className = defaultModalContent.categoryClass;
            defaultCategory.innerHTML = defaultModalContent.category; // Pre-validated content
        }
        if (defaultLocation && defaultModalContent.location) defaultLocation.textContent = defaultModalContent.location;
        if (defaultStar && defaultModalContent.star) defaultStar.textContent = defaultModalContent.star;
        if (defaultRating && defaultModalContent.rating) defaultRating.textContent = defaultModalContent.rating;
        if (defaultReviews && defaultModalContent.reviews) defaultReviews.textContent = defaultModalContent.reviews;
        if (defaultDesc && defaultModalContent.desc) defaultDesc.textContent = defaultModalContent.desc;
        if (defaultNote && defaultModalContent.note) defaultNote.textContent = defaultModalContent.note;
        if (defaultRules && defaultModalContent.rules) defaultRules.innerHTML = defaultModalContent.rules; // Pre-validated content
        if (defaultTags && defaultModalContent.tags) defaultTags.innerHTML = defaultModalContent.tags; // Pre-validated content
        if (defaultValidity && defaultModalContent.validity) defaultValidity.textContent = defaultModalContent.validity;
        if (defaultBranches && defaultModalContent.branches) defaultBranches.innerHTML = defaultModalContent.branches; // Pre-validated content
        lucide.createIcons();
    }

    // SECURED event delegation for modal buttons
    document.body.addEventListener('click', function(e) {
        console.log('Click detected on:', e.target);
        
        let btn = e.target.closest('.details-button, .map-link-mobile, .map-button');
        if (btn) {
            console.log('Modal button clicked:', btn);
            e.preventDefault();
            
            let card = btn.closest('.discount-card, .featured-card');
            let imgElement = card ? card.querySelector('img') : null;
            let imgSrc = imgElement ? sanitizeUrl(imgElement.src) : undefined;
            
            console.log('Card found:', card);
            console.log('Image src:', imgSrc);
            
            // If discount card, use modals.json data
            if (card && card.classList.contains('discount-card')) {
                const modalId = sanitizeText(btn.getAttribute('data-modal-id') || card.getAttribute('data-modal-id') || '');
                console.log('Modal ID:', modalId);
                console.log('Modals data available:', !!modalsData);
                
                if (modalsData && modalId) {
                    const modalData = modalsData.find(m => String(m.id) === String(modalId));
                    console.log('Modal data found:', modalData);
                    
                    if (modalData) {
                        fillModalFromData(modalData);
                        openModal(modalData.image_url);
                        return;
                    }
                }
            }
            
            // Otherwise, fallback to default (featured card)
            resetModalToDefault();
            openModal(imgSrc);
        }
    });

    // Close modal on close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal on overlay click (but not when clicking inside the modal content or scrolling)
    let isScrolling = false;
    let scrollTimeout;
    
    // Track scrolling on the modal
    modal.addEventListener('scroll', function() {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 100);
    });
    
    // Also track scrolling on modal content
    const modalContent = modal.querySelector('.discount-modal-card, .modal-content, .discount-modal');
    if (modalContent) {
        modalContent.addEventListener('scroll', function() {
            isScrolling = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 100);
        });
    }
    
    modal.addEventListener('click', function(e) {
        // Only close if clicking directly on the modal overlay (not inside content) and not scrolling
        if (e.target === modal && !isScrolling) {
            closeModal();
        }
    });

    // Close modal on Esc key
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'flex' && (e.key === 'Escape' || e.key === 'Esc')) {
            closeModal();
        }
    });
});

// Reinitialize icons after adding new content
lucide.createIcons();