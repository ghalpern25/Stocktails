export type IngredientCategory = 
  | 'BASE_SPIRIT' 
  | 'LIQUEUR' 
  | 'MIXER' 
  | 'SYRUP' 
  | 'BITTERS' 
  | 'GARNISH' 
  | 'OTHER';

export interface Ingredient {
  id: number;
  name: string;
  category: IngredientCategory;
  in_stock: boolean;
}

export interface IngredientCreate {
  name: string;
  category: IngredientCategory;
}

export interface IngredientUpdate {
  name?: string;
  category?: IngredientCategory;
  in_stock?: boolean;
}

export interface RecipeIngredient {
  ingredient_id: number;
  amount: string;
  unit: string | null;
}

export interface RecipeIngredientResponse {
  ingredient_id: number;
  ingredient_name: string;
  amount: string;
  unit: string | null;
}

export interface Recipe {
  id: number;
  name: string;
  instructions: string;
  glassware: string | null;
  ingredients: RecipeIngredientResponse[];
  missing_garnish: string | null;
  is_favorite: boolean;
}

export interface RecipeList {
  id: number;
  name: string;
  glassware: string | null;
  ingredients: RecipeIngredientResponse[];
  can_make: boolean;
  missing_garnish: string | null;
  is_favorite: boolean;
}

export interface RecipeCreate {
  name: string;
  instructions: string;
  glassware?: string | null;
  ingredients: RecipeIngredient[];
}

export interface RecipeUpdate {
  name?: string;
  instructions?: string;
  glassware?: string | null;
  ingredients?: RecipeIngredient[];
}

export interface ShoppingListItem {
  id: number;
  name: string;
  category: IngredientCategory;
}

export const CATEGORIES: IngredientCategory[] = [
  'BASE_SPIRIT',
  'LIQUEUR',
  'MIXER',
  'SYRUP',
  'BITTERS',
  'GARNISH',
  'OTHER',
];

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  BASE_SPIRIT: 'Base Spirit',
  LIQUEUR: 'Liqueur',
  MIXER: 'Mixer',
  SYRUP: 'Syrup',
  BITTERS: 'Bitters',
  GARNISH: 'Garnish',
  OTHER: 'Other',
};

export const GLASSWARE_OPTIONS = [
  'Rocks Glass',
  'Collins Glass',
  'Coupe Glass',
  'Martini Glass',
  'Pint Glass',
  'Copper Mule Mug',
  'Wine Glass',
  'Shot Glass',
  'Tiki Glass',
  'Other',
];
