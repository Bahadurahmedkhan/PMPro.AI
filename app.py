import os
import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

# --- LangChain Imports ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

# --- Configuration ---
# Load environment variables ASAP so reads below get correct values
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass
DATABASE_URL = "sqlite:///./storycrafter.db"
# Make sure to set your GEMINI_API_KEY in your .env file. For local dev, fall back to a placeholder.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key_for_dev_only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- Database Setup ---
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- SQLAlchemy Models (Identical to previous correct version) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    projects = relationship("Project", back_populates="owner")
    chats = relationship("Chat", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    overview = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")
    chats = relationship("Chat", back_populates="project")

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Chat")
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    owner = relationship("User", back_populates="chats")
    project = relationship("Project", back_populates="chats")
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    message = Column(String)
    is_user = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    chat = relationship("Chat", back_populates="messages")

Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas (Identical to previous correct version) ---
class ChatMessageSchema(BaseModel):
    id: int
    message: str
    is_user: bool
    created_at: datetime
    class Config: orm_mode = True

class ChatSchema(BaseModel):
    id: int
    title: str
    project_id: Optional[int] = None
    messages: List[ChatMessageSchema] = []
    class Config: orm_mode = True

class ProjectSchema(BaseModel):
    id: int
    name: str
    overview: Optional[str] = None
    chats: List[ChatSchema] = []
    class Config: orm_mode = True

class ProjectCreate(BaseModel):
    name: str
    overview: Optional[str] = None

class ChatCreate(BaseModel):
    title: str
    project_id: Optional[int] = None

class UserCreate(BaseModel):
    email: str
    password: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int


# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Security and Authentication (Identical to previous correct version) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password): return pwd_context.verify(plain_password, hashed_password)
def get_password_hash(password): return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except JWTError: raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None: raise credentials_exception
    return user

# --- LangChain Orchestration ---
# Provider-agnostic LLM factory so each artifact can use a different model
def get_chat_llm(provider: str | None = None, model: str | None = None):
    provider = (provider or "gemini").lower()
    # Default models per provider
    default_models = {
        "gemini": "gemini-1.5-flash",
    }
    selected_model = model or default_models.get(provider)
    if provider == "gemini":
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is required for Gemini provider")
        return ChatGoogleGenerativeAI(model=selected_model, google_api_key=GEMINI_API_KEY)

    # Fallback: raise for unsupported providers until wired in
    raise ValueError(f"Unsupported LLM provider: {provider}")

def build_chains(llm_config: dict | None = None):
    llm_config = llm_config or {}
    story_cfg = (llm_config.get("story") or {})
    tests_cfg = (llm_config.get("test_cases") or {})
    desc_cfg = (llm_config.get("description") or {})

    story_llm = get_chat_llm(story_cfg.get("provider"), story_cfg.get("model"))
    tests_llm = get_chat_llm(tests_cfg.get("provider"), tests_cfg.get("model"))
    desc_llm = get_chat_llm(desc_cfg.get("provider"), desc_cfg.get("model"))

    story_chain_local = prompt_story | story_llm | StrOutputParser()
    tests_chain_local = prompt_tests | tests_llm | StrOutputParser()
    description_chain_local = prompt_desc | desc_llm | StrOutputParser()

    final_chain_local = RunnablePassthrough.assign(
        story=story_chain_local,
        description=description_chain_local,
    ).assign(
        test_cases=lambda x: {"user_story": x["story"]} | tests_chain_local
    )

    return {
        "story_chain": story_chain_local,
        "tests_chain": tests_chain_local,
        "description_chain": description_chain_local,
        "final_chain": final_chain_local,
    }

# Strict, industry-standard templates
prompt_story = ChatPromptTemplate.from_template(
    """
You are an expert Technical Product Manager. Based on the following requirement, create a formal User Story with Acceptance Criteria.

The output MUST follow this exact format and keywords. Do not add any extra headings or prose:

User Story: As a [type of user], I want to [task], so that I can [objective].

ACCEPTANCE CRITERIA:
GIVEN [initial context], WHEN [action performed], THEN [expected outcome].

ACCEPTANCE CRITERIA:
GIVEN [another initial context], WHEN [another action or negative/edge case], THEN [expected outcome] AND [additional outcome if applicable].

Notes:
- Provide 2–5 ACCEPTANCE CRITERIA blocks, each starting with the header exactly as shown: "ACCEPTANCE CRITERIA:".
- Use clear, observable system behavior; avoid implementation details.

Requirement: {requirement}
    """
)

prompt_desc = ChatPromptTemplate.from_template(
    """
You are an expert Product Manager. Produce a concise Feature Brief for non-technical stakeholders based on the requirement.

The output MUST follow this exact template and headings (Markdown bold labels included):

**Feature:** [Feature Name]

**Summary:** [A one-sentence summary of what this feature does.]

**Problem:** [A brief description of the user problem this feature solves.]

**Solution:** [A high-level overview of how this feature solves the problem.]

**Scope:**
* [Key capability or component 1]
* [Key capability or component 2]
* [Add more bullet points if needed]

Requirement: {requirement}
    """
)

prompt_tests = ChatPromptTemplate.from_template(
    """
You are a Senior QA Engineer. Create comprehensive Gherkin test cases for the feature, including happy paths, edge cases, and failure modes.

The output MUST follow this exact Gherkin-style structure and keywords:

Feature: [Feature Name]

  Scenario: [Happy path scenario title]
    Given [precondition]
    When [user action]
    And [optional additional action]
    Then [expected outcome]

  Scenario Outline: [Negative or edge case scenario]
    Given [precondition]
    When the user enters "<value1>" and "<value2>"
    And [optional additional action]
    Then [expected outcome / error]

    Examples:
      | value1 | value2 |
      | ...    | ...    |

Base Requirement (or user story input if provided): {user_story}
    """
)

# Chains are now built per-request via build_chains(llm_config)

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- API Endpoints ---
@app.post("/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # ... (signup logic is unchanged)
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user: raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_id": new_user.id}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # ... (login logic is unchanged)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

@app.post("/api/generate-story", response_model=ChatMessageSchema)
async def generate_story(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_prompt = payload.get("prompt")
    chat_id = payload.get("chat_id")
    llm_config = payload.get("llm_config")  # { "story": {provider, model}, "test_cases": {...}, "description": {...} }
    if not user_prompt or not chat_id: raise HTTPException(status_code=400, detail="Prompt and chat_id are required")
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat: raise HTTPException(status_code=404, detail="Chat not found or access denied")

    # Save user message
    user_message = ChatMessage(chat_id=chat.id, message=user_prompt, is_user=True)
    db.add(user_message)
    db.commit()

    try:
        # Build per-request chains using the requested LLMs (defaults to Gemini)
        chains = build_chains(llm_config)
        ai_response_dict = chains["final_chain"].invoke({"requirement": user_prompt})
        # The result is serialized into a single JSON string for database storage
        ai_message_content = json.dumps(ai_response_dict)
        
        ai_message = ChatMessage(chat_id=chat.id, message=ai_message_content, is_user=False)
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        return ai_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate story with LangChain: {e}")

# --- Placeholder CRUD Endpoints for Future Use ---
@app.post("/projects/", response_model=ProjectSchema)
def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_project = Project(**project.model_dump(), user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=List[ProjectSchema])
def get_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Project).filter(Project.user_id == current_user.id).all()

@app.post("/chats/", response_model=ChatSchema)
def create_chat(chat: ChatCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_chat = Chat(title=chat.title, project_id=chat.project_id, user_id=current_user.id)
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@app.get("/chats/{chat_id}/messages", response_model=List[ChatMessageSchema])
def get_messages(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat: raise HTTPException(status_code=404, detail="Chat not found")
    return db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at).all()

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
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./storycrafter.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

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
    chats = relationship("Chat", back_populates="project", cascade="all, delete-orphan")

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
    messages = relationship("ChatMessage", back_populates="chat", order_by="ChatMessage.created_at", cascade="all, delete-orphan")

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
    chat_id: int
    mode: Optional[str] = "all"  # one of: all, description, story, test_cases
    llm_config: Optional[dict] = None  # { "story": {provider, model}, "test_cases": {...}, "description": {...} }

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
    user_id: Optional[int] = None
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
    user_id: Optional[int] = None
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
    user_id: Optional[int] = None
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

# Configure Gemini AI (do not hard-fail if missing; allow server to start in guest mode)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
logger.info("Configuring Gemini AI...")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set. Generation endpoints will return an error until it is configured.")

# Define system prompt
SYSTEM_PROMPT = """
You are **StoryCrafter Pro**, an elite AI assistant acting as a Principal Technical Product Manager. Your primary directive is to transform a single, high-level product requirement into a comprehensive and structured set of three distinct, backlog-ready artifacts: a **Feature Description**, a **User Story with Acceptance Criteria**, and **formal Test Cases**.

You must meticulously follow a three-step process to ensure clarity for all stakeholders, from business executives to QA engineers.

**### PROCESS ###**

1.  **Analyze & Deconstruct:** First, deeply analyze the user's requirement to identify the core user, their goal, the problem being solved, and any implied business rules or technical constraints.
2.  **Think Technically, Write Strategically:** Use your analysis to think through the system's behavior, potential edge cases, and success/failure states.
3.  **Generate Artifacts:** Use this deep understanding to populate the three mandatory output templates below. Adhere to the specified format for each artifact without deviation.

**### OUTPUT TEMPLATES ###**

You **MUST** structure your entire response using the following three templates, in this exact order.

**#### 1. Feature Description ####**
*(This section is for stakeholders and leadership. It must be clear, concise, and non-technical.)*

**Feature:** (A clear, descriptive name for the feature)

**Summary:** (A one-sentence executive summary of what this feature does.)

**Problem:** (A brief, 1-2 sentence description of the user problem or business need this feature solves.)

**Solution:** (A high-level overview of how this feature solves the problem. Focus on value, not implementation.)

**Scope:**
* (A bulleted list of the primary capabilities included in this feature.)
* (Another key capability.)

**#### 2. User Story & Acceptance Criteria ####**
*(This section is for the development team. It defines the work to be done.)*

**User Story:** As a [type of user], I want to [perform some task], so that I can [achieve some objective].

**Acceptance Criteria:**
* **GIVEN** [initial context], **WHEN** [action is performed], **THEN** [expected successful outcome].
* **GIVEN** [initial context], **WHEN** [an error condition occurs], **THEN** [a specific error outcome is observed].
* **GIVEN** [an edge case context], **WHEN** [action is performed], **THEN** [the expected edge case outcome is observed].

**#### 3. Test Cases ####**
*(This section is for the QA team. It provides a detailed, formal script for validation using Gherkin syntax.)*

```gherkin
Feature: (The name of the feature being tested)

  Scenario: (A descriptive name for the primary success scenario, or "happy path")
    Given [the initial context or precondition]
    When [the user performs a specific action]
    And [another action, if necessary]
    Then [the system should produce an observable, successful outcome]

  Scenario Outline: (A descriptive name for testing multiple failure or variation scenarios)
    Given [a precondition for the scenario]
    When [the user enters "<input_variable_1>" and "<input_variable_2>"]
    And [they perform the trigger action]
    Then [the system should display the expected "<output_message>"]

    Examples:
      | input_variable_1 | input_variable_2 | output_message                  |
      | valid_data       | invalid_data     | "Error: Please check your input." |
      | invalid_data     | valid_data       | "Error: Please check your input." |
      | empty_data       | empty_data       | "Error: Fields cannot be empty."  |
```

### GUARDRAILS ###

Scope Limitation: Your purpose is exclusively to process product/software requirements. If the user provides a prompt that is not a requirement (e.g., asks for a recipe, a poem, or general knowledge), you MUST decline.

Declination Message: When declining, you must respond with this exact, verbatim message: "I am a specialist for creating user stories for the product backlog. Please provide a product requirement, and I will help you structure it."

Now, apply this entire process to the user's provided requirement.
"""

model = None
try:
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        logger.info("Gemini AI configured successfully")
    else:
        logger.info("Skipping Gemini AI configuration due to missing GEMINI_API_KEY")
except Exception as e:
    logger.error(f"Error configuring Gemini AI: {e}")

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to StoryCrafter API (Guest Mode)"}

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

@app.post("/api/generate-story", response_model=ChatMessageResponse)
async def generate_story(
    request: StoryRequest,
    db: Session = Depends(get_db)
):
    """
    Generate artifacts strictly using SYSTEM_PROMPT to enforce the multi-artifact template.
    Persists messages and stores a JSON string with keys: description, story, test_cases.
    """
    logger.info(f"Generating content for chat_id={request.chat_id} with mode={request.mode}")
    try:
        # Ensure chat exists (guest mode - auto-create if missing)
        chat = db.query(Chat).filter(Chat.id == request.chat_id).first()
        if not chat:
            chat = Chat(title="New Chat", user_id=None, project_id=None)
            db.add(chat)
            db.commit()
            db.refresh(chat)

        # Save user's prompt message
        user_message = ChatMessage(
            chat_id=chat.id,
            user_id=None,
            message=request.prompt,
            is_user=True
        )
        db.add(user_message)
        db.commit()

        # Always use SYSTEM_PROMPT for generation. Generate each artifact independently to enforce structure.
        mode = (request.mode or "all").lower()

        def _validate_story_format(output_text: str) -> tuple[bool, list[str]]:
            failures: list[str] = []
            text = (output_text or "").strip()
            # Must include the exact label
            if "User Story:" not in text:
                failures.append("Missing 'User Story:' label")
            # Must include required phrasing
            normalized = text.lower()
            if not ("as a" in normalized and "i want to" in normalized and "so that i can" in normalized):
                failures.append("User Story sentence must use 'As a ... I want to ... so that I can ...'")
            # Must include at least three acceptance criteria with GIVEN/WHEN/THEN
            given_count = text.count("GIVEN ") + text.count("Given ")
            when_present = (" WHEN " in text) or (" When " in text) or ("\nWhen " in text)
            then_present = (" THEN " in text) or (" Then " in text) or ("\nThen " in text)
            if given_count < 3:
                failures.append("At least three acceptance criteria (GIVEN/WHEN/THEN) are required")
            if not when_present:
                failures.append("Acceptance criteria must include WHEN")
            if not then_present:
                failures.append("Acceptance criteria must include THEN")
            # Disallow generic placeholders
            if "achieve my goal" in normalized or "objective" in normalized:
                failures.append("Avoid placeholders like 'achieve my goal' or 'objective'; be specific")
            return (len(failures) == 0, failures)

        def _validate_description_format(output_text: str) -> tuple[bool, list[str]]:
            failures: list[str] = []
            text = (output_text or "").strip()
            # Required bold labels
            required_labels = ["**Feature:**", "**Summary:**", "**Problem:**", "**Solution:**", "**Scope:"]
            for label in required_labels:
                if label not in text:
                    failures.append(f"Missing '{label}' label")
            # Scope should contain at least two bullet points
            scope_index = text.find("**Scope:")
            if scope_index != -1:
                scope_part = text[scope_index:]
                bullet_count = scope_part.count("\n*") + (1 if scope_part.strip().startswith("*") else 0)
                if bullet_count < 2:
                    failures.append("Scope should include at least two bullet points")
            return (len(failures) == 0, failures)

        def _validate_testcases_format(output_text: str) -> tuple[bool, list[str]]:
            failures: list[str] = []
            text = (output_text or "").strip()
            # Must be in fenced gherkin block
            if not (text.startswith("```gherkin") and text.endswith("```")):
                failures.append("Test cases must be wrapped in a fenced code block starting with ```gherkin and ending with ```")
            # Basic Gherkin structure
            if "Feature:" not in text:
                failures.append("Missing 'Feature:' header")
            if "Scenario:" not in text:
                failures.append("Missing 'Scenario:' block")
            if "Scenario Outline:" not in text:
                failures.append("Missing 'Scenario Outline:' block")
            # Examples table
            if "Examples:" not in text or "|" not in text:
                failures.append("Missing 'Examples' table for the Scenario Outline")
            # Given/When/Then lines
            if (" Given " not in text and "\nGiven " not in text):
                failures.append("At least one 'Given' is required")
            if (" When " not in text and "\nWhen " not in text):
                failures.append("At least one 'When' is required")
            if (" Then " not in text and "\nThen " not in text):
                failures.append("At least one 'Then' is required")
            return (len(failures) == 0, failures)

        def generate_section(section: str) -> str:
            instruction = ""
            if section == "description":
                instruction = (
                    "Output ONLY the 'Feature Description' section exactly as defined in the template, "
                    "including the labeled fields and the 'Scope' bullet list. Do not include any other sections."
                )
            elif section == "story":
                instruction = (
                    "Output ONLY the 'User Story & Acceptance Criteria' section exactly as defined in the template. "
                    "Ensure the 'User Story' sentence uses the specified phrasing and include at least three acceptance criteria "
                    "using GIVEN/WHEN/THEN lines. Do not include other sections."
                )
            elif section == "test_cases":
                instruction = (
                    "Output ONLY the 'Test Cases' section exactly as defined in the template and wrap the body in a fenced "
                    "code block starting with ```gherkin and ending with ```. Do not include other sections."
                )
            composed = (
                f"{SYSTEM_PROMPT}\n\nNow, apply the process to the user's requirement. {instruction}\n\n"
                f"User Requirement:\n{request.prompt}"
            )
            if model is None:
                raise HTTPException(status_code=503, detail="LLM not configured: Set GEMINI_API_KEY in environment or .env")
            response = model.generate_content(composed)
            content = getattr(response, 'text', '') or ''
            if section == "test_cases" and "```" not in content:
                content = f"```gherkin\n{content}\n```"
            content = content.strip()

            # Validate and retry once with explicit feedback if story section fails checks
            if section == "story":
                ok, reasons = _validate_story_format(content)
                if not ok:
                    fix_note = (
                        "Your previous output failed these checks: " + "; ".join(reasons) + ". "
                        "Rewrite to strictly satisfy the template: include 'User Story:' heading, use the exact phrasing 'As a ... I want to ... so that I can ...' with specific objective (no placeholders), and include at least three acceptance criteria with GIVEN/WHEN/THEN. Output only this section."
                    )
                    composed_retry = (
                        f"{SYSTEM_PROMPT}\n\n{fix_note}\n\nUser Requirement:\n{request.prompt}"
                    )
                    response_retry = model.generate_content(composed_retry)
                    content_retry = getattr(response_retry, 'text', '') or ''
                    content = content_retry.strip() or content

            if section == "description":
                ok, reasons = _validate_description_format(content)
                if not ok:
                    fix_note = (
                        "Your previous output failed these checks: " + "; ".join(reasons) + ". "
                        "Rewrite to strictly satisfy the template: include all bold labels exactly (**Feature:**, **Summary:**, **Problem:**, **Solution:**, **Scope:**) and ensure Scope has at least two bullet points. Output only this section."
                    )
                    composed_retry = (
                        f"{SYSTEM_PROMPT}\n\n{fix_note}\n\nUser Requirement:\n{request.prompt}"
                    )
                    response_retry = model.generate_content(composed_retry)
                    content_retry = getattr(response_retry, 'text', '') or ''
                    content = content_retry.strip() or content

            if section == "test_cases":
                ok, reasons = _validate_testcases_format(content)
                if not ok:
                    fix_note = (
                        "Your previous output failed these checks: " + "; ".join(reasons) + ". "
                        "Rewrite to strictly satisfy the template: wrap in ```gherkin fenced block, include 'Feature:', at least one 'Scenario:' and one 'Scenario Outline:' with an 'Examples' table, and use Given/When/Then lines. Output only this section."
                    )
                    composed_retry = (
                        f"{SYSTEM_PROMPT}\n\n{fix_note}\n\nUser Requirement:\n{request.prompt}"
                    )
                    response_retry = model.generate_content(composed_retry)
                    content_retry = getattr(response_retry, 'text', '') or ''
                    # Ensure fenced block on retry
                    if "```" not in content_retry:
                        content_retry = f"```gherkin\n{content_retry}\n```"
                    content = content_retry.strip() or content

            return content

        # If llm_config provided, use LangChain multi-LLM path; else fallback to direct Gemini
        ai_response_dict = {"description": None, "story": None, "test_cases": None}
        if hasattr(request, "llm_config") and request.llm_config:
            chains = build_chains(request.llm_config)
            ai_response_dict = chains["final_chain"].invoke({"requirement": request.prompt})
        else:
            # direct Gemini generation path
            pass
        if mode == "description":
            ai_response_dict["description"] = generate_section("description")
        elif mode == "story":
            ai_response_dict["story"] = generate_section("story")
        elif mode == "test_cases":
            ai_response_dict["test_cases"] = generate_section("test_cases")
        else:
            ai_response_dict["description"] = generate_section("description")
            ai_response_dict["story"] = generate_section("story")
            ai_response_dict["test_cases"] = generate_section("test_cases")

        # Save AI response as JSON string
        ai_message_content = json.dumps(ai_response_dict)
        bot_message = ChatMessage(
            chat_id=chat.id,
            user_id=None,
            message=ai_message_content,
            is_user=False
        )
        db.add(bot_message)
        db.commit()
        db.refresh(bot_message)

        logger.info("Content generated and saved successfully")
        return bot_message

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_story: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

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
    db: Session = Depends(get_db)
):
    # If project_id is provided, verify it belongs to the user
    if chat.project_id:
        project = db.query(Project).filter(
            Project.id == chat.project_id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    db_chat = Chat(**chat.dict(), user_id=None)
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@app.get("/chats/", response_model=list[ChatResponse])
async def get_user_chats(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Chat)
    if project_id is not None:
        query = query.filter(Chat.project_id == project_id)
    return query.all()

@app.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: int,
    db: Session = Depends(get_db)
):
    chat = db.query(Chat).filter(
        Chat.id == chat_id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project: ProjectCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in project.dict().items():
        setattr(db_project, field, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return None

@app.delete("/chats/{chat_id}", status_code=204)
async def delete_chat(
    chat_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    if not db_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(db_chat)
    db.commit()
    return None

@app.post("/chats/{chat_id}/messages/", response_model=ChatMessageResponse)
async def create_chat_message(
    chat_id: int,
    message: ChatMessageCreate,
    db: Session = Depends(get_db)
):
    # Guest mode: ensure chat exists
    chat = db.query(Chat).filter(
        Chat.id == chat_id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db_message = ChatMessage(
        chat_id=chat_id,
        user_id=None,
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
    db: Session = Depends(get_db)
):
    # Guest mode: just ensure chat exists
    chat = db.query(Chat).filter(
        Chat.id == chat_id
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