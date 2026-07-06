FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY package.json ./
COPY server ./server
COPY web ./web
COPY brand ./brand
COPY docs ./docs
COPY proof ./proof
COPY .env.example ./.env.example
COPY LICENSE README.md ./

EXPOSE 8787

CMD ["npm", "start"]
