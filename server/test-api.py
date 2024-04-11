import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="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",
)
message = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Tóm tắt văn bản sau: Theo cáo trạng, Ding đã đánh cắp thông tin chi tiết về cơ sở hạ tầng phần cứng và phần mềm cho phép các trung tâm dữ liệu về siêu máy tính của Google đào tạo mô hình AI thông qua máy học (machine learning). Những thứ bị đánh cắp gồm các chi tiết về chip, hệ thống và phần mềm giúp siêu máy tính có khả năng thực thi ở mức đỉnh cao của công nghệ máy học và AI. Ding được Alphabet, công ty mẹ của Google, thuê năm 2019. Người này được cho là thực hiện hành vi trộm cắp lần đầu năm 2022 sau khi một công ty công nghệ Trung Quốc bí mật mời làm giám đốc công nghệ. Ding cũng đến Trung Quốc trong vài tháng, tham gia các cuộc họp với nhà đầu tư để quyên tiền cho công ty và nắm 20% cổ phần công ty. Tính đến tháng 5/2023, Ding được cho là đã tải hơn 500 tệp từ máy chủ Google về máy tính cá nhân. Cũng trong tháng đó, người này thành lập công ty công nghệ của riêng mình và nộp đơn vào một chương trình khởi nghiệp tại Trung Quốc. Trong một nhóm chat nội bộ, Ding đăng số dữ liệu đánh cắp được và nói: Chúng ta có kinh nghiệm với nền tảng sức mạnh tính toán của Google. Chúng ta chỉ cần sao chép và nâng cấp, sau đó phát triển thêm nền tảng sức mạnh tính toán phù hợp với điều kiện tại Trung Quốc"}
    ]
)
print(message.content)