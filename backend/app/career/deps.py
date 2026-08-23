from fastapi import Request, HTTPException

async def get_current_student_id(request: Request) -> str:
    student_id = request.headers.get("X-Student-ID")
    if student_id:
        return student_id
    raise HTTPException(status_code=401, detail="Not authenticated — access via CampusOS ERP")
