document.getElementById('spin-button').addEventListener('click', () => {
    const wheel = document.querySelector('.wheel');
    const randomAngle = Math.random() * 360 + 3600; // At least 10 full spins + random
    const currentRotation = parseFloat(wheel.style.transform.replace(/[^\d.]/g, '')) || 0;
    const newRotation = currentRotation + randomAngle;

    wheel.style.transition = 'transform 3s ease-out';
    wheel.style.transform = `rotate(${newRotation}deg)`;

    // Determine the prize (example with 6 segments)
    setTimeout(() => {
        const finalAngle = newRotation % 360;
        const segmentAngle = 360 / 6;
        const index = Math.floor((360 - finalAngle + segmentAngle / 2) / segmentAngle) % 6;
        alert(`You won: Prize ${index + 1}`);
    }, 3000); // Match animation duration
});
