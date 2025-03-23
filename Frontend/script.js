// State Global Variables
let users = [];
let isSpinning = false;

// Wheel Configuration
const canvas = document.getElementById('raffleWheel');
const ctx = canvas.getContext('2d');
const wheelRadius = canvas.width / 2;
//The color options for each name
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
document.getElementById('addUserBtn').addEventListener('click', addUser);
document.getElementById('addMassUserBtn').addEventListener('click', addMassUser);

// Function to Add a User
function addUser() {

    //Trim whitespace from name
    const name = document.getElementById('username').value.trim();
    //If the field was empty
    if (name === "") {
        //alert user of bad input
        showAlert("Please enter a valid name.");
        return;
    }
    //If the name is already in the list
    if (users.includes(name)) {
        //Alert user of duplicate name
        showAlert("This name is already added.");
        return;
    }
    //Push name to the list
    users.push(name);
    //Update the wheel
    updateWheel();
    //Reset the input field
    usernameInput.value = '';
}

//Function to add multiple users at once. Uses CSV style input
function addMassUser() {
    //Get the input for mass users
    const massUsersInput = document.getElementById('massUsers');

    //Exit Case: Empty input field
    if (massUsersInput.value.length == 0) {
        //alert user of bad input
        showAlert("Please enter a valid username.");
        return;
    }

    //Split the users by the comma seperating each value
    let usersList = massUsersInput.value.split(',');
    //List of duplicate users that have been removed
    let removedUsers = []

    //For the list of users entered
    usersList.forEach(function (user) {
        //.trim() to remove the whitespace surrounding name
        formattedUser = user.trim();

        //Check if the string is currently in the list of users
        if (users.includes(formattedUser) || formattedUser === "") {
            //If true, add to new list of skipped users
            removedUsers.push(formattedUser);
        } else {
            //Add the user to the list
            users.push(formattedUser);
        }

    });

    //Alert the user of removed users
    if (removedUsers.length > 0) {
        alert(`The following user(s) were skipped: ${removedUsers}`);
    }

    //Update the wheel (list and reload the wheel)
    updateWheel();
    //reset the input field
    massUsersInput.value = '';

}

// Update the User List UI
function updateUserList() {
    const userList = document.getElementById('userList');
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
    document.getElementById('spinBtn').disabled = true;

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
    document.getElementById('spinBtn').disabled = false;
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
    document.getElementById('winnerText').textContent = `${winner} has been eliminated!`;
    document.getElementById('winnerModal').style.display = "block";
}

// Close Modal Events
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('winnerModal').style.display = "none";
});

window.addEventListener('click', (event) => {
    const winnerModal = document.getElementById('winnerModal');
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