class TennisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.playerScoreEl = document.getElementById('playerScore');
        this.computerScoreEl = document.getElementById('computerScore');

        this.gameRunning = false;
        this.gamePaused = false;
        this.animationId = null;

        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            speedX: 5,
            speedY: 3,
            maxSpeed: 12
        };

        this.playerPaddle = {
            x: 20,
            y: this.canvas.height / 2 - 50,
            width: 15,
            height: 100,
            speed: 8
        };

        this.computerPaddle = {
            x: this.canvas.width - 35,
            y: this.canvas.height / 2 - 50,
            width: 15,
            height: 100,
            speed: 6
        };

        this.score = {
            player: 0,
            computer: 0
        };

        this.keys = {};
        this.mouseY = 0;

        this.initEventListeners();
        this.resetBall();
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());

        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top;
        });
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.startBtn.style.display = 'none';
            this.pauseBtn.style.display = 'inline-block';
            this.gameLoop();
        }
    }

    pauseGame() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            this.pauseBtn.textContent = this.gamePaused ? '再開' : '一時停止';
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }

    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score.player = 0;
        this.score.computer = 0;
        this.updateScore();
        this.resetBall();
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.pauseBtn.textContent = '一時停止';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.draw();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
        this.ball.speedY = (Math.random() - 0.5) * 4;
    }

    updatePaddles() {
        if (this.keys['ArrowUp'] && this.playerPaddle.y > 0) {
            this.playerPaddle.y -= this.playerPaddle.speed;
        }
        if (this.keys['ArrowDown'] && this.playerPaddle.y < this.canvas.height - this.playerPaddle.height) {
            this.playerPaddle.y += this.playerPaddle.speed;
        }

        const targetY = this.mouseY - this.playerPaddle.height / 2;
        if (targetY >= 0 && targetY <= this.canvas.height - this.playerPaddle.height) {
            this.playerPaddle.y = targetY;
        }

        const computerCenter = this.computerPaddle.y + this.computerPaddle.height / 2;
        const ballCenter = this.ball.y;
        
        if (computerCenter < ballCenter - 35) {
            this.computerPaddle.y += this.computerPaddle.speed;
        } else if (computerCenter > ballCenter + 35) {
            this.computerPaddle.y -= this.computerPaddle.speed;
        }

        if (this.computerPaddle.y < 0) this.computerPaddle.y = 0;
        if (this.computerPaddle.y > this.canvas.height - this.computerPaddle.height) {
            this.computerPaddle.y = this.canvas.height - this.computerPaddle.height;
        }
    }

    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;

        if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.speedY = -this.ball.speedY;
        }

        if (this.ball.x - this.ball.radius <= this.playerPaddle.x + this.playerPaddle.width &&
            this.ball.x + this.ball.radius >= this.playerPaddle.x &&
            this.ball.y >= this.playerPaddle.y &&
            this.ball.y <= this.playerPaddle.y + this.playerPaddle.height) {
            
            this.ball.speedX = Math.abs(this.ball.speedX);
            const relativeIntersectY = (this.ball.y - (this.playerPaddle.y + this.playerPaddle.height / 2)) / (this.playerPaddle.height / 2);
            this.ball.speedY = relativeIntersectY * 5;
            
            const currentSpeed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
            if (currentSpeed < this.ball.maxSpeed) {
                this.ball.speedX *= 1.05;
                this.ball.speedY *= 1.05;
            }
        }

        if (this.ball.x + this.ball.radius >= this.computerPaddle.x &&
            this.ball.x - this.ball.radius <= this.computerPaddle.x + this.computerPaddle.width &&
            this.ball.y >= this.computerPaddle.y &&
            this.ball.y <= this.computerPaddle.y + this.computerPaddle.height) {
            
            this.ball.speedX = -Math.abs(this.ball.speedX);
            const relativeIntersectY = (this.ball.y - (this.computerPaddle.y + this.computerPaddle.height / 2)) / (this.computerPaddle.height / 2);
            this.ball.speedY = relativeIntersectY * 5;
            
            const currentSpeed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
            if (currentSpeed < this.ball.maxSpeed) {
                this.ball.speedX *= 1.05;
                this.ball.speedY *= 1.05;
            }
        }

        if (this.ball.x < 0) {
            this.score.computer++;
            this.updateScore();
            this.resetBall();
        }

        if (this.ball.x > this.canvas.width) {
            this.score.player++;
            this.updateScore();
            this.resetBall();
        }

        if (this.score.player >= 5 || this.score.computer >= 5) {
            this.endGame();
        }
    }

    updateScore() {
        this.playerScoreEl.textContent = this.score.player;
        this.computerScoreEl.textContent = this.score.computer;
        
        this.playerScoreEl.classList.add('score-flash');
        setTimeout(() => this.playerScoreEl.classList.remove('score-flash'), 300);
    }

    endGame() {
        this.gameRunning = false;
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.startBtn.textContent = 'もう一度プレイ';
        
        const winner = this.score.player >= 5 ? 'あなた' : 'コンピューター';
        setTimeout(() => {
            alert(`${winner}の勝利です！`);
            this.score.player = 0;
            this.score.computer = 0;
            this.updateScore();
            this.startBtn.textContent = 'ゲーム開始';
        }, 100);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCourt();
        this.drawPaddle(this.playerPaddle);
        this.drawPaddle(this.computerPaddle);
        this.drawBall();
    }

    drawCourt() {
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawPaddle(paddle) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    drawBall() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

        this.updatePaddles();
        this.updateBall();
        this.draw();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    init() {
        this.draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new TennisGame();
    game.init();
});