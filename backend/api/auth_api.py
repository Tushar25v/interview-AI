"""
Authentication API endpoints for user management with Supabase.
Provides registration, login, and token verification.
"""

import os
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
import jwt
from datetime import datetime, timedelta

from backend.database.db_manager import DatabaseManager
from backend.config import get_logger

logger = get_logger(__name__)

# Models
class UserRegisterRequest(BaseModel):
    """Request body for user registration."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password (min 8 characters)")
    name: str = Field(..., min_length=1, max_length=100, description="User full name")

class UserLoginRequest(BaseModel):
    """Request body for user login."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class UserResponse(BaseModel):
    """Response model for user information."""
    id: str
    email: str
    name: str
    created_at: Optional[datetime] = None

class AuthTokenResponse(BaseModel):
    """Response containing authentication tokens."""
    access_token: str
    refresh_token: str
    user: UserResponse

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str

# Security
security = HTTPBearer(auto_error=False)

async def get_database_manager() -> DatabaseManager:
    """Dependency to get database manager."""
    from backend.services import get_database_manager
    return get_database_manager()

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db_manager: DatabaseManager = Depends(get_database_manager)
) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token and get current user (optional).
    Returns None if no token is provided or token is invalid.
    
    Returns:
        Optional[Dict]: User data if authenticated, None otherwise
    """
    if not credentials or not credentials.credentials:
        return None
        
    try:
        # Get JWT secret - check for mock mode first
        jwt_secret = os.environ.get("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            # Check if we're in mock mode
            use_mock_auth = os.environ.get("USE_MOCK_AUTH", "false").lower() == "true"
            if use_mock_auth:
                # Use mock secret for development
                jwt_secret = "development_secret_key_not_for_production"
            else:
                return None
        
        # Decode token
        payload = jwt.decode(
            credentials.credentials, 
            jwt_secret,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_aud": False  # Disable audience verification for Supabase JWTs
            }
        )
        
        # Check if token has expired
        if datetime.fromtimestamp(payload.get("exp", 0)) < datetime.utcnow():
            return None
        
        # Get user ID from token
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        # Get user from database
        user = await db_manager.get_user(user_id)
        return user
    
    except jwt.PyJWTError as e:
        logger.debug(f"JWT verification failed (optional auth): {e}")
        return None
    except Exception as e:
        logger.debug(f"Error verifying token (optional auth): {e}")
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db_manager: DatabaseManager = Depends(get_database_manager)
) -> Dict[str, Any]:
    """
    Verify JWT token and get current user.
    
    Returns:
        Dict: User data
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Get JWT secret - check for mock mode first
        jwt_secret = os.environ.get("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            # Check if we're in mock mode
            use_mock_auth = os.environ.get("USE_MOCK_AUTH", "false").lower() == "true"
            if use_mock_auth:
                # Use mock secret for development
                jwt_secret = "development_secret_key_not_for_production"
            else:
                raise HTTPException(status_code=500, detail="JWT secret not configured")
        
        # Decode token
        payload = jwt.decode(
            credentials.credentials, 
            jwt_secret,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_aud": False  # Disable audience verification for Supabase JWTs
            }
        )
        
        # Check if token has expired
        if datetime.fromtimestamp(payload.get("exp", 0)) < datetime.utcnow():
            raise HTTPException(
                status_code=401, 
                detail="Token has expired"
            )
        
        # Get user ID from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401, 
                detail="Invalid token payload"
            )
        
        # Get user from database
        user = await db_manager.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=404, 
                detail="User not found"
            )
        
        return user
    
    except jwt.PyJWTError as e:
        logger.error(f"JWT verification error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.exception(f"Error verifying token: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during authentication"
        )

def create_auth_api(app):
    """Creates and registers authentication API routes."""
    router = APIRouter(prefix="/auth", tags=["authentication"])

    @router.post("/register", response_model=AuthTokenResponse)
    async def register_user(
        register_data: UserRegisterRequest,
        db_manager: DatabaseManager = Depends(get_database_manager)
    ):
        """
        Register a new user with email, password, and name.
        Creates user account in Supabase auth and local database.
        
        Returns:
            AuthTokenResponse: Authentication tokens and user data
        """
        try:
            # Register user with Supabase Auth
            auth_data = await db_manager.register_user(
                email=register_data.email, 
                password=register_data.password,
                name=register_data.name
            )
            
            logger.info(f"User registered successfully: {register_data.email}")
            return auth_data
            
        except Exception as e:
            logger.exception(f"Registration failed: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Registration failed: {str(e)}"
            )

    @router.post("/login", response_model=AuthTokenResponse)
    async def login_user(
        login_data: UserLoginRequest,
        db_manager: DatabaseManager = Depends(get_database_manager)
    ):
        """
        Login a user with email and password.
        
        Returns:
            AuthTokenResponse: Authentication tokens and user data
        """
        try:
            # Login user with Supabase Auth
            auth_data = await db_manager.login_user(
                email=login_data.email, 
                password=login_data.password
            )
            
            logger.info(f"User logged in successfully: {login_data.email}")
            return auth_data
            
        except Exception as e:
            logger.exception(f"Login failed: {e}")
            raise HTTPException(
                status_code=401,
                detail=f"Login failed: {str(e)}"
            )

    @router.post("/refresh", response_model=AuthTokenResponse)
    async def refresh_token(
        refresh_token: str,
        db_manager: DatabaseManager = Depends(get_database_manager)
    ):
        """
        Refresh an access token using a refresh token.
        
        Returns:
            AuthTokenResponse: New authentication tokens and user data
        """
        try:
            # Refresh token with Supabase Auth
            auth_data = await db_manager.refresh_token(refresh_token)
            
            logger.info("Token refreshed successfully")
            return auth_data
            
        except Exception as e:
            logger.exception(f"Token refresh failed: {e}")
            raise HTTPException(
                status_code=401,
                detail=f"Token refresh failed: {str(e)}"
            )

    @router.get("/me", response_model=UserResponse)
    async def get_user_profile(
        current_user: Dict[str, Any] = Depends(get_current_user)
    ):
        """
        Get the current user's profile.
        
        Returns:
            UserResponse: User profile data
        """
        return UserResponse(
            id=current_user["id"],
            email=current_user["email"],
            name=current_user["name"],
            created_at=current_user.get("created_at")
        )

    @router.post("/logout", response_model=MessageResponse)
    async def logout_user(
        db_manager: DatabaseManager = Depends(get_database_manager),
        current_user: Dict[str, Any] = Depends(get_current_user)
    ):
        """
        Logout the current user.
        
        Returns:
            MessageResponse: Success message
        """
        try:
            # Optional: Invalidate token on server side
            # For Supabase, this typically happens client-side
            
            logger.info(f"User logged out: {current_user['email']}")
            return MessageResponse(message="Logged out successfully")
            
        except Exception as e:
            logger.exception(f"Logout failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Logout failed: {str(e)}"
            )

    app.include_router(router)
    logger.info("Auth API routes registered") 