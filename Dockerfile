FROM node:latest as node
RUN mkdir -p /app
WORKDIR /app
COPY package*.json /app/
COPY  cert/ /app/
RUN npm install 
COPY . /app/
EXPOSE 9000
CMD ["npm", "run", "start"]
