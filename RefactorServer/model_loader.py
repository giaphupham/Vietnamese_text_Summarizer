from model.summary import Summarizer
from model.evaluate import Evaluate
from model.abstract_model import summarizer

from nltk.tokenize import sent_tokenize
from werkzeug.utils import secure_filename

def load_model():
    s = Summarizer()
    e = Evaluate()
    return s, e