import { db } from "./index";
import {
  topicsTable,
  topicStepsTable,
  dsaPatternsTable,
  patternQuestionsTable,
  achievementsTable,
  usersTable,
  discussPostsTable,
  postCommentsTable,
} from "./schema";
import { eq } from "drizzle-orm";

type StepInput = {
  stepType:
    | "introduction"
    | "real_life_example"
    | "core_concepts"
    | "industry_usage"
    | "revision_notes"
    | "interview_questions"
    | "common_mistakes"
    | "revision_card";
  title: string;
  content: string;
};

type TopicInput = {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  iconName: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  steps: StepInput[];
};

const TOPICS: TopicInput[] = [
  {
    slug: "hashmap-and-hashing",
    title: "HashMap & Hashing",
    description: "The single most useful data structure in interviews — O(1) lookups and the key to turning brute-force solutions into optimal ones.",
    category: "Data Structures",
    order: 1,
    iconName: "grid-outline",
    difficulty: "beginner",
    estimatedMinutes: 35,
    steps: [
      {
        stepType: "introduction",
        title: "What is a HashMap?",
        content:
          "A HashMap (also called a hash table or dictionary) stores key-value pairs and gives you average O(1) time for insert, lookup, and delete. Under the hood, a hash function converts each key into an index into an underlying array (called buckets). When two keys hash to the same bucket — a collision — most implementations chain them in a small list or probe to the next open slot.\n\nWhy interviewers love it: an enormous fraction of \"optimize this brute-force O(n^2) solution\" problems reduce to \"trade space for a HashMap so you can look things up in O(1) instead of scanning.\" If you take away one lesson from this app, it's this: whenever you catch yourself writing a nested loop to check \"does some other element satisfy X,\" stop and ask whether a HashMap eliminates the inner loop.\n\nIn most languages you'll use a built-in: `dict` in Python, `HashMap`/`Map` in Java, `unordered_map` in C++, `Map`/plain object in JavaScript. You rarely implement your own hash table in an interview, but you should understand what's happening underneath so you can reason about complexity and edge cases like mutation during iteration.",
      },
      {
        stepType: "real_life_example",
        title: "Where HashMaps show up in production",
        content:
          "Think about a URL shortener like bit.ly. When someone visits `bit.ly/abc123`, the service needs to find the original long URL in constant time regardless of how many billions of links exist — that's a HashMap (backed by a real database index, but the interview version is the in-memory analog).\n\nAnother example: a web framework's routing table maps a request path like `/users/:id` to a handler function. Frameworks build this as a hash-based lookup (or a trie, for prefix matching) so that adding more routes doesn't slow down every request.\n\nCaching layers (Redis, Memcached, even a simple LRU cache) are, at their core, HashMaps with eviction policies bolted on. Any time you hear \"O(1) lookup by key\" in a system design conversation, a hash-based structure is doing the work.",
      },
      {
        stepType: "core_concepts",
        title: "Core operations and complexity",
        content:
          "- **Insert / update**: `map[key] = value` — O(1) average, O(n) worst case if many keys collide (rare with a good hash function and modern language implementations).\n- **Lookup**: `key in map` or `map.get(key)` — O(1) average.\n- **Delete**: `del map[key]` — O(1) average.\n- **Iteration**: O(n), but with **no guaranteed order** in most languages (Python 3.7+ dicts happen to preserve insertion order, but don't rely on this cross-language).\n\nKey patterns to internalize:\n1. **Frequency counting** — build a HashMap of `element -> count` in one pass, then reason about it in a second pass (e.g. \"first non-repeating character,\" \"most frequent element\").\n2. **Existence / complement lookup** — Two Sum is the canonical example: for each number, check if `target - number` has already been seen.\n3. **Grouping** — group items sharing a computed key, e.g. group anagrams by their sorted-letters signature.\n4. **Index memoization** — map a value to the last index you saw it at, useful in sliding-window problems for detecting duplicates in O(1).\n\nA HashSet is a HashMap that only cares about keys (no values) — use it purely for \"have I seen this before?\" checks.",
      },
      {
        stepType: "industry_usage",
        title: "How hashing shows up at scale",
        content:
          "At scale, plain in-memory HashMaps don't cut it — you need **consistent hashing** to distribute keys across many servers (used by DynamoDB, Cassandra, and CDN load balancers) so that adding or removing a server only reshuffles a small fraction of keys instead of all of them.\n\nDatabases use hash indexes for equality lookups (as opposed to B-tree indexes, which support range queries). Bloom filters — a probabilistic, space-efficient cousin of hash sets — are used by systems like Chrome's Safe Browsing and Cassandra's read path to cheaply answer \"is this definitely not in the set?\" before paying for an expensive lookup.\n\nHashing is also foundational to content-addressable storage (Git uses SHA-1/SHA-256 hashes of file contents as keys) and to password storage (never store plaintext — store a salted hash).",
      },
      {
        stepType: "revision_notes",
        title: "Quick revision notes",
        content:
          "- HashMap = O(1) average insert/lookup/delete, O(n) space.\n- Worst case degrades to O(n) per operation only with pathological hash collisions — rarely relevant in interviews unless explicitly discussed (hash-flooding attacks).\n- No ordering guarantee unless you use a specialized structure (e.g. Python's `OrderedDict`, Java's `LinkedHashMap`, or just sort explicitly).\n- Keys must be hashable/immutable (in Python: no lists as keys; in Java: objects need consistent `equals`/`hashCode`).\n- A HashSet is a HashMap with no values — used for membership tests and deduplication.\n- Whenever you see \"pairs that sum to X,\" \"find duplicates,\" \"group by property,\" or \"count frequency\" — reach for a HashMap first.",
      },
      {
        stepType: "interview_questions",
        title: "Practice interview questions",
        content:
          "1. **Two Sum** — Given an array and a target, return indices of two numbers that add up to the target. *Approach*: single pass, store `value -> index` as you go, check for the complement before inserting the current value.\n2. **Group Anagrams** — Group strings that are anagrams of each other. *Approach*: compute a canonical key per string (sorted characters, or a 26-length character-count tuple) and map key -> list of strings.\n3. **Longest Consecutive Sequence** — Given an unsorted array, find the length of the longest run of consecutive integers. *Approach*: put all numbers in a HashSet, then only start counting a sequence from numbers whose `n - 1` is not in the set (an O(n) trick, not O(n log n) sorting).\n4. **Subarray Sum Equals K** — Count subarrays summing to K. *Approach*: running prefix sum + a HashMap of `prefixSum -> count of times seen`.\n5. **First Unique Character in a String** — *Approach*: frequency map in one pass, then a second pass to find the first count-1 character.",
      },
      {
        stepType: "common_mistakes",
        title: "Common mistakes to avoid",
        content:
          "- **Reaching for a nested loop out of habit.** If you write `for i in range(n): for j in range(n):` to check a relationship between elements, pause — a HashMap almost always turns this into a single pass.\n- **Forgetting hashability.** In Python you cannot use a list or dict as a dictionary key — convert to a tuple first.\n- **Assuming insertion order** in languages/versions where it isn't guaranteed.\n- **Off-by-one on \"check before insert\" vs \"insert before check.\"** In Two Sum, you must check for the complement *before* adding the current number, or you'll incorrectly match a number with itself.\n- **Ignoring collision-heavy worst cases in a security context** — if untrusted input controls your keys, an adversary can craft hash collisions to degrade performance (hash-flooding); most languages mitigate this with randomized hash seeds, but it's worth mentioning if asked about it directly.",
      },
      {
        stepType: "revision_card",
        title: "Cheat sheet",
        content:
          "**HashMap in 30 seconds**\n- Avg complexity: O(1) insert / lookup / delete\n- Space: O(n)\n- No order guarantee (use `LinkedHashMap`/`OrderedDict` if you need it)\n- Use for: frequency counts, complement/existence checks, grouping by computed key, deduplication\n- Trigger phrases: \"pairs that sum to,\" \"has duplicate,\" \"group by,\" \"count occurrences,\" \"first unique\"\n- Sibling structure: HashSet = HashMap with no values, for O(1) membership tests",
      },
    ],
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    description: "Turn O(n^2) array and string scans into a single O(n) pass by moving two indices toward or across each other.",
    category: "Techniques",
    order: 2,
    iconName: "swap-horizontal-outline",
    difficulty: "beginner",
    estimatedMinutes: 30,
    steps: [
      {
        stepType: "introduction",
        title: "What is the Two Pointers technique?",
        content:
          "Two Pointers is a technique where you maintain two indices into a data structure (usually a sorted array or a string) and move them according to some rule, instead of using nested loops. The two most common shapes are:\n\n1. **Opposite ends closing inward** — start one pointer at index 0 and the other at the last index, and move them toward each other based on a comparison (classic for sorted-array problems like Two Sum II or Container With Most Water).\n2. **Same-direction, different speeds** — both pointers start near the beginning and move rightward, but one advances under different conditions than the other (used for removing duplicates in place, or partitioning).\n\nThe key insight that makes this valid is usually **monotonicity**: because the array is sorted (or you can establish an invariant), moving a pointer only ever discards possibilities you've already proven can't be optimal, so you never need to \"go back.\"",
      },
      {
        stepType: "real_life_example",
        title: "Where this shows up in practice",
        content:
          "Merge-sort's merge step is a two-pointer walk across two sorted arrays, picking the smaller head element each time — this is literally how databases merge sorted result sets from different indexes efficiently.\n\nText diffing tools (like `diff` or Git's line-by-line comparison) use pointer-based techniques to find the longest common subsequence between two versions of a file without recomparing everything from scratch.\n\nNetwork packet reassembly and streaming video buffering both use a \"two cursor\" pattern: one cursor tracks what's been consumed/played, another tracks what's been received/buffered, and the gap between them represents the buffer.",
      },
      {
        stepType: "core_concepts",
        title: "Core patterns and complexity",
        content:
          "- **Converging pointers on a sorted array**: `left = 0, right = n - 1`. Compare `arr[left] + arr[right]` (or similar) to a target; move `left` forward if the sum is too small, `right` backward if too large. O(n) time, O(1) space — this is why it's a strict upgrade over the O(n^2) brute force for problems like Two Sum on a sorted array or 3Sum (which nests a converging two-pointer scan inside a single outer loop, giving O(n^2) instead of the naive O(n^3)).\n- **Fast/slow same-direction pointers**: one pointer (`write`) tracks where the next \"valid\" element should go, another (`read`) scans ahead. Classic for \"remove duplicates from sorted array in place\" or \"move zeroes to the end.\"\n- **Container / area problems**: two pointers at the ends of an array of heights, always move the pointer at the *shorter* height inward, because moving the taller one can never increase the limiting height.\n- Always ask: *does moving this pointer provably never lose the optimal answer?* If you can't argue that, two pointers is the wrong tool.",
      },
      {
        stepType: "industry_usage",
        title: "Two pointers at scale",
        content:
          "Database query engines use two-pointer merge joins when both input relations are already sorted on the join key — this avoids building a hash table and is often the preferred join strategy for large, pre-sorted data.\n\nVersion control systems and collaborative editors (Google Docs' operational transforms, CRDTs) rely on pointer-walking algorithms to reconcile two divergent edit histories efficiently.\n\nIn compilers and parsers, a \"lookahead\" pointer alongside a \"current position\" pointer is a two-pointer pattern used to tokenize source code in a single linear pass.",
      },
      {
        stepType: "revision_notes",
        title: "Quick revision notes",
        content:
          "- Requires (or benefits enormously from) sorted input, or an invariant you can maintain as pointers move.\n- Converging pointers: O(n) time, O(1) space, replaces an O(n^2) nested-loop search on sorted data.\n- Same-direction pointers: used for in-place array partitioning/deduplication, O(n) time, O(1) space.\n- The decision of *which* pointer to move must be provably safe (you're discarding a possibility only when you've shown it can't be part of a better answer).\n- Trigger phrases: \"sorted array,\" \"pair that sums to,\" \"in place,\" \"container,\" \"palindrome check.\"",
      },
      {
        stepType: "interview_questions",
        title: "Practice interview questions",
        content:
          "1. **Two Sum II (sorted input)** — Return indices of two numbers summing to target, input is sorted. *Approach*: converging pointers, O(n).\n2. **Container With Most Water** — Maximize area between two vertical lines. *Approach*: converging pointers, always move the shorter line inward.\n3. **Valid Palindrome** — Check if a string reads the same forwards/backwards, ignoring non-alphanumeric characters. *Approach*: converging pointers skipping invalid characters.\n4. **Remove Duplicates from Sorted Array (in place)** — *Approach*: slow/fast pointers, slow tracks the write position.\n5. **3Sum** — Find all unique triplets summing to zero. *Approach*: sort, fix one element, converging two-pointer scan on the rest; careful skip-logic to avoid duplicate triplets.",
      },
      {
        stepType: "common_mistakes",
        title: "Common mistakes to avoid",
        content:
          "- **Forgetting to sort first** when the technique depends on sorted order (and forgetting that sorting costs O(n log n), which can dominate your overall complexity).\n- **Moving the wrong pointer** without justifying why it's safe — this is the #1 way candidates get 3Sum or Container With Most Water wrong.\n- **Off-by-one boundary conditions** — `while left < right` vs `while left <= right` changes behavior; know which you need (strictly less-than when you need two distinct elements).\n- **Not skipping duplicates** in problems like 3Sum, leading to duplicate triplets in the output.\n- **Confusing this with the sliding window pattern** — two pointers here typically move independently or converge; sliding window maintains a contiguous *range* between them (see the Sliding Window topic).",
      },
      {
        stepType: "revision_card",
        title: "Cheat sheet",
        content:
          "**Two Pointers in 30 seconds**\n- Converging: `left=0, right=n-1`, move based on comparison — O(n) time, O(1) space\n- Same-direction: `slow`/`fast` (or `write`/`read`) for in-place partitioning — O(n) time, O(1) space\n- Needs sorted input or a provable invariant\n- Trigger phrases: sorted array + target sum, palindrome, container/area, remove-in-place\n- Contrast with Sliding Window: two pointers often converge or scan independently; sliding window keeps a contiguous window between them",
      },
    ],
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    description: "Maintain a moving contiguous range over an array or string to solve subarray/substring problems in linear time.",
    category: "Techniques",
    order: 3,
    iconName: "scan-outline",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    steps: [
      {
        stepType: "introduction",
        title: "What is the Sliding Window technique?",
        content:
          "Sliding Window is a specialization of two pointers where the two pointers (`left` and `right`) always define a contiguous window `[left, right]`, and you incrementally grow or shrink that window rather than recomputing everything from scratch.\n\nThe pattern applies whenever you're looking for the best (longest, shortest, max-sum, count-satisfying) contiguous subarray or substring, and the property you care about (sum, count of distinct characters, etc.) can be updated in O(1) as the window's edges move — rather than O(k) per window if you recomputed it fully.\n\nThere are two flavors: **fixed-size windows** (window length is given, e.g. \"max sum of any k consecutive elements\") and **variable-size windows** (you grow the right edge until a condition breaks, then shrink the left edge until it's valid again, e.g. \"longest substring without repeating characters\").",
      },
      {
        stepType: "real_life_example",
        title: "Where this shows up in practice",
        content:
          "TCP's congestion control uses a literal \"sliding window\" of unacknowledged packets — the sender can have at most `window size` bytes in flight, and the window slides forward as acknowledgments arrive, shrinking under packet loss.\n\nReal-time analytics dashboards (e.g. \"requests per second over the last 60 seconds\") maintain a sliding time window over an event stream, adding new events on one side and expiring old ones on the other, without rescanning the whole history.\n\nRate limiters (like the ones protecting a public API) are sliding-window counters: they track how many requests a client made in the trailing N seconds and reject once the window's count exceeds a threshold.",
      },
      {
        stepType: "core_concepts",
        title: "Core patterns and complexity",
        content:
          "**Fixed-size window** (size `k` is given):\n1. Compute the result for the first `k` elements.\n2. Slide right: add the new element entering the window, subtract the one leaving. O(1) per step, O(n) total.\n\n**Variable-size window** (find the longest/shortest window satisfying a condition):\n1. Expand `right` one step at a time, updating window state (e.g. a HashMap of character counts).\n2. While the window violates the condition, shrink from `left`, updating state as elements leave.\n3. After each expansion, record whether the current window is a valid/better answer.\n\nBoth pointers only ever move forward — each element enters and leaves the window at most once — which is why total work is O(n) even though it looks like a nested loop.\n\nA HashMap almost always lives inside the window to track counts (character frequency, distinct elements) in O(1) per update — Sliding Window and HashMap are frequently combined.",
      },
      {
        stepType: "industry_usage",
        title: "Sliding window at scale",
        content:
          "Streaming systems like Apache Flink and Kafka Streams have first-class \"windowing\" operators (tumbling windows, sliding windows, session windows) for aggregating unbounded event streams — this is the distributed-systems generalization of the same idea you'll implement in an interview.\n\nCDNs and API gateways implement sliding-window rate limiting (as opposed to simpler but bursty fixed-window limiting) to smooth out traffic spikes at window boundaries.\n\nVideo/audio codecs use sliding windows over the signal for tasks like adaptive bitrate calculations and noise-floor estimation, continuously updating statistics as the window moves forward in time.",
      },
      {
        stepType: "revision_notes",
        title: "Quick revision notes",
        content:
          "- Fixed window: O(n) time, O(1) or O(k) space depending on what you track.\n- Variable window: O(n) time (each pointer moves forward at most n times total), space depends on auxiliary structure (often O(min(n, alphabet size))).\n- Always maintain window state incrementally — never recompute the whole window's property from scratch on each slide.\n- Shrinking the left edge is usually a `while` loop, not an `if` — you may need to shrink multiple times to restore validity.\n- Trigger phrases: \"longest/shortest substring/subarray,\" \"at most K distinct,\" \"contains all characters of,\" \"maximum sum of size-k subarray.\"",
      },
      {
        stepType: "interview_questions",
        title: "Practice interview questions",
        content:
          "1. **Maximum Sum Subarray of Size K** — *Approach*: fixed window, add entering element, subtract leaving element.\n2. **Longest Substring Without Repeating Characters** — *Approach*: variable window with a HashMap of `char -> last index`; shrink left past any repeated character.\n3. **Minimum Window Substring** — Find the smallest substring of `s` containing all characters of `t`. *Approach*: variable window, expand until valid, then greedily shrink while still valid, tracking the best window seen.\n4. **Longest Substring with At Most K Distinct Characters** — *Approach*: variable window with a frequency map, shrink whenever distinct count exceeds K.\n5. **Permutation in String** — Check if `s2` contains a permutation of `s1`. *Approach*: fixed window of size `len(s1)` sliding across `s2`, comparing character-count arrays.",
      },
      {
        stepType: "common_mistakes",
        title: "Common mistakes to avoid",
        content:
          "- **Using `if` instead of `while` when shrinking** — a single shrink step is often not enough to restore validity.\n- **Forgetting to update window state when removing the left element** — every element that enters the window must have a matching \"remove\" when it leaves.\n- **Recomputing window properties from scratch** on every slide, which silently turns your O(n) solution into O(n*k) or O(n^2).\n- **Confusing \"at most K\" with \"exactly K\"** — a common trick is computing `atMost(K) - atMost(K-1)` to get \"exactly K.\"\n- **Not handling empty-string/empty-array edge cases**, and not resetting window state correctly when the window becomes empty.",
      },
      {
        stepType: "revision_card",
        title: "Cheat sheet",
        content:
          "**Sliding Window in 30 seconds**\n- Fixed size: add-on-enter, subtract-on-exit, O(n)\n- Variable size: expand right, `while` invalid shrink left, O(n) amortized\n- Almost always paired with a HashMap/array for window state\n- Trigger phrases: longest/shortest substring, at-most-K-distinct, subarray sum/size-k window, contains-all-of\n- Gotcha: shrink with `while`, not `if`",
      },
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    description: "Not just for sorted arrays — a general technique for slashing a search space in half whenever you can test a condition monotonically.",
    category: "Techniques",
    order: 4,
    iconName: "search-outline",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    steps: [
      {
        stepType: "introduction",
        title: "What is Binary Search?",
        content:
          "Binary Search finds a target (or a boundary) in a sorted, monotonic search space in O(log n) time by repeatedly halving the space: check the middle element, and based on the comparison, discard the half that can't contain the answer.\n\nThe classic form searches a sorted array for an exact value. But the far more interview-relevant generalization is **binary search on the answer**: whenever you can phrase a problem as \"find the smallest/largest X such that `condition(X)` is true,\" and `condition` is monotonic (once true, stays true as X increases, or vice versa), you can binary search over the space of possible X values — even if that space isn't an explicit sorted array at all (e.g. binary searching over possible answer magnitudes like \"minimum days to ship all packages\").",
      },
      {
        stepType: "real_life_example",
        title: "Where this shows up in practice",
        content:
          "Git's `git bisect` command literally performs binary search over your commit history to find which commit introduced a bug — you tell it \"good\" or \"bad,\" and it halves the remaining range each time, turning an O(n) manual hunt into O(log n) checks.\n\nDatabase indexes (B-trees) are a generalization of binary search that lets a lookup traverse a small number of levels instead of a linear scan, even across millions of rows.\n\nNetflix and similar services use binary-search-style bisection to tune adaptive streaming bitrates: given a monotonic relationship between bitrate and buffering risk, they can converge on the best bitrate for current bandwidth conditions quickly rather than trying every option.",
      },
      {
        stepType: "core_concepts",
        title: "Core template and complexity",
        content:
          "Standard template for \"find exact value or first/last valid position\":\n```\nleft, right = 0, n - 1\nwhile left <= right:\n    mid = left + (right - left) // 2\n    if condition(mid) is \"too small\":\n        left = mid + 1\n    elif condition(mid) is \"too big\":\n        right = mid - 1\n    else:\n        return mid  # or narrow further for first/last occurrence\n```\n\n**Binary search on the answer** template (finding the smallest X satisfying a monotonic predicate):\n```\nleft, right = lowest_possible, highest_possible\nwhile left < right:\n    mid = left + (right - left) // 2\n    if feasible(mid):\n        right = mid       # mid might be the answer, keep it in range\n    else:\n        left = mid + 1\nreturn left\n```\n\nComplexity: O(log n) iterations, each doing O(f) work to evaluate the condition, so total O(f * log n) — this is why binary search on the answer is so powerful: it can turn an O(n^2) or worse brute force into O(n log n) as long as each feasibility check is efficient.\n\nThe hardest part isn't the loop — it's correctly identifying that a monotonic condition exists and defining the search space bounds.",
      },
      {
        stepType: "industry_usage",
        title: "Binary search at scale",
        content:
          "Load balancers and autoscalers sometimes use bisection-style search to find the minimum number of instances that keeps latency under a target SLA, by testing configurations and narrowing in on a threshold.\n\nCompilers and profilers use binary search over commits/builds (bisection) to isolate performance regressions automatically in CI pipelines.\n\nIn distributed systems, consistent-hashing ring lookups (finding which node owns a given key) are implemented with binary search over a sorted list of node hash values — O(log n) per request even with thousands of nodes.",
      },
      {
        stepType: "revision_notes",
        title: "Quick revision notes",
        content:
          "- Classic binary search: O(log n) time, O(1) space (iterative) — requires sorted input.\n- Binary search on the answer: applicable whenever a yes/no predicate over a range is monotonic, even without an explicit array.\n- Watch integer overflow: use `left + (right - left) // 2`, not `(left + right) // 2`, in languages where this matters.\n- Two loop styles: `while left <= right` (searching for exact match, `return -1` if not found) vs `while left < right` (converging to a single boundary index).\n- Trigger phrases: \"sorted array,\" \"minimum/maximum X such that,\" \"find peak,\" \"search in rotated sorted array,\" \"koko eating bananas\"-style capacity problems.",
      },
      {
        stepType: "interview_questions",
        title: "Practice interview questions",
        content:
          "1. **Binary Search (classic)** — Find target's index in a sorted array, or -1. *Approach*: standard template.\n2. **Search in Rotated Sorted Array** — Sorted array rotated at an unknown pivot. *Approach*: at each mid, determine which half is properly sorted, then check if target lies in that half's range.\n3. **Find Minimum in Rotated Sorted Array** — *Approach*: compare `arr[mid]` to `arr[right]` to decide which half contains the rotation point.\n4. **Koko Eating Bananas** — Find the minimum eating speed to finish all bananas within H hours. *Approach*: binary search on the answer (eating speed), feasibility check is \"total hours needed at this speed <= H.\"\n5. **Find Peak Element** — Find any local maximum in an unsorted array where `arr[-1] = arr[n] = -infinity`. *Approach*: binary search using the slope at `mid` to decide which half must contain a peak.",
      },
      {
        stepType: "common_mistakes",
        title: "Common mistakes to avoid",
        content:
          "- **Infinite loops from wrong bound updates** — e.g. using `right = mid` when it should be `right = mid - 1` (or vice versa) causes the range to stop shrinking.\n- **Off-by-one errors switching between `<=` and `<` loop conditions** without adjusting the body to match.\n- **Assuming the whole array must be sorted** — many binary search problems (rotated arrays, 2D matrices) only need *piecewise* or *directional* monotonicity.\n- **Not verifying the predicate is actually monotonic** before reaching for binary search on the answer — if it isn't, the technique silently gives wrong answers.\n- **Overflow** in languages with fixed-width integers when computing `(left + right) / 2` on large arrays — prefer `left + (right - left) / 2`.",
      },
      {
        stepType: "revision_card",
        title: "Cheat sheet",
        content:
          "**Binary Search in 30 seconds**\n- Classic: O(log n) time, O(1) space, needs sorted (or piecewise-monotonic) input\n- On the answer: search a range of candidate answers with a monotonic feasibility check — turns O(n * f) brute force into O(log n * f)\n- Use `mid = left + (right - left)//2` to avoid overflow\n- `while left <= right` for exact match; `while left < right` for boundary convergence\n- Trigger phrases: sorted/rotated array, \"minimum X such that condition holds,\" capacity/speed threshold problems",
      },
    ],
  },
  {
    slug: "recursion-and-backtracking",
    title: "Recursion & Backtracking",
    description: "Break problems into smaller identical subproblems, and systematically explore (and undo) choices to search a solution space.",
    category: "Techniques",
    order: 5,
    iconName: "git-branch-outline",
    difficulty: "intermediate",
    estimatedMinutes: 40,
    steps: [
      {
        stepType: "introduction",
        title: "What is Recursion & Backtracking?",
        content:
          "Recursion is solving a problem by expressing it in terms of smaller instances of itself, with one or more base cases that terminate the recursion. Every recursive function needs: (1) a base case that returns directly, and (2) a recursive case that makes progress toward the base case.\n\nBacktracking is a specific application of recursion for exploring a search space of choices: you make a choice, recurse into the consequences of that choice, and if it doesn't lead anywhere valid, you *undo* the choice (\"backtrack\") and try the next one. This is how you systematically generate all permutations, combinations, or valid configurations (like N-Queens or Sudoku) without missing any or visiting the same state twice.\n\nThe mental model: backtracking builds a decision tree where each node is a partial solution, each edge is a choice, and you do a depth-first traversal, pruning branches early when you can prove they can't lead to a valid answer.",
      },
      {
        stepType: "real_life_example",
        title: "Where this shows up in practice",
        content:
          "Autocomplete and text-prediction engines use recursive tree traversal (over tries) to explore all valid completions of a prefix, backtracking away from branches that don't match.\n\nConstraint solvers used in scheduling software (e.g. assigning employees to shifts subject to constraints) are essentially large-scale backtracking search with heavy pruning — this is also how Sudoku solvers and many puzzle-generation tools work.\n\nCompilers use recursive descent parsing to turn source code into an abstract syntax tree — each grammar rule is expressed as a recursive function that may need to backtrack (or use lookahead) when a parse attempt fails.\n\nFile system traversal (recursively walking directories to compute total size, or search for a file) is one of the simplest and most common real-world recursions.",
      },
      {
        stepType: "core_concepts",
        title: "Core patterns and complexity",
        content:
          "**Recursion structure:**\n```\ndef solve(state):\n    if base_case(state):\n        return base_result\n    return combine(solve(smaller_state))\n```\n\n**Backtracking template:**\n```\ndef backtrack(path, choices):\n    if is_complete(path):\n        record(path)\n        return\n    for choice in choices:\n        if not is_valid(choice, path):\n            continue\n        path.append(choice)          # make the choice\n        backtrack(path, remaining_choices)\n        path.pop()                   # undo the choice (backtrack)\n```\n\nKey complexity intuition: backtracking is inherently exponential in the worst case (you're exploring a tree of possibilities), so the real skill is **pruning** — cutting off branches as early as possible via constraint checks, rather than generating a full candidate and validating it at the end.\n\nRecursion also underlies **divide and conquer** (merge sort, quick sort: split the problem, solve each half recursively, combine) and **memoized recursion / top-down dynamic programming** (cache results of subproblems you've already solved to avoid exponential blowup — this is the bridge from plain recursion to DP).",
      },
      {
        stepType: "industry_usage",
        title: "Recursion & backtracking at scale",
        content:
          "SAT solvers and modern constraint/optimization engines (used in chip design, logistics, and scheduling at companies like Google and Amazon) are industrial-strength descendants of backtracking search, augmented with clause learning and sophisticated pruning heuristics (DPLL/CDCL algorithms).\n\nQuery planners in databases recursively explore join orderings (a combinatorial search problem) to find an efficient execution plan, pruning obviously-bad plans early.\n\nGame AI (chess, Go engines) use a close cousin of backtracking called minimax with alpha-beta pruning — recursively exploring the game tree while cutting off branches proven not to affect the final decision.",
      },
      {
        stepType: "revision_notes",
        title: "Quick revision notes",
        content:
          "- Every recursive function needs a base case and provable progress toward it (or you get infinite recursion / stack overflow).\n- Backtracking = DFS over a decision tree + explicit undo step after each recursive call returns.\n- Complexity is typically exponential (e.g. O(2^n) for subsets, O(n!) for permutations) — pruning reduces the practical runtime, not the theoretical worst case.\n- Memoization turns exponential recursion into polynomial time when overlapping subproblems exist — the moment you notice repeated identical subproblem calls, consider caching (this is literally what \"top-down DP\" means).\n- Watch recursion depth vs. language stack limits for deep recursion — consider converting to iterative with an explicit stack if needed.",
      },
      {
        stepType: "interview_questions",
        title: "Practice interview questions",
        content:
          "1. **Subsets** — Generate all subsets of a set. *Approach*: backtrack, at each element choose to include or exclude it.\n2. **Permutations** — Generate all orderings of an array. *Approach*: backtrack, swap-based or \"used\" boolean array to track which elements are already placed.\n3. **Combination Sum** — Find all combinations that sum to a target (numbers can repeat). *Approach*: backtrack, at each step either reuse the current number or advance to the next; prune when the running sum exceeds target.\n4. **N-Queens** — Place N queens on an N x N board so none attack each other. *Approach*: backtrack row by row, prune columns/diagonals already under attack using sets.\n5. **Word Search** — Determine if a word exists in a 2D grid via adjacent cells. *Approach*: DFS/backtrack from each starting cell, mark visited cells temporarily and unmark on backtrack.",
      },
      {
        stepType: "common_mistakes",
        title: "Common mistakes to avoid",
        content:
          "- **Forgetting to undo the choice** (`path.pop()`, unmarking visited cells) after the recursive call returns — this corrupts subsequent branches of the search.\n- **Mutating shared state without copying** when recording a valid solution — appending a reference to a list that gets mutated later instead of a snapshot/copy.\n- **Missing or incorrect base case**, causing infinite recursion or premature termination.\n- **Not pruning early enough**, leading to correct but far too slow solutions (e.g. checking full validity only at the leaf instead of incrementally).\n- **Confusing backtracking with plain DFS** — backtracking specifically implies an undo step to explore alternate branches from the same state.",
      },
      {
        stepType: "revision_card",
        title: "Cheat sheet",
        content:
          "**Recursion & Backtracking in 30 seconds**\n- Recursion needs: base case + progress toward it\n- Backtracking = choose -> recurse -> undo, exploring a decision tree via DFS\n- Complexity is typically exponential; pruning is the main lever for practical performance\n- Memoize repeated subproblems to convert to polynomial time (top-down DP)\n- Trigger phrases: \"all subsets/permutations/combinations,\" \"generate all valid,\" grid/board search problems (N-Queens, Word Search, Sudoku)",
      },
    ],
  },
  {
    slug: "system-design-fundamentals",
    title: "System Design Fundamentals",
    description: "The vocabulary and mental models you need before any system design interview: scaling, caching, and the tradeoffs behind them.",
    category: "System Design",
    order: 6,
    iconName: "layers-outline",
    difficulty: "advanced",
    estimatedMinutes: 45,
    steps: [
      {
        stepType: "introduction",
        title: "Why system design interviews exist",
        content:
          "Coding interviews test whether you can solve a well-specified problem correctly and efficiently. System design interviews test something different: whether you can take an *ambiguous, open-ended* requirement (\"design Twitter,\" \"design a URL shortener\") and reason about tradeoffs at scale — how data flows, where bottlenecks form, and what breaks first as load grows from 100 to 100 million users.\n\nThere's no single \"correct\" architecture. What interviewers evaluate is whether you can: clarify requirements and scope, estimate scale (back-of-envelope math), propose a reasonable high-level architecture, and then go deep on 1-2 components while articulating tradeoffs explicitly rather than asserting one option is simply \"better.\"\n\nThis topic covers the foundational vocabulary — scaling, caching, CAP theorem — that every subsequent system design conversation builds on.",
      },
      {
        stepType: "real_life_example",
        title: "A concrete walkthrough: scaling a simple app",
        content:
          "Imagine you launch a note-taking app with a single server running your app code and a single Postgres database. At 100 users, this is fine. At 100,000 users, the database becomes the bottleneck — read queries pile up waiting for the same CPU/disk.\n\nFirst fix: add a **cache** (like Redis) in front of the database for frequently-read data (e.g. a user's own notes), so most reads never touch Postgres.\n\nNext bottleneck: a single app server can't handle the request volume. You add a **load balancer** in front of multiple identical app server instances (horizontal scaling), each stateless so any instance can handle any request.\n\nNext bottleneck: the single database becomes a write bottleneck. You introduce **read replicas** (copies of the database that only serve reads, while a single primary handles writes) — trading a bit of read staleness (eventual consistency) for much higher read throughput.\n\nThis progression — cache, load balancer, read replicas — is the backbone of almost every \"scale this app\" system design conversation.",
      },
      {
        stepType: "core_concepts",
        title: "Core concepts you must know cold",
        content:
          "**Vertical vs. horizontal scaling**: vertical = bigger machine (more CPU/RAM on one box) — simple but has a hard ceiling and a single point of failure. Horizontal = more machines working together — effectively unlimited scaling but requires your app to be stateless (or to manage distributed state explicitly).\n\n**Caching**: store frequently-accessed data somewhere faster than its source of truth (in-memory vs. disk, or close to the user vs. far). Key tradeoffs: cache invalidation (\"there are only two hard problems in computer science...\"), TTL-based expiry vs. explicit invalidation, and cache-aside vs. write-through strategies.\n\n**Load balancing**: distributes incoming requests across multiple servers. Common algorithms: round robin, least-connections, consistent hashing (important when you need requests from the same client to consistently hit the same backend, e.g. for session affinity or sharding).\n\n**CAP theorem**: in a distributed system experiencing a network **P**artition, you must choose between **C**onsistency (every read sees the latest write) and **A**vailability (every request gets a response, possibly stale). You cannot have all three of C, A, and P simultaneously during a partition — most real systems pick a point on the CP/AP spectrum per use case rather than a single global answer (e.g. a banking ledger favors consistency; a social media feed favors availability).\n\n**Database sharding**: splitting a dataset across multiple database instances by some key (e.g. `user_id % N` or a hash range), so no single machine holds all the data. Enables horizontal write scaling but complicates cross-shard queries and transactions.",
      },
      {
        stepType: "industry_usage",
        title: "How real companies apply these ideas",
        content:
          "Twitter's timeline system famously chose **availability over strict consistency** for the home timeline — it's fine if you see a tweet a few seconds late, but the app must never simply fail to load. Contrast this with a bank's balance-transfer system, which must be strongly consistent even if that means occasionally rejecting a request during a partition.\n\nNetflix pioneered aggressive **caching at the edge** (CDNs) so that video content is served from a server physically close to the viewer, dramatically reducing latency and central-server load — the same caching principle from the walkthrough above, applied globally.\n\nInstagram famously used database sharding by user ID early on to handle write scale for photo metadata, accepting the complexity of cross-shard queries in exchange for near-linear write scalability.\n\nAmazon's DynamoDB was explicitly designed around the CAP theorem tradeoff, offering tunable consistency (you can choose stronger or weaker consistency per-query depending on the use case).",
      },
      {
        stepType: "revision_notes",
        title: "Quick revision notes",
        content:
          "- Vertical scaling: simpler, hits a ceiling, single point of failure. Horizontal scaling: complex, near-unlimited, requires statelessness or explicit state management.\n- Caching trades staleness risk for massive latency/throughput wins — always state your invalidation strategy explicitly.\n- Load balancers enable horizontal scaling; consistent hashing keeps redistribution minimal when servers are added/removed.\n- CAP theorem: pick 2 of 3 *during a partition* — this is not about normal operation, it's specifically about partition behavior.\n- Sharding scales writes horizontally at the cost of cross-shard query/transaction complexity.\n- In interviews: always state assumptions and back-of-envelope numbers (requests/sec, data size) before designing — this shows structured thinking more than any specific technology choice.",
      },
      {
        stepType: "interview_questions",
        title: "Practice interview questions",
        content:
          "1. **Design a URL shortener** — *Approach*: talk through ID generation (counter vs. hash), a HashMap-like key-value store for the mapping, caching hot URLs, and read/write ratio (reads dominate, so optimize for read latency).\n2. **Design a rate limiter** — *Approach*: discuss fixed window vs. sliding window vs. token bucket algorithms, and where state lives (in-memory per-server vs. shared Redis for a distributed limiter).\n3. **How would you scale a read-heavy API that's starting to slow down?** — *Approach*: walk through the progression — add caching, add read replicas, consider a CDN if content is largely static.\n4. **Explain CAP theorem with a concrete example from a system you've used.** — *Approach*: pick a real system, identify where partitions could occur, and argue which side of CAP it favors and why that's the right tradeoff for its use case.\n5. **Design a notification system (push notifications to millions of users)** — *Approach*: discuss a message queue to decouple producers from delivery workers, fan-out strategies, and idempotency to avoid duplicate notifications on retry.",
      },
      {
        stepType: "common_mistakes",
        title: "Common mistakes to avoid",
        content:
          "- **Jumping straight to a specific technology** (\"I'll use Kafka\") before establishing requirements and scale — interviewers want to see the reasoning, not a name-drop.\n- **Ignoring scale estimation entirely** — a design for 100 users looks very different from one for 100 million; always ballpark the numbers.\n- **Treating CAP as \"pick one forever\"** rather than a per-operation, per-partition-event tradeoff that can vary across different parts of the same system.\n- **Over-engineering** — proposing microservices, multiple caches, and global sharding for a problem that a single well-indexed database could handle at the stated scale.\n- **Not stating assumptions out loud** — system design is a collaborative conversation; silently assuming details (like read/write ratio) instead of stating them denies the interviewer the chance to redirect you.",
      },
      {
        stepType: "revision_card",
        title: "Cheat sheet",
        content:
          "**System Design Fundamentals in 30 seconds**\n- Vertical scaling = bigger machine (ceiling, SPOF); Horizontal = more machines (needs statelessness)\n- Caching trades staleness for speed — always name your invalidation strategy\n- Load balancer + consistent hashing enables horizontal scaling with minimal reshuffling\n- CAP: during a network partition, pick Consistency or Availability (not both)\n- Sharding scales writes horizontally, complicates cross-shard operations\n- Interview flow: clarify requirements -> estimate scale -> high-level design -> deep dive -> tradeoffs",
      },
    ],
  },
];

type PatternInput = {
  slug: string;
  name: string;
  description: string;
  recognitionClues: string;
  timeComplexity: string;
  spaceComplexity: string;
  tags: string[];
  questions: {
    title: string;
    difficulty: "easy" | "medium" | "hard";
    description: string;
    hint: string;
  }[];
};

const PATTERNS: PatternInput[] = [
  {
    slug: "two-pointers",
    name: "Two Pointers",
    description: "Use two indices moving toward or across each other to avoid nested loops on sorted or invariant-preserving data.",
    recognitionClues: "The input is sorted (or can be sorted cheaply), and the problem asks for a pair, triplet, or in-place transformation. Look for phrasing like \"pair that sums to,\" \"closest to target,\" or \"remove/partition in place.\"",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["arrays", "strings", "sorting"],
    questions: [
      {
        title: "Two Sum II — Input Array Is Sorted",
        difficulty: "easy",
        description: "Given a 1-indexed sorted array of integers, find two numbers that add up to a specific target and return their indices.",
        hint: "Start pointers at both ends; if the sum is too small move left forward, if too large move right backward.",
      },
      {
        title: "Container With Most Water",
        difficulty: "medium",
        description: "Given n non-negative integers representing heights of vertical lines, find two lines that together with the x-axis form a container holding the most water.",
        hint: "Always move the pointer at the shorter line inward — moving the taller one can never increase the limiting height.",
      },
      {
        title: "3Sum",
        difficulty: "medium",
        description: "Given an integer array, return all unique triplets that sum to zero.",
        hint: "Sort the array, fix one element in an outer loop, then run a converging two-pointer scan on the remainder — skip duplicate values to avoid repeated triplets.",
      },
    ],
  },
  {
    slug: "sliding-window",
    name: "Sliding Window",
    description: "Maintain a contiguous, incrementally-updated window over an array or string instead of recomputing from scratch.",
    recognitionClues: "The problem asks for the longest/shortest/best contiguous subarray or substring satisfying some condition, and that condition can be tracked incrementally as the window's edges move.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k) for auxiliary window state",
    tags: ["arrays", "strings", "hashing"],
    questions: [
      {
        title: "Maximum Sum Subarray of Size K",
        difficulty: "easy",
        description: "Given an array and an integer k, find the maximum sum of any contiguous subarray of size k.",
        hint: "Compute the sum of the first k elements, then slide: add the entering element, subtract the one leaving.",
      },
      {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "medium",
        description: "Given a string, find the length of the longest substring without repeating characters.",
        hint: "Track the last seen index of each character in a hashmap; when you see a repeat inside the window, jump left past its previous occurrence.",
      },
      {
        title: "Minimum Window Substring",
        difficulty: "hard",
        description: "Given strings s and t, find the smallest substring of s that contains every character of t (including duplicates).",
        hint: "Expand right until the window contains all of t's characters, then greedily shrink from the left while it's still valid, recording the smallest valid window seen.",
      },
    ],
  },
  {
    slug: "fast-and-slow-pointers",
    name: "Fast & Slow Pointers",
    description: "Move two pointers through a linked structure at different speeds to detect cycles, find midpoints, or locate nth-from-end nodes.",
    recognitionClues: "The problem involves a linked list (or an implicit chain, like a functional graph) and asks about cycles, midpoints, or a fixed offset from the end — without wanting you to compute the length up front.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["linked-list", "cycle-detection"],
    questions: [
      {
        title: "Linked List Cycle",
        difficulty: "easy",
        description: "Given the head of a linked list, determine if the list has a cycle.",
        hint: "Advance slow by one and fast by two each step; if they ever meet, there's a cycle (Floyd's Tortoise and Hare).",
      },
      {
        title: "Middle of the Linked List",
        difficulty: "easy",
        description: "Given the head of a singly linked list, return the middle node.",
        hint: "Move slow one step and fast two steps at a time; when fast reaches the end, slow is at the middle.",
      },
      {
        title: "Find the Duplicate Number",
        difficulty: "medium",
        description: "Given an array of n+1 integers where each is between 1 and n, find the one duplicate, treating the array as a functional graph via value-as-next-index.",
        hint: "Treat arr[i] as a pointer to the next index — this creates a cycle at the duplicate value; apply Floyd's cycle detection.",
      },
    ],
  },
  {
    slug: "merge-intervals",
    name: "Merge Intervals",
    description: "Sort intervals by start time, then sweep once, merging or comparing adjacent overlapping intervals.",
    recognitionClues: "The problem gives a list of (start, end) ranges and asks you to merge, insert, or find overlaps/gaps between them — a strong signal is the word \"interval\" or \"meeting\" plus \"overlap.\"",
    timeComplexity: "O(n log n) (dominated by the sort)",
    spaceComplexity: "O(n) for the output",
    tags: ["arrays", "sorting", "greedy"],
    questions: [
      {
        title: "Merge Intervals",
        difficulty: "medium",
        description: "Given a collection of intervals, merge all overlapping intervals.",
        hint: "Sort by start time, then walk through once: merge into the last interval in your result if it overlaps, otherwise append a new one.",
      },
      {
        title: "Insert Interval",
        difficulty: "medium",
        description: "Given a sorted, non-overlapping list of intervals and a new interval, insert it and merge as needed.",
        hint: "Split into three phases: intervals ending before the new one starts, intervals overlapping the new one (merge these together), and intervals starting after the new one ends.",
      },
      {
        title: "Meeting Rooms II",
        difficulty: "medium",
        description: "Given an array of meeting time intervals, find the minimum number of conference rooms required.",
        hint: "Separate start times and end times into two sorted arrays and sweep them together, or use a min-heap of end times to track currently-occupied rooms.",
      },
    ],
  },
  {
    slug: "binary-search",
    name: "Binary Search",
    description: "Halve a monotonic search space each step, either over a sorted array or over a range of candidate answers.",
    recognitionClues: "The input is sorted (possibly rotated), or the problem asks for a minimum/maximum value satisfying a condition that gets easier or harder to satisfy monotonically as the candidate value increases.",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    tags: ["arrays", "search"],
    questions: [
      {
        title: "Search in Rotated Sorted Array",
        difficulty: "medium",
        description: "Given a rotated sorted array with no duplicates, search for a target value in O(log n).",
        hint: "At each mid, one half is always properly sorted — check whether the target lies within that half's range to decide which side to search.",
      },
      {
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "medium",
        description: "Find the minimum element in a rotated sorted array with no duplicates.",
        hint: "Compare arr[mid] to arr[right]: if arr[mid] > arr[right], the minimum is to the right of mid; otherwise it's at or to the left of mid.",
      },
      {
        title: "Koko Eating Bananas",
        difficulty: "medium",
        description: "Koko must eat all bananas within h hours; find the minimum eating speed k that makes this possible.",
        hint: "Binary search over possible speeds from 1 to max(piles); the feasibility check (total hours at speed k) is monotonic in k.",
      },
    ],
  },
  {
    slug: "dfs-bfs-graph-traversal",
    name: "DFS/BFS Graph Traversal",
    description: "Systematically explore all reachable nodes in a graph or grid — depth-first for path/connectivity problems, breadth-first for shortest-path-in-unweighted-graph problems.",
    recognitionClues: "The problem involves a grid, tree, or explicit graph and asks about connectivity, reachability, shortest path in an unweighted graph, or exhaustive exploration (islands, flood fill, level-order traversal).",
    timeComplexity: "O(V + E) (or O(rows * cols) for a grid)",
    spaceComplexity: "O(V) for the visited set / queue / recursion stack",
    tags: ["graphs", "trees", "grids"],
    questions: [
      {
        title: "Number of Islands",
        difficulty: "medium",
        description: "Given a 2D grid of '1's (land) and '0's (water), count the number of islands.",
        hint: "For each unvisited land cell, run DFS or BFS to mark the entire connected island as visited, incrementing your island count once per new island found.",
      },
      {
        title: "Binary Tree Level Order Traversal",
        difficulty: "medium",
        description: "Given the root of a binary tree, return the level-order traversal of its nodes' values (left to right, level by level).",
        hint: "Use BFS with a queue, processing one full level at a time by tracking the queue's size at the start of each level.",
      },
      {
        title: "Course Schedule (Cycle Detection in a Directed Graph)",
        difficulty: "medium",
        description: "Given course prerequisites as directed edges, determine if it's possible to finish all courses (i.e. the graph has no cycle).",
        hint: "Run DFS tracking three states per node (unvisited, in current recursion stack, fully processed) — encountering a node already in the current recursion stack means there's a cycle. Alternatively use Kahn's algorithm (BFS topological sort).",
      },
    ],
  },
];

const ACHIEVEMENTS = [
  { code: "first-topic", title: "First Steps", description: "Complete your first topic.", iconName: "footsteps" },
  { code: "week-streak", title: "On Fire", description: "Reach a 7-day learning streak.", iconName: "flame" },
  { code: "pattern-master", title: "Pattern Master", description: "Reach 100% mastery on any DSA pattern.", iconName: "ribbon" },
  { code: "first-post", title: "Community Voice", description: "Publish your first discuss post.", iconName: "megaphone" },
  { code: "first-comment", title: "Helper", description: "Leave your first comment.", iconName: "chatbubble-ellipses" },
  { code: "first-session", title: "Co-Learner", description: "Complete your first chat or voice session.", iconName: "people" },
  { code: "five-topics", title: "Well-Rounded", description: "Complete 5 topics.", iconName: "trophy" },
  { code: "hundred-xp", title: "Century Club", description: "Earn 100 XP.", iconName: "star" },
];

const SEED_USERS = [
  { anonymousHandle: "QuietFalcon482", avatarColor: "#7c6cff" },
  { anonymousHandle: "SwiftOtter219", avatarColor: "#4fd8e8" },
  { anonymousHandle: "BoldPanther055", avatarColor: "#3ddc97" },
  { anonymousHandle: "SharpSparrow731", avatarColor: "#ff9f5a" },
  { anonymousHandle: "CalmFox398", avatarColor: "#ff6b81" },
  { anonymousHandle: "CleverWolf607", avatarColor: "#c792ea" },
  { anonymousHandle: "SteadyHeron142", avatarColor: "#5ac8fa" },
  { anonymousHandle: "NimbleLynx873", avatarColor: "#ffd166" },
];

const SEED_POSTS: { authorIdx: number; type: "question" | "discussion" | "resource"; title: string; content: string; topicTag: string | null; upvoteCount: number; daysAgo: number }[] = [
  {
    authorIdx: 0,
    type: "question",
    title: "How do you decide between HashMap and sorting for a problem?",
    content: "I keep seeing problems where either a HashMap approach or a sort-then-two-pointer approach both work. Is there a rule of thumb for which to reach for first, or does it just come down to whichever you code faster under pressure?",
    topicTag: "hashmap-and-hashing",
    upvoteCount: 14,
    daysAgo: 6,
  },
  {
    authorIdx: 1,
    type: "discussion",
    title: "Sliding window finally clicked for me after this reframe",
    content: "For weeks I kept trying to recompute the window from scratch every time. What finally clicked: think of it as \"what changes when I move the right edge by one, and what changes when I move the left edge by one\" — track only the deltas. Sharing in case it helps someone else stuck on variable window problems.",
    topicTag: "sliding-window",
    upvoteCount: 27,
    daysAgo: 4,
  },
  {
    authorIdx: 2,
    type: "resource",
    title: "A mental checklist I use before every binary search problem",
    content: "1) Is the search space actually monotonic? 2) What am I searching over — indices or the answer itself? 3) Do I need left<=right or left<right? Writing these three questions down before coding has cut my binary search bugs by a lot.",
    topicTag: "binary-search",
    upvoteCount: 33,
    daysAgo: 9,
  },
  {
    authorIdx: 3,
    type: "question",
    title: "Anyone have a good intuition for when to backtrack vs. just do DP?",
    content: "I can usually tell they're related but I struggle to know upfront if a problem wants exhaustive enumeration (backtracking) or optimal-value-via-subproblems (DP). What's your trigger?",
    topicTag: "recursion-and-backtracking",
    upvoteCount: 19,
    daysAgo: 2,
  },
  {
    authorIdx: 4,
    type: "discussion",
    title: "System design interviews are way less about memorizing tech names than I thought",
    content: "Went into my first onsite system design round expecting to need to know Kafka internals cold. Turns out the interviewer cared way more about whether I asked clarifying questions and stated tradeoffs out loud. Sharing so others don't over-prep on trivia and under-prep on structured communication.",
    topicTag: "system-design-fundamentals",
    upvoteCount: 41,
    daysAgo: 11,
  },
  {
    authorIdx: 5,
    type: "question",
    title: "Best way to practice explaining your approach out loud?",
    content: "I can solve problems fine alone but freeze up a bit when narrating my thought process live. Any tips beyond \"just practice with a friend\"?",
    topicTag: null,
    upvoteCount: 22,
    daysAgo: 1,
  },
  {
    authorIdx: 6,
    type: "resource",
    title: "Two pointers vs sliding window — the distinction that finally made sense",
    content: "Two pointers can move independently or converge from opposite ends. Sliding window specifically maintains a *contiguous range* between the pointers as an invariant. If you're tracking \"stuff currently between left and right,\" it's a window; if you're just comparing endpoints, it's plain two pointers.",
    topicTag: "two-pointers",
    upvoteCount: 18,
    daysAgo: 7,
  },
  {
    authorIdx: 7,
    type: "discussion",
    title: "Found a co-learner through the matching feature and it actually helped",
    content: "Was skeptical about the anonymous matching but did a 20-minute session on graph traversal with a stranger and explaining Number of Islands out loud to them exposed three gaps in my own understanding I didn't know I had. Recommend trying it once.",
    topicTag: "dfs-bfs-graph-traversal",
    upvoteCount: 25,
    daysAgo: 3,
  },
];

const SEED_COMMENTS: { postIdx: number; authorIdx: number; content: string }[] = [
  { postIdx: 0, authorIdx: 2, content: "I usually default to HashMap first since it's O(n) instead of O(n log n) for the sort, unless the problem needs the sorted order for something else (like a two-pointer convergence)." },
  { postIdx: 0, authorIdx: 4, content: "Agreed with the above — also if the interviewer explicitly says 'the array is already sorted,' that's a strong hint they want the two-pointer approach." },
  { postIdx: 1, authorIdx: 3, content: "This is a great reframe, going to try it on Minimum Window Substring today." },
  { postIdx: 2, authorIdx: 6, content: "Saving this checklist, thank you." },
  { postIdx: 4, authorIdx: 1, content: "100% agree, my mock interviewer stopped me mid-answer just to ask 'why do you think that's a reasonable assumption' more than anything about the tech itself." },
];

async function upsertTopic(input: TopicInput) {
  const [existing] = await db.select().from(topicsTable).where(eq(topicsTable.slug, input.slug));
  const topicId = existing
    ? existing.id
    : (
        await db
          .insert(topicsTable)
          .values({
            slug: input.slug,
            title: input.title,
            description: input.description,
            category: input.category,
            order: input.order,
            iconName: input.iconName,
            difficulty: input.difficulty,
            estimatedMinutes: input.estimatedMinutes,
          })
          .returning()
      )[0].id;

  const existingSteps = await db.select().from(topicStepsTable).where(eq(topicStepsTable.topicId, topicId));
  if (existingSteps.length === 0) {
    await db.insert(topicStepsTable).values(
      input.steps.map((s, idx) => ({
        topicId,
        stepNumber: idx + 1,
        stepType: s.stepType,
        title: s.title,
        content: s.content,
      })),
    );
  }
  return topicId;
}

async function upsertPattern(input: PatternInput) {
  const [existing] = await db.select().from(dsaPatternsTable).where(eq(dsaPatternsTable.slug, input.slug));
  const patternId = existing
    ? existing.id
    : (
        await db
          .insert(dsaPatternsTable)
          .values({
            slug: input.slug,
            name: input.name,
            description: input.description,
            recognitionClues: input.recognitionClues,
            timeComplexity: input.timeComplexity,
            spaceComplexity: input.spaceComplexity,
            tags: input.tags,
          })
          .returning()
      )[0].id;

  const existingQuestions = await db.select().from(patternQuestionsTable).where(eq(patternQuestionsTable.patternId, patternId));
  if (existingQuestions.length === 0) {
    await db.insert(patternQuestionsTable).values(
      input.questions.map((q) => ({
        patternId,
        title: q.title,
        difficulty: q.difficulty,
        description: q.description,
        hint: q.hint,
      })),
    );
  }
}

async function seed() {
  console.log("Seeding topics...");
  for (const topic of TOPICS) {
    await upsertTopic(topic);
  }

  console.log("Seeding patterns...");
  for (const pattern of PATTERNS) {
    await upsertPattern(pattern);
  }

  console.log("Seeding achievements...");
  for (const achievement of ACHIEVEMENTS) {
    await db.insert(achievementsTable).values(achievement).onConflictDoNothing();
  }

  console.log("Seeding community users & posts...");
  const seedUserIds: number[] = [];
  for (const user of SEED_USERS) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.anonymousHandle, user.anonymousHandle));
    if (existing) {
      seedUserIds.push(existing.id);
    } else {
      const [created] = await db
        .insert(usersTable)
        .values({ ...user, displayName: user.anonymousHandle, isSeed: true })
        .returning();
      seedUserIds.push(created.id);
    }
  }

  const existingPosts = await db.select().from(discussPostsTable);
  const postIds: number[] = [];
  if (existingPosts.length === 0) {
    for (const post of SEED_POSTS) {
      const createdAt = new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000);
      const [created] = await db
        .insert(discussPostsTable)
        .values({
          authorId: seedUserIds[post.authorIdx],
          type: post.type,
          title: post.title,
          content: post.content,
          topicTag: post.topicTag,
          upvoteCount: post.upvoteCount,
          createdAt,
        })
        .returning();
      postIds.push(created.id);
    }

    for (const comment of SEED_COMMENTS) {
      const postId = postIds[comment.postIdx];
      await db.insert(postCommentsTable).values({
        postId,
        authorId: seedUserIds[comment.authorIdx],
        content: comment.content,
      });
      const [post] = await db.select().from(discussPostsTable).where(eq(discussPostsTable.id, postId));
      await db
        .update(discussPostsTable)
        .set({ commentCount: post.commentCount + 1 })
        .where(eq(discussPostsTable.id, postId));
    }
  } else {
    console.log("Discuss posts already seeded, skipping.");
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
