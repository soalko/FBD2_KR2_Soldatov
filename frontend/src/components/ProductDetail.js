import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            setProduct(response.data);
        } catch (err) {
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
        },
        card: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '20px',
        },
        price: {
            color: '#28a745',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: '20px 0',
        },
        backButton: {
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px',
        },
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>{product.title}</h1>
                <div>
                    <strong>Category:</strong> {product.category}
                </div>
                <div style={styles.price}>${product.price}</div>
                <div>
                    <strong>Description:</strong>
                    <p>{product.description}</p>
                </div>
                <Link to="/products">
                    <button style={styles.backButton}>Обратно к объявлениям</button>
                </Link>
            </div>
        </div>
    );
}

export default ProductDetail;