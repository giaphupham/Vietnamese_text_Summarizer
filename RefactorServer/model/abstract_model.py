from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, GenerationConfig
from os.path import dirname
from transformers.utils import cached_file
import transformers
import requests

API_URL = "https://luq9jfipgs5462dc.us-east-1.aws.endpoints.huggingface.cloud/"
headers = {
	"Accept" : "application/json",
	"Authorization": "Bearer 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",
	"Content-Type": "application/json" 
}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

def summarizer_2(sentence):

    model = AutoModelForSeq2SeqLM.from_pretrained(f"{dirname(__file__)}/model_v2/")
    tokenizer = AutoTokenizer.from_pretrained(f"{dirname(__file__)}/model_v2/") 

    text =  sentence
    encoding = tokenizer(text, return_tensors="pt")
    input_ids, attention_masks = encoding["input_ids"], encoding["attention_mask"]
    outputs = model.generate(
        input_ids=input_ids, 
        attention_mask=attention_masks,
    )
    for output in outputs:
        line = tokenizer.decode(output, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return line


def summarizer(sentence):
    output = query({
        "inputs": sentence,
    })
    return output[0]['summary']


text = """Nga cảnh báo nguy cơ xung đột hạt nhân nếu Ukraine dùng vũ khí phương Tây tập kích nước này, nhưng giới quan sát cho rằng Moskva "chỉ dọa suông".

Ukraine gần đây liên tục kêu gọi các đồng minh cho phép Kiev sử dụng vũ khí được phương Tây viện trợ để tập kích mục tiêu trong lãnh thổ Nga, trong bối cảnh cục diện chiến sự đang thay đổi nhanh chóng và không tích cực với Kiev. Tổng thống Ukraine Volodymyr Zelensky nhấn mạnh việc tập kích mục tiêu trong lãnh thổ Nga chỉ mang tính phòng thủ.

Trong những tháng qua, các nước phương Tây liên tục tranh cãi về vấn đề này, khi một số lo ngại leo thang căng thẳng với Nga, điều có thể dẫn đến xung đột trực tiếp giữa NATO với Moskva, thậm chí là chiến tranh hạt nhân.

Nhưng chiến dịch tấn công Kharkov của Nga dường như đã thay đổi tình thế. Nhận thấy sự bất lợi của Ukraine khi Nga tập trung quân bên kia biên giới để tấn công mà Kiev không thể làm gì, phương Tây dần nới "vòng kim cô". Giới chức Mỹ ngày 30/5 xác nhận Tổng thống Joe Biden đã cho phép Ukraine sử dụng vũ khí do Mỹ cung cấp cho mục đích phản công ở Kharkov. Chính phủ Đức ngày 31/5 có động thái tương tự Mỹ.

Tổng thống Zelensky nói Ukraine "đã nhận thông điệp từ phía Mỹ vào sáng sớm 31/5", mô tả đây là "bước tiến" đáng kể trong nỗ lực bảo vệ người dân tại khu vực gần biên giới với Nga. Ông không nêu chi tiết thông điệp của Washington.

Andrey Kartapolov, Chủ tịch Ủy ban Quốc phòng Duma Quốc gia (tức Hạ viện Nga), cùng ngày cảnh báo Moskva sẽ triển khai biện pháp "bất đối xứng" đáp trả quyết định của Mỹ, nhưng không nêu cụ thể. Phát ngôn viên Điện Kremlin Dmitry Peskov cho biết lãnh đạo chính phủ và quân đội Nga "đang thảo luận các biện pháp đối phó phù hợp"."""

#print(summarizer(text))
#print(summarizer("Đứng trên ngọn đồi hoa sim nở tím biếc, em có thể ngắm nhìn toàn cảnh ngôi làng nhỏ - quê ngoại yêu dấu của em. Đây là một ngôi làng nhỏ mang những đặc trưng thân thuộc nhất của một làng quê bắc bộ. Với những ngôi nhà gạch có mái ngói đỏ tươi, cùng khoảng sân rộng bằng xi măng ở phía trước. Và cả một vườn rau với cái ao bèo phía sau nhà. Con đường trong làng giờ đã rộng hơn trước, nhưng vẫn khá ngoằn nghoèo và khúc khuỷu. Những cột điện đứng nép hai bên đường, vừa đỡ dây điện vừa đóng vai trò là cột đèn đường. Cuối làng là một cánh đồng rộng lớn, trồng đầy lạc, củ đậu và su hào. Những người dân trong làng ai cũng hiền lành và dễ mến. Mỗi khi có ai ở xa về, họ lại niềm nở đón chào, gửi tặng những món quà nặng tình láng giềng. Trong buổi chiều tà, sương giăng kín mít. Những mái nhà lại hắt lên ánh đèn vàng ấm áp. Khung cảnh ấy thật bình yên quá đỗi. Yêu biết bao nhiêu quê hương này của em!"))
#print(dirname(__file__))


