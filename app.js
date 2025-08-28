
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let tasks = [];

// JSON dosyası varsa oku
if (fs.existsSync('tasks.json')) {
    try {
        const data = fs.readFileSync('tasks.json');
        tasks = JSON.parse(data);
    } catch (err) {
        console.error('JSON okunamadı, boş array oluşturuluyor', err);
        tasks = [];
    }
}

// Ana sayfa
app.get('/', (req, res) => {
    res.render('index', { todoItems: tasks });
});

// Yeni görev ekleme
app.post('/add', (req, res) => {
    const newTask = req.body.task;
    if (newTask) {
        tasks.push({ text: newTask, completed: false }); // İlk etapta false
        fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
    }
    res.redirect('/');
});

// Görevi toggle etme
app.post('/completed/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (tasks[index]) {
        tasks[index].completed = !tasks[index].completed;

        // JSON dosyasına yazma (kalıcılık için)
        fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));

        // Sunucu güncel durumu frontend’e gönderiyor
        res.json({ completed: tasks[index].completed });
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});


// Görevi silme
app.post('/delete/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (tasks[index]) {
        tasks.splice(index, 1);
        fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
    }
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


