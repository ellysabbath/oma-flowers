// Import images
import pic from '../../assets/pic.jpg';
import pict from '../../assets/pict.jpg';
import pictur from '../../assets/pictur.jpg';
import picture from '../../assets/picture.jpg';

export const imageSet = [pic, pict, pictur, picture];

export const categories = [
  { name: 'Accessories', count: 3 },
  { name: 'Electronics & Computer', count: 5 },
  { name: 'Laptops & Desktops', count: 2 },
  { name: 'Mobiles & Tablets', count: 8 },
  { name: 'SmartPhone & Smart TV', count: 5 },
];

export const products = [
  { id: 1, name: 'Apple iPad Mini G2356', category: 'SmartPhone', price: 1050.00, originalPrice: 1250.00, image: imageSet[0], badge: 'New' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', category: 'SmartPhone', price: 1200.00, originalPrice: 1400.00, image: imageSet[1], badge: 'Sale' },
  { id: 3, name: 'Sony WH-1000XM5', category: 'Headphones', price: 350.00, originalPrice: 400.00, image: imageSet[2], badge: '' },
  { id: 4, name: 'Dell XPS 15 Laptop', category: 'Laptops', price: 1800.00, originalPrice: 2100.00, image: imageSet[3], badge: 'New' },
  { id: 5, name: 'Apple Watch Series 9', category: 'Watches', price: 450.00, originalPrice: 500.00, image: imageSet[0], badge: 'Sale' },
  { id: 6, name: 'Samsung 65" Smart TV', category: 'TV', price: 1500.00, originalPrice: 1800.00, image: imageSet[1], badge: '' },
  { id: 7, name: 'Canon EOS R6 Camera', category: 'Cameras', price: 2500.00, originalPrice: 2800.00, image: imageSet[2], badge: 'Sale' },
  { id: 8, name: 'iPad Pro M2 12.9"', category: 'Tablets', price: 1100.00, originalPrice: 1300.00, image: imageSet[3], badge: '' },
  { id: 9, name: 'Google Pixel 8 Pro', category: 'SmartPhone', price: 1000.00, originalPrice: 1200.00, image: imageSet[0], badge: 'New' },
  { id: 10, name: 'MacBook Pro 16"', category: 'Laptops', price: 2500.00, originalPrice: 2800.00, image: imageSet[1], badge: '' },
  { id: 11, name: 'Samsung Galaxy Tab S9', category: 'Tablets', price: 800.00, originalPrice: 950.00, image: imageSet[2], badge: 'Sale' },
  { id: 12, name: 'Sony A7 IV Camera', category: 'Cameras', price: 2800.00, originalPrice: 3200.00, image: imageSet[3], badge: '' },
  { id: 13, name: 'Apple AirPods Pro 2', category: 'Headphones', price: 250.00, originalPrice: 300.00, image: imageSet[0], badge: 'New' },
  { id: 14, name: 'LG OLED 77" TV', category: 'TV', price: 3500.00, originalPrice: 4000.00, image: imageSet[1], badge: '' },
  { id: 15, name: 'Samsung Galaxy Watch 6', category: 'Watches', price: 400.00, originalPrice: 480.00, image: imageSet[2], badge: 'Sale' },
  { id: 16, name: 'Microsoft Surface Pro 9', category: 'Tablets', price: 1300.00, originalPrice: 1500.00, image: imageSet[3], badge: '' },
  { id: 17, name: 'OnePlus 12', category: 'SmartPhone', price: 900.00, originalPrice: 1050.00, image: imageSet[0], badge: 'New' },
  { id: 18, name: 'Razer Blade 14 Laptop', category: 'Laptops', price: 2200.00, originalPrice: 2500.00, image: imageSet[1], badge: '' },
  { id: 19, name: 'Bose 700 Headphones', category: 'Headphones', price: 380.00, originalPrice: 420.00, image: imageSet[2], badge: 'Sale' },
  { id: 20, name: 'TCL 55" Smart TV', category: 'TV', price: 600.00, originalPrice: 750.00, image: imageSet[3], badge: '' },
];

export const services = [
  { icon: 'RefreshCw', title: 'Free Return', desc: '30 days money back guarantee!' },
  { icon: 'Truck', title: 'Free Shipping', desc: 'Free shipping on all order' },
  { icon: 'Headphones', title: 'Support 24/7', desc: 'We support online 24 hrs a day' },
  { icon: 'CreditCard', title: 'Receive Gift Card', desc: 'Receive gift all over order $50' },
  { icon: 'Lock', title: 'Secure Payment', desc: 'We Value Your Security' },
  { icon: 'Globe', title: 'Online Service', desc: 'Free return products in 30 days' },
];

export const tabs = ['All Products', 'New Arrivals', 'Featured', 'Top Selling'];