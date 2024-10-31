
    function showCategory(category) {
        const products = document.querySelectorAll('.product');
        const buttons = document.querySelectorAll('.category-list button');

        // Afficher/Masquer les produits
        products.forEach(product => {
            product.style.display = product.classList.contains(category) ? 'block' : 'none';
        });

        // Gérer la sélection des boutons
        buttons.forEach(button => {
            button.classList.remove('selected');
            if (button.innerText.toLowerCase() === category) {
                button.classList.add('selected');
            }
        });
    }

    // Afficher tous les produits au début
    document.addEventListener('DOMContentLoaded', () => {
        showCategory('poules'); // Par exemple, afficher les poules par défaut
    });

    function showCategory(category) {
        const products = document.querySelectorAll('.product');
        products.forEach(product => {
            if (product.classList.contains(category)) {
                product.style.display = 'block'; // Affiche le produit
            } else {
                product.style.display = 'none'; // Masque le produit
            }
        });
    }
    

    function showCategory(category) {
        const products = document.querySelectorAll('.product');
        const buttons = document.querySelectorAll('.category-list button');
    
        // Afficher/Masquer les produits
        products.forEach(product => {
            product.style.display = product.classList.contains(category) ? 'block' : 'none';
        });
    
        // Gérer la sélection des boutons
        buttons.forEach(button => {
            button.classList.remove('selected');
            if (button.innerText.toLowerCase() === category) {
                button.classList.add('selected');
            }
        });
    }
    
    // Au chargement de la page, vous pouvez afficher une catégorie par défaut ou rien
    document.addEventListener('DOMContentLoaded', () => {
        showCategory('mammals'); // Affiche les mammifères par défaut
    });
    
    