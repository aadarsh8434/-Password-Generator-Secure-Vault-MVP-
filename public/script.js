document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const lengthInput = document.getElementById('length');
    const uppercaseInput = document.getElementById('uppercase');
    const numbersInput = document.getElementById('numbers');
    const symbolsInput = document.getElementById('symbols');
    const excludeSimilarInput = document.getElementById('exclude-similar');
    const noRepeatInput = document.getElementById('no-repeat');
    const customSymbolsInput = document.getElementById('custom-symbols');

    const generateBtn = document.getElementById('generateBtn');
    const passwordOutput = document.getElementById('password-output');
    const strengthOutput = document.getElementById('strength-output');
    const errorMsg = document.getElementById('error-msg');

    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('reset-btn');

    const categoryInput = document.getElementById('category-input');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const vaultList = document.getElementById('vault-list');

    const exportBtn = document.getElementById('export-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');

    let passwordVault = {}; // This will now be populated from the backend
    let passwordHistory = []; // Client-side history, not persisted on backend

    // Password generation logic (client-side)
    function generatePassword(length, includeUppercase, includeNumbers, includeSymbols, excludeSimilar, noRepeat, customSymbols) {
        const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
        const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const NUMBERS = '0123456789';
        const DEFAULT_SYMBOLS = '!@#$%^&*()-_=+<>?/';

        let symbols = customSymbols || DEFAULT_SYMBOLS;

        let characterPool = LOWERCASE;
        if (includeUppercase) characterPool += UPPERCASE;
        if (includeNumbers) characterPool += NUMBERS;
        if (includeSymbols) characterPool += symbols;

        if (excludeSimilar) {
            characterPool = characterPool.replace(/[ilLI|oO0]/g, '');
        }

        if (characterPool.length === 0) {
            throw new Error('Character pool is empty. Enable at least one character type.');
        }

        let password = '';

        if (noRepeat) {
            let availableChars = characterPool.split('');

            if (length > availableChars.length) {
                throw new Error(`Cannot generate a password of length ${length} with no repeated characters. Only ${availableChars.length} unique characters available from current selections.`);
            }

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * availableChars.length);
                password += availableChars[randomIndex];
                availableChars.splice(randomIndex, 1);
            }
        } else {
            for (let i = 0; i < length; i++) {
                const char = characterPool.charAt(Math.floor(Math.random() * characterPool.length));
                password += char;
            }
        }
        return password;
    }

    function checkStrength(pwd) {
        let score = 0;
        if (!pwd) return 'None';
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        switch (score) {
            case 4: return 'Very Strong';
            case 3: return 'Strong';
            case 2: return 'Medium';
            case 1: return 'Weak';
            default: return 'Very Weak';
        }
    }

    // Render the vault from the global passwordVault object
    function renderVault() {
        vaultList.innerHTML = '';

        if (!passwordVault || Object.keys(passwordVault).length === 0) {
            vaultList.textContent = 'Vault is empty.';
            return;
        }

        for (const category in passwordVault) {
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            vaultList.appendChild(categoryHeader);

            passwordVault[category].forEach((pwd) => {
                const item = document.createElement('div');
                item.className = 'vault-item';

                const pwdText = document.createElement('span');
                pwdText.textContent = pwd;
                pwdText.className = 'vault-password';
                pwdText.title = 'Click to copy password';
                pwdText.style.cursor = 'pointer';

                pwdText.addEventListener('click', () => {
                    navigator.clipboard.writeText(pwd);
                    alert('Password copied to clipboard!');
                });

                const copyVaultBtn = document.createElement('button');
                copyVaultBtn.textContent = 'Copy';
                copyVaultBtn.className = 'copy-vault-btn';
                copyVaultBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(pwd);
                    alert('Password copied to clipboard!');
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'delete-btn';
                deleteBtn.addEventListener('click', () => {
                    deletePasswordFromVault(category, pwd);
                });

                item.appendChild(pwdText);
                item.appendChild(copyVaultBtn);
                item.appendChild(deleteBtn);

                vaultList.appendChild(item);
            });
        }
    }

    // API calls (interact with your Node.js backend)

    async function loadVaultFromServer() {
        try {
            const res = await fetch('/api/vault');
            if (!res.ok) {
                // If it's a 404 or other server error, try to parse JSON error or throw
                const errorData = await res.json().catch(() => ({ message: 'Server error' }));
                throw new Error('Failed to fetch vault: ' + (errorData.error || errorData.message || res.statusText));
            }
            passwordVault = await res.json();
            renderVault();
        } catch (e) {
            console.error('Error loading vault:', e);
            alert('Error loading vault: ' + e.message);
            passwordVault = {}; // Ensure vault is empty on client if load fails
            renderVault(); // Render empty vault
        }
    }

    async function savePasswordToVault(category, password) {
        try {
            const res = await fetch('/api/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, password }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                await loadVaultFromServer(); // Reload vault to reflect changes
            } else {
                alert('Error: ' + (data.error || data.message || 'Failed to save password'));
            }
        } catch (e) {
            console.error('Failed to save password:', e);
            alert('Failed to save password: ' + e.message);
        }
    }

    async function deletePasswordFromVault(category, password) {
        if (!confirm('Are you sure you want to delete this password?')) {
            return;
        }
        try {
            const res = await fetch('/api/vault', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, password }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                await loadVaultFromServer(); // Reload vault to reflect changes
            } else {
                alert('Error: ' + (data.error || data.message || 'Failed to delete password'));
            }
        } catch (e) {
            console.error('Failed to delete password:', e);
            alert('Failed to delete password: ' + e.message);
        }
    }

    // Event Listeners

    generateBtn.addEventListener('click', () => {
        errorMsg.textContent = '';
        try {
            const pwd = generatePassword(
                +lengthInput.value,
                uppercaseInput.checked,
                numbersInput.checked,
                symbolsInput.checked,
                excludeSimilarInput.checked,
                noRepeatInput.checked,
                customSymbolsInput.value
            );

            passwordOutput.textContent = pwd;
            strengthOutput.textContent = 'Strength: ' + checkStrength(pwd);

            // Add to history (client-side only)
            if (!passwordHistory.includes(pwd)) {
                passwordHistory.unshift(pwd);
                if (passwordHistory.length > 10) passwordHistory.pop();
            }
        } catch (e) {
            errorMsg.textContent = e.message;
            passwordOutput.textContent = ''; // Clear previous output if error
            strengthOutput.textContent = ''; // Clear strength if error
        }
    });

    copyBtn.addEventListener('click', () => {
        const pwd = passwordOutput.textContent;
        if (pwd) {
            navigator.clipboard.writeText(pwd);
            alert('Password copied to clipboard!');
        }
    });

    resetBtn.addEventListener('click', () => {
        lengthInput.value = 12;
        uppercaseInput.checked = true;
        numbersInput.checked = true;
        symbolsInput.checked = true;
        excludeSimilarInput.checked = false;
        noRepeatInput.checked = false;
        customSymbolsInput.value = '';
        passwordOutput.textContent = '';
        strengthOutput.textContent = '';
        errorMsg.textContent = '';
    });

    savePasswordBtn.addEventListener('click', () => {
        const category = categoryInput.value.trim(); // Allow empty category to default to 'Uncategorized' on backend
        const pwd = passwordOutput.textContent;

        if (!pwd) {
            alert('Generate a password first!');
            return;
        }

        savePasswordToVault(category, pwd);
        categoryInput.value = ''; // Clear category input after saving
    });

    exportBtn.addEventListener('click', () => {
        if (Object.keys(passwordVault).length === 0) {
            alert('Your vault is empty. Nothing to export.');
            return;
        }
        const dataStr = JSON.stringify(passwordVault, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'password-vault.json';
        document.body.appendChild(a); // Append to body to make it clickable in all browsers
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url);
    });

    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Copy password on output click (if any)
    passwordOutput.addEventListener('click', () => {
        const pwd = passwordOutput.textContent;
        if (pwd) {
            navigator.clipboard.writeText(pwd);
            alert('Password copied to clipboard!');
        }
    });

    // Load vault on page load
    loadVaultFromServer();
});