from abc import ABC, abstractmethod
from typing import List, Dict, Any
import time
import random

class CodeExecutionProvider(ABC):
    @abstractmethod
    def execute(self, language: str, source_code: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Executes code against test cases securely.
        Returns aggregate result + array of test case results.
        """
        pass

class MockExecutionProvider(CodeExecutionProvider):
    """
    A safe development execution provider for hackathon use.
    DO NOT execute actual code on the host filesystem.
    This simulates execution status deterministically without risk.
    """
    def execute(self, language: str, source_code: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        results = []
        passed = 0
        total_time = 0
        
        # Simple heuristic for Mocking:
        # If code contains "return" and is longer than a basic template,
        # we consider it "ACCEPTED" for demo purposes.
        # Otherwise, "WRONG_ANSWER" or compilation error.
        
        is_meaningful = "return" in source_code and len(source_code.strip()) > 30
        is_error = "sys.exit" in source_code or "os.system" in source_code # Just mock some "bad" code
        
        for tc in test_cases:
            runtime = random.randint(10, 45)
            total_time += runtime
            
            if is_error:
                results.append({
                    "status": "RUNTIME_ERROR",
                    "actual_output": "Exception: Invalid operation",
                    "runtime_ms": runtime,
                    "is_hidden": tc.get("is_hidden", True)
                })
            elif is_meaningful:
                results.append({
                    "status": "ACCEPTED",
                    "actual_output": tc["expected_output"], # Mocks returning correct
                    "runtime_ms": runtime,
                    "is_hidden": tc.get("is_hidden", True)
                })
                passed += 1
            else:
                results.append({
                    "status": "WRONG_ANSWER",
                    "actual_output": "null\n",
                    "runtime_ms": runtime,
                    "is_hidden": tc.get("is_hidden", True)
                })
                
        status = "ACCEPTED" if passed == len(test_cases) else "WRONG_ANSWER"
        if is_error: status = "RUNTIME_ERROR"
        if len(test_cases) == 0: status = "SYSTEM_ERROR"
        
        return {
            "status": status,
            "test_cases_passed": passed,
            "total_test_cases": len(test_cases),
            "results": results,
            "runtime_ms": total_time,
            "memory_kb": random.randint(1024, 8192)
        }

# Provider factory for DI
def get_execution_provider() -> CodeExecutionProvider:
    return MockExecutionProvider()
