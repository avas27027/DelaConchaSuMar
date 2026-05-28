import React from 'react';

export interface DishCardProps {
    readonly id: string;
    readonly image: string;
    readonly price: string | number;
    readonly title: string;
    readonly description: string;
    readonly category: string;
    readonly onClick?: () => void;
}

export default function DishCard({ image, price, title, description, category, onClick }: DishCardProps) {
    const hasImage = Boolean(image?.trim());

    return (
        <div className="dish-card" onClick={onClick}>
            <div className="image-container">
                {hasImage ? (
                    <img src={image} alt={title} className="dish-image" />
                ) : (
                    <div className="dish-image-placeholder" aria-label={`Imagen no disponible para ${title}`}>
                        {title.charAt(0)}
                    </div>
                )}
                <div className="price-badge">
                    <span>S/ {price}</span>
                </div>
            </div>

            <div className="dish-info">
                <h3 className="dish-title">{title}</h3>
                <p className="dish-description">{description}</p>
                <span className="dish-category">{category}</span>
            </div>
        </div>
    );
}
