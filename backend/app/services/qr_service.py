import io
import base64
import os
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:5173")


def generate_passport_qr_data_uri(passport_id: str) -> str:
    """
    Generates a high-resolution QR code that encodes the public verification URL.
    Returns: Data URI string (data:image/png;base64,...)
    """
    verify_url = f"{PUBLIC_BASE_URL}/verify/{passport_id}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
