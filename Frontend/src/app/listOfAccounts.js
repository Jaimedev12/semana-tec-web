"use client";
import React, { useEffect } from 'react';
import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

const ListOfAccounts = ({ accounts, setAccounts }) => {
    useEffect(() => {
        accounts.forEach(account => {
            console.log('Account ID:', account.id);
        });
    }, [accounts]);

    const deleteAccountFunction = httpsCallable(functions, 'deleteAccount');

    const handleDelete = async (accountId) => {
        try {
            console.log('Deleting account with ID:', accountId);
            await deleteAccountFunction({ accountId });
            setAccounts(accounts.filter(account => account.id !== accountId));
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    return (
        <>
            <h1
                style={{
                    fontSize: '25px',
                    marginTop: '20px'
                }}
            >
                List of Accounts:
            </h1>
            <ul className="account-list">
                {accounts.map((account, index) => (
                    <li key={index} className="account-item">
                        <div className="account-details" style={{
                            display: 'flex',
                            flexDirection: 'row',
                        }}>
                            <span style={{
                                fontSize: '16px',
                                marginBottom: '5px',
                                marginRight: '20px'
                            }}>Username: {account.name}</span>
                            <span style={{
                                fontSize: '16px',
                                marginBottom: '5px',
                                marginRight: '20px'
                            }}>Password: {account.username}</span>
                            <span style={{
                                fontSize: '16px',
                                marginBottom: '5px',
                                marginRight: '20px'
                            }}>Password: {account.password}</span>
                            <button
                                onClick={() => handleDelete(account.id)}
                                style={{
                                    backgroundColor: '#ff4d4d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default ListOfAccounts;
