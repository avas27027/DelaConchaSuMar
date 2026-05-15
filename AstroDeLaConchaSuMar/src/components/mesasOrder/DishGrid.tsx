import DishCard, { type DishCardProps } from './DishCard';

interface DishGridProps {
    readonly dishes: DishCardProps[];
    readonly onDishClick: (dish: DishCardProps) => void;
}

export default function DishGrid({ dishes, onDishClick }: DishGridProps) {
    return (
        <div className="dish-grid">
            {dishes.map((dish) => (
                <DishCard
                    key={dish.id}
                    {...dish}
                    onClick={() => onDishClick(dish)}
                />
            ))}
        </div>
    );
}
