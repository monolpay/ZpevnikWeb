// Replace with your GitHub Username and Repository name
        const username = 'monolpay';
        const repo = 'Zpevnik';
        var loc = window.location.pathname;
        //3 funguje na githubu a 2 na localhost
        var dir = loc.split("/")[3]
        const zpevnik = dir

        const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/zpevniky/${zpevnik}`;

        fetch(apiUrl, {
    headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Web-Browser-App' // GitHub toto vyžaduje
    }})
            .then(response => response.json())
            .then(data => {
                const listElement = document.getElementById('file-list');
                listElement.innerHTML = '';
                
                if (!Array.isArray(data)) {
                    listElement.innerHTML = '<li>Chyba při načítání souborů.</li>';
                    return;
                }

                data.forEach(file => {
                    // Skip index.html itself from showing up in the list
                    if (file.name === 'index.html') return;
                    if (file.name === 'obsah') return;

                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = file.name;
                    a.textContent = file.name;
                    li.appendChild(a);
                    listElement.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('file-list').innerHTML = '<li>Nelze načíst soubory.</li>';
            });