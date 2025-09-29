"""
Field-level encryption for PII data
Encrypts sensitive data like tax_id, salary, bank_account, national_id
"""
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from typing import Optional, Dict, Any
import json
import logging

logger = logging.getLogger(__name__)

class FieldEncryption:
    """Custom field-level encryption for PII data"""
    
    def __init__(self):
        self.master_key = self._get_or_create_master_key()
        self.fernet = Fernet(self.master_key)
        
        # Define which fields need encryption
        self.encrypted_fields = {
            'tax_id', 'national_id', 'salary', 'basic_salary', 
            'bank_account', 'account_number', 'bvn', 'phone'
        }
    
    def _get_or_create_master_key(self) -> bytes:
        """Get encryption key from environment or generate new one"""
        key_env = os.environ.get('ENCRYPTION_MASTER_KEY')
        
        if key_env:
            try:
                return base64.urlsafe_b64decode(key_env.encode())
            except Exception as e:
                logger.warning(f"Invalid encryption key in environment: {e}")
        
        # Generate new key for development (WARNING: use proper KMS in production)
        password = os.environ.get('JWT_SECRET', 'default-dev-secret').encode()
        salt = b'fiquant-taxpro-2024'  # Use fixed salt for consistency in dev
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        
        logger.warning("Using derived encryption key. Set ENCRYPTION_MASTER_KEY in production!")
        return key
    
    def encrypt_field(self, value: Any) -> str:
        """Encrypt a single field value"""
        if value is None or value == "":
            return ""
        
        try:
            # Convert to string and encrypt
            plaintext = str(value).encode('utf-8')
            encrypted = self.fernet.encrypt(plaintext)
            return base64.urlsafe_b64encode(encrypted).decode('utf-8')
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise ValueError("Encryption failed")
    
    def decrypt_field(self, encrypted_value: str) -> str:
        """Decrypt a single field value"""
        if not encrypted_value:
            return ""
        
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_value.encode('utf-8'))
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode('utf-8')
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            return "[ENCRYPTED]"  # Return placeholder if decryption fails
    
    def encrypt_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Encrypt sensitive fields in a document before storing"""
        encrypted_doc = document.copy()
        
        for field_name, field_value in document.items():
            if field_name in self.encrypted_fields and field_value:
                try:
                    encrypted_doc[field_name] = self.encrypt_field(field_value)
                    encrypted_doc[f"{field_name}_encrypted"] = True
                except Exception as e:
                    logger.error(f"Failed to encrypt field {field_name}: {e}")
                    # Keep original value if encryption fails
                    encrypted_doc[f"{field_name}_encrypted"] = False
        
        return encrypted_doc
    
    def decrypt_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Decrypt sensitive fields in a document after retrieving"""
        decrypted_doc = document.copy()
        
        for field_name, field_value in document.items():
            if field_name in self.encrypted_fields and field_value:
                # Check if field was encrypted
                if document.get(f"{field_name}_encrypted", False):
                    try:
                        decrypted_doc[field_name] = self.decrypt_field(field_value)
                    except Exception as e:
                        logger.error(f"Failed to decrypt field {field_name}: {e}")
                        decrypted_doc[field_name] = "[ENCRYPTED]"
                
                # Remove encryption flag from response
                if f"{field_name}_encrypted" in decrypted_doc:
                    del decrypted_doc[f"{field_name}_encrypted"]
        
        return decrypted_doc
    
    def is_field_encrypted(self, field_name: str) -> bool:
        """Check if a field should be encrypted"""
        return field_name in self.encrypted_fields

# Global encryption instance
field_encryption = FieldEncryption()

def encrypt_pii_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function to encrypt PII data"""
    return field_encryption.encrypt_document(data)

def decrypt_pii_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function to decrypt PII data"""
    return field_encryption.decrypt_document(data)

def mask_sensitive_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Mask sensitive data for logging (show only first/last chars)"""
    masked_data = data.copy()
    
    for field_name, field_value in data.items():
        if field_name in field_encryption.encrypted_fields and field_value:
            value_str = str(field_value)
            if len(value_str) > 6:
                masked_data[field_name] = f"{value_str[:2]}***{value_str[-2:]}"
            else:
                masked_data[field_name] = "***"
    
    return masked_data