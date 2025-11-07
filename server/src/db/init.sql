INSERT INTO roles (id, name, description)
VALUES
  (1, 'admin', 'Administrator'),
  (2, 'staff', 'Plant care staff'),
  (3, 'customer', 'Registered user')
ON CONFLICT (id) DO NOTHING;
