// Importeren van de express module in node_modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./classes/database.js');

const cookieParser = require('cookie-parser'); //om cookie te kunnen gebruiken
const { Cookie } = require('express-session');


// Aanmaken van een express app
const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:8080', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow credentials (cookies)
}));
app.use((req, res, next) => {
    res.header('Acces-Control-Allow-Credentials', 'true');
    next();
});


// Middleware om JSON-requests te parsen
app.use(bodyParser.json());
//om cookies te gebruiken
app.use(cookieParser());

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
    console.log('Gegevens ophalen van ', userId);
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
                WHERE u.ID = (?)
                ORDER BY b.Eind_Datum`, [userId]).then((user) => {
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
app.get('/api/campingInBeheer', async (req, res) => {
    const db = new Database();
    //niet via cookie
    // app.get('/api/campingInBeheer/:id', (req, res) => {
    //const userId = req.params.id;

    //Wel via cookie
    const userId = req.cookies.userId;
    db.getQuery(`SELECT *
                FROM campings
                WHERE User_ID = (?)`, [userId]).then((user) => {
        res.send(user);
    });
}); 


// User toevoegen
app.post('/api/user', (req, res) => {
    const { Admin, Name, First_Name, Mail, Password } = req.body;
    const db = new Database();
    db.getQuery(`INSERT INTO users (Admin, Name, First_Name, Mail, Password) 
                VALUES (?, ?, ?, ?, ?)`, [Admin, Name, First_Name, Mail, Password])
                .then(() => res.status(201).send({message: 'Added user!'}))
                .catch((error) => res.status(500).send({error: 'Failed to add user', details: error}));
});

// Login
app.post('/api/login', async (req, res) => {
    const { mail, password } = req.body;

    console.log('login attempt: ', mail, password);
    
    const db = new Database();
    
    try {
        const results = await db.getQuery('SELECT * FROM users WHERE mail = ?', [mail]);
        console.log('Query results:', results);
        
        if (results.length === 0) {
            console.log('User not found');
            return res.status(404).send('Gebruiker niet gevonden');
        }

        const gebruiker = results[0];
        if (password !== gebruiker.Password) {
            console.log('Invalid password');
            return res.status(401).send('Ongeldig wachtwoord');
        }

        res.cookie('userId', gebruiker.ID, { httpOnly: false, secure: false });   
        res.cookie('isAdmin', gebruiker.Admin, {httpOnly: false, secure: false});
             
        console.log('Login successful, user ID:', gebruiker.ID);
        res.status(200).json({message: 'Login succesvol'});
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Server error');
    }
});

//log uit
app.post('/api/logout', (req, res) => {
    res.clearCookie('userId', { httpOnly: false, secure: false});
    res.clearCookie('isAdmin', {httpOnly: false, secure: false});
    console.log('Logout succesvol!');
    res.status(200).send('Logout successful');
});

// Update user
app.put('/api/user/:id', async (req, res) => {
    const db = new Database();
    const userId = req.cookies.userId;
    const { Name, First_Name, Mail } = req.body;

    console.log('Updating user:', {userId, Name, First_Name, Mail});

    try {
        await db.getQuery(`UPDATE users SET Name = ?, First_Name = ?, Mail = ? WHERE id = ?`,
        [Name, First_Name, Mail, userId]);
    
        res.status(200).json({ message: 'User updated successfully!' });
    } catch (error)
    {
        Console.log('Error update user');
        res.status(500).send('Server error');
    }
});

//Booking systeem
//beschikbaarheid camping
async function checkAvailability(db, campingId, startDatum, eindDatum, electriciteit) {
    const column = electriciteit ? 'Plaats_Electriciteit' : 'Plaats_Zonder_Electriciteit';
    const query = `
        SELECT COUNT(*) as count 
        FROM boekingen 
        WHERE Camping_ID = ? 
        AND Electriciteit = ? 
        AND ((Start_Datum <= ? AND Eind_Datum >= ?) 
        OR (Start_Datum <= ? AND Eind_Datum >= ?))
    `;
    const result = await db.getQuery(query, [campingId, electriciteit, startDatum, startDatum, eindDatum, eindDatum]);
    const bookedCount = result[0].count;

    const spotsQuery = `SELECT ${column} as spots FROM campings WHERE ID = ?`;
    const spotsResult = await db.getQuery(spotsQuery, [campingId]);
    const totalSpots = spotsResult[0].spots;

    return bookedCount < totalSpots;
}
//Plaats boeken
app.post('/api/book', async (req, res) => {
    const db = new Database();
    const { userId, campingId, startDatum, eindDatum, electriciteit } = req.body;

    const vandaag = new Date().toISOString().split('T')[0];
    if (startDatum < vandaag) {
        return res.status(400).json({ message: 'Begin kan niet in het verleden liggen.' });
    }

    try {
        // Check availability
        const isAvailable = await checkAvailability(db, campingId, startDatum, eindDatum, electriciteit);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Camping spot not available for the selected dates' });
        }

        // Create booking
        await db.getQuery(`INSERT INTO boekingen (User_ID, Camping_ID, Start_Datum, Eind_Datum, Electriciteit) 
                           VALUES (?, ?, ?, ?, ?)`, [userId, campingId, startDatum, eindDatum, electriciteit]);
        res.status(201).json({ message: 'Booking created successfully!' });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).send('Server error');
    }
});

//Start server
app.listen(3000, () => {
    console.log("Server is up and running on 3000.");
})