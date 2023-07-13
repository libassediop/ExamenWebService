// Importez les modules nécessaires
const express = require('express');
const mysql = require('mysql2/promise');

// Initialisez l'application Express
const app = express();
app.use(express.json());

//  connexion Db
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bdlimamou'
});


app.get('/dayfinder', async (req, res) => {
    const dateStr = req.query.date;
    const date = new Date(dateStr);
    const dayOfWeek = date.toLocaleString('fr-FR', { weekday: 'long' });

    const response = {
        date: date.toLocaleDateString('fr-FR'),
        dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    };

    // Enregistrez l'historique dans la base de données
    const insertQuery = 'INSERT INTO search_history (request, response) VALUES (?, ?)';
    const insertParams = [date.toLocaleDateString('fr-FR'), JSON.stringify(response)];
    await connection.execute(insertQuery, insertParams);

    res.json(response);
});

// Route pour l'historique des recherches
app.get('/dayfinder/historique', async (req, res) => {
    const selectQuery = 'SELECT * FROM search_history';
    const [rows] = await connection.execute(selectQuery);

    const response = rows.map(row => ({
        id: row.id,
        searchDate: row.search_date.toLocaleString('fr-FR'),
        searchItens: {
            request: row.request,
            response: JSON.parse(row.response)
        }
    }));

    res.json(response);
});

// Lancez le serveur
app.listen(8080, () => {
    console.log('Le serveur est démarré sur le port 8080');
});
