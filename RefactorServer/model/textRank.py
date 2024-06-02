from summary import Summarizer
from evaluate import Evaluate


def load_model():
    s = Summarizer()
    e = Evaluate()
    return s, e

# summarizer, evaluate = load_model()

# full_text = str(input("Enter your paragraph: "))
# # cai nay la goi ham summarize cua class Summarizer cho text rank
# summary = summarizer.summarize(full_text, mode="text rank")
# # cai nay de tinh toan do chinh xac cua cai summary
# score = evaluate.content_based(summary[0], full_text)

# # print ra ket qua
# print("-"*20)
# print("summary: " + summary[0])
# print("-"*20)

# # print ra cac cau duoc chon
# list_sentence_selected = list(summary[1])
# list_sentence_selected = list(map(str, list_sentence_selected))
# print("Sentence selected: {}".format(", ".join(list_sentence_selected)))
# print("With {:.2f}% information keep (content-based evaluation)".format(score*100))
