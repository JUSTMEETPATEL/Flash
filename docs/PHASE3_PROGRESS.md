# Phase 3 Progress Tracker

## 📊 Overall Progress: 0% Complete

---

## Week 9: Thread Pool Implementation

### Day 1-2: WorkerPool Foundation ⏳ Not Started

#### TODO 9.1.2: WorkerPool Destructor

- [ ] Read TODO_9.1_GUIDE.md section on destructor
- [ ] Understand RAII principle
- [ ] Implement destructor
- [ ] Test manually (create pool in scope, let it destroy)

**Files:** `cpp/src/worker_pool.cpp` (lines ~28-42)

**Success Criteria:**

- [ ] Calls shutdown() if running
- [ ] No compiler warnings
- [ ] No memory leaks (valgrind clean)

---

#### TODO 9.1.3: start() Method

- [ ] Read TODO_9.1_GUIDE.md section on start()
- [ ] Understand thread creation syntax
- [ ] Implement start() method
- [ ] Test: Create pool, call start(), verify no errors

**Files:** `cpp/src/worker_pool.cpp` (lines ~44-66)

**Success Criteria:**

- [ ] Creates correct number of threads
- [ ] Sets running\_ = true
- [ ] Prints confirmation message
- [ ] Prevents double-start

---

#### TODO 9.1.4: worker_thread() Method ⭐⭐⭐⭐⭐

- [ ] Read TODO_9.1_GUIDE.md section carefully (most complex!)
- [ ] Understand condition variable waiting
- [ ] Understand why to unlock before executing task
- [ ] Implement worker_thread() method
- [ ] Test: Submit simple task, verify it executes

**Files:** `cpp/src/worker_pool.cpp` (lines ~68-134)

**Success Criteria:**

- [ ] Uses unique_lock for condition variable
- [ ] Waits with predicate (no spurious wakeups)
- [ ] Checks shutdown*requested* flag
- [ ] Executes task outside of lock
- [ ] Catches all exceptions
- [ ] Exits cleanly on shutdown

**Common Issues:**

- [ ] If tasks don't execute: Check notify in submit()
- [ ] If program hangs: Check shutdown*requested* check
- [ ] If segfault: Check mutex locks around queue access

---

#### TODO 9.1.5: submit() Method

- [ ] Read TODO_9.1_GUIDE.md section on submit()
- [ ] Understand notify_one() vs notify_all()
- [ ] Implement submit() method
- [ ] Test: Submit 10 tasks, verify all execute

**Files:** `cpp/src/worker_pool.cpp` (lines ~136-161)

**Success Criteria:**

- [ ] Locks mutex before accessing queue
- [ ] Uses std::move() for task
- [ ] Calls notify_one() after push
- [ ] Returns false if shutdown requested

---

#### TODO 9.1.6: shutdown() Method

- [ ] Read TODO_9.1_GUIDE.md section on shutdown()
- [ ] Understand graceful shutdown
- [ ] Understand why notify_all() here
- [ ] Implement shutdown() method
- [ ] Test: Submit tasks, call shutdown, verify all complete

**Files:** `cpp/src/worker_pool.cpp` (lines ~163-197)

**Success Criteria:**

- [ ] Sets shutdown*requested* = true
- [ ] Calls notify_all() to wake all workers
- [ ] Joins all threads
- [ ] Sets running\_ = false
- [ ] Prints confirmation messages

---

#### TODO 9.1.7: Utility Methods

- [ ] Implement pending_tasks()
- [ ] Implement num_workers()
- [ ] Test: Verify correct values returned

**Files:** `cpp/src/worker_pool.cpp` (lines ~199-225)

**Success Criteria:**

- [ ] pending_tasks() locks mutex
- [ ] num_workers() returns correct count
- [ ] Both are const methods

---

### Day 3-4: Integration Testing ⏳ Not Started

#### Manual Testing Script

- [ ] Create test program (see below)
- [ ] Compile and run
- [ ] Verify output matches expected

**Test Program:** `tests/manual/test_worker_pool_basic.cpp`

```cpp
#include "worker_pool.h"
#include <atomic>
#include <iostream>
#include <chrono>
#include <thread>

int main() {
    std::cout << "=== WorkerPool Manual Test ===" << std::endl;

    // Test 1: Basic creation and shutdown
    std::cout << "\n[Test 1] Create and shutdown" << std::endl;
    {
        flash::WorkerPool pool(4);
        pool.start();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        pool.shutdown();
        std::cout << "✓ Clean shutdown" << std::endl;
    }

    // Test 2: Execute tasks
    std::cout << "\n[Test 2] Execute 100 tasks" << std::endl;
    {
        flash::WorkerPool pool(4);
        std::atomic<int> counter{0};

        pool.start();

        for (int i = 0; i < 100; ++i) {
            pool.submit([&counter]() {
                counter++;
            });
        }

        pool.shutdown();

        std::cout << "Counter: " << counter << " (expected: 100)" << std::endl;
        if (counter == 100) {
            std::cout << "✓ All tasks executed" << std::endl;
        } else {
            std::cout << "✗ FAILED: Not all tasks executed!" << std::endl;
        }
    }

    // Test 3: Concurrent submissions
    std::cout << "\n[Test 3] Concurrent submissions" << std::endl;
    {
        flash::WorkerPool pool(4);
        std::atomic<int> counter{0};

        pool.start();

        // Submit from multiple threads
        std::vector<std::thread> submitters;
        for (int i = 0; i < 10; ++i) {
            submitters.emplace_back([&pool, &counter]() {
                for (int j = 0; j < 100; ++j) {
                    pool.submit([&counter]() {
                        counter++;
                    });
                }
            });
        }

        for (auto& t : submitters) {
            t.join();
        }

        pool.shutdown();

        std::cout << "Counter: " << counter << " (expected: 1000)" << std::endl;
        if (counter == 1000) {
            std::cout << "✓ Concurrent submissions work" << std::endl;
        } else {
            std::cout << "✗ FAILED: Lost some tasks!" << std::endl;
        }
    }

    // Test 4: Heavy load
    std::cout << "\n[Test 4] Heavy load (10000 tasks)" << std::endl;
    {
        flash::WorkerPool pool(8);
        std::atomic<int> counter{0};

        pool.start();

        auto start = std::chrono::steady_clock::now();

        for (int i = 0; i < 10000; ++i) {
            pool.submit([&counter]() {
                counter++;
                // Simulate work
                volatile int x = 0;
                for (int j = 0; j < 1000; ++j) {
                    x += j;
                }
            });
        }

        pool.shutdown();

        auto end = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

        std::cout << "Counter: " << counter << " (expected: 10000)" << std::endl;
        std::cout << "Time: " << duration.count() << "ms" << std::endl;
        if (counter == 10000) {
            std::cout << "✓ Heavy load handled" << std::endl;
        } else {
            std::cout << "✗ FAILED: Lost some tasks under load!" << std::endl;
        }
    }

    std::cout << "\n=== All Tests Complete ===" << std::endl;
    return 0;
}
```

**How to run:**

```bash
cd /Users/meet/Developer/flash
mkdir -p tests/manual
# (Create test file above)

# Add to CMakeLists.txt:
# add_executable(test_worker_pool_manual tests/manual/test_worker_pool_basic.cpp)
# target_link_libraries(test_worker_pool_manual flash_core pthread)

# Build and run:
cd cpp/build
cmake ..
make
./test_worker_pool_manual
```

**Expected Output:**

```
=== WorkerPool Manual Test ===

[Test 1] Create and shutdown
[WorkerPool] Creating pool with 4 workers
[WorkerPool] Started 4 workers
[WorkerPool] Shutting down...
[WorkerPool] Shutdown complete
✓ Clean shutdown

[Test 2] Execute 100 tasks
[WorkerPool] Creating pool with 4 workers
[WorkerPool] Started 4 workers
[WorkerPool] Shutting down...
[WorkerPool] Shutdown complete
Counter: 100 (expected: 100)
✓ All tasks executed

[Test 3] Concurrent submissions
[WorkerPool] Creating pool with 4 workers
[WorkerPool] Started 4 workers
[WorkerPool] Shutting down...
[WorkerPool] Shutdown complete
Counter: 1000 (expected: 1000)
✓ Concurrent submissions work

[Test 4] Heavy load (10000 tasks)
[WorkerPool] Creating pool with 8 workers
[WorkerPool] Started 8 workers
[WorkerPool] Shutting down...
[WorkerPool] Shutdown complete
Counter: 10000 (expected: 10000)
Time: 150ms (approximate)
✓ Heavy load handled

=== All Tests Complete ===
```

---

### Day 5: Debug & Polish ⏳ Not Started

#### Sanitizer Testing

- [ ] Compile with Thread Sanitizer
- [ ] Run tests, verify no data races
- [ ] Compile with Address Sanitizer
- [ ] Run tests, verify no memory leaks

**Commands:**

```bash
# Thread Sanitizer
cd cpp/build
cmake .. -DCMAKE_BUILD_TYPE=Debug -DENABLE_SANITIZERS=ON
make
./test_worker_pool_manual

# Address Sanitizer
clang++ -fsanitize=address -g \
    -I../include \
    ../src/worker_pool.cpp \
    ../tests/manual/test_worker_pool_basic.cpp \
    -o test_worker_pool_asan
./test_worker_pool_asan
```

#### Checklist:

- [ ] No data races detected
- [ ] No memory leaks detected
- [ ] No deadlocks
- [ ] Clean output from sanitizers

---

## Week 10: Performance & Integration (Coming Soon)

### TODO 9.2: Integrate with HttpServer ⏳ Not Started

- [ ] Add WorkerPool to HttpServer
- [ ] Update constructor
- [ ] Modify accept loop to submit tasks
- [ ] Update stop() to shutdown pool

### TODO 9.3: Unit Tests ⏳ Not Started

- [ ] Create test_worker_pool.cpp with Google Test
- [ ] Write 10+ test cases

### TODO 9.4: Performance Benchmarks ⏳ Not Started

- [ ] Benchmark single-threaded vs multi-threaded
- [ ] Measure throughput improvement

---

## 📝 Notes & Issues

### Blockers

<!-- List any blockers here -->

- None yet

### Questions

<!-- List questions as you encounter them -->

-

### Lessons Learned

<!-- Document insights as you go -->

-

---

## 🎯 Next Steps

**Current Task:** TODO 9.1.2 - Implement destructor

**When TODO 9.1 Complete:**

1. Update this tracker
2. Review code one more time
3. Ask for code review if needed
4. Move to Week 10 tasks

---

## 📚 Resources Used

- [x] docs/PHASE3_PLAN.md - Read overview
- [ ] docs/TODO_9.1_GUIDE.md - Detailed implementation guide
- [ ] docs/CPP_THREADING_REFERENCE.md - Quick reference

---

**Last Updated:** 2025-10-13  
**Status:** Just started Phase 3!  
**Next Milestone:** Complete TODO 9.1 (WorkerPool foundation)
