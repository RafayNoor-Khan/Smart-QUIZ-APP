Build a full-stack Quiz Application using:

Frontend: Next.js (App Router) + Tailwind CSS + shadcn/ui
Backend: NestJS
Database: PostgreSQL with Prisma

The system supports two roles:
1. Instructor
2. Student


## AUTHENTICATION

* Implement login/signup (JWT-based)
* Store user role (student/instructor)
* Protect routes based on role
* Store user in localStorage on frontend

## INSTRUCTOR FEATURES

* Create Quiz

  * Quiz has: topic, multiple questions
  * Each question has 4 options + 1 correct answer

* View All Quizzes

* Assign Quiz to Students

* View Analytics (basic: total attempts, average score)

* Delete Quiz


## STUDENT FEATURES

* View assigned quizzes
* Attempt quiz (one question at a tim)
* Submit quiz
* Store attempt result (score, percentage, date)
* View completed quizzes
* Click completed quiz → redirect to Results page


## RESULTS SYSTEM
* Results page show:
  * Score %
  * Correct / incorrect
  * Pass/Fail (60% threshold)
  * Submission time

## UI DetailS 

* Dark theme (black background)

* White ONLY for headings

* Gray for secondary text

* Emerald color ONLY for:

  * buttons
  * active states
  * success states

* Used shadcn/ui components:

  * Button
  * Card
  * Input
  * Tabs
  * Dialog (for modals)

* Fully responsive (mobile, tablet, desktop)

## DELIVERABLE

* Working frontend + backend
* Clean UI 
* No unnecessary complexity
