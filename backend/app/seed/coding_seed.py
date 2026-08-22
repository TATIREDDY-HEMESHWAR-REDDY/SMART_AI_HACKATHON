import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.career.coding.models import CodingProblem, CodingTestCase

def seed_coding_data():
    db = SessionLocal()
    try:
        if db.query(CodingProblem).first():
            print("Coding data already seeded.")
            return

        print("Seeding Coding problems...")
        
        # Problem 1: Two Sum
        p1 = CodingProblem(
            title="Two Sum",
            slug="two-sum",
            description="""Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.""",
            difficulty="EASY",
            topic="Arrays",
            constraints=["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
            hints=["Can you do it in one pass using a hash map?"],
            starter_code={
                "python": "def twoSum(nums, target):\n    # Write your code here\n    pass\n",
                "javascript": "function twoSum(nums, target) {\n    // Write your code here\n}\n",
                "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}\n",
                "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}\n"
            }
        )
        db.add(p1)
        db.flush()

        tc1_1 = CodingTestCase(problem_id=p1.id, input_data="nums = [2,7,11,15], target = 9", expected_output="[0,1]", is_sample=True, is_hidden=False, explanation="Because nums[0] + nums[1] == 9, we return [0, 1].")
        tc1_2 = CodingTestCase(problem_id=p1.id, input_data="nums = [3,2,4], target = 6", expected_output="[1,2]", is_sample=True, is_hidden=False)
        tc1_3 = CodingTestCase(problem_id=p1.id, input_data="nums = [3,3], target = 6", expected_output="[0,1]", is_sample=False, is_hidden=True)
        
        db.add_all([tc1_1, tc1_2, tc1_3])

        # Problem 2: Valid Parentheses
        p2 = CodingProblem(
            title="Valid Parentheses",
            slug="valid-parentheses",
            description="""Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.""",
            difficulty="EASY",
            topic="Stack",
            constraints=["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
            hints=["Use a stack data structure."],
            starter_code={
                "python": "def isValid(s):\n    # Write your code here\n    pass\n",
                "javascript": "function isValid(s) {\n    // Write your code here\n}\n"
            }
        )
        db.add(p2)
        db.flush()

        tc2_1 = CodingTestCase(problem_id=p2.id, input_data="s = \"()\"", expected_output="true", is_sample=True, is_hidden=False)
        tc2_2 = CodingTestCase(problem_id=p2.id, input_data="s = \"()[]{}\"", expected_output="true", is_sample=True, is_hidden=False)
        tc2_3 = CodingTestCase(problem_id=p2.id, input_data="s = \"(]\"", expected_output="false", is_sample=False, is_hidden=True)
        
        db.add_all([tc2_1, tc2_2, tc2_3])
        
        # Problem 3: Number of Islands
        p3 = CodingProblem(
            title="Number of Islands",
            slug="number-of-islands",
            description="""Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.""",
            difficulty="MEDIUM",
            topic="Graphs",
            constraints=["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
            hints=["Can we use DFS or BFS to traverse the grid?"],
            starter_code={
                "python": "def numIslands(grid):\n    # Write your code here\n    pass\n"
            }
        )
        db.add(p3)
        db.flush()

        tc3_1 = CodingTestCase(problem_id=p3.id, input_data='grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]', expected_output="1", is_sample=True, is_hidden=False)
        tc3_2 = CodingTestCase(problem_id=p3.id, input_data='grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]', expected_output="3", is_sample=True, is_hidden=False)
        
        db.add_all([tc3_1, tc3_2])

        db.commit()
        print("Coding seeding complete.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_coding_data()
