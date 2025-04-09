# Sử dụng Node.js LTS version làm base image
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép package.json
COPY package.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép tất cả files
COPY . .

# Mở port 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "server.js"] 