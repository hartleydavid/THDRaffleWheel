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
    //We need to have at least two users to spin the wheel
    if (users.length < 2) {
        showAlert("Please add at least two users.");
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
async function stopRotateWheel() {
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd) % users.length;

    //Remove and return the "winner"
    const eliminated = users.splice(index, 1)[0];
    //Update wheel
    updateWheel();
    isSpinning = false;
    document.getElementById('spinBtn').disabled = false;

    //Wait for the user to close the modal before continuing logic
    await showEliminated(eliminated);

    //If there is only one name left after spinning. We found the winner
    if (users.length === 1) {
        showWinner(users[0]);
    }
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

/** "Async" function that displays the name that was eliminated from the raffle
 * 
 * @param {*} eliminated The name of the user that has been eliminated
 * @returns A promise to have a similar effect to an async function
 */
function showEliminated(eliminated) {
    return new Promise((resolve) => {
        //Get the modal and close button elements
        const modal = document.getElementById('eliminatedModal');
        const closeBtn = modal.querySelector('.close-button');

        //Set the text of the modal to be who was elimated
        document.getElementById('eliminatedText').textContent =
            `${eliminated} has been eliminated!`;

        // Event handler to close modal and resolve promise
        function closeModal() {
            modal.style.display = "none";
            closeBtn.removeEventListener('click', closeModal);
            window.removeEventListener('click', outsideClick);
            resolve(); // This tells the awaiting code to continue
        }

        //Close the modal if you click outside the area of it
        function outsideClick(event) {
            if (event.target === modal) {
                closeModal();
            }
        }

        //Close the modal event listeners
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', outsideClick);

        modal.style.display = "block";
    });
}

/** "Aysnc" function that will display the winner of the raffle wheel
 * 
 * @param {*} winner The name of the winner 
 * @returns A promise to replicate async functionality
 */
function showWinner(winner) {
    return new Promise((resolve) => {
        //Get the winner modal elements
        const modal = document.getElementById('winnerModal');
        const closeBtn = modal.querySelector('.close-button');

        //Change the text to have the winners name
        document.getElementById('winnerText').textContent =
            `${winner} has won!`;

        //Get Audio element
        const audio = document.getElementById("celebrationSound");
        //Play audio from the start of clip
        audio.currentTime = 0; 
        audio.play().catch(err => {
            console.log("Autoplay prevented, will play after user interaction:", err);
        });

        //Get the confetti elements
        const confettiCanvas = document.getElementById('confettiCanvas');
        const myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });
        // Fire confetti multiple times for effect
        let count = 0;
        const interval = setInterval(() => {
            myConfetti({
                particleCount: 70,
                spread: 100,
                origin: { y: 0.6 }
            });
            count++;
            if (count > 5) clearInterval(interval);
        }, 400);

        // Event handler to close modal and resolve promise
        function closeModal() {
            modal.style.display = "none";
            closeBtn.removeEventListener('click', closeModal);
            window.removeEventListener('click', outsideClick);
            resolve(); // This tells the awaiting code to continue
        }

        //Function to close the modal with clicking outside the box
        function outsideClick(event) {
            if (event.target === modal) {
                closeModal();
            }
        }

        //Event listeners
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', outsideClick);

        modal.style.display = "block";
    });
}

// Function that will copy the list of users that are currently in the raffle wheel
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