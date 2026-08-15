import cv2
import numpy as np
from typing import List

def extract_dominant_colors(image_bytes: bytes, mask_bytes: bytes, k: int = 3) -> List[str]:
    """
    Extracts the dominant hex colors from the skin regions specified by the mask.
    This builds the 'styling profile' color palette.
    Uses in-memory bytes instead of disk paths to comply with privacy rules.
    """
    # Load image and mask from bytes
    image_np = np.frombuffer(image_bytes, np.uint8)
    mask_np = np.frombuffer(mask_bytes, np.uint8)
    
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    mask = cv2.imdecode(mask_np, cv2.IMREAD_GRAYSCALE)

    if image is None or mask is None:
        raise ValueError("Could not load image or mask from bytes")

    # Ensure mask is the same size as image
    if image.shape[:2] != mask.shape:
        mask = cv2.resize(mask, (image.shape[1], image.shape[0]))

    # Threshold the mask to ensure it's binary
    _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)

    # Extract pixels where mask is active
    # mask == 255 gives the skin region.
    pixels = image[mask == 255]

    if len(pixels) == 0:
        return []

    # Convert pixels to float32 for k-means
    pixels = np.float32(pixels)

    # Define criteria, number of clusters(K) and apply kmeans()
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    # Convert centers to uint8 (BGR format)
    centers = np.uint8(centers)

    # Sort centers by frequency
    counts = np.bincount(labels.flatten())
    sorted_indices = np.argsort(counts)[::-1]
    sorted_centers = centers[sorted_indices]

    hex_colors = []
    for center in sorted_centers:
        b, g, r = center
        # Convert BGR to Hex
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        hex_colors.append(hex_color)

    return hex_colors
