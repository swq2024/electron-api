function calculatePasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;

    // Basic length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Check for different character types
    if (/\d/.test(password)) strength += 1; // Digits
    if (/[a-z]/.test(password)) strength += 1; // Lowercase letters
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase letters
    if (/[^a-zA-Z\d]/.test(password)) strength += 1; // Symbols

    // Return a score between 1 and 5 based on the strength criteria
    // You can adjust the weight of each criterion by modifying the strength increment values.
    return Math.min(strength, 5);
}

module.exports = {
    calculatePasswordStrength
};