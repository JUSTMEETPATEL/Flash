# Phase 3: Concurrency & Worker Threads (Weeks 9-10)

## 🎯 Phase Overview

**Goal:** Implement multi-threaded request handling for true concurrent processing  
**Duration:** 2-3 weeks  
**Difficulty:** Advanced  
**Prerequisites:** Phase 1 & 2 complete

---

## 📚 What You'll Learn

### Concurrency Concepts

- Thread pools and worker threads
- Mutex and condition variables
- Lock-free data structures (optional)
- Thread-safe design patterns
- Graceful shutdown with threads

### C++ Threading

- `std::thread` and `std::jthread`
- `std::mutex` and `std::lock_guard`
- `std::condition_variable`
- `std::atomic` operations
- Move semantics for thread safety

### Performance

- Load balancing strategies
- Minimize lock contention
- Avoid blocking operations
- Thread pool sizing
- Performance profiling

---

## 🏗️ Architecture Overview

### Current Architecture (Phase 2)

```
Client Request
    ↓
C++ HTTP Server (single-threaded)
    ↓
N-API Bridge
    ↓
JavaScript Handler (Node.js event loop)
    ↓
Response
```

### Phase 3 Architecture

```
Client Request 1 ──┐
Client Request 2 ──┼─→ HTTP Server (Accept Thread)
Client Request 3 ──┘         ↓
                        Work Queue
                             ↓
                    ┌────────┼────────┐
                    ↓        ↓        ↓
                Worker 1  Worker 2  Worker 3  (Thread Pool)
                    ↓        ↓        ↓
                    └────────┼────────┘
                             ↓
                      Process Request
                             ↓
                         Response
```

**Key Changes:**

1. **Accept Thread**: Main thread only accepts connections
2. **Work Queue**: Thread-safe queue of pending requests
3. **Worker Pool**: N threads processing requests concurrently
4. **Load Balancing**: Distribute work evenly across workers

---

## 📋 Week 9: Thread Pool Implementation

### Day 1-2: WorkerPool Foundation

**Goal:** Create basic thread pool structure

#### TODO 9.1.1: Create WorkerPool class header

**File:** `cpp/include/worker_pool.h`

```cpp
#pragma once

#include <thread>
#include <vector>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <atomic>
#include <memory>

namespace flash {

/**
 * @brief Thread pool for concurrent request processing
 *
 * Manages a pool of worker threads that process tasks from a queue.
 * Thread-safe with proper synchronization.
 */
class WorkerPool {
public:
    using Task = std::function<void()>;

    /**
     * @brief Create worker pool with specified number of threads
     * @param num_workers Number of worker threads (default: hardware concurrency)
     */
    explicit WorkerPool(size_t num_workers = std::thread::hardware_concurrency());

    /**
     * @brief Destructor - ensures clean shutdown
     */
    ~WorkerPool();

    // Delete copy operations (thread pool is not copyable)
    WorkerPool(const WorkerPool&) = delete;
    WorkerPool& operator=(const WorkerPool&) = delete;

    /**
     * @brief Submit a task to the worker pool
     * @param task Function to execute on a worker thread
     * @return true if task was queued, false if pool is shutting down
     */
    bool submit(Task task);

    /**
     * @brief Start the worker threads
     */
    void start();

    /**
     * @brief Shutdown the worker pool gracefully
     * Waits for all queued tasks to complete
     */
    void shutdown();

    /**
     * @brief Get number of pending tasks
     */
    size_t pending_tasks() const;

    /**
     * @brief Get number of worker threads
     */
    size_t num_workers() const;

private:
    /**
     * @brief Worker thread main loop
     * Continuously takes tasks from queue and executes them
     */
    void worker_thread();

    // Worker threads
    std::vector<std::thread> workers_;

    // Task queue
    std::queue<Task> task_queue_;

    // Synchronization
    mutable std::mutex queue_mutex_;
    std::condition_variable condition_;

    // State
    std::atomic<bool> running_;
    std::atomic<bool> shutdown_requested_;

    size_t num_workers_;
};

} // namespace flash
```

#### TODO 9.1.2: Implement WorkerPool constructor

**File:** `cpp/src/worker_pool.cpp`

```cpp
#include "worker_pool.h"
#include <iostream>

namespace flash {

WorkerPool::WorkerPool(size_t num_workers)
    : running_(false)
    , shutdown_requested_(false)
    , num_workers_(num_workers)
{
    if (num_workers_ == 0) {
        num_workers_ = std::thread::hardware_concurrency();
        if (num_workers_ == 0) {
            num_workers_ = 4; // Fallback
        }
    }

    std::cout << "[WorkerPool] Creating pool with " << num_workers_ << " workers" << std::endl;
}

// TODO 9.1.2: Implement destructor
WorkerPool::~WorkerPool() {
    // HINT 1: Call shutdown() if not already called
    // HINT 2: Join all worker threads
    // HINT 3: Ensure clean shutdown

    // IMPLEMENTATION:
    //   if (running_) {
    //       shutdown();
    //   }
}

} // namespace flash
```

#### TODO 9.1.3: Implement start() method

```cpp
void WorkerPool::start() {
    // TODO 9.1.3: Start all worker threads
    // HINT 1: Set running_ = true
    // HINT 2: Create worker threads with worker_thread() as entry point
    // HINT 3: Store threads in workers_ vector
    // HINT 4: Use std::thread constructor with member function

    // IMPLEMENTATION:
    //   if (running_) {
    //       std::cerr << "[WorkerPool] Already running!" << std::endl;
    //       return;
    //   }
    //
    //   running_ = true;
    //   shutdown_requested_ = false;
    //
    //   for (size_t i = 0; i < num_workers_; ++i) {
    //       workers_.emplace_back(&WorkerPool::worker_thread, this);
    //   }
    //
    //   std::cout << "[WorkerPool] Started " << num_workers_ << " workers" << std::endl;
}
```

#### TODO 9.1.4: Implement worker_thread() - THE HEART OF THE POOL

```cpp
void WorkerPool::worker_thread() {
    // TODO 9.1.4: Implement worker thread main loop
    // HINT 1: Loop while running_ is true
    // HINT 2: Wait on condition variable for new tasks
    // HINT 3: Lock mutex before checking queue
    // HINT 4: Pop task from queue and execute it
    // HINT 5: Handle shutdown_requested_

    // IMPLEMENTATION:
    //   while (running_) {
    //       Task task;
    //
    //       {
    //           std::unique_lock<std::mutex> lock(queue_mutex_);
    //
    //           // Wait for task or shutdown
    //           condition_.wait(lock, [this]() {
    //               return !task_queue_.empty() || shutdown_requested_;
    //           });
    //
    //           // Check if we should exit
    //           if (shutdown_requested_ && task_queue_.empty()) {
    //               break;
    //           }
    //
    //           // Get task from queue
    //           if (!task_queue_.empty()) {
    //               task = std::move(task_queue_.front());
    //               task_queue_.pop();
    //           }
    //       }
    //
    //       // Execute task outside of lock
    //       if (task) {
    //           try {
    //               task();
    //           } catch (const std::exception& e) {
    //               std::cerr << "[WorkerPool] Task exception: " << e.what() << std::endl;
    //           }
    //       }
    //   }
}
```

#### TODO 9.1.5: Implement submit() method

```cpp
bool WorkerPool::submit(Task task) {
    // TODO 9.1.5: Submit task to queue
    // HINT 1: Check if shutdown is requested
    // HINT 2: Lock mutex before modifying queue
    // HINT 3: Push task to queue
    // HINT 4: Notify one waiting worker thread
    // HINT 5: Return success/failure

    // IMPLEMENTATION:
    //   if (shutdown_requested_) {
    //       return false;
    //   }
    //
    //   {
    //       std::lock_guard<std::mutex> lock(queue_mutex_);
    //       task_queue_.push(std::move(task));
    //   }
    //
    //   condition_.notify_one();
    //   return true;
}
```

#### TODO 9.1.6: Implement shutdown() method

```cpp
void WorkerPool::shutdown() {
    // TODO 9.1.6: Gracefully shutdown worker pool
    // HINT 1: Set shutdown_requested_ = true
    // HINT 2: Notify all worker threads
    // HINT 3: Join all worker threads
    // HINT 4: Set running_ = false

    // IMPLEMENTATION:
    //   std::cout << "[WorkerPool] Shutting down..." << std::endl;
    //
    //   shutdown_requested_ = true;
    //   condition_.notify_all();
    //
    //   for (auto& worker : workers_) {
    //       if (worker.joinable()) {
    //           worker.join();
    //       }
    //   }
    //
    //   running_ = false;
    //   std::cout << "[WorkerPool] Shutdown complete" << std::endl;
}
```

#### TODO 9.1.7: Implement utility methods

```cpp
size_t WorkerPool::pending_tasks() const {
    std::lock_guard<std::mutex> lock(queue_mutex_);
    return task_queue_.size();
}

size_t WorkerPool::num_workers() const {
    return num_workers_;
}
```

---

### Day 3-4: Integrate WorkerPool with HttpServer

#### TODO 9.2.1: Add WorkerPool to HttpServer

**File:** `cpp/include/server.h`

```cpp
#include "worker_pool.h"

class HttpServer {
private:
    // ... existing members ...

    // TODO 9.2.1: Add worker pool member
    std::unique_ptr<WorkerPool> worker_pool_;

    // TODO 9.2.2: Change connection handling to use worker pool
    void handle_connection_async(int client_fd);
};
```

#### TODO 9.2.2: Update HttpServer constructor

```cpp
HttpServer::HttpServer(uint16_t port, size_t num_workers)
    : socket_fd_(-1)
    , port_(port)
    , running_(false)
    , worker_pool_(std::make_unique<WorkerPool>(num_workers))
{
    // ... existing code ...
}
```

#### TODO 9.2.3: Start worker pool with server

```cpp
void HttpServer::start() {
    // ... existing socket setup ...

    // TODO 9.2.3: Start worker pool
    worker_pool_->start();

    running_ = true;

    // ... accept loop ...
    while (running_) {
        int client_fd = accept(socket_fd_, ...);

        // TODO 9.2.4: Submit connection handling to worker pool
        worker_pool_->submit([this, client_fd]() {
            handle_connection(client_fd);
        });
    }
}
```

#### TODO 9.2.4: Update stop() to shutdown worker pool

```cpp
void HttpServer::stop() {
    running_ = false;

    // TODO 9.2.4: Shutdown worker pool
    if (worker_pool_) {
        worker_pool_->shutdown();
    }

    // ... existing cleanup ...
}
```

---

### Day 5: Testing Thread Pool

#### TODO 9.3.1: Create worker pool unit tests

**File:** `cpp/tests/test_worker_pool.cpp`

```cpp
#include <gtest/gtest.h>
#include "worker_pool.h"
#include <chrono>
#include <atomic>

namespace flash {
namespace test {

class WorkerPoolTest : public ::testing::Test {
protected:
    void SetUp() override {
        pool_ = std::make_unique<WorkerPool>(4);
    }

    void TearDown() override {
        pool_.reset();
    }

    std::unique_ptr<WorkerPool> pool_;
};

TEST_F(WorkerPoolTest, CreatesWorkers) {
    EXPECT_EQ(pool_->num_workers(), 4);
}

TEST_F(WorkerPoolTest, StartsAndStops) {
    pool_->start();
    EXPECT_NO_THROW(pool_->shutdown());
}

TEST_F(WorkerPoolTest, ExecutesSingleTask) {
    std::atomic<bool> executed{false};

    pool_->start();
    pool_->submit([&executed]() {
        executed = true;
    });

    pool_->shutdown();

    EXPECT_TRUE(executed);
}

TEST_F(WorkerPoolTest, ExecutesMultipleTasks) {
    std::atomic<int> counter{0};
    const int num_tasks = 100;

    pool_->start();

    for (int i = 0; i < num_tasks; ++i) {
        pool_->submit([&counter]() {
            counter++;
        });
    }

    pool_->shutdown();

    EXPECT_EQ(counter, num_tasks);
}

TEST_F(WorkerPoolTest, HandlesConcurrentSubmissions) {
    std::atomic<int> counter{0};
    const int num_tasks = 1000;

    pool_->start();

    // Submit from multiple threads
    std::vector<std::thread> submitters;
    for (int i = 0; i < 10; ++i) {
        submitters.emplace_back([this, &counter, num_tasks]() {
            for (int j = 0; j < num_tasks / 10; ++j) {
                pool_->submit([&counter]() {
                    counter++;
                });
            }
        });
    }

    for (auto& t : submitters) {
        t.join();
    }

    pool_->shutdown();

    EXPECT_EQ(counter, num_tasks);
}

TEST_F(WorkerPoolTest, RejectsTasksAfterShutdown) {
    pool_->start();
    pool_->shutdown();

    bool accepted = pool_->submit([]() {});
    EXPECT_FALSE(accepted);
}

} // namespace test
} // namespace flash
```

---

## 📋 Week 10: Performance & Optimization

### Day 6-7: Load Balancing & Optimization

#### TODO 9.4.1: Add work stealing (Advanced - Optional)

**Concept:** Each worker has its own queue, can steal from others when idle

```cpp
// Optional advanced feature - only if you want extra challenge
class WorkStealingPool {
    std::vector<std::queue<Task>> worker_queues_;
    std::vector<std::mutex> queue_mutexes_;

    Task steal_task(size_t worker_id);
};
```

#### TODO 9.4.2: Add performance monitoring

```cpp
class WorkerPool {
private:
    std::atomic<uint64_t> tasks_completed_{0};
    std::atomic<uint64_t> tasks_submitted_{0};

public:
    uint64_t get_tasks_completed() const {
        return tasks_completed_;
    }

    double get_utilization() const {
        return tasks_completed_ / (double)tasks_submitted_;
    }
};
```

### Day 8-9: Integration Testing

#### TODO 9.5.1: Concurrent request testing

**File:** `cpp/tests/test_concurrent_requests.cpp`

```cpp
TEST(ConcurrentTest, Handles100ConcurrentRequests) {
    HttpServer server(9999, 8); // 8 workers

    // Start server in background
    std::thread server_thread([&server]() {
        server.start();
    });

    // Create 100 client connections
    std::vector<std::thread> clients;
    std::atomic<int> success_count{0};

    for (int i = 0; i < 100; ++i) {
        clients.emplace_back([&success_count]() {
            TestClient client;
            if (client.connect(9999)) {
                std::string req = "GET / HTTP/1.1\r\n\r\n";
                if (client.send(req)) {
                    std::string res = client.receive();
                    if (res.find("200 OK") != std::string::npos) {
                        success_count++;
                    }
                }
            }
        });
    }

    for (auto& client : clients) {
        client.join();
    }

    server.stop();
    server_thread.join();

    EXPECT_GE(success_count, 95); // Allow some failures
}
```

### Day 10: Performance Benchmarking

#### TODO 9.6.1: Benchmark thread pool vs single-threaded

**File:** `benchmarks/thread_pool_benchmark.cpp`

```cpp
void benchmark_single_threaded() {
    HttpServer server(8000, 1); // 1 worker
    // Run benchmark
}

void benchmark_multi_threaded() {
    HttpServer server(8000, 8); // 8 workers
    // Run benchmark
}

// Compare results
```

---

## 🎯 Success Criteria

### Functionality

- ✅ Worker pool creates and manages threads
- ✅ Tasks execute concurrently
- ✅ Graceful shutdown with no leaked threads
- ✅ Thread-safe task queue
- ✅ All unit tests passing

### Performance

- ✅ Handle 1000+ concurrent connections
- ✅ 5-10x throughput improvement vs single-threaded
- ✅ No deadlocks or race conditions
- ✅ Minimal lock contention

### Code Quality

- ✅ No memory leaks (valgrind clean)
- ✅ No data races (thread sanitizer clean)
- ✅ Proper RAII for thread management
- ✅ Exception-safe code

---

## 📚 Key Concepts to Master

### 1. Mutex & Lock Management

```cpp
// ALWAYS use RAII locks
std::lock_guard<std::mutex> lock(mutex_);  // Unlocks automatically

// For conditional waiting
std::unique_lock<std::mutex> lock(mutex_);  // Can unlock manually
condition_.wait(lock);
```

### 2. Condition Variables

```cpp
// Waiting thread
std::unique_lock<std::mutex> lock(mutex_);
condition_.wait(lock, []() { return !queue_.empty(); });

// Notifying thread
{
    std::lock_guard<std::mutex> lock(mutex_);
    queue_.push(item);
}
condition_.notify_one();  // Wake one waiter
```

### 3. Atomic Operations

```cpp
std::atomic<bool> flag{false};
flag = true;  // Thread-safe
if (flag.load()) { ... }  // Thread-safe read
```

### 4. Move Semantics

```cpp
task_queue_.push(std::move(task));  // Transfer ownership
```

---

## 🐛 Common Pitfalls

### 1. Deadlock

```cpp
// BAD: Two locks in different order
Thread 1: lock(mutex_a); lock(mutex_b);
Thread 2: lock(mutex_b); lock(mutex_a);  // DEADLOCK!

// GOOD: Always lock in same order
std::scoped_lock lock(mutex_a, mutex_b);  // C++17
```

### 2. Forgetting to Notify

```cpp
// BAD: Workers wait forever
task_queue_.push(task);  // Forgot notify!

// GOOD
task_queue_.push(task);
condition_.notify_one();  // Wake a worker
```

### 3. Race Conditions

```cpp
// BAD: Check and modify without lock
if (!queue_.empty()) {  // Race here!
    auto task = queue_.front();
}

// GOOD: Lock covers entire operation
std::lock_guard<std::mutex> lock(mutex_);
if (!queue_.empty()) {
    auto task = queue_.front();
}
```

---

## 📖 Resources

### C++ Threading Documentation

- [std::thread](https://en.cppreference.com/w/cpp/thread/thread)
- [std::mutex](https://en.cppreference.com/w/cpp/thread/mutex)
- [std::condition_variable](https://en.cppreference.com/w/cpp/thread/condition_variable)
- [std::atomic](https://en.cppreference.com/w/cpp/atomic/atomic)

### Books & Tutorials

- "C++ Concurrency in Action" by Anthony Williams
- [C++ Threading Tutorial](https://www.cplusplus.com/reference/thread/)

### Tools

- Thread Sanitizer: `clang++ -fsanitize=thread`
- Valgrind: `valgrind --tool=helgrind`

---

## 🎉 What You'll Achieve

After Phase 3, you'll have:

1. **Deep Threading Knowledge** - Multi-threaded programming mastery
2. **High-Performance Server** - 5-10x faster with concurrent processing
3. **Production Skills** - Thread-safe code, proper synchronization
4. **Resume Gold** - "Built multi-threaded HTTP server in C++"

---

**Ready to start?** Let's create the WorkerPool! 🚀💪

**Next:** Create `cpp/include/worker_pool.h`
