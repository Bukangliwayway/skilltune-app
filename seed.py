from faker import Faker
import uuid
from datetime import datetime, timedelta
import random

class IDGenerator:
    def __init__(self, start=1000):
        self.current_id = start
    
    def next_id(self):
        self.current_id += 1
        return self.current_id - 1

def generate_all_sql():
    fake = Faker()
    sql_statements = []
    
    # Initialize ID generators
    lesson_id_gen = IDGenerator(1000)
    quiz_deck_id_gen = IDGenerator(1000)
    quiz_attempt_id_gen = IDGenerator(1000)
    learning_progress_id_gen = IDGenerator(1000)
    
    # Header
    sql_statements.append("-- Generated SQL Insert Statements")
    sql_statements.append("-- Generated at: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    sql_statements.append("\n")
    
    # Store IDs for relationships
    user_uuids = []
    lesson_ids = []
    quiz_deck_map = {}  # lesson_id to quiz_deck_id mapping
    
    # Generate Users (with UUIDs)
    sql_statements.append("-- Users")
    batch_values = []
    for _ in range(100):
        user_uuid = str(uuid.uuid4())
        user_uuids.append(user_uuid)
        created_at = fake.date_time_between(
            start_date=datetime(2024, 12, 1),
            end_date=datetime(2025, 1, 31)
        )
        batch_values.append(f"""(
    '{user_uuid}',
    '{fake.email()}',
    'USER',
    '{created_at.strftime("%Y-%m-%d %H:%M:%S")}',
    '{fake.name().replace("'", "''")}'
)""")
    
    sql_statements.append("INSERT INTO users (id, email, type, created_at, name) VALUES")
    sql_statements.append(',\n'.join(batch_values) + ';\n')
    
    # Generate Lessons (with incremental IDs)
    sql_statements.append("\n-- Lessons")
    lesson_created = datetime(2025, 12, 1).strftime("%Y-%m-%d %H:%M:%S")
    batch_values = []
    
    for i in range(1, 11):
        lesson_id = lesson_id_gen.next_id()
        lesson_ids.append(lesson_id)
        
        batch_values.append(f"""(
    {lesson_id},
    '{fake.sentence(nb_words=5)}',
    '{fake.paragraph(nb_sentences=4)}',
    {i},
    '{lesson_created}',
    '{lesson_created}',
    '',
    '',
    '',
    ''
)""")
    
    sql_statements.append("INSERT INTO lessons (id, title, description, sequence, created_at, updated_at, pdf_key, video_key, pdf_filename, video_filename) VALUES")
    sql_statements.append(',\n'.join(batch_values) + ';\n')
    
    # Generate Quiz Decks (with incremental IDs)
    sql_statements.append("\n-- Quiz Decks")
    batch_values = []
    
    for lesson_id in lesson_ids:
        quiz_deck_id = quiz_deck_id_gen.next_id()
        quiz_deck_map[lesson_id] = quiz_deck_id
        
        batch_values.append(f"""(
    {quiz_deck_id},
    {lesson_id},
    '{fake.sentence(nb_words=5)}',
    '{fake.paragraph(nb_sentences=4)}',
    '',
    '{lesson_created}',
    '{lesson_created}'
)""")
    
    sql_statements.append("INSERT INTO quiz_decks (id, lesson_id, title, description, csv_version, created_at, updated_at) VALUES")
    sql_statements.append(',\n'.join(batch_values) + ';\n')
    
    # Generate Quiz Attempts and Learning Progress
    quiz_attempts = []
    learning_progress = []
    
    # Helper function to process lesson completion
    def process_lesson_completion(user_id, lesson_id):
        quiz_deck_id = quiz_deck_map[lesson_id]
        completion_date = fake.date_time_between(
            start_date=datetime(2024, 12, 1),
            end_date=datetime(2025, 1, 31)
        )
        
        # Generate 1-3 failed attempts
        num_fails = random.randint(1, 3)
        for _ in range(num_fails):
            attempt_date = completion_date - timedelta(days=random.randint(1, 10))
            quiz_attempts.append({
                'id': quiz_attempt_id_gen.next_id(),
                'user_id': user_id,
                'quiz_deck_id': quiz_deck_id,
                'score': 25,
                'is_passed': False,
                'attempt_date': attempt_date
            })
        
        # Generate passing attempt
        quiz_attempts.append({
            'id': quiz_attempt_id_gen.next_id(),
            'user_id': user_id,
            'quiz_deck_id': quiz_deck_id,
            'score': 50,
            'is_passed': True,
            'attempt_date': completion_date
        })
        
        # Generate learning progress
        learning_progress.append({
            'id': learning_progress_id_gen.next_id(),
            'user_id': user_id,
            'lesson_id': lesson_id,
            'lesson_completed_at': completion_date,
            'is_lesson_accessed': True,
            'is_quiz_passed': True,
            'is_video_played': True,
            'is_pdf_viewed': True
        })
    
    # Process all user groups
    # 20 users with all lessons
    for user_id in user_uuids[:20]:
        for lesson_id in lesson_ids:
            process_lesson_completion(user_id, lesson_id)
    
    # 60 users with 5 random lessons
    for user_id in user_uuids[20:80]:
        selected_lessons = random.sample(lesson_ids, 5)
        for lesson_id in selected_lessons:
            process_lesson_completion(user_id, lesson_id)
    
    # 20 users with 3 random lessons
    for user_id in user_uuids[80:]:
        selected_lessons = random.sample(lesson_ids, 3)
        for lesson_id in selected_lessons:
            process_lesson_completion(user_id, lesson_id)
    
    # Write Quiz Attempts in batches
    sql_statements.append("\n-- Quiz Attempts")
    batch_size = 500
    for i in range(0, len(quiz_attempts), batch_size):
        batch = quiz_attempts[i:i + batch_size]
        values_sql = []
        for attempt in batch:
            values_sql.append(f"""(
    {attempt['id']},
    '{attempt['user_id']}',
    {attempt['quiz_deck_id']},
    {attempt['score']},
    {str(attempt['is_passed']).lower()},
    '{attempt['attempt_date'].strftime("%Y-%m-%d %H:%M:%S")}'
)""")
        
        sql_statements.append("INSERT INTO quiz_attempts (id, user_id, quiz_deck_id, score, is_passed, attempt_date) VALUES")
        sql_statements.append(',\n'.join(values_sql) + ';\n')
    
    # Write Learning Progress in batches
    sql_statements.append("\n-- Learning Progress")
    for i in range(0, len(learning_progress), batch_size):
        batch = learning_progress[i:i + batch_size]
        values_sql = []
        for progress in batch:
            values_sql.append(f"""(
    {progress['id']},
    '{progress['user_id']}',
    {progress['lesson_id']},
    '{progress['lesson_completed_at'].strftime("%Y-%m-%d %H:%M:%S")}',
    {str(progress['is_lesson_accessed']).lower()},
    {str(progress['is_quiz_passed']).lower()},
    {str(progress['is_video_played']).lower()},
    {str(progress['is_pdf_viewed']).lower()}
)""")
        
        sql_statements.append("INSERT INTO learning_progress (id, user_id, lesson_id, lesson_completed_at, is_lesson_accessed, is_quiz_passed, is_video_played, is_pdf_viewed) VALUES")
        sql_statements.append(',\n'.join(values_sql) + ';\n')
    
    # Write to file
    with open('generated_educational_data.sql', 'w') as f:
        f.write('\n'.join(sql_statements))

if __name__ == "__main__":
    generate_all_sql()
    print("Generated SQL file 'generated_educational_data.sql' with all data")