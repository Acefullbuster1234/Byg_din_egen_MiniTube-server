const http = require('http');
const fs = require('node:fs/promises');
const ROLLS_FILE = 'data/rolls.log.json';

async function logRoll(roll) {
    let rolls = [];
    try {
        rolls = JSON.parse(await fs.readFile(ROLLS_FILE, 'utf8'));
    } catch {
        // filen findes ikke endnu, start med tom liste
    }
    rolls.push({ roll, time: new Date().toISOString() });
    await fs.writeFile(ROLLS_FILE, JSON.stringify(rolls, null, 2), 'utf8');
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Velkommen til MiniTube');

    } else if (req.method === 'GET' && req.url === '/video') {
        try {
        const filIndhold = await fs.readFile('data/video.json', 'utf8');
        const video  = JSON.parse(filIndhold);

        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify(video));
        } catch (error) {
            console.error('fejl i /video', error);
            res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('Serverfejl: kunne ikke hente videoen');
        }

    } else if (req.method === 'GET' && req.url === '/roll') {
        try {
            const roll = Math.floor(Math.random() * 6) + 1;

            await logRoll(roll)

            let message
            if (roll === 6) {
                message = `You rolled ${roll} you win`;
            } else {
                message = `You rolled ${roll} you lose`;
            }
            res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end(message);
        } catch (error) {
            console.error('fejl i /roll', error);
            res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('Serverfejl');
        }
    } else if (req.method === 'GET' && req.url === '/rollHistory') {
        try {
            const rollHistory = await fs.readFile('data/rolls.log.json', 'utf8');
            const history = JSON.parse(rollHistory);

            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify(history));
        }catch(error) {
            console.error('fejl i /rollHistory', error);
            res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('Serverfejl');
        }
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('ups vi kunne ikke finde denne side');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

