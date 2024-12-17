// Importeren van de express module in node_modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./classes/database.js');

// Aanmaken van een express app
const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:8080', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Middleware om JSON-requests te parsen
app.use(bodyParser.json());


//Endpoints
//app.get -> opvragen
//app.post -> doorgeven (ook update? bv. ww)
app.get('/', (req, res) => {
    res.send('examen');
  });


// Overzicht campings
app.get('/api/campings', (req, res) => {
    const db = new Database();
    db.getQuery('SELECT * FROM campings').then((campings) => {
        res.send(campings);
    });
});

// Gegevens gebruiker
app.get('/api/user/:id', (req, res) => {
    const db = new Database();
    const userId = req.params.id;
    db.getQuery('SELECT * FROM users WHERE ID = (?)', [userId]).then((user) => {
        res.send(user);
    });
});

// Boekingen gebruiker
app.get('/api/boekingenUser/:id', (req, res) => {
    const db = new Database();
    const userId = req.params.id;
    db.getQuery(`SELECT b.Start_Datum, b.Eind_Datum, b.Electriciteit, u.First_Name, u.Name as "Last_Name", c.Naam as "Camping_Name", c.Straatnaam, c.Huisnummer, c.Gemeente, c.Postcode, c.Bescrijving, c.Animatie, c.Speeltuin, c.Zwembad
                FROM users as u
                INNER JOIN boekingen as b ON u.ID = b.User_ID
                INNER JOIN campings as c on b.Camping_ID = c.ID
                WHERE u.ID = (?)`, [userId]).then((user) => {
        res.send(user);
    });
});

// Boekingen camping
app.get('/api/boekingenCamping/:idU/:idC', (req, res) => {
    const db = new Database();
    const userId = req.params.idU;
    const campingId = req.params.idC;
    db.getQuery(`SELECT c.Naam as "Camping_Name", u.Name as "Last_Name", u.First_Name, b.Start_Datum, b.Eind_Datum, b.Electriciteit
                FROM campings as c
                INNER JOIN boekingen as b ON c.ID = b.Camping_ID
                INNER JOIN users as u ON u.ID = b.User_ID
                WHERE c.ID = (?)
                AND c.User_ID = (?)`, [campingId, userId]).then((user) => {
        res.send(user);
    });
});

// Campings in beheer
app.get('/api/campingInBeheer/:id', (req, res) => {
    const db = new Database();
    const userId = req.params.id;
    db.getQuery(`SELECT *
                FROM campings
                WHERE User_ID = (?)`, [userId]).then((user) => {
        res.send(user);
    });
});

//Start server
app.listen(3000, () => {
    console.log("Server is up and running on 3000.");
})