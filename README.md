# Dự án cửa hàng thương mại điện tử
## Cách 1: Deploy dự án lên AWS sử dụng EC2, ALB.
Đầu tiên, ta sẽ vào giao diện console của AWS và chọn vào dịch vụ EC2.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/consoleec2.png?raw=true)
ấn vào Launch instance. Ở đây ta có thể chọn cấu hình máy tùy muốn, ở đây tôi sẽ cấu hình máy chủ như sau:
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/summary_instance.png?raw=true)


Làm tương tự như vậy để tạo một instance nữa. Và cuối cùng ta sẽ có 2 instane như sau:
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/checkinstance.png?raw=true)
Khi mà đã có 2 máy, ta sẽ cần phải truy cập vào 2 máy này để cấu hình. Lưu ý để truy cập vào được máy thì phải tạo key từ trước và truy cập máy tại nơi lưu key. Và để ssh vào được 2 máy thì ta cần phải cấu hình inbound rules cho truy cập ssh bằng ip được chỉ định.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/inboundrule.png?raw=true)
Để kết nối bằng ssh thì ta sẽ sử dụng lệnh sau:
```bash
ssh - i "@tên_key" ubuntu@ec2-"ip_public_của_instance".compute-1.amazonaws.com
```
Và lưu ý là phải dùng lệnh này ở nơi lưu key ví dụ:
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/ssh.png?raw=true)
Sau khi chúng ta truy cập được vào instance, ta sẽ dùng lệnh ```sudo -i``` để chạy lệnh với quyền root. Ở đây ta sẽ tải những gói cần thiết để chạy được dự án. Dự án này tôi chạy bằng Docker nên tôi sẽ tải Docker. Dùng những lệnh sau để cài Docker:
```bash
apt-get update
apt install docker* -y
``` 
Sau khi đã cài xong Docker, ta sẽ kéo code từ github về instance với lệnh ```git clone "Đường dẫn"``` và lưu ý hãy lưu ở thư mục mà muốn chạy dự án. Ta truy cập vào thư mục chứa code bằng lệnh ```cd projects/CNPMN5/```. Sau khi đã vào nơi lưu code rồi thì ta sẽ tạo một Dockerfile để triển khai dự án. Ta sẽ sử dụng lệnh ```vi Dockerfile``` để tạo một file Docker. Sau đó ta sẽ viết Dockerfile như sau:
```dockerfile
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
```
Sau đó ta sẽ lưu lại file và ra ngoài chạy lệnh ```docker build -t myweb1 .``` để tạo một image. Để kiểm tra image đã được tạo thành công hay chưa ta có thể sử dụng lệnh ```docker images```. Ở đây, tôi đã tạo được một image như sau:
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/checkimages.png?raw=true)
Giờ để chạy được container, ta sẽ phải dùng lệnh ```docker run -dp 3000:3000 0cb```. Ở đây -d là để cho container này chạy ở dưới nền còn -p là để chỉ định port. Còn 0cb là 3 ký tự đầu của image ID. Sau khi đã chạy thành công ta có thể lên web kiểm tra xem dự án đã chạy thành công ở port 3000 chưa.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/testfirst.png?raw=true)
Và ở đây dự án đã được chạy thành công. Sau đó chúng ta sẽ chạy tương tự các bước dự án ở instance còn lại.

Sau khi đã chạy thành công dự án ở 2 instance thì ta sẽ cấu hình Load Balance cho dự án, ở đây tôi sử dụng ALB để cân bằng lưu lượng giữa 2 instance. Đầu tiên, ta cần tạo Target group trên AWS. Vẫn vào phần dịch vụ EC2, sau đó kéo xuống và chọn vào phần Target Groups. Sau khi ấn vào, ta chọn Create target group để tạo một target group mới.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/cau_hinh_tg1.png?raw=true)
Ở đây ta chọn mục Instances và đặt tên cho target group tùy ý.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/cau_hinh_tg.png?raw=true)
Ở đây ta sẽ chọn những mục như sau, lưu ý chọn HTTP và cho chạy ở cổng mặc định là 80. Sau đó ấn next.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/choninstance_vao_targetgroup.png?raw=true)
Ở phần này ta sẽ chọn 2 instance mà ta đang chạy dự án. Sau khi chọn, ta sẽ chỉnh sửa port thành 3000 thay vì 80 thì ta muốn khi người dùng truy cập vào load balance thì lưu lượng sẽ được chuyển hướng tới service ta đang chạy ở port 3000. Sau đó ấn vào Include as pending below và chọn Create target group.

Sau khi đã tạo target group thành công thì ta sẽ tạo ALB. Ta quay lại phần EC2, kéo xuống dưới và chọn vào Load Balancers. Ở đây ta sẽ chọn Create load balancer.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/chonalb.png?raw=true)
Ở đây thì ta sẽ chọn Application Load Balancer như ta đã nói từ đầu.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/cauhinhalbrainternet.png?raw=true)
Ở đây ta sẽ đặt tên và chọn vào những mục như trên ảnh để mọi người ngoài internet có thể truy cập được vào.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/bestpractice.png?raw=true)
Ở phần này ta sẽ chọn vào tất cả các Availability Zones and subnets theo best practice của AWS. Ở phần security group thì ta sẽ chọn những security group mà ta muốn sử dụng, tối đa là 5 security group.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/chontargetgroup.png?raw=true)
Ở đây, mục Default action thì ta sẽ chọn target group mà ta vừa cấu hình. Sau đó ta kéo xuống dưới và chọn Create load balancer và sẽ phải đợi 1 thời gian để ALB có thể truy cập được. Và đây là sơ đồ của ta:
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/s%C6%A1%20%C4%91%E1%BB%93.png?raw=true)
Và ở đây ta có một vấn đề đó chính là khi mà ta ấn F5 thì traffic sẽ được chuyển hướng đến instance còn lại mà nó không giữ nguyên tại instance này vì vậy khi bạn đang giao dịch dở dang mà ấn nhầm thì mọi thứ sẽ công cốc, để tránh điều đó thì ta sẽ vào lại phần target group và ấn vào target group đang sử dụng, ở đây ta vào mục Attributes và ấn vào edit. Ta kéo xuống gần cuối thì sẽ thấy mục như này:
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/stickiness.png?raw=true)
Ở phần Stickiness ta ấn vào phần Turn on stickiness thì khi ta ấn F5 thì ta vẫn sẽ làm việc với instance hiện tại. Và sau khi ALB đã chạy lên thành công thì ta sẽ copy đường dẫn DNS của nó ở đây:
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/dns.png?raw=true)
Và ta sẽ dán dns ấy lên google để xem dự án chạy thành công chưa.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/testwebfinal.png?raw=true)
Và ở đây có thể thấy dự án của ta đã được chạy thành công.

## Cách 2: Deploy dự án trên on premise 2: Deploy dự án trên on premise.

Đầu tiên thì ta sẽ phải chuẩn bị ít nhất 2 máy chủ để sau đó có thể cấu hình cân bằng tải giữa 2 máy. Ở đây tôi chuẩn bị 2 máy chủ Ubuntu Linux với ip lần lượt là 192.168.6.110 và 192.168.6.111. Để xem được địa chỉ ip thì ta dùng lệnh ```ip a```.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/anh1.png?raw=true) ![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/anh2.png?raw=true)
Sau đó thì ở 2 máy chủ ta sẽ chạy ở quyền root với lệnh là ```sudo -i```. Sau khi đã chạy với quyền root thì ta sẽ tạo ra thư mục để lưu code, ở đây tôi sẽ đặt là project và sau đó đi vào thư mục đó rồi clone code trên github và làm tương tự ở cả 2 máy.
```bash
mkdir /project
cd /project
git clone https://github.com/nammmm156/projects.git
```
Dự án này chạy bằng Nodejs nên tôi sẽ cần tải những package phù hợp.
```bash
apt-get update
apt install nodejs
apt install npm
```
Lưu ý: Version của các công cụ như npm và nodejs cần phải lớn hơn hoặc bằng với version mà dự án yêu cầu, để check mình đã cài version nào của npm và nodejs thì có thể dùng lệnh 
```bash
npm -v
nodejs -v
```
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/anh3.png?raw=true)
Sau đó thì ta sẽ dùng lệnh ```npm install``` để tải các dependencies cần thiết cho dự án.
Khi đã hoàn thành việc cài đặt thì ta sẽ dùng lệnh ```npm start``` để chạy dự án và dự án của chúng ta sẽ chạy ở port 3000.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/anh4.png?raw=true)
Ở đây chúng ta phải đảm bảo chưa có tiến trình nào chạy ở port 3000 nếu đã có tiến trình chạy ở port 3000 thì dự án sẽ không được khởi chạy thành công. Để kiếm tra thì ta có thể dùng lệnh ```ss -nulpt | grep 3000```
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/anh6.png?raw=true)
Vấn đề ở đây là khi ta chạy lệnh ```npm start``` thì dự án sẽ lưu log trực tiếp ra màn hình và ta sẽ không thể thao tác được nữa. ![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/anh5.png?raw=true) Vì vậy ở đây ta sẽ dùng lệnh ```nohup npm install > server.log 2>&1 &``` Để cho dự án chạy ở dưới nền và log sẽ được đưa vào file server.log. Ta sẽ làm tương tự ở máy chủ còn lại.

Và ở đây khi muốn truy cập trang web thì chúng ta sẽ phải nhập port, như vậy sẽ rất bất tiện và khách hàng chắc chắn sẽ không muốn như vậy. Vì vậy ở đây chúng ta sẽ phải chạy reverse-proxy để có thể map cổng 3000 sang cổng 80 và khi người dùng truy cập http thông thường thì lưu lượng sẽ được chuyển về cổng 3000. Ở dự án này, tôi sẽ sử dụng reverse proxy của Nginx. Đầu tiên sẽ càn tải Nginx bằng lệnh ```apt install nginx -y```, đảm bảo chưa có tiến trình nào chạy ở cổng 80. Sau đó ta sẽ dùng lệnh ```vi /etc/nginx/site-enabled/default```để có thể cấu hình reverse proxy. Ta sẽ cấu hình file như sau:
```bash
server {
    listen 80;
    server_name 192.168.6.111;

    location / {
        proxy_pass http://192.168.6.111:3000;
        proxy_pass http://192.168.6.110:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Ở đây ta sẽ sử dụng server 192.168.6.111 làm reverse-proxy server. Sau đó ta sẽ truy cập ```http://192.168.6.111``` để test xem mọi thứ đã chạy bình thường chưa.
![Ảnh](https://github.com/nammmm156/projects/blob/master/assets/anh7.png?raw=true)
Chú ý ở phần ```server_name``` ta sẽ để tên miền của chúng ta, ở đây tôi chưa có tên miền nên sẽ để địa chỉ ip của server.

Vậy là dự án của chúng ta đã triển khai thành công.
