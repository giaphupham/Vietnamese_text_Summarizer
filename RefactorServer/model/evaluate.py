from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer as TfVectorizer
from nltk import sent_tokenize
from sklearn.metrics.pairwise import cosine_similarity
from numpy.linalg import norm
import numpy as np


class Evaluate:
    def __init__(self):
        pass

    def content_based(self, summary, full_text):
        sentences = sent_tokenize(full_text)

        vectorizer = TfVectorizer().fit(sentences)
        full_text_vector = vectorizer.transform([full_text])
        summary_vector = vectorizer.transform([summary])

        score = cosine_similarity(full_text_vector, summary_vector)[0][0]

        return score

    def semantic_based(self, summary, full_text):
        try:
            pi = 3.14159265358979323846
            summary_sentences = sent_tokenize(summary)
            full_text_sentences = sent_tokenize(full_text)

            vectorizer = TfVectorizer(ngram_range=(1, 3)).fit(full_text_sentences)
            smr_matrix = vectorizer.transform(summary_sentences).T.toarray()
            full_text_matrix = vectorizer.transform(full_text_sentences).T.toarray()

            U0, S0, VT0 = np.linalg.svd(full_text_matrix, full_matrices=False)
            U1, S1, VT1 = np.linalg.svd(smr_matrix, full_matrices=False)

            vectors0 = [(S0[i] * U0[:, i]) for i in range(len(S0))]
            vectors1 = [(S1[i] * U1[:, i]) for i in range(len(S1))]
            angles = []
            for a in vectors0:
                for b in vectors1:
                    cosine_sim = cosine_similarity(a.reshape(1, -1), b.reshape(1, -1))
                    angle = np.arccos(np.clip(cosine_sim, -1.0, 1.0))
                    angles.append(angle)

            # Tránh lỗi số học
            if len(angles) == 0:
                return 0.5
            
            return abs(1 - float(angles[1]) / float(pi / 2))
        except:
            print("Bug with semantic based evaluation")
            return 0.5

