// Selecting DOM Elements
const addUserBtn = document.getElementById('addUserBtn');
const usernameInput = document.getElementById('username');
const userList = document.getElementById('userList');
const setPrizeBtn = document.getElementById('setPrizeBtn');
const prizeInput = document.getElementById('prize');
const selectedPrize = document.getElementById('selectedPrize');
const spinBtn = document.getElementById('spinBtn');
const winnerModal = document.getElementById('winnerModal');
const closeBtn = document.querySelector('.close-button');
const winnerText = document.getElementById('winnerText');
const shareBtn = document.getElementById('shareBtn');
// State Variables
let users = [];
let prize = "None";
let isSpinning = false;
// Wheel Configuration
const canvas = document.getElementById('raffleWheel');
const ctx = canvas.getContext('2d');
const wheelRadius = canvas.width / 2;
const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8', '#33FFF6', '#FFC300', '#DAF7A6'];
let startAngle = 0;
let arc = 0;
// Initialize Wheel
function initializeWheel() {
    if (users.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    arc = (2 * Math.PI) / users.length;
    drawWheel();
}
// Draw the Raffle Wheel
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < users.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(wheelRadius, wheelRadius);
        ctx.arc(wheelRadius, wheelRadius, wheelRadius, angle, angle + arc, false);
        ctx.closePath();
        ctx.fill();
        // Draw User Names
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.translate(wheelRadius, wheelRadius);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(users[i], wheelRadius - 20, 10);
        ctx.restore();
    }
    // Draw Pointer
    drawPointer();
}
// Draw the Pointer Arrow
function drawPointer() {
    const pointerSize = 20;
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.moveTo(wheelRadius - pointerSize, 0);
    ctx.lineTo(wheelRadius + pointerSize, 0);
    ctx.lineTo(wheelRadius, -pointerSize * 1.5);
    ctx.closePath();
    ctx.fill();
}
// Add User Event
addUserBtn.addEventListener('click', addUser);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addUser();
});
// Function to Add a User
function addUser() {
    const username = usernameInput.value.trim();
    if (username === "") {
        showAlert("Please enter a valid username.");
        return;
    }
    if (users.includes(username)) {
        showAlert("This username is already added.");
        return;
    }
    users.push(username);
    updateUserList();
    usernameInput.value = '';
    initializeWheel();
}
// Update the User List UI
function updateUserList() {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
}

// Spin Button Event
spinBtn.addEventListener('click', spinWheel);
// Function to Spin the Wheel
function spinWheel() {
    if (isSpinning) return;
    if (users.length === 0) {
        showAlert("Please add at least one user.");
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    const spinAngleStart = Math.random() * 10 + 10;
    const spinTimeTotal = Math.random() * 3000 + 4000;
    let spinTime = 0;
    function rotateWheel() {
        spinTime += 30;
        if (spinTime >= spinTimeTotal) {
            stopRotateWheel();
            return;
        }
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        startAngle += (spinAngle * Math.PI / 180);
        drawWheel();
        requestAnimationFrame(rotateWheel);
    }
    rotateWheel();
}
// Function to Stop the Wheel and Announce Winner
function stopRotateWheel() {
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd) % users.length;
    const winner = users[index];
    showWinner(winner);
    isSpinning = false;
    spinBtn.disabled = false;
}
// Easing Function for Smooth Animation
function easeOut(t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
}
// Function to Display Alerts
function showAlert(message) {
    alert(message);
}
// Function to Show Winner in Modal
function showWinner(winner) {
    winnerText.textContent = `${winner} has been eliminated!`;
    winnerModal.style.display = "block";
}
// Close Modal Events
closeBtn.addEventListener('click', () => {
    winnerModal.style.display = "none";
});
window.addEventListener('click', (event) => {
    if (event.target === winnerModal) {
        winnerModal.style.display = "none";
    }
});

// Initial Wheel Setup
initializeWheel();