# Project Time Breakdown

This document outlines where my time was spent during the development of the project.

---

## Total Time Spent

**2 hours 30 minutes**  
30 minutes were on setup and testing


---

## Project Setup (15 minutes)

- Initial Node.js + TypeScript environment setup
- Installed dependencies (Express, Multer, UUID, Mammoth, Docx, React setup)
- Configured project structure for backend and frontend

---

## Backend Development (1 hour 15 minutes)

### Node.js/TypeScript API setup

- Created Express server with TypeScript support
- Added middleware for file uploads using **multer**

### Document Parsing Service

- Implemented parsing logic with **mammoth.js** to extract text from `.docx`
- Added logic to break documents into structured sections
- Basic document type detection (NDA, Service Agreement, etc.)

### Clause Insertion Logic

- Built insertion engine with **docx** library
- Implemented section numbering and style application
- Added insertion point resolution (`before/after section X`)

### File Handling Endpoints

- **`POST /upload`** → upload & parse document
- **`POST /jobs/:documentId`** → add insertion job
- **`POST /process/:documentId`** → process jobs and generate document
- **`GET /download/:documentId`** → download processed document

---

## Frontend Development (45 minutes)

### React Integration

- Connected React components to backend API endpoints
- File upload form with validation (`.docx` only)

### Real-time Communication

- Managed insertion job state (add, update, remove)
- Triggered document processing and displayed results

### Error Handling & Status

- Improved user feedback with loading states and error messages
- Added clear error dismissal

---

## 🔍 Integration & Testing (15 minutes)

### API Testing

- Verified backend endpoints with sample `.docx` documents
- Confirmed insertion jobs work with various instructions

### UI/UX Improvements

- Ensured smooth upload → insert → process → download flow
- Cleaned up error handling edge cases

---
