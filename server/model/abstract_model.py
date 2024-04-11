from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from os.path import dirname
from transformers.utils import cached_file
import torch

def load_and_save_model():
    tokenizer = AutoTokenizer.from_pretrained("VietAI/vit5-large-vietnews-summarization")  
    model = AutoModelForSeq2SeqLM.from_pretrained("VietAI/vit5-large-vietnews-summarization")
    model.save_pretrained("./t5small", from_pt=True) 
    tokenizer.save_pretrained("./t5small")


def summarizer(sentence):

    model = AutoModelForSeq2SeqLM.from_pretrained(f'{dirname(__file__)}/t5small/')
    tokenizer = AutoTokenizer.from_pretrained(f'{dirname(__file__)}/t5small/') 

    text =  "vietnews: " + sentence + " </s>"
    encoding = tokenizer(text, return_tensors="pt")
    input_ids, attention_masks = encoding["input_ids"], encoding["attention_mask"]
    outputs = model.generate(
        input_ids=input_ids, attention_mask=attention_masks,
        max_length=256
    )
    for output in outputs:
        line = tokenizer.decode(output, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return line

#summarizer("Đứng trên ngọn đồi hoa sim nở tím biếc, em có thể ngắm nhìn toàn cảnh ngôi làng nhỏ - quê ngoại yêu dấu của em. Đây là một ngôi làng nhỏ mang những đặc trưng thân thuộc nhất của một làng quê bắc bộ. Với những ngôi nhà gạch có mái ngói đỏ tươi, cùng khoảng sân rộng bằng xi măng ở phía trước. Và cả một vườn rau với cái ao bèo phía sau nhà. Con đường trong làng giờ đã rộng hơn trước, nhưng vẫn khá ngoằn nghoèo và khúc khuỷu. Những cột điện đứng nép hai bên đường, vừa đỡ dây điện vừa đóng vai trò là cột đèn đường. Cuối làng là một cánh đồng rộng lớn, trồng đầy lạc, củ đậu và su hào. Những người dân trong làng ai cũng hiền lành và dễ mến. Mỗi khi có ai ở xa về, họ lại niềm nở đón chào, gửi tặng những món quà nặng tình láng giềng. Trong buổi chiều tà, sương giăng kín mít. Những mái nhà lại hắt lên ánh đèn vàng ấm áp. Khung cảnh ấy thật bình yên quá đỗi. Yêu biết bao nhiêu quê hương này của em!")