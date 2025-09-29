"""
Security middleware for FastAPI
Handles HTTPS enforcement, security headers, rate limiting
"""
from fastapi import Request, HTTPException
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import logging
from collections import defaultdict
from typing import Dict
import ipaddress

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY" 
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp
        
        # HTTPS enforcement in production
        if request.headers.get("x-forwarded-proto") == "http":
            # Redirect HTTP to HTTPS
            url = str(request.url).replace("http://", "https://", 1)
            return RedirectResponse(url=url, status_code=301)
        
        # HSTS header for HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Basic rate limiting middleware"""
    
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)
        
        # Sensitive endpoints with stricter limits
        self.sensitive_limits = {
            "/api/auth/login": (5, 60),  # 5 requests per minute
            "/api/auth/register": (3, 60),  # 3 requests per minute
            "/api/auth/reset-password": (3, 300),  # 3 requests per 5 minutes
        }
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded IP (from load balancer/proxy)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def is_whitelisted_ip(self, ip: str) -> bool:
        """Check if IP is whitelisted (for admin access)"""
        # Add your admin IP ranges here
        whitelisted_ranges = [
            "127.0.0.0/8",  # Localhost
            "10.0.0.0/8",   # Private networks
            "172.16.0.0/12",
            "192.168.0.0/16",
        ]
        
        try:
            ip_obj = ipaddress.ip_address(ip)
            for range_str in whitelisted_ranges:
                if ip_obj in ipaddress.ip_network(range_str):
                    return True
        except ValueError:
            logger.warning(f"Invalid IP address: {ip}")
        
        return False
    
    async def dispatch(self, request: Request, call_next):
        client_ip = self.get_client_ip(request)
        current_time = time.time()
        path = request.url.path
        
        # Skip rate limiting for whitelisted IPs
        if self.is_whitelisted_ip(client_ip):
            return await call_next(request)
        
        # Get rate limit for this endpoint
        max_req, window = self.sensitive_limits.get(path, (self.max_requests, self.window_seconds))
        
        # Clean old requests
        key = f"{client_ip}:{path}"
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if current_time - req_time < window
        ]
        
        # Check rate limit
        if len(self.requests[key]) >= max_req:
            logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "retry_after": window,
                    "limit": max_req,
                    "window": window
                }
            )
        
        # Add current request
        self.requests[key].append(current_time)
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_req)
        response.headers["X-RateLimit-Remaining"] = str(max_req - len(self.requests[key]))
        response.headers["X-RateLimit-Reset"] = str(int(current_time + window))
        
        return response

class SecurityAuditMiddleware(BaseHTTPMiddleware):
    """Log security-relevant events"""
    
    def __init__(self, app):
        super().__init__(app)
        self.sensitive_paths = {
            "/api/auth/", 
            "/api/admin/",
            "/api/export/",
            "/api/messaging/"
        }
    
    def is_sensitive_path(self, path: str) -> bool:
        """Check if path contains sensitive operations"""
        return any(sensitive in path for sensitive in self.sensitive_paths)
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
        
        # Log sensitive requests
        if self.is_sensitive_path(request.url.path):
            logger.info(f"SECURITY_AUDIT: {request.method} {request.url.path} from {client_ip}")
        
        response = await call_next(request)
        
        # Log failed auth attempts
        if request.url.path.startswith("/api/auth/") and response.status_code >= 400:
            logger.warning(f"AUTH_FAILURE: {request.method} {request.url.path} from {client_ip} - Status: {response.status_code}")
        
        # Log admin access
        if request.url.path.startswith("/api/admin/"):
            duration = time.time() - start_time
            logger.info(f"ADMIN_ACCESS: {request.method} {request.url.path} from {client_ip} - Status: {response.status_code} - Duration: {duration:.2f}s")
        
        return response