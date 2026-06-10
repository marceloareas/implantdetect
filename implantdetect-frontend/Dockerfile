FROM node:25-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variáveis VITE_* são embutidas no bundle em build-time.
# Recebidas como build args (ver docker-compose.yml), originadas do .env raiz.
ARG VITE_SHOW_SURVEY
ARG VITE_SURVEY_URL
ENV VITE_SHOW_SURVEY=$VITE_SHOW_SURVEY
ENV VITE_SURVEY_URL=$VITE_SURVEY_URL

RUN npm run build

FROM nginx:1.29.8-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
