INSERT INTO public.payment_methods (name, logo_url, address, min_amount, max_amount, is_active, sort_order)
VALUES
  ('bKash',  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BKash_Logo.svg/512px-BKash_Logo.svg.png',  '01700000000', 100, 25000, true, 1),
  ('Nagad',  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Nagad_Logo.svg/512px-Nagad_Logo.svg.png',  '01800000000', 100, 25000, true, 2),
  ('Rocket', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rocket_logo.png/512px-Rocket_logo.png',     '017000000000', 100, 25000, true, 3)
ON CONFLICT DO NOTHING;
