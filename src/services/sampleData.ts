export interface SampleMediaItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  category: string;
  notes?: string;
}

export const SAMPLE_FOOD_ITEMS: SampleMediaItem[] = [
  {
    id: 'food-salmon-bowl',
    title: 'Wild Salmon Quinoa Bowl',
    subtitle: 'Seared salmon, avocado, quinoa, spinach, tomatoes',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    category: 'Balanced Bowl',
    notes: 'High protein Mediterranean meal with healthy omega-3 fats',
  },
  {
    id: 'food-avocado-toast',
    title: 'Artisan Avocado & Poached Egg Toast',
    subtitle: 'Sourdough, smashed avocado, pasture-raised egg, chili flakes',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    category: 'Breakfast / Brunch',
    notes: 'Breakfast with monounsaturated fats and choline',
  },
  {
    id: 'food-ramen',
    title: 'Traditional Miso Ramen Bowl',
    subtitle: 'Ramen noodles, soft boiled egg, scallions, nori, mushrooms',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    category: 'Noodle Soup',
    notes: 'Savory broth with noodles, egg, and vegetables',
  },
  {
    id: 'food-berry-smoothie',
    title: 'Acai Berry & Chia Superfood Bowl',
    subtitle: 'Blended acai, blueberries, banana, granola, chia seeds',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    category: 'Plant-Based Breakfast',
    notes: 'Antioxidant-dense smoothie bowl',
  },
  {
    id: 'food-grilled-chicken-salad',
    title: 'Grilled Herb Chicken Garden Salad',
    subtitle: 'Mixed crisp greens, grilled chicken breast, cucumbers, olive oil',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    category: 'Low Carb Salad',
    notes: 'Lean protein with leafy greens and raw veggies',
  },
];

export const SAMPLE_FRESHNESS_ITEMS: SampleMediaItem[] = [
  {
    id: 'fresh-apples',
    title: 'Crisp Honeycrisp Apples',
    subtitle: 'Smooth taut skin, vibrant crimson-gold color, firm stem',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    category: 'Fresh Produce',
    notes: 'Status: Fresh. Zero surface wrinkling or bruising.',
  },
  {
    id: 'aging-bananas',
    title: 'Sugar-Freckled Bananas',
    subtitle: 'Yellow peel with dense brown speckles; softened pulp',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
    category: 'Ripening Fruit',
    notes: 'Status: Possibly Aging. Peak sweetness, great for baking.',
  },
  {
    id: 'fresh-strawberries',
    title: 'Garden Fresh Red Strawberries',
    subtitle: 'Lustrous red sheen, firm calyx green leaves',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
    category: 'Fresh Berries',
    notes: 'Status: Fresh. Consume within 3-4 days.',
  },
  {
    id: 'aging-avocado',
    title: 'Softening Ripe Avocado',
    subtitle: 'Dark pebbled skin yielding to gentle thumb pressure',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
    category: 'Ready to Eat',
    notes: 'Status: Ripe / Near Aging. Use today for guacamole.',
  },
  {
    id: 'wilted-greens',
    title: 'Wilted Salad Spinach Leaves',
    subtitle: 'Losing crisp turgor, slight yellowing at leaf tips',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    category: 'Aging Produce',
    notes: 'Status: Possibly Aging. Cook into soups or saute.',
  },
];

export const SAMPLE_HYGIENE_ITEMS: SampleMediaItem[] = [
  {
    id: 'hygiene-prep-station',
    title: 'Stainless Commercial Prep Line',
    subtitle: 'Salad & cold sandwich staging with stainless tables',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    category: 'Cold Prep Area',
    notes: 'Observe ingredient covering, surface sanitization, and board condition.',
  },
  {
    id: 'hygiene-cook-line',
    title: 'Restaurant Hot Cook Line',
    subtitle: 'Gas ranges, saute station, and stainless ventilation hood',
    imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80',
    category: 'Hot Line Station',
    notes: 'Observe grease containment, pan handling, and apron standards.',
  },
  {
    id: 'hygiene-bakery-counter',
    title: 'Bakery Prep & Kneading Bench',
    subtitle: 'Marble pastry bench with rolling equipment and storage',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    category: 'Bakery & Pastry',
    notes: 'Observe flour containment, cloth towels, and utensil hygiene.',
  },
];
