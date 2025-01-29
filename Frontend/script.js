const wheel = document.querySelector('.wheel');
const spinButton = document.getElementById('spin-button');

// Initialize prizes
const prizes = ["Prize 1", "Prize 2", "Prize 3", "Prize 4", "Prize 5", "Prize 6"];

// Function to dynamically create wheel segments
function createWheel(prizes) {
    const segmentAngle = 360 / prizes.length;

    prizes.forEach((prize, index) => {
        const segment = document.createElement('div');
        segment.className = 'segment';
        segment.style.transform = `rotate(${index * segmentAngle}deg)`;

        const text = document.createElement('span');
        text.className = "segment-text";
        text.style.transform = `rotate(${segmentAngle}deg)`;
        text.textContent = prize;

        //segment.textContent = prize;
        segment.appendChild(text);
        wheel.appendChild(segment);
    });
}

// Spin functionality
function spinWheel() {

    const randomAngle = Math.floor(Math.random() * 3600) + 360; // At least 10 full rotations
    //const currentRotation = parseFloat(wheel.style.transform.replace(/[^\d.]/g, '')) || 0;
    //const newRotation = currentRotation + randomAngle;

    // Animate the spin
    wheel.style.transition = 'transform 3s ease-out';
    wheel.style.transform = `rotate(${randomAngle}deg)`;

    // Determine the winning segment
    setTimeout(() => {
        const finalAngle = randomAngle % 360;//newRotation % 360;
        const segmentAngle = 360 / prizes.length;
        const winningIndex = Math.floor((360 - finalAngle + segmentAngle / 2) % 360 / segmentAngle);
        alert(`You won: ${prizes[winningIndex]}`);
        wheel.style.transform = `rotate(0deg)`;
    }, 3000); // Match animation duration

    
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    createWheel(prizes);
    spinButton.addEventListener('click', spinWheel);
});
