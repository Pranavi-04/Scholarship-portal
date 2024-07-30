document.addEventListener('DOMContentLoaded', () => {
    const fetchScholarships = async (url, listId) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const list = document.getElementById(listId);
            const searchInput = document.getElementById('searchInput');
            const stateFilter = document.getElementById('stateFilter');
            const keywordFilter = document.getElementById('keywordFilter');

            const renderScholarships = (scholarships) => {
                list.innerHTML = ''; // Clear previous list items
                scholarships.forEach(scholarship => {
                    const listItem = document.createElement('li');
                    let htmlContent = `<h2>${scholarship.name}</h2>`;
                    if (scholarship.description) {
                        htmlContent += `<p>${scholarship.description}</p>`;
                    }
                    if (scholarship.eligibility) {
                        htmlContent += `<p>Eligibility: ${scholarship.eligibility}</p>`;
                    }
                    if (scholarship.deadline) {
                        htmlContent += `<p>Deadline: ${scholarship.deadline}</p>`;
                    }
                    if (scholarship.link) {
                        htmlContent += `<a href="${scholarship.link}">Apply</a>`;
                    }
                    listItem.innerHTML = htmlContent;
                    list.appendChild(listItem);
                });
            };
            
            const applyFilters = () => {
                const searchString = searchInput.value.toLowerCase();
                const selectedState = stateFilter.value.toLowerCase();
                const selectedKeyword = keywordFilter.value.toLowerCase();


                const filteredScholarships = data.filter(scholarship => {
                    // Check if scholarship matches search input
                    const matchesSearch = scholarship.name.toLowerCase().includes(searchString);

                    // Check if scholarship matches state filter
                    let matchesState = true;
                    if (selectedState !== 'all') {
                        // Check if state name appears in scholarship name or another relevant field
                        const stateNameAppears = scholarship.name.toLowerCase().includes(selectedState);
                        matchesState = stateNameAppears; // Adjust as per your scholarship data structure
                    }

                    // Check if scholarship matches keyword filter
                    let matchesKeyword = true;
                    if (selectedKeyword !== 'all') {
                        // Check if keyword appears in any field of the scholarship object
                        const keywordAppears = Object.values(scholarship).some(field =>
                            field.toString().toLowerCase().includes(selectedKeyword)
                        );
                        matchesKeyword = keywordAppears;
                    }

                    return matchesSearch && matchesState && matchesKeyword;
                });

                renderScholarships(filteredScholarships);
            };

            // Event listeners for filters
            searchInput.addEventListener('input', applyFilters);
            stateFilter.addEventListener('change', applyFilters);
            keywordFilter.addEventListener('change', applyFilters);

            // Initial rendering of all scholarships
            renderScholarships(data);
            
        } catch (error) {
            console.error(`Error fetching scholarships from ${url}:`, error);
        }
    };

    // Fetch scholarships from the first collection
    fetchScholarships('http://localhost:3000/api/scholarships', 'scholarship-list');

    // Fetch scholarships from the second collection
    fetchScholarships('http://localhost:3000/api/scholarships2', 'scholarship2-list');

     // Fetch scholarships from the third collection
     fetchScholarships('http://localhost:3001/api/scholarship_news', 'scholarship3-list');
});
