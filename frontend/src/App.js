import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import ProductDetail from './components/ProductDetail';
import UserList from './components/UserList';

const ProtectedRoute = ({ children, allowedRoles = null }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/products" />;
    }

    return children;
};

function AppContent() {
    return (
        <BrowserRouter>
            <Navbar />
            <div style={{ padding: '20px' }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute>
                                <ProductList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/products/create"
                        element={
                            <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                <ProductForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/products/:id"
                        element={
                            <ProtectedRoute>
                                <ProductDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/products/:id/edit"
                        element={
                            <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                <ProductForm isEdit />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <UserList />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/products" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;