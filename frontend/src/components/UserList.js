import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (userId) => {
        if (window.confirm('Are you sure you want to block this user?')) {
            try {
                await apiClient.delete(`/users/${userId}`);
                loadUsers();
            } catch (err) {
                alert('Failed to block user');
            }
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await apiClient.put(`/users/${userId}`, { role: newRole });
            loadUsers();
            setEditingUser(null);
        } catch (err) {
            alert('Failed to update user role');
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            border: '1px solid #ddd',
            padding: '12px',
            backgroundColor: '#f2f2f2',
            textAlign: 'left',
        },
        td: {
            border: '1px solid #ddd',
            padding: '12px',
        },
        button: {
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
        },
        editButton: {
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
        },
        select: {
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ddd',
        },
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2>Управление пользователями</h2>
            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td style={styles.td}>{user.id}</td>
                        <td style={styles.td}>{user.username}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>{user.firstName} {user.lastName}</td>
                        <td style={styles.td}>
                            {editingUser === user.id ? (
                                <select
                                    defaultValue={user.role}
                                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="user">User</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </select>
                            ) : (
                                user.role
                            )}
                        </td>
                        <td style={styles.td}>
                <span style={{ color: user.isActive ? 'green' : 'red' }}>
                  {user.isActive ? 'Active' : 'Blocked'}
                </span>
                        </td>
                        <td style={styles.td}>
                            {editingUser === user.id ? (
                                <button onClick={() => setEditingUser(null)} style={styles.button}>
                                    Cancel
                                </button>
                            ) : (
                                <button onClick={() => setEditingUser(user.id)} style={styles.editButton}>
                                    Edit Role
                                </button>
                            )}
                            {user.isActive && user.role !== 'admin' && (
                                <button onClick={() => handleBlock(user.id)} style={styles.button}>
                                    Block
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;