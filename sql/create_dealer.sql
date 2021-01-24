INSERT INTO users (id, username, email,password, created_at, updated_at)
values ('e46fe472-586e-11eb-ae93-0242ac130002', 'DEALER', 'DEALER@DEALER.COM', '123', NOW(), NOW()); 

--docker cp ./create_dealer.sql 42a67fb264ab:/docker-entrypoint-initdb.d/create_dealer.sql
--docker exec -u postgres 42a67fb264ab psql poker postgres -f docker-entrypoint-initdb.d/create_dealer.sql
