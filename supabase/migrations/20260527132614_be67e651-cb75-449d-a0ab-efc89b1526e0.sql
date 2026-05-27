UPDATE public.payment_methods SET logo_url = '/payment-logos/bkash.webp', updated_at = now() WHERE lower(name) = 'bkash';
UPDATE public.payment_methods SET logo_url = '/payment-logos/nagad.png', updated_at = now() WHERE lower(name) = 'nagad';
UPDATE public.payment_methods SET logo_url = '/payment-logos/rocket.png', updated_at = now() WHERE lower(name) = 'rocket';