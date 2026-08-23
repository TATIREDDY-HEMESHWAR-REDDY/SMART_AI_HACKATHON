import sys
import os

# Add the backend directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.career.coding.models import CodingProblem, CodingTestCase
import json

problems_data = [
    {
        "title": "Reverse String",
        "slug": "reverse-string",
        "description": "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
        "difficulty": "EASY",
        "topic": "Strings",
        "constraints": ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
        "hints": ["Can you use two pointers, one at the beginning and one at the end?"],
        "starter_code": {
            "python": "def reverseString(s):\n    # Write your code here\n    pass\n",
            "javascript": "function reverseString(s) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Merge Two Sorted Lists",
        "slug": "merge-two-sorted-lists",
        "description": "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
        "difficulty": "EASY",
        "topic": "Linked Lists",
        "constraints": ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100", "Both list1 and list2 are sorted in non-decreasing order."],
        "hints": ["Use a dummy node to easily handle the head of the new list."],
        "starter_code": {
            "python": "# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\ndef mergeTwoLists(list1, list2):\n    # Write your code here\n    pass\n",
            "javascript": "/*\nfunction ListNode(val, next) {\n    this.val = (val===undefined ? 0 : val)\n    this.next = (next===undefined ? null : next)\n}\n*/\nfunction mergeTwoLists(list1, list2) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "slug": "best-time-to-buy-and-sell-stock",
        "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        "difficulty": "EASY",
        "topic": "Arrays",
        "constraints": ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        "hints": ["Keep track of the minimum price seen so far and the maximum profit."],
        "starter_code": {
            "python": "def maxProfit(prices):\n    # Write your code here\n    pass\n",
            "javascript": "function maxProfit(prices) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Contains Duplicate",
        "slug": "contains-duplicate",
        "description": "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        "difficulty": "EASY",
        "topic": "Arrays",
        "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        "hints": ["Use a hash set to track seen numbers."],
        "starter_code": {
            "python": "def containsDuplicate(nums):\n    # Write your code here\n    pass\n",
            "javascript": "function containsDuplicate(nums) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Climbing Stairs",
        "slug": "climbing-stairs",
        "description": "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "difficulty": "EASY",
        "topic": "Dynamic Programming",
        "constraints": ["1 <= n <= 45"],
        "hints": ["Think about the Fibonacci sequence. To reach step n, you can come from n-1 or n-2."],
        "starter_code": {
            "python": "def climbStairs(n):\n    # Write your code here\n    pass\n",
            "javascript": "function climbStairs(n) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "slug": "longest-substring-without-repeating-characters",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "difficulty": "MEDIUM",
        "topic": "Strings",
        "constraints": ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        "hints": ["Use a sliding window approach with a hash set or hash map."],
        "starter_code": {
            "python": "def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass\n",
            "javascript": "function lengthOfLongestSubstring(s) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "3Sum",
        "slug": "3sum",
        "description": "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
        "difficulty": "MEDIUM",
        "topic": "Arrays",
        "constraints": ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        "hints": ["Sort the array first. Then fix one number and use two pointers for the rest."],
        "starter_code": {
            "python": "def threeSum(nums):\n    # Write your code here\n    pass\n",
            "javascript": "function threeSum(nums) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Binary Tree Level Order Traversal",
        "slug": "binary-tree-level-order-traversal",
        "description": "Given the `root` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        "difficulty": "MEDIUM",
        "topic": "Trees",
        "constraints": ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
        "hints": ["Use a queue to perform Breadth-First Search (BFS)."],
        "starter_code": {
            "python": "# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\ndef levelOrder(root):\n    # Write your code here\n    pass\n",
            "javascript": "/*\nfunction TreeNode(val, left, right) {\n    this.val = (val===undefined ? 0 : val)\n    this.left = (left===undefined ? null : left)\n    this.right = (right===undefined ? null : right)\n}\n*/\nfunction levelOrder(root) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Validate Binary Search Tree",
        "slug": "validate-binary-search-tree",
        "description": "Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node's key.\n- The right subtree of a node contains only nodes with keys greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
        "difficulty": "MEDIUM",
        "topic": "Trees",
        "constraints": ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
        "hints": ["Keep track of the valid range (min, max) for each node."],
        "starter_code": {
            "python": "# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\ndef isValidBST(root):\n    # Write your code here\n    pass\n",
            "javascript": "/*\nfunction TreeNode(val, left, right) {\n    this.val = (val===undefined ? 0 : val)\n    this.left = (left===undefined ? null : left)\n    this.right = (right===undefined ? null : right)\n}\n*/\nfunction isValidBST(root) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Coin Change",
        "slug": "coin-change",
        "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nYou may assume that you have an infinite number of each kind of coin.",
        "difficulty": "MEDIUM",
        "topic": "Dynamic Programming",
        "constraints": ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
        "hints": ["Can you solve this using Bottom-Up Dynamic Programming? dp[i] = min(dp[i], 1 + dp[i - coin])."],
        "starter_code": {
            "python": "def coinChange(coins, amount):\n    # Write your code here\n    pass\n",
            "javascript": "function coinChange(coins, amount) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Merge Intervals",
        "slug": "merge-intervals",
        "description": "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "difficulty": "MEDIUM",
        "topic": "Arrays",
        "constraints": ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= starti <= endi <= 10^4"],
        "hints": ["Sort the intervals by their start times first."],
        "starter_code": {
            "python": "def merge(intervals):\n    # Write your code here\n    pass\n",
            "javascript": "function merge(intervals) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Course Schedule",
        "slug": "course-schedule",
        "description": "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.",
        "difficulty": "MEDIUM",
        "topic": "Graphs",
        "constraints": ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "prerequisites[i].length == 2", "0 <= ai, bi < numCourses", "All the pairs prerequisites[i] are unique."],
        "hints": ["This problem is equivalent to finding if a cycle exists in a directed graph. Use topological sort or DFS."],
        "starter_code": {
            "python": "def canFinish(numCourses, prerequisites):\n    # Write your code here\n    pass\n",
            "javascript": "function canFinish(numCourses, prerequisites) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Word Search",
        "slug": "word-search",
        "description": "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
        "difficulty": "MEDIUM",
        "topic": "Backtracking",
        "constraints": ["m == board.length", "n = board[i].length", "1 <= m, n <= 6", "1 <= word.length <= 15"],
        "hints": ["Use Depth-First Search (DFS) with backtracking to explore all possible paths from each starting letter."],
        "starter_code": {
            "python": "def exist(board, word):\n    # Write your code here\n    pass\n",
            "javascript": "function exist(board, word) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "LRU Cache",
        "slug": "lru-cache",
        "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the `key` if the key exists, otherwise return `-1`.\n- `void put(int key, int value)` Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, evict the least recently used key.\n\nThe functions `get` and `put` must each run in O(1) average time complexity.",
        "difficulty": "HARD",
        "topic": "Design",
        "constraints": ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls will be made to get and put."],
        "hints": ["You need a Hash Map and a Doubly Linked List to achieve O(1) for both operations."],
        "starter_code": {
            "python": "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass\n",
            "javascript": "class LRUCache {\n    constructor(capacity) {\n        \n    }\n    get(key) {\n        \n    }\n    put(key, value) {\n        \n    }\n}\n"
        }
    },
    {
        "title": "Merge k Sorted Lists",
        "slug": "merge-k-sorted-lists",
        "description": "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
        "difficulty": "HARD",
        "topic": "Linked Lists",
        "constraints": ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500", "-10^4 <= lists[i][j] <= 10^4", "lists[i] is sorted in ascending order."],
        "hints": ["Can you use a Priority Queue (Min-Heap) or Divide and Conquer?"],
        "starter_code": {
            "python": "# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\ndef mergeKLists(lists):\n    # Write your code here\n    pass\n",
            "javascript": "/*\nfunction ListNode(val, next) {\n    this.val = (val===undefined ? 0 : val)\n    this.next = (next===undefined ? null : next)\n}\n*/\nfunction mergeKLists(lists) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Trapping Rain Water",
        "slug": "trapping-rain-water",
        "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
        "difficulty": "HARD",
        "topic": "Arrays",
        "constraints": ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
        "hints": ["Use two pointers, one from the left and one from the right, to keep track of the maximum height on both sides."],
        "starter_code": {
            "python": "def trap(height):\n    # Write your code here\n    pass\n",
            "javascript": "function trap(height) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Maximum Subarray",
        "slug": "maximum-subarray",
        "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        "difficulty": "MEDIUM",
        "topic": "Dynamic Programming",
        "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        "hints": ["Think about Kadane's algorithm. For each element, what is the maximum sum subarray ending at this element?"],
        "starter_code": {
            "python": "def maxSubArray(nums):\n    # Write your code here\n    pass\n",
            "javascript": "function maxSubArray(nums) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Invert Binary Tree",
        "slug": "invert-binary-tree",
        "description": "Given the `root` of a binary tree, invert the tree, and return its root.",
        "difficulty": "EASY",
        "topic": "Trees",
        "constraints": ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
        "hints": ["For each node, swap its left and right children."],
        "starter_code": {
            "python": "# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\ndef invertTree(root):\n    # Write your code here\n    pass\n",
            "javascript": "/*\nfunction TreeNode(val, left, right) {\n    this.val = (val===undefined ? 0 : val)\n    this.left = (left===undefined ? null : left)\n    this.right = (right===undefined ? null : right)\n}\n*/\nfunction invertTree(root) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Find Minimum in Rotated Sorted Array",
        "slug": "find-minimum-in-rotated-sorted-array",
        "description": "Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. For example, the array `nums = [0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]` if it was rotated `4` times.\n\nGiven the sorted rotated array `nums` of unique elements, return the minimum element of this array.\n\nYou must write an algorithm that runs in `O(log n)` time.",
        "difficulty": "MEDIUM",
        "topic": "Binary Search",
        "constraints": ["n == nums.length", "1 <= n <= 5000", "-5000 <= nums[i] <= 5000", "All the integers of nums are unique.", "nums is sorted and rotated between 1 and n times."],
        "hints": ["Use binary search. Compare mid with the rightmost element to determine which half contains the minimum."],
        "starter_code": {
            "python": "def findMin(nums):\n    # Write your code here\n    pass\n",
            "javascript": "function findMin(nums) {\n    // Write your code here\n}\n"
        }
    },
    {
        "title": "Group Anagrams",
        "slug": "group-anagrams",
        "description": "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
        "difficulty": "MEDIUM",
        "topic": "Strings",
        "constraints": ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
        "hints": ["Sort each string to use as a key in a Hash Map, or use the character count array as the key."],
        "starter_code": {
            "python": "def groupAnagrams(strs):\n    # Write your code here\n    pass\n",
            "javascript": "function groupAnagrams(strs) {\n    // Write your code here\n}\n"
        }
    }
]

def seed_db():
    db: Session = SessionLocal()
    
    # Get existing slugs
    existing = db.query(CodingProblem).all()
    existing_slugs = {p.slug for p in existing}
    
    added_count = 0
    for prob in problems_data:
        if prob["slug"] not in existing_slugs:
            p = CodingProblem(
                title=prob["title"],
                slug=prob["slug"],
                description=prob["description"],
                difficulty=prob["difficulty"],
                topic=prob["topic"],
                constraints=prob["constraints"],
                hints=prob["hints"],
                starter_code=prob["starter_code"],
                is_active=True
            )
            db.add(p)
            added_count += 1
            
    db.commit()
    print(f"Successfully seeded {added_count} new DSA problems.")

if __name__ == "__main__":
    seed_db()
