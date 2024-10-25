import React, { useState, useEffect } from 'react';
import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

const AddAccountForm = ({ accounts, setAccounts }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    const addAccountFunction = httpsCallable(functions, 'addAccount');

    useEffect(() => {
        const checkPassword = async () => {
            try {
                const response = await fetch('https://lock-app-back-2.onrender.com/check-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password: password }),
                });
                const data = await response.json();
                setMessage(data.message);
                console.log('Password check response:', data);
            } catch (error) {
                console.error('Error checking password:', error);
            }
        };

        if (password) {
            checkPassword();
        } else {
            setMessage('');
        }
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await addAccountFunction({ name, username, password });
            console.log('Account added:', result.data);
            // Add the new account to the accounts array
            setAccounts([...accounts, {
                id: result.data.addedId,
                name: name,
                username: username,
                password: password
            }]);
            // Clear form fields after successful submission
            setName('');
            setUsername('');
            setPassword('');
        } catch (error) {
            console.error('Error adding account:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="add-account-form">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="input-new-account"
                style={{ border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="input-new-account"
                style={{ border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <div className="password-input-container">
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="toggle-password-visibility"
                    style={{ border: '1px solid #ccc', borderRadius: '4px' }}
                >
                    {showPassword ? "Hide Password" : "Show Password"}
                </button>
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="input-new-account"
                    style={{ border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <p style={{ color: message === "La contraseña no ha sido encontrada en brechas de datos." ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>
            </div>
            <button 
                type="submit" 
                className="add-account-button" 
                disabled={isLoading}
                style={{ border: '1px solid #ccc', borderRadius: '4px' }}
            >
                {isLoading ? 'Adding...' : 'Add Account'}
            </button>
        </form>
    );
};

export default AddAccountForm;
