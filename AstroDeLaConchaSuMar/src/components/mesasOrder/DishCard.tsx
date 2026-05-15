import React from 'react';

export interface DishCardProps {
    id: string;
    image: string;
    price: string | number;
    title: string;
    description: string;
    onClick?: () => void;
}

export default function DishCard({ image, price, title, description, onClick }: DishCardProps) {
    return (
        <div className="dish-card" onClick={onClick}>
            <div className="image-container">
                <img src={image || '/placeholder-dish.jpg'} alt={title} className="dish-image" />
                <div className="price-badge">
                    <span>S/ {price}</span>
                </div>
            </div>

            <div className="dish-info">
                <h3 className="dish-title">{title}</h3>
                <p className="dish-description">{description}</p>
            </div>
        </div>
    );
}
