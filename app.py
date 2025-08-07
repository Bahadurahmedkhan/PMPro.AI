from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./storycrafter.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    projects = relationship("Project", back_populates="user")
    chats = relationship("Chat", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    overview = Column(Text)
    type = Column(String)
    industry = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserModel", back_populates="projects")
    chats = relationship("Chat", back_populates="project")

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserModel", back_populates="chats")
    project = relationship("Project", back_populates="chats")
    messages = relationship("ChatMessage", back_populates="chat", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    is_user = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserModel")
    chat = relationship("Chat", back_populates="messages")

# Create all tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {str(e)}")
    raise

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")  # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int

class TokenData(BaseModel):
    email: str | None = None

class StoryRequest(BaseModel):
    prompt: str

class StoryResponse(BaseModel):
    story: str

class ProjectBase(BaseModel):
    name: str
    overview: str
    type: str
    industry: str

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatBase(BaseModel):
    title: str
    project_id: Optional[int] = None

class ChatCreate(ChatBase):
    pass

class ChatResponse(ChatBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    message: str
    is_user: bool = True

class ChatMessageCreate(ChatMessageBase):
    chat_id: int

class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    chat_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Security Functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Database Functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user(db: Session, email: str):
    return db.query(UserModel).filter(UserModel.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"],  # Include all possible Vite ports
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCq1mK98zrOc3PUAu06CLXtkyjAHMQhlJU")
logger.info("Configuring Gemini AI...")

# Define system prompt
SYSTEM_PROMPT = """ 
You are an expert AI assistant named 'StoryCrafter Pro', designed specifically for Technical Product Managers. Your sole purpose is to convert product requirements into well-structured user stories. You excel at bridging the gap between business requirements and technical implementation by using clear, unambiguous, and non-technical language that everyone on the team (Business, UI/UX, QA, and Dev) can understand.

Your Core Task:
Analyze the User's Input: The user will provide a product requirement. You must meticulously analyze this requirement to identify the user persona, their desired action (the "what"), and their underlying motivation (the "why").
Think Technically, Write Clearly: This is your most critical skill. You must think like a developer or architect about the necessary background processes (APIs, database changes, validations, system states). However, you must write the output for a general audience. Do not use technical jargon in the user story or acceptance criteria. Your role is to translate complex technical operations into simple, observable outcomes.
Focus on the "what," not the "how." Describe the system's behavior, not its implementation.

Guideline for Language:
Instead of: "The system makes an authenticated API call to POST /api/cart."
Use: "The system adds the item to the user's shopping cart."
Instead of: "The is_active flag is set to false in the users table."
Use: "The user's account is marked as deactivated."
Instead of: "The system returns a 404 Not Found error."
Use: "The system displays a 'User not found' message."

Generate the User Story: Use your analysis to populate the specific templates provided below. Ensure every part of the template is filled out logically. Generate multiple, distinct acceptance criteria to cover the "happy path," negative paths, and edge cases using the clear language guidelines above.

Strict Constraints (Guardrails):
Scope Limitation: You have one job. If the user's prompt is not a product or software requirement (e.g., "create a receipt for a pizza," "write an email," "what is the weather?"), you MUST decline the request.
Declination Message: When declining a request, you must respond with this exact message: "I am a specialist for creating user stories for the product backlog. Please provide a product requirement, and I will help you structure it."
Template Adherence: You MUST follow the output templates for the Title, User Story, and Acceptance Criteria exactly as defined below.

Output Templates:
Title:
(Provide a concise title that clearly shows the functionality of the user story.)

User Story:
As a [type of user],I want to [perform some task] so that [I can achieve some objective].

Acceptance Criteria:
(Use the Gherkin "Given-When-Then" format. Create multiple criteria to ensure full technical coverage, written in plain language.)
Scenario: [Name of the scenario, e.g., Successful Action]
Given [the initial context or precondition], When [a specific action is performed by the user] Then [the expected outcome occurs] And [any additional, observable outcomes].
Scenario: [Name of another scenario, e.g., Error Handling or Edge Case]
Given [a different context or precondition], When [a different action or the same action under different conditions occurs] Then [the expected error or alternative outcome occurs].
"""

try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    logger.info("Gemini AI configured successfully")
except Exception as e:
    logger.error(f"Error configuring Gemini AI: {e}")
    raise

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to StoryCrafter API"}

@app.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Attempting to create user with email: {user.email}")
        db_user = get_user(db, email=user.email)
        if db_user:
            logger.warning(f"Email already registered: {user.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        new_user = create_user(db, user)
        logger.info(f"Successfully created user with email: {user.email}")
        return new_user
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

@app.post("/api/generate-story", response_model=StoryResponse)
async def generate_story(
    request: StoryRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a user story from a product requirement and save to database.
    """
    logger.info(f"Generating story for prompt: {request.prompt}")
    try:
        # Create a new chat if it doesn't exist
        # For now, we'll create a chat with a generic title
        chat_title = f"Chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        new_chat = Chat(
            title=chat_title,
            user_id=current_user.id,
            project_id=None  # We can add project_id later if needed
        )
        db.add(new_chat)
        db.flush()  # This gets us the chat ID without committing
        
        # Save user's prompt
        user_message = ChatMessage(
            chat_id=new_chat.id,
            user_id=current_user.id,
            message=request.prompt,
            is_user=True
        )
        db.add(user_message)
        
        try:
            # Generate response with system prompt
            logger.info("Attempting to generate content with Gemini...")
            
            # Combine system prompt and user prompt
            full_prompt = f"{SYSTEM_PROMPT}\n\nUser Request: {request.prompt}"
            response = model.generate_content(full_prompt)
            
            logger.info("Content generation successful")
            
            if not response or not response.text:
                logger.error("Empty response from Gemini API")
                raise HTTPException(
                    status_code=500,
                    detail="Empty response from AI model"
                )
            
            # Save bot's response
            bot_message = ChatMessage(
                chat_id=new_chat.id,
                user_id=current_user.id,
                message=response.text,
                is_user=False
            )
            db.add(bot_message)
            db.commit()
            
            logger.info("Story generated and saved successfully")
            return StoryResponse(story=response.text)
            
        except Exception as api_error:
            logger.error(f"Gemini API error: {str(api_error)}")
            # Rollback the user message since we couldn't get a response
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"AI model error: {str(api_error)}"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in generate_story: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

# Project endpoints
@app.post("/projects/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_project = Project(**project.dict(), user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=list[ProjectResponse])
async def get_user_projects(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Project).filter(Project.user_id == current_user.id).all()

@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Chat endpoints
@app.post("/chats/", response_model=ChatResponse)
async def create_chat(
    chat: ChatCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If project_id is provided, verify it belongs to the user
    if chat.project_id:
        project = db.query(Project).filter(
            Project.id == chat.project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    db_chat = Chat(**chat.dict(), user_id=current_user.id)
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@app.get("/chats/", response_model=list[ChatResponse])
async def get_user_chats(
    project_id: Optional[int] = None,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Chat).filter(Chat.user_id == current_user.id)
    if project_id is not None:
        query = query.filter(Chat.project_id == project_id)
    return query.all()

@app.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.post("/chats/{chat_id}/messages/", response_model=ChatMessageResponse)
async def create_chat_message(
    chat_id: int,
    message: ChatMessageCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify chat belongs to user
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db_message = ChatMessage(
        chat_id=chat_id,
        user_id=current_user.id,
        message=message.message,
        is_user=message.is_user
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/chats/{chat_id}/messages/", response_model=list[ChatMessageResponse])
async def get_chat_messages(
    chat_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify chat belongs to user
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at).all()

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server...")
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,  # Changed port to 8000
        reload=True,
        log_level="debug"
    ) 