export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image_url: string;
  images: string[];
  amazon_url: string;
  description?: string;
  discount?: number;
  favorites_count: number;
  tags: string[];
  created_at: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  image_url: string;
  images: string[];
  amazon_url: string;
  description?: string;
  discount?: number;
  tags: string[];
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}