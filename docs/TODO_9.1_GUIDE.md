# TODO 9.1: WorkerPool Foundation

## 🎯 Overview

**Goal:** Implement a thread pool that manages worker threads for concurrent task execution  
**Files:** `cpp/include/worker_pool.h`, `cpp/src/worker_pool.cpp`  
**Difficulty:** Advanced (Multi-threading)  
**Time Estimate:** 4-6 hours

---

## 📚 What You'll Learn

### Threading Concepts

- **Thread Pool Pattern**: Reuse threads instead of creating new ones for each task
- **Task Queue**: FIFO queue of pending work items
- **Worker Threads**: Long-lived threads that process tasks from queue
- **Synchronization**: Mutex and condition variables for thread coordination

### C++ Threading Primitives

- `std::thread`: Represents a single thread of execution
- `std::mutex`: Mutual exclusion lock for protecting shared data
- `std::lock_guard`: RAII wrapper for automatic lock/unlock
- `std::unique_lock`: More flexible lock for condition variables
- `std::condition_variable`: Allows threads to wait for notifications
- `std::atomic`: Lock-free atomic operations

### Why Thread Pools?

**Without Thread Pool:**

```
Request 1 → Create Thread → Process → Destroy Thread
Request 2 → Create Thread → Process → Destroy Thread
Request 3 → Create Thread → Process → Destroy Thread
```

- **Problem**: Creating threads is EXPENSIVE (1-2ms each)
- **Problem**: Unbounded thread creation can exhaust resources
- **Problem**: Context switching overhead with many threads

**With Thread Pool:**

```
Request 1 ┐
Request 2 ├─→ Task Queue ─→ Worker 1 (reused)
Request 3 ┤                 Worker 2 (reused)
Request 4 ┘                 Worker 3 (reused)
```

- **Benefit**: Threads created once, reused forever
- **Benefit**: Fixed number of threads (predictable resource usage)
- **Benefit**: Work queue buffers bursts of requests

---

## 🏗️ Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        WorkerPool                           │
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │ Task Queue   │      │ Worker       │                    │
│  │              │      │ Threads      │                    │
│  │ [Task 1]     │      │              │                    │
│  │ [Task 2]     │◄────┤ Thread 1 ●   │ (waiting)          │
│  │ [Task 3]     │      │ Thread 2 ●   │ (executing)        │
│  │              │      │ Thread 3 ●   │ (waiting)          │
│  └──────────────┘      │ Thread 4 ●   │ (executing)        │
│         ▲              └──────────────┘                    │
│         │                                                   │
│         │ submit()                                          │
│         │                                                   │
│  ┌──────┴────────┐     ┌──────────────┐                   │
│  │ Mutex         │     │ Condition    │                    │
│  │ (protects     │     │ Variable     │                    │
│  │  queue)       │     │ (notifies    │                    │
│  └───────────────┘     │  workers)    │                    │
│                        └──────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      WorkerPool Lifecycle                   │
└─────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │  CREATED     │  Constructor called
  │ running=false│  Threads not yet started
  └──────┬───────┘
         │
         │ start()
         │
         ▼
  ┌──────────────┐
  │   RUNNING    │  Workers waiting for tasks
  │ running=true │  Accepting task submissions
  └──────┬───────┘
         │
         │ shutdown()
         │
         ▼
  ┌──────────────┐
  │ SHUTTING     │  Finishing current tasks
  │   DOWN       │  No new tasks accepted
  │shutdown=true │
  └──────┬───────┘
         │
         │ All tasks complete
         │
         ▼
  ┌──────────────┐
  │   STOPPED    │  All threads joined
  │ running=false│  Resources cleaned up
  └──────────────┘
```

---

## 📝 Implementation Guide

### TODO 9.1.2: Destructor

**Task:** Ensure clean shutdown when WorkerPool is destroyed

**Concepts:**

- **RAII (Resource Acquisition Is Initialization)**: Resources cleaned up automatically
- **Thread Cleanup**: Must join all threads before destruction
- **No Leaks**: Threads left running = resource leak!

**Example Scenario:**

```cpp
{
    WorkerPool pool(4);
    pool.start();
    // ... use pool ...
} // Destructor called here - must clean up!
```

**Implementation:**

```cpp
WorkerPool::~WorkerPool() {
    if (running_) {
        shutdown();  // Delegate cleanup to shutdown()
    }
}
```

**Why This Matters:**

- If destructor doesn't join threads, program behavior is undefined
- User might forget to call shutdown() manually
- RAII pattern makes cleanup automatic and safe

---

### TODO 9.1.3: start() Method

**Task:** Launch all worker threads

**Concepts:**

- **Thread Creation**: Each std::thread runs a function
- **Member Function Threads**: Pass &Class::method and this pointer
- **State Management**: Set flags before starting threads

**Thread Creation Syntax:**

```cpp
// Option 1: Lambda (captures this)
workers_.emplace_back([this]() {
    worker_thread();
});

// Option 2: Member function pointer (what we use)
workers_.emplace_back(&WorkerPool::worker_thread, this);
```

**Implementation:**

```cpp
void WorkerPool::start() {
    if (running_) {
        std::cerr << "[WorkerPool] Already running!" << std::endl;
        return;
    }

    running_ = true;
    shutdown_requested_ = false;

    // Create worker threads
    for (size_t i = 0; i < num_workers_; ++i) {
        workers_.emplace_back(&WorkerPool::worker_thread, this);
    }

    std::cout << "[WorkerPool] Started " << num_workers_ << " workers" << std::endl;
}
```

**Common Mistakes:**

- ❌ Forgetting to set `running_ = true` (workers won't run!)
- ❌ Starting threads before setting state (race condition!)
- ❌ Not checking if already running (duplicate threads!)

---

### TODO 9.1.4: worker_thread() - THE CORE ALGORITHM

**Task:** Implement the worker thread main loop

This is the **most important method** in the entire class! 🌟

**Concepts:**

- **Producer-Consumer Pattern**: Main thread produces tasks, workers consume
- **Condition Variable**: Efficient waiting (no busy-wait loop)
- **Critical Section**: Code that accesses shared data (must be locked)
- **Exception Safety**: One bad task shouldn't kill the thread

**Algorithm Pseudocode:**

```
LOOP forever:
    LOCK mutex
    WAIT until (task available OR shutdown requested)

    IF shutdown AND queue empty:
        EXIT loop

    IF task available:
        POP task from queue
    UNLOCK mutex

    IF have task:
        EXECUTE task (catch exceptions)
END LOOP
```

**Why Unlock Before Executing Task?**

❌ **BAD (Execute with lock held):**

```cpp
{
    std::lock_guard<std::mutex> lock(mutex_);
    task = queue_.front();
    queue_.pop();
    task();  // Executing while locked!
}
```

- **Problem**: Only ONE thread can work at a time
- **Problem**: All other threads blocked waiting for lock
- **Result**: No concurrency! Thread pool is useless!

✅ **GOOD (Execute after unlock):**

```cpp
{
    std::lock_guard<std::mutex> lock(mutex_);
    task = queue_.front();
    queue_.pop();
}  // Lock released here
task();  // Execute outside lock - other threads can grab tasks!
```

- **Benefit**: Multiple threads execute tasks concurrently
- **Benefit**: Lock only held briefly (less contention)
- **Result**: TRUE concurrency!

**Condition Variable Explained:**

**Bad Approach (Busy Wait):**

```cpp
while (true) {
    if (!queue_.empty()) {
        // process task
    }
    // Loop continuously checking - wastes CPU!
}
```

- Wastes CPU checking queue constantly
- Thread running at 100% doing nothing

**Good Approach (Condition Variable):**

```cpp
condition_.wait(lock, []() {
    return !queue_.empty();
});
// Thread sleeps until notified - no CPU waste!
```

- Thread sleeps (0% CPU) until notified
- Wakes up only when work is available
- Efficient waiting!

**Implementation:**

```cpp
void WorkerPool::worker_thread() {
    while (running_) {
        Task task;

        {
            std::unique_lock<std::mutex> lock(queue_mutex_);

            // Wait for work or shutdown
            condition_.wait(lock, [this]() {
                return !task_queue_.empty() || shutdown_requested_;
            });

            // Exit if shutting down and no work left
            if (shutdown_requested_ && task_queue_.empty()) {
                break;
            }

            // Get task
            if (!task_queue_.empty()) {
                task = std::move(task_queue_.front());
                task_queue_.pop();
            }
        }
        // Lock released here!

        // Execute outside lock
        if (task) {
            try {
                task();
            } catch (const std::exception& e) {
                std::cerr << "[WorkerPool] Task exception: " << e.what() << std::endl;
            } catch (...) {
                std::cerr << "[WorkerPool] Unknown task exception" << std::endl;
            }
        }
    }
}
```

**Key Points:**

1. **Use `unique_lock` not `lock_guard`**: condition_variable requires unique_lock
2. **Check predicate in loop**: Prevents spurious wakeups
3. **Move task, don't copy**: `std::move()` for efficiency
4. **Catch all exceptions**: Don't let bad task crash thread
5. **Exit on shutdown**: Check `shutdown_requested_` flag

---

### TODO 9.1.5: submit() Method

**Task:** Add task to queue and notify a worker

**Concepts:**

- **Thread-Safe Queue**: Must lock before modifying
- **Notification**: Wake sleeping worker to process task
- **Move Semantics**: Transfer ownership, avoid copy

**Notification Strategy:**

- `notify_one()`: Wake ONE waiting thread (efficient)
- `notify_all()`: Wake ALL waiting threads (overkill for submit)

**When to use which:**

- **submit()**: Use `notify_one()` - only one thread can take the task
- **shutdown()**: Use `notify_all()` - want all threads to exit

**Implementation:**

```cpp
bool WorkerPool::submit(Task task) {
    if (shutdown_requested_) {
        return false;  // Don't accept tasks during shutdown
    }

    {
        std::lock_guard<std::mutex> lock(queue_mutex_);
        task_queue_.push(std::move(task));
    }

    condition_.notify_one();  // Wake one worker
    return true;
}
```

**Common Mistakes:**

- ❌ Forgetting to notify (workers never wake up!)
- ❌ Using notify_all() (wakes all threads unnecessarily)
- ❌ Notifying before unlock (less efficient, but still works)

---

### TODO 9.1.6: shutdown() Method

**Task:** Gracefully stop all workers

**Graceful Shutdown Steps:**

1. Signal shutdown request
2. Wake all sleeping workers
3. Wait for workers to finish current tasks
4. Join all threads
5. Update state

**Why notify_all() here:**

- During shutdown, want ALL threads to exit
- notify_one() would only wake one thread
- Other threads would never wake up and never exit!

**Implementation:**

```cpp
void WorkerPool::shutdown() {
    std::cout << "[WorkerPool] Shutting down..." << std::endl;

    shutdown_requested_ = true;  // Signal workers
    condition_.notify_all();     // Wake ALL workers

    // Wait for all threads to finish
    for (auto& worker : workers_) {
        if (worker.joinable()) {
            worker.join();
        }
    }

    running_ = false;
    std::cout << "[WorkerPool] Shutdown complete" << std::endl;
}
```

**Thread Joining:**

- `join()`: Wait for thread to finish (blocks until done)
- `joinable()`: Check if thread is still running
- Must call join() before thread object is destroyed!

---

### TODO 9.1.7: Utility Methods

**Task:** Helper methods for monitoring pool state

**pending_tasks():**

```cpp
size_t WorkerPool::pending_tasks() const {
    std::lock_guard<std::mutex> lock(queue_mutex_);
    return task_queue_.size();
}
```

- **Must lock**: Reading queue size is not atomic
- **const method**: Doesn't modify pool state
- **mutable mutex**: Allows locking in const method

**num_workers():**

```cpp
size_t WorkerPool::num_workers() const {
    return num_workers_;
}
```

- **No lock needed**: Value is const after construction
- **Simple getter**: Just returns member variable

---

## 🧪 Testing Your Implementation

### Basic Test

```cpp
#include "worker_pool.h"
#include <atomic>
#include <iostream>

int main() {
    flash::WorkerPool pool(4);
    std::atomic<int> counter{0};

    pool.start();

    // Submit 100 tasks
    for (int i = 0; i < 100; ++i) {
        pool.submit([&counter]() {
            counter++;
        });
    }

    pool.shutdown();

    std::cout << "Counter: " << counter << std::endl;
    // Should print: Counter: 100

    return 0;
}
```

**Expected Output:**

```
[WorkerPool] Creating pool with 4 workers
[WorkerPool] Started 4 workers
[WorkerPool] Shutting down...
[WorkerPool] Shutdown complete
Counter: 100
```

### Common Issues

**Issue 1: Counter != 100**

- **Cause**: Race condition accessing counter
- **Fix**: Use `std::atomic<int>` not `int`

**Issue 2: Program hangs on shutdown**

- **Cause**: Worker threads not checking shutdown*requested*
- **Fix**: Check flag in worker_thread() loop

**Issue 3: Segmentation fault**

- **Cause**: Accessing queue without lock
- **Fix**: Always lock queue*mutex* before accessing task*queue*

**Issue 4: Tasks not executing**

- **Cause**: Forgot to notify workers in submit()
- **Fix**: Call condition\_.notify_one() after pushing task

---

## 📊 Performance Characteristics

### Time Complexity

- **submit()**: O(1) - just push to queue
- **worker_thread()**: O(1) per task
- **shutdown()**: O(n) where n = number of workers (join each)

### Space Complexity

- **Fixed overhead**: O(num_workers) for thread objects
- **Variable overhead**: O(queued_tasks) for task queue

### Scalability

- **Sweet spot**: num_workers = number of CPU cores
- **Too few workers**: Can't utilize all cores
- **Too many workers**: Context switching overhead

---

## 🎯 Success Criteria

✅ **Functionality:**

- [ ] Pool starts with specified number of workers
- [ ] Tasks execute concurrently
- [ ] All submitted tasks complete
- [ ] Graceful shutdown with no hanging threads
- [ ] No memory leaks

✅ **Thread Safety:**

- [ ] No data races (verified with thread sanitizer)
- [ ] No deadlocks
- [ ] Proper mutex usage
- [ ] Condition variables work correctly

✅ **Code Quality:**

- [ ] RAII for resource management
- [ ] Exception-safe code
- [ ] Clear comments
- [ ] No compiler warnings

---

## 🚀 Ready to Implement?

**Start with TODO 9.1.2** (Destructor) - the easiest one!

Then proceed in order:

1. TODO 9.1.2: Destructor ⭐
2. TODO 9.1.3: start() ⭐⭐
3. TODO 9.1.4: worker_thread() ⭐⭐⭐⭐⭐ (most complex!)
4. TODO 9.1.5: submit() ⭐⭐
5. TODO 9.1.6: shutdown() ⭐⭐⭐
6. TODO 9.1.7: Utilities ⭐

**Tips:**

- Implement one TODO at a time
- Test after each TODO (create simple main.cpp)
- Read the hints carefully
- Refer to this guide when stuck
- Ask for help if needed!

**Next:** After completing TODO 9.1, we'll write comprehensive tests in TODO 9.3! 🧪

Good luck! You're about to become a multi-threading expert! 💪🔥
