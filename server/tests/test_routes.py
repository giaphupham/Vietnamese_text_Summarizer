import pytest
from app import app

HEADERS= {'Origin': 'https://hcmusummarizer.azurewebsites.net'}

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with client.session_transaction() as session:
            session['user'] = '20120385@student.hcmus.edu.vn' 
        yield client

def test_login(client):
    data = {
        'username': '20120385@student.hcmus.edu.vn',
        'password': '123'
    }
    response = client.post('/login', json=data, headers=HEADERS)
    assert response.status_code == 200

def test_home(client):
    response = client.get('/home', headers=HEADERS)
    assert response.status_code == 200

def test_user_status(client):
    response = client.get('/status', headers=HEADERS)
    assert response.status_code == 200
    assert response.json == {'loggedIn': None}  

def test_summarize(client):
    data = {
        'input-text': 'Roger Federer - hiện nghỉ dưỡng ở Hội An - gây dựng tên tuổi vững chắc đến mức đã giải nghệ hai năm nhưng vẫn là tay vợt mạnh nhất về thương hiệu cá nhân. Federer treo vợt tháng 9/2022, sau 25 năm thi đấu chuyên nghiệp, tạo di sản đồ sộ với 20 Grand Slam trong tổng 103 danh hiệu ATP, thắng 1.251 trận (nhiều thứ hai lịch sử), đứng top 10 thế giới 968 tuần, gồm 310 tuần ở vị trí số một. Ở giai đoạn đỉnh cao 2004-2008, Federer tạo sự thống trị gần như tuyệt đối, với năm lần liên tiếp vô địch Mỹ Mở rộng và Wimbledon, thắng 20 trong 23 trận bán kết Grand Slam liên tiếp, cùng kỷ lục 237 tuần liên tiếp giữ đỉnh bảng điểm ATP. Trong thập niên đầu của thế kỷ 21, Federer gần như không có đối thủ trên mặt sân cứng và cỏ. Anh tạo thiện cảm với lối đánh hoa mỹ, chính xác đến khó tin. Huyền thoại Thụy Sĩ được xem là nhân vật quan trọng bậc nhất lịch sử ATP Tour khi góp phần nâng tầm các giải quần vợt và giá trị bản quyền truyền hình. Rất nhiều lứa đàn em thừa nhận theo đuổi quần vợt vì ngưỡng mộ Federer. Sự chú ý của thế giới dành cho quần vợt bước sang trang mới khi Federer và Nadal tạo nên cặp kỳ phùng địch thủ vĩ đại bậc nhất kỷ nguyên Mở. Mỗi trận của Federer với Nadal (16 thắng – 24 thua) và sau này với Djokovic (23-27) đều thu hút lượng lớn người xem. Nhiều trận trong số này được ATP chọn là những trận kinh điển bậc nhất lịch sử, để lại cảm xúc mạnh với hàng triệu người trên thế giới. Federer là nhân vật ảnh hưởng lớn nhất tới ATP Tour ba thập kỷ qua, khi giữ vai trò Chủ tịch Hội đồng các tay vợt trong sáu năm (2008-2014). Anh đưa ra nhiều sáng kiến để nâng tầm quần vợt khi môn thể thao này có dấu hiệu giảm sức hút so với các môn hàng đầu khác. Federer cũng giúp tái cấu trúc ATP Tour và mở ra kỷ nguyên thành công mới về mặt tài chính của hệ thống. Phong thái lịch thiệp giúp Federer được ví như Pele của bóng đá và Jack Nicklaus của golf. Anh đoạt giải Tay vợt được người hâm mộ yêu thích nhất liên tục từ 2003 đến 2021, dù trải qua nhiều quãng thời gian gián đoạn thi đấu vì chấn thương. Gần như mọi giải thưởng do khán giả bình chọn đều thuộc về Federer mỗi khi tên anh nằm trong đề cử. Tên tuổi của Federer vượt xa quần vợt và thậm chí thể thao. Anh là biểu tượng toàn cầu, hình mẫu quý ông lịch lãm, mẫu mực trong mắt các thương hiệu lớn. Uniqlo trao cho Federer bản hợp đồng kỷ lục 300 triệu USD khi anh đã cận ngày giải nghệ. Rolex hợp tác với Federer từ 2006, ký gia hạn năm 2016 và kéo dài thương vụ đến 2027. Federer được xem là đại sứ hoàn hảo nhất của hãng đồng hồ quê hương anh. Federer đến nay vẫn là tay vợt duy nhất và là ngôi sao thể thao thứ bảy trong lịch sử kiếm 1 tỷ USD trước khi giải nghệ.',
        'sentences': 3
    }
    
    response = client.post('/summarize', json=data, headers=HEADERS)
    assert response.status_code == 200

def test_profile(client):
    data = {
        'username': '20120385@student.hcmus.edu.vn'
    }
    response = client.post('/profile', json=data, headers=HEADERS)
    assert response.status_code == 200 

def test_feedback(client):
    data = {
        'star': 5,
        'comment': 'Great app!',
        'user': '20120385@student.hcmus.edu.vn'
    }
    response = client.post('/feedback', json=data, headers=HEADERS)
    assert response.status_code == 200  # Sẽ cần cập nhật kết quả dựa trên logic của ứng dụng của bạn

def test_change_name(client):
    data = {
        'email': '20120385@student.hcmus.edu.vn',
        'new_name': 'New Name'
    }
    response = client.post('/change_name', json=data, headers=HEADERS)
    assert response.status_code == 200 


def test_logout(client):
    response = client.get('/logout')
    assert response.status_code == 302 