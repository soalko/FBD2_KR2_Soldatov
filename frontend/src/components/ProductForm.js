import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios';

function ProductForm({ isEdit = false }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        price: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            loadProduct();
        }
    }, [isEdit, id]);

    const loadProduct = async () => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            const product = response.data;
            setFormData({
                title: product.title,
                category: product.category,
                description: product.description,
                price: product.price,
            });
        } catch (err) {
            setError('Failed to load product');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                await apiClient.put(`/products/${id}`, formData);
            } else {
                await apiClient.post('/products', formData);
            }
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
        },
        input: {
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
        },
        textarea: {
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minHeight: '100px',
        },
        button: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
        },
        error: {
            color: 'red',
            marginBottom: '10px',
        },
    };

    return (
        <div style={styles.container}>
            <h2>{isEdit ? 'Редактировать объявление' : 'Создать объявление'}</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    style={styles.textarea}
                    required
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Saving...' : (isEdit ? 'Обновление' : 'Создание')}
                </button>
            </form>
        </div>
    );
}

export default ProductForm;