import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.career.coding.models import CodingProblem

more_problems = [
    {
        "title": "Reverse Linked List",
        "slug": "reverse-linked-list",
        "description": "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
        "difficulty": "EASY",
        "topic": "Linked Lists",
        "constraints": ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
        "hints": ["Can you do it iteratively? How about recursively?"],
        "starter_code": {
            "python": "# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\ndef reverseList(head):\n    pass\n",
            "javascript": "function reverseList(head) {\n}\n"
        }
    },
    {
        "title": "Linked List Cycle",
        "slug": "linked-list-cycle",
        "description": "Given `head`, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer.",
        "difficulty": "EASY",
        "topic": "Linked Lists",
        "constraints": ["The number of the nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5"],
        "hints": ["Use Floyd's Cycle-Finding Algorithm (Tortoise and Hare)."],
        "starter_code": {
            "python": "def hasCycle(head):\n    pass\n",
            "javascript": "function hasCycle(head) {\n}\n"
        }
    },
    {
        "title": "Valid Anagram",
        "slug": "valid-anagram",
        "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
        "difficulty": "EASY",
        "topic": "Strings",
        "constraints": ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
        "hints": ["Count the frequency of each character in both strings and compare them."],
        "starter_code": {
            "python": "def isAnagram(s, t):\n    pass\n",
            "javascript": "function isAnagram(s, t) {\n}\n"
        }
    },
    {
        "title": "Valid Palindrome",
        "slug": "valid-palindrome",
        "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        "difficulty": "EASY",
        "topic": "Strings",
        "constraints": ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
        "hints": ["Use two pointers, one starting from the beginning and one from the end."],
        "starter_code": {
            "python": "def isPalindrome(s):\n    pass\n",
            "javascript": "function isPalindrome(s) {\n}\n"
        }
    },
    {
        "title": "Maximum Depth of Binary Tree",
        "slug": "maximum-depth-of-binary-tree",
        "description": "Given the `root` of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        "difficulty": "EASY",
        "topic": "Trees",
        "constraints": ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
        "hints": ["Use recursion to find the max depth of the left and right subtrees."],
        "starter_code": {
            "python": "def maxDepth(root):\n    pass\n",
            "javascript": "function maxDepth(root) {\n}\n"
        }
    },
    {
        "title": "Same Tree",
        "slug": "same-tree",
        "description": "Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.\n\nTwo binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
        "difficulty": "EASY",
        "topic": "Trees",
        "constraints": ["The number of nodes in both trees is in the range [0, 100].", "-10^4 <= Node.val <= 10^4"],
        "hints": ["Recursively check if the current nodes match and if their subtrees match."],
        "starter_code": {
            "python": "def isSameTree(p, q):\n    pass\n",
            "javascript": "function isSameTree(p, q) {\n}\n"
        }
    },
    {
        "title": "Product of Array Except Self",
        "slug": "product-of-array-except-self",
        "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
        "difficulty": "MEDIUM",
        "topic": "Arrays",
        "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
        "hints": ["Compute prefix products and suffix products in two separate passes."],
        "starter_code": {
            "python": "def productExceptSelf(nums):\n    pass\n",
            "javascript": "function productExceptSelf(nums) {\n}\n"
        }
    },
    {
        "title": "Container With Most Water",
        "slug": "container-with-most-water",
        "description": "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `ith` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
        "difficulty": "MEDIUM",
        "topic": "Arrays",
        "constraints": ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        "hints": ["Use two pointers starting at the beginning and end, and move the pointer pointing to the shorter line."],
        "starter_code": {
            "python": "def maxArea(height):\n    pass\n",
            "javascript": "function maxArea(height) {\n}\n"
        }
    },
    {
        "title": "Longest Palindromic Substring",
        "slug": "longest-palindromic-substring",
        "description": "Given a string `s`, return the longest palindromic substring in `s`.",
        "difficulty": "MEDIUM",
        "topic": "Strings",
        "constraints": ["1 <= s.length <= 1000", "s consist of only digits and English letters."],
        "hints": ["Try to expand around every possible center of a palindrome."],
        "starter_code": {
            "python": "def longestPalindrome(s):\n    pass\n",
            "javascript": "function longestPalindrome(s) {\n}\n"
        }
    },
    {
        "title": "Longest Repeating Character Replacement",
        "slug": "longest-repeating-character-replacement",
        "description": "You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most `k` times.\n\nReturn the length of the longest substring containing the same letter you can get after performing the above operations.",
        "difficulty": "MEDIUM",
        "topic": "Strings",
        "constraints": ["1 <= s.length <= 10^5", "s consists of only uppercase English letters.", "0 <= k <= s.length"],
        "hints": ["Use a sliding window. Track the most frequent character in the window to know how many replacements are needed."],
        "starter_code": {
            "python": "def characterReplacement(s, k):\n    pass\n",
            "javascript": "function characterReplacement(s, k) {\n}\n"
        }
    },
    {
        "title": "Remove Nth Node From End of List",
        "slug": "remove-nth-node-from-end-of-list",
        "description": "Given the `head` of a linked list, remove the `nth` node from the end of the list and return its head.",
        "difficulty": "MEDIUM",
        "topic": "Linked Lists",
        "constraints": ["The number of nodes in the list is sz.", "1 <= sz <= 30", "0 <= Node.val <= 100", "1 <= n <= sz"],
        "hints": ["Use two pointers separated by a gap of n nodes to easily find the node to remove."],
        "starter_code": {
            "python": "def removeNthFromEnd(head, n):\n    pass\n",
            "javascript": "function removeNthFromEnd(head, n) {\n}\n"
        }
    },
    {
        "title": "Lowest Common Ancestor of a Binary Search Tree",
        "slug": "lowest-common-ancestor-of-a-binary-search-tree",
        "description": "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
        "difficulty": "MEDIUM",
        "topic": "Trees",
        "constraints": ["The number of nodes in the tree is in the range [2, 10^5].", "-10^9 <= Node.val <= 10^9"],
        "hints": ["Use the BST property: if both nodes are smaller than the root, LCA is in the left subtree. If both are larger, it's in the right."],
        "starter_code": {
            "python": "def lowestCommonAncestor(root, p, q):\n    pass\n",
            "javascript": "function lowestCommonAncestor(root, p, q) {\n}\n"
        }
    },
    {
        "title": "Clone Graph",
        "slug": "clone-graph",
        "description": "Given a reference of a node in a connected undirected graph.\n\nReturn a deep copy (clone) of the graph.",
        "difficulty": "MEDIUM",
        "topic": "Graphs",
        "constraints": ["The number of nodes in the graph is in the range [0, 100].", "1 <= Node.val <= 100"],
        "hints": ["Use DFS or BFS and a hash map to keep track of already cloned nodes."],
        "starter_code": {
            "python": "def cloneGraph(node):\n    pass\n",
            "javascript": "function cloneGraph(node) {\n}\n"
        }
    },
    {
        "title": "Longest Increasing Subsequence",
        "slug": "longest-increasing-subsequence",
        "description": "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.",
        "difficulty": "MEDIUM",
        "topic": "Dynamic Programming",
        "constraints": ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
        "hints": ["Can you do it in O(n^2) using DP? Can you do it in O(n log n) using binary search?"],
        "starter_code": {
            "python": "def lengthOfLIS(nums):\n    pass\n",
            "javascript": "function lengthOfLIS(nums) {\n}\n"
        }
    },
    {
        "title": "Combination Sum",
        "slug": "combination-sum",
        "description": "Given an array of distinct integers `candidates` and a target integer `target`, return a list of all unique combinations of `candidates` where the chosen numbers sum to `target`. You may return the combinations in any order.",
        "difficulty": "MEDIUM",
        "topic": "Backtracking",
        "constraints": ["1 <= candidates.length <= 30", "2 <= candidates[i] <= 40", "1 <= target <= 40"],
        "hints": ["Use backtracking to explore all possible combinations."],
        "starter_code": {
            "python": "def combinationSum(candidates, target):\n    pass\n",
            "javascript": "function combinationSum(candidates, target) {\n}\n"
        }
    },
    {
        "title": "House Robber",
        "slug": "house-robber",
        "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
        "difficulty": "MEDIUM",
        "topic": "Dynamic Programming",
        "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
        "hints": ["For each house, you can either rob it (and add to the max from two houses ago) or skip it (and keep the max from the previous house)."],
        "starter_code": {
            "python": "def rob(nums):\n    pass\n",
            "javascript": "function rob(nums) {\n}\n"
        }
    },
    {
        "title": "Insert Interval",
        "slug": "insert-interval",
        "description": "You are given an array of non-overlapping intervals `intervals` where `intervals[i] = [starti, endi]` represent the start and the end of the `ith` interval and `intervals` is sorted in ascending order by `starti`. You are also given an interval `newInterval = [start, end]` that represents the start and end of another interval.\n\nInsert `newInterval` into `intervals` such that `intervals` is still sorted in ascending order by `starti` and `intervals` still does not have any overlapping intervals (merge overlapping intervals if necessary).",
        "difficulty": "MEDIUM",
        "topic": "Arrays",
        "constraints": ["0 <= intervals.length <= 10^4", "intervals[i].length == 2"],
        "hints": ["Iterate through the intervals, add non-overlapping ones, and merge overlapping ones with the new interval."],
        "starter_code": {
            "python": "def insert(intervals, newInterval):\n    pass\n",
            "javascript": "function insert(intervals, newInterval) {\n}\n"
        }
    },
    {
        "title": "Non-overlapping Intervals",
        "slug": "non-overlapping-intervals",
        "description": "Given an array of intervals `intervals` where `intervals[i] = [starti, endi]`, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.",
        "difficulty": "MEDIUM",
        "topic": "Arrays",
        "constraints": ["1 <= intervals.length <= 10^5", "intervals[i].length == 2"],
        "hints": ["Sort the intervals by their end time to greedily choose intervals that leave the most room for others."],
        "starter_code": {
            "python": "def eraseOverlapIntervals(intervals):\n    pass\n",
            "javascript": "function eraseOverlapIntervals(intervals) {\n}\n"
        }
    },
    {
        "title": "Number of 1 Bits",
        "slug": "number-of-1-bits",
        "description": "Write a function that takes the binary representation of an unsigned integer and returns the number of '1' bits it has (also known as the Hamming weight).",
        "difficulty": "EASY",
        "topic": "Bit Manipulation",
        "constraints": ["The input must be a binary string of length 32."],
        "hints": ["Use bitwise AND with a mask or repeatedly do n & (n - 1) to clear the lowest set bit."],
        "starter_code": {
            "python": "def hammingWeight(n):\n    pass\n",
            "javascript": "function hammingWeight(n) {\n}\n"
        }
    },
    {
        "title": "Missing Number",
        "slug": "missing-number",
        "description": "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
        "difficulty": "EASY",
        "topic": "Bit Manipulation",
        "constraints": ["n == nums.length", "1 <= n <= 10^4", "0 <= nums[i] <= n"],
        "hints": ["You can use the formula for the sum of the first N numbers or use XOR to cancel out the present numbers."],
        "starter_code": {
            "python": "def missingNumber(nums):\n    pass\n",
            "javascript": "function missingNumber(nums) {\n}\n"
        }
    },
    {
        "title": "Top K Frequent Elements",
        "slug": "top-k-frequent-elements",
        "description": "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.",
        "difficulty": "MEDIUM",
        "topic": "Heaps",
        "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "k is in the range [1, the number of unique elements in the array]."],
        "hints": ["Count the frequencies, then use a Priority Queue (Min-Heap) or Bucket Sort."],
        "starter_code": {
            "python": "def topKFrequent(nums, k):\n    pass\n",
            "javascript": "function topKFrequent(nums, k) {\n}\n"
        }
    },
    {
        "title": "Implement Trie (Prefix Tree)",
        "slug": "implement-trie-prefix-tree",
        "description": "A trie (pronounced as 'try') or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.\n\nImplement the Trie class:\n- `Trie()` Initializes the trie object.\n- `void insert(String word)` Inserts the string `word` into the trie.\n- `boolean search(String word)` Returns `true` if the string `word` is in the trie.\n- `boolean startsWith(String prefix)` Returns `true` if there is a previously inserted string `word` that has the prefix `prefix`.",
        "difficulty": "MEDIUM",
        "topic": "Tries",
        "constraints": ["1 <= word.length, prefix.length <= 2000", "word and prefix consist only of lowercase English letters."],
        "hints": ["Each node in the Trie should have an array or map of children and a boolean to mark the end of a word."],
        "starter_code": {
            "python": "class Trie:\n    def __init__(self):\n        pass\n    def insert(self, word):\n        pass\n    def search(self, word):\n        pass\n    def startsWith(self, prefix):\n        pass\n",
            "javascript": "class Trie {\n    constructor() {}\n    insert(word) {}\n    search(word) {}\n    startsWith(prefix) {}\n}\n"
        }
    },
    {
        "title": "Word Search II",
        "slug": "word-search-ii",
        "description": "Given an `m x n` `board` of characters and a list of strings `words`, return all words on the board.\n\nEach word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.",
        "difficulty": "HARD",
        "topic": "Tries",
        "constraints": ["m == board.length", "n == board[i].length", "1 <= m, n <= 12", "1 <= words.length <= 3 * 10^4"],
        "hints": ["Build a Trie with the given words, then use DFS on the board to search for them."],
        "starter_code": {
            "python": "def findWords(board, words):\n    pass\n",
            "javascript": "function findWords(board, words) {\n}\n"
        }
    },
    {
        "title": "Find Median from Data Stream",
        "slug": "find-median-from-data-stream",
        "description": "The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.\n\nImplement the MedianFinder class:\n- `MedianFinder()` initializes the MedianFinder object.\n- `void addNum(int num)` adds the integer `num` from the data stream to the data structure.\n- `double findMedian()` returns the median of all elements so far.",
        "difficulty": "HARD",
        "topic": "Heaps",
        "constraints": ["-10^5 <= num <= 10^5", "There will be at least one element in the data structure before calling findMedian."],
        "hints": ["Maintain a Max-Heap for the lower half of the numbers and a Min-Heap for the upper half."],
        "starter_code": {
            "python": "class MedianFinder:\n    def __init__(self):\n        pass\n    def addNum(self, num):\n        pass\n    def findMedian(self):\n        pass\n",
            "javascript": "class MedianFinder {\n    constructor() {}\n    addNum(num) {}\n    findMedian() {}\n}\n"
        }
    },
    {
        "title": "Serialize and Deserialize Binary Tree",
        "slug": "serialize-and-deserialize-binary-tree",
        "description": "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree.",
        "difficulty": "HARD",
        "topic": "Trees",
        "constraints": ["The number of nodes in the tree is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
        "hints": ["You can use either Preorder Traversal (DFS) or Level Order Traversal (BFS) to serialize the tree."],
        "starter_code": {
            "python": "class Codec:\n    def serialize(self, root):\n        pass\n    def deserialize(self, data):\n        pass\n",
            "javascript": "var serialize = function(root) {};\nvar deserialize = function(data) {};\n"
        }
    }
]

def seed_db():
    db: Session = SessionLocal()
    
    existing = db.query(CodingProblem).all()
    existing_slugs = {p.slug for p in existing}
    
    added_count = 0
    for prob in more_problems:
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
    print(f"Successfully seeded {added_count} MORE DSA problems.")

if __name__ == "__main__":
    seed_db()
