import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/axios';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await apiClient.get('/products');
            setProducts(response.data);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await apiClient.delete(`/products/${id}`);
                loadProducts();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
        },
        card: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
        },
        title: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '10px',
        },
        price: {
            color: '#28a745',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            margin: '10px 0',
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
        viewButton: {
            backgroundColor: '#1b6e1f',
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
        link: {
            textDecoration: 'none',
        },
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2>Объявления</h2>
            <div style={styles.grid}>
                {products.map(product => (
                    <div key={product.id} style={styles.card}>
                        <div style={styles.title}>{product.title}</div>
                        <div>Category: {product.category}</div>
                        <div style={styles.price}>${product.price}</div>
                        <div>Description: {product.description.substring(0, 50)}...</div>
                        <div style={{ marginTop: '10px' }}>
                            <Link to={`/products/${product.id}`} style={styles.link}>
                                <button style={styles.viewButton}>Просмотр</button>
                            </Link>
                            {(user?.role === 'seller' || user?.role === 'admin') && (
                                <Link to={`/products/${product.id}/edit`} style={styles.link}>
                                    <button style={styles.editButton}>Редактирование</button>
                                </Link>
                            )}
                            {user?.role === 'admin' && (
                                <button onClick={() => handleDelete(product.id)} style={styles.button}>
                                    Удаление
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;