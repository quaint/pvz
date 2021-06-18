let suns = [];
let plants = [];

let field = {
    x: 76,
    y: 120,
    width: 9 * 72,
    height: 5 * 72,
    widthInTiles: 9,
    heightInTiles: 5,
    tileSize: 72,
};

function generateSun() {
    return {
        x: (Math.floor(Math.random() * field.widthInTiles) * field.tileSize) + field.x + field.tileSize / 2,
        y: 0,
        width: 72,
        height: 72,
        speed: 0.05,
        destY: (Math.floor(Math.random() * field.heightInTiles) * field.tileSize) + field.y + field.tileSize / 2,
    };
}

let screenWidth = 800;
let screenHeight = 600;

let canvas = document.getElementById("game");
canvas.width = screenWidth;
canvas.height = screenHeight;
let ctx = canvas.getContext("2d");

function drawField() {
    for (let x = 0; x < field.widthInTiles; x++) {
        for (let y = 0; y < field.heightInTiles; y++) {
            ctx.strokeRect(field.x + x * field.tileSize, field.y + y * field.tileSize, field.tileSize, field.tileSize);
        }
    }
}

let startTime = Date.now();
let generateTime = Date.now();
let sunGenerateInterval = 10000;

let points = 50;
let icon = {
    x: 82,
    y: 5,
    width: 72,
    height: 72,
    selected: false,
    value: 50,
    type: 1,
}

function updatePosition(timeDiff, sun) {
    if (sun.y < sun.destY) {
        sun.y += sun.speed * timeDiff;
    }
}

function drawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawSun(sun) {
    ctx.save();
    ctx.translate(sun.x, sun.y);
    drawCircle(0, 0, sun.width / 2)
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
}

function drawIcon(x, value, boldFrame, type) {
    ctx.save();
    ctx.lineWidth = boldFrame ? 4 : 1;
    ctx.strokeRect(x, 5, 72, 72);
    ctx.lineWidth = 1;
    if (type == 0) {
        drawCircle(x + 36, 50, 18)
    } else {
        ctx.strokeRect(x + 20, 36, 32, 32);
    }
    ctx.font = '20px sans-serif';
    ctx.fillText(value, x + 25, 25);
    ctx.restore();
}

function drawPlant(plant) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeRect(field.x + plant.x + 11, field.y + plant.y + 11, 50, 50);
    ctx.restore();
}

function refresh(lastTime) {
    let time = Date.now();
    let timeDiff = time - lastTime;

    if (time - generateTime > sunGenerateInterval) {
        generateTime = time;
        suns.push(generateSun());
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIcon(5, points, false, 0);
    drawIcon(icon.x, icon.value, icon.selected, icon.type);

    drawField();

    suns.forEach(sun => {
        updatePosition(timeDiff, sun);
        drawSun(sun);
    });

    plants.forEach(plant => {
        drawPlant(plant);
    });

    window.requestAnimationFrame(function () {
        refresh(time);
    });
}

function checkCollisionWithCircle(x, y, entity) {
    let distance = Math.sqrt(Math.pow(x - entity.x, 2) + Math.pow(y - entity.y, 2));
    return distance < (entity.width / 2);
}

function checkCollisionWithSquare(x, y, entity) {
    return entity.x < x && entity.x + entity.width > x && entity.y < y && entity.y + entity.height > y;
}

function deleteSun(sun) {
    const index = suns.indexOf(sun);
    if (index > -1) {
        suns.splice(index, 1);
    }
}

canvas.addEventListener('click', function (event) {
    let clickX = event.pageX - 10;
    let clickY = event.pageY - 10;
    if (checkCollisionWithSquare(clickX, clickY, icon)) {
        icon.selected = !icon.selected;
    }
    if (checkCollisionWithSquare(clickX, clickY, field)) {
        if (icon.selected) {
            let tileX = Math.floor((clickX - field.x) / field.tileSize);
            let tileY = Math.floor((clickY - field.y) / field.tileSize);
            plants.push({ x: tileX * field.tileSize, y: tileY * field.tileSize });
        }
    }
    suns.forEach(sun => {
        if (checkCollisionWithCircle(clickX, clickY, sun)) {
            points += 50;
            deleteSun(sun);
        }
    })
}, false);

refresh(startTime);