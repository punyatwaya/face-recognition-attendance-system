# face_engine.py

import cv2
import numpy as np
from insightface.app import FaceAnalysis


# ---------------------------------------------------
# Load buffalo_l Model
# ---------------------------------------------------

face_app = FaceAnalysis(name="buffalo_l")

# CPU MODE
face_app.prepare(ctx_id=-1)


# ---------------------------------------------------
# Face Recognition Threshold
# ---------------------------------------------------

THRESHOLD = 0.45


# ---------------------------------------------------
# Generate Face Embedding
# ---------------------------------------------------

def get_embedding(image_path):

    # Read image
    img = cv2.imread(image_path)

    if img is None:
        return None

    # Detect faces
    faces = face_app.get(img)

    # No face found
    if len(faces) == 0:
        return None

    # Return embedding
    return faces[0].embedding


# ---------------------------------------------------
# Cosine Similarity
# ---------------------------------------------------

def cosine_similarity(a, b):

    a = np.array(a)
    b = np.array(b)

    return np.dot(a, b) / (
        np.linalg.norm(a) * np.linalg.norm(b)
    )


# ---------------------------------------------------
# Compare Face Embeddings
# ---------------------------------------------------

def compare_faces(
    embedding,
    database_embeddings
):

    best_score = -1
    best_match = None

    for student in database_embeddings:

        db_embedding = student["embedding"]

        score = cosine_similarity(
            embedding,
            db_embedding
        )

        if score > best_score:

            best_score = score
            best_match = student

    return best_match, best_score