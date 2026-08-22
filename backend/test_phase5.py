import asyncio
from app.db.database import SessionLocal
from app.career.coding.service import CodingService
from app.career.coding.schemas import RunCodeRequest
from app.career.readiness.service import CareerReadinessService

async def test():
    db = SessionLocal()
    student_id = "STU10045"
    
    # Run Code
    req = RunCodeRequest(language="python", source_code="def twoSum():\n    return 'hello'\n")
    run_res = CodingService.run_code(db, "two-sum", req)
    print(f"Run output status: {run_res.status} (expected WRONG_ANSWER or ACCEPTED based on mock heuristic)")
    
    # Submit Code with 'return' and long enough to trigger ACCEPTED in mock
    req_acc = RunCodeRequest(language="python", source_code="def twoSum(nums, target):\n    # This is a bit longer so it passes the mock execution threshold\n    return [0, 1]")
    submit_res = await CodingService.submit_code(db, student_id, "two-sum", req_acc)
    print(f"Submit output status: {submit_res.status}")
    
    # Check Readiness
    readiness = CareerReadinessService.get_latest_score(db, student_id)
    print(f"Coding Readiness Score: {readiness.coding_score}, Overall: {readiness.overall_score}")

    db.close()

if __name__ == "__main__":
    asyncio.run(test())
