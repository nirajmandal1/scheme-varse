

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        const schemesList = document.getElementById(category + '-schemes');
        
        // Hide all scheme lists first
        document.querySelectorAll('.schemes-list').forEach(list => {
            list.style.display = 'none';
        });
        
        // Show the selected category's schemes
        if (schemesList) {
            schemesList.style.display = 'block';
            schemesList.scrollIntoView({ behavior: 'smooth' });
        }
    });
});