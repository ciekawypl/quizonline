# Instalacja

	npm install
	echo 'DATABASE_URL="file:./dev.db"' > .env
	npx prisma migrate dev --name init
	npx prisma generate

# Uruchamianie

Wersja developerska:

	npm run dev