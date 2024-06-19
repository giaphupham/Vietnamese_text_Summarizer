from model.summary import Summarizer
from model.evaluate import Evaluate

def load_model():
    s = Summarizer()
    e = Evaluate()
    return s, e