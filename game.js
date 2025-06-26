const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const birdImg = new Image();
const bgImg = new Image();
const fgImg = new Image();
const pipeTopImg = new Image();
const pipeBottomImg = new Image();

birdImg.src = "bird.png";
bgImg.src = "background.png";
fgImg.src = "ground.png";
pipeTopImg.src = "pipe-top.png";
pipeBottomImg.src = "pipe-bottom.png";

let gap = 90;
let constant;
let birdX = 50;
let birdY = 150;
let gravity = 1.5;
let velocity = 0;
let score = 0;
let best = 0;

let pipes = [];

pipes[0] = {
    x: canvas.width,
    y: Math.floor(Math.random() * pipeTopImg.height) - pipeTopImg.height
};

document.addEventListener("keydown", moveUp);
document.addEventListener("click", moveUp);

function moveUp() {
    velocity = -25;
}

function draw() {
    ctx.drawImage(bgImg, 0, 0);

    for (let i = 0; i < pipes.length; i++) {
        constant = pipeTopImg.height + gap;
        ctx.drawImage(pipeTopImg, pipes[i].x, pipes[i].y);
        ctx.drawImage(pipeBottomImg, pipes[i].x, pipes[i].y + constant);

        pipes[i].x--;

        if (pipes[i].x === 125) {
            pipes.push({
                x: canvas.width,
                y: Math.floor(Math.random() * pipeTopImg.height) - pipeTopImg.height
            });
        }

        if (birdX + birdImg.width >= pipes[i].x &&
            birdX <= pipes[i].x + pipeTopImg.width &&
            (birdY <= pipes[i].y + pipeTopImg.height || birdY + birdImg.height >= pipes[i].y + constant) ||
            birdY + birdImg.height >= canvas.height - fgImg.height) {
            resetGame();
            return;
        }

        if (pipes[i].x === 5) {
            score++;
            if (score > best) {
                best = score;
                localStorage.setItem('best', best);
            }
        }
    }

    ctx.drawImage(fgImg, 0, canvas.height - fgImg.height);
    ctx.drawImage(birdImg, birdX, birdY);

    birdY += gravity;
    velocity += gravity;
    birdY += velocity * 0.1;

    document.getElementById("score").innerText = score;
    document.getElementById("best").innerText = localStorage.getItem('best') || 0;

    requestAnimationFrame(draw);
}

function resetGame() {
    pipes = [];
    pipes[0] = {
        x: canvas.width,
        y: Math.floor(Math.random() * pipeTopImg.height) - pipeTopImg.height
    };
    birdY = 150;
    velocity = 0;
    score = 0;
}

birdImg.onload = draw;
