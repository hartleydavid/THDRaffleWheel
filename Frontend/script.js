// Selecting DOM Elements
const addUserBtn = document.getElementById('addUserBtn');
const addMassUserBtn = document.getElementById('addMassUserBtn');
const usernameInput = document.getElementById('username');
const massUsersInput = document.getElementById('massUsers');
const userList = document.getElementById('userList');
const setPrizeBtn = document.getElementById('setPrizeBtn');
const prizeInput = document.getElementById('prize');
const selectedPrize = document.getElementById('selectedPrize');
const spinBtn = document.getElementById('spinBtn');
const winnerModal = document.getElementById('winnerModal');
const closeBtn = document.querySelector('.close-button');
const winnerText = document.getElementById('winnerText');
const copyBtn = document.getElementById('copyBtn');

// State Global Variables
let users = [];
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

//Function that will update the list of users and reinitialize the wheel for the new list
function updateWheel() {
    //Update the list of users and reload the wheel
    updateUserList();
    initializeWheel();
}

// Add User Events
addUserBtn.addEventListener('click', addUser);
addMassUserBtn.addEventListener('click', addMassUser);

//Quickly add individual users by pressing enter
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addUser();
});

// Function to Add a User
function addUser() {
    //Trim whitespace from name
    const username = usernameInput.value.trim();
    //If the field was empty
    if (username === "") {
        //alert user of bad input
        showAlert("Please enter a valid username.");
        return;
    }
    //If the name is already in the list
    if (users.includes(username)) {
        //Alert user of duplicate name
        showAlert("This username is already added.");
        return;
    }
    //Push name to the list
    users.push(username);
    //Update the wheel
    updateWheel();
    //Reset the input field
    usernameInput.value = '';
}

//Function to add multiple users at once. Uses CSV style input
function addMassUser() {
    //Split the users by the comma seperating each value
    let usersList = massUsersInput.value.split(',');
    //List of duplicate users that have been removed
    let removedUsers = []

    //For the list of users entered
    usersList.forEach(function (user) {
        //.trim() to remove the whitespace surrounding name
        formattedUser = user.trim();
        //Check if the string is currently in the list of users
        if (users.includes(formattedUser)) {
            //If true, add to new list of skipped users
            removedUsers.push(formattedUser);
        } else {
            //Add the user to the list
            users.push(formattedUser);
        }

    });

    //Alert the user of removed users
    if (removedUsers.length > 0) {
        alert(`The following user(s) were removed: ${removedUsers}`);
    }

    //Update the wheel (list and reload the wheel)
    updateWheel();
    //reset the input field
    massUsersInput.value = '';

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

// Function to Spin the Wheel
function spinWheel() {
    //Exit Case: The wheel is currently spinning, do not spin again
    if (isSpinning) return;
    //We need to have at least one user to spin the wheel
    if (users.length === 0) {
        showAlert("Please add at least one user.");
        return;
    }

    //The wheel is now spinning and cannot spin again until finished
    isSpinning = true;
    spinBtn.disabled = true;

    //Generate a random spin angle and time of spin
    const spinAngleStart = Math.random() * 10 + 10;
    const spinTimeTotal = Math.random() * 3000 + 4000;
    let spinTime = 0;

    //Function to rotate the wheel (spinning)
    function rotateWheel() {
        //Increment the time spinning
        spinTime += 30;
        //If we exceed the spin time
        if (spinTime >= spinTimeTotal) {
            //Stop the wheel from spinning
            stopRotateWheel();
            return;
        }

        //Slowly stop the wheel from spinning
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        //Change the new spin angle after spinning the wheel
        startAngle += (spinAngle * Math.PI / 180);

        //Draw the wheel and animate the spinning
        drawWheel();
        requestAnimationFrame(rotateWheel);
    }

    //rotate the wheel
    rotateWheel();
}
// Function to Stop the Wheel and Announce Winner
function stopRotateWheel() {
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd) % users.length;
    //Remove and return the "winner"
    const winner = users.splice(index, 1)[0];
    //Update
    updateWheel();
    //const winner = users[index];
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

function copyUserList() {

    navigator.clipboard.writeText(users.join(","))
        .then(() => {
            //alert("List of users have been copied!");
            const copiedMsg = document.getElementById("copiedMessage");
            copiedMsg.style.opacity = 1;

            // Hide the message after 2 seconds
            setTimeout(() => {
                copiedMsg.style.opacity = 0;
            }, 2000);
        })
        .catch(err => {
            alert("Failed to copy: " + err)

        });
}

// Initial Wheel Setup
initializeWheel();