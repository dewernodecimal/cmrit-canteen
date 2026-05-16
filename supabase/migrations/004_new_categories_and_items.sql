-- ============================================================
-- CMRIT Canteen — Migration 004: New Categories & Menu Items
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add new values to the item_category ENUM
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'sandwiches';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'burgers';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'maggi';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'milkshakes';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'snacks_refreshers';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'juices';


-- 2. Insert new menu items
-- All prices stored in paise (₹1 = 100 paise)

-- SANDWICHES
INSERT INTO menu_items (name, description, price, category, daily_stock_cap, current_stock) VALUES
  ('Veg Sandwich',           'Classic grilled vegetable sandwich',                        4000,  'sandwiches', 80, 80),
  ('Veg Corn Sandwich',      'Grilled sandwich loaded with sweet corn',                   5000,  'sandwiches', 70, 70),
  ('Veg Paneer Sandwich',    'Grilled sandwich with spiced paneer filling',               6000,  'sandwiches', 70, 70),
  ('Egg Sandwich',           'Soft bread with seasoned egg filling',                      5000,  'sandwiches', 70, 70),
  ('Chicken Sandwich',       'Grilled sandwich with spiced chicken filling',              6500,  'sandwiches', 60, 60),
  ('Chicken Cheese',         'Chicken sandwich with melted cheese',                       8000,  'sandwiches', 60, 60),
  ('Paneer Cheese',          'Paneer sandwich with melted cheese',                        7500,  'sandwiches', 60, 60),
  ('Double Omelette Sandwich','Double egg omelette grilled sandwich',                     7500,  'sandwiches', 60, 60),
  ('Aloo Masala Sandwich',   'Spiced potato masala grilled sandwich',                     4000,  'sandwiches', 80, 80),
  ('Sweet Corn Sandwich',    'Sweet corn with herbs grilled sandwich',                    5000,  'sandwiches', 70, 70),
  ('Egg Cheese Sandwich',    'Egg and cheese grilled sandwich',                           6500,  'sandwiches', 60, 60),
  ('Chilli Chicken Sandwich','Spicy chilli chicken grilled sandwich',                     7000,  'sandwiches', 60, 60),
  ('Chilli Cheese Sandwich', 'Spicy chilli and cheese grilled sandwich',                  5500,  'sandwiches', 70, 70);

-- BURGERS
INSERT INTO menu_items (name, description, price, category, daily_stock_cap, current_stock) VALUES
  ('Veg Patty Burger',        'Crispy veg patty with fresh veggies in a soft bun',        6000,  'burgers', 80, 80),
  ('Veg Patty Cheese Burger', 'Veg patty burger with a melted cheese slice',              7500,  'burgers', 70, 70),
  ('Chicken Patty Burger',    'Juicy chicken patty with fresh veggies in a soft bun',     7000,  'burgers', 70, 70),
  ('Chicken Cheese Burger',   'Chicken patty burger loaded with melted cheese',           8500,  'burgers', 60, 60);

-- MAGGI
INSERT INTO menu_items (name, description, price, category, daily_stock_cap, current_stock) VALUES
  ('Veg Maggi',               'Classic Maggi noodles tossed with vegetables',             4000,  'maggi', 80, 80),
  ('Egg Cheese Maggi',        'Maggi noodles with egg and melted cheese',                 6500,  'maggi', 70, 70),
  ('Egg Maggi',               'Maggi noodles cooked with egg',                            5000,  'maggi', 70, 70),
  ('Chicken Maggi',           'Maggi noodles tossed with spiced chicken',                 6000,  'maggi', 70, 70),
  ('Paneer Cheese Maggi',     'Maggi noodles with paneer and melted cheese',              7500,  'maggi', 60, 60);

-- MILKSHAKES & DRINKS
INSERT INTO menu_items (name, description, price, category, daily_stock_cap, current_stock) VALUES
  ('Banana Milkshake',        'Thick and creamy fresh banana milkshake',                  5000,  'milkshakes', 60, 60),
  ('Oreo Shake',              'Chilled Oreo cookie blended milkshake',                    6000,  'milkshakes', 60, 60),
  ('Muskmelon Shake',         'Refreshing chilled muskmelon milkshake',                   5000,  'milkshakes', 60, 60),
  ('Cold Coffee',             'Chilled coffee blended with ice cream',                    6000,  'milkshakes', 80, 80),
  ('Avocado Shake',           'Smooth and creamy fresh avocado shake',                    8000,  'milkshakes', 40, 40);

-- SNACKS & REFRESHERS
INSERT INTO menu_items (name, description, price, category, daily_stock_cap, current_stock) VALUES
  ('Double Egg Omelette',     'Fluffy double egg omelette, lightly spiced',               4000,  'snacks_refreshers', 80, 80),
  ('French Fries',            'Golden crispy salted french fries',                        7000,  'snacks_refreshers', 80, 80),
  ('Peri Peri Fries',         'Crispy fries tossed in spicy peri peri masala',            8000,  'snacks_refreshers', 70, 70),
  ('Chicken Nuggets',         'Crispy golden fried chicken nuggets (6 pcs)',              8000,  'snacks_refreshers', 60, 60);

-- JUICES
INSERT INTO menu_items (name, description, price, category, daily_stock_cap, current_stock) VALUES
  ('Apple Juice',             'Fresh chilled apple juice',                                4000,  'juices', 80, 80),
  ('Orange Juice',            'Freshly squeezed orange juice',                            4000,  'juices', 80, 80),
  ('Pineapple Juice',         'Sweet and tangy chilled pineapple juice',                  4000,  'juices', 80, 80),
  ('Watermelon Juice',        'Refreshing chilled watermelon juice',                      4000,  'juices', 80, 80),
  ('Lemon Juice',             'Fresh lime juice, sweet or salted',                        3000,  'juices', 100, 100);

