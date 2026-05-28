import { useMemo, useState } from 'react';
import DishCard, { type DishCardProps } from './DishCard';

interface DishGridProps {
    readonly dishes: DishCardProps[];
    readonly onDishClick: (dish: DishCardProps) => void;
}

export default function DishGrid({ dishes, onDishClick }: DishGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    const categories = useMemo(() => {
        const uniqueCategories = dishes
            .map((dish) => dish.category?.trim())
            .filter((category): category is string => Boolean(category));

        return ['Todas', ...Array.from(new Set(uniqueCategories))];
    }, [dishes]);

    const filteredDishes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return dishes.filter((dish) => {
            const dishCategory = dish.category.trim();
            const matchesCategory = selectedCategory === 'Todas' || dishCategory === selectedCategory;
            const searchableText = `${dish.title} ${dish.description} ${dish.category}`.toLowerCase();
            const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [dishes, searchTerm, selectedCategory]);

    return (
        <section className="dish-browser">
            <div className="dish-filters">
                <div className="dish-search-wrapper">
                    <label htmlFor="dish-search" className="dish-filter-label">Buscar plato</label>
                    <input
                        id="dish-search"
                        className="dish-search-input"
                        type="search"
                        placeholder="Buscar por nombre, descripcion o categoria"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>

                <div className="dish-category-wrapper">
                    <span className="dish-filter-label">Categoria</span>
                    <div className="dish-category-filters">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                className={`dish-category-filter ${selectedCategory === category ? 'active' : ''}`}
                                aria-pressed={selectedCategory === category}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredDishes.length > 0 ? (
                <div className="dish-grid">
                    {filteredDishes.map((dish) => (
                        <DishCard
                            key={dish.id}
                            {...dish}
                            onClick={() => onDishClick(dish)}
                        />
                    ))}
                </div>
            ) : (
                <div className="dish-empty-state">
                    No se encontraron platos con esos filtros.
                </div>
            )}
        </section>
    );
}
