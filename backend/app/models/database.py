from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlite3
import os

# SQLite database for development
SQLALCHEMY_DATABASE_URL = "sqlite:///./twitter_clone.db"
DB_FILE = "./twitter_clone.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to check if a column exists in a table
def check_column_exists(table_name, column_name):
    # Check if database file exists
    if not os.path.exists(DB_FILE):
        return False
        
    # Connect to SQLite database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Query to get table info
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    # Close connection
    conn.close()
    
    # Check if column exists
    return any(column[1] == column_name for column in columns)

# Function to add a column to a table if it doesn't exist
def add_column_if_not_exists(table_name, column_name, column_type):
    # Check if database file exists
    if not os.path.exists(DB_FILE):
        return
        
    if not check_column_exists(table_name, column_name):
        # Connect to SQLite database
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Add column
        try:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
            conn.commit()
            print(f"Added column {column_name} to table {table_name}")
        except Exception as e:
            print(f"Error adding column: {e}")
        
        # Close connection
        conn.close()

# Function to create followers table if it doesn't exist
def create_followers_table():
    # Check if database file exists
    if not os.path.exists(DB_FILE):
        return
        
    # Connect to SQLite database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Check if followers table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='followers'")
    if not cursor.fetchone():
        try:
            cursor.execute("""
            CREATE TABLE followers (
                follower_id INTEGER NOT NULL,
                followed_id INTEGER NOT NULL,
                PRIMARY KEY (follower_id, followed_id),
                FOREIGN KEY(follower_id) REFERENCES users(id),
                FOREIGN KEY(followed_id) REFERENCES users(id)
            )
            """)
            conn.commit()
            print("Created followers table")
        except Exception as e:
            print(f"Error creating followers table: {e}")
    
    # Close connection
    conn.close()

# Run migrations
def run_migrations():
    try:
        # Add profile_picture column if it doesn't exist
        add_column_if_not_exists("users", "profile_picture", "TEXT")
        
        # Create followers table if it doesn't exist
        create_followers_table()
        
        # Add parent_id column to tweets table for reply functionality
        add_column_if_not_exists("tweets", "parent_id", "INTEGER")
    except Exception as e:
        print(f"Migration error: {e}")