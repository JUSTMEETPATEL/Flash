# C++ Threading Quick Reference

## 🧵 Thread Basics

### Creating Threads

```cpp
#include <thread>

// Lambda function
std::thread t1([]() {
    std::cout << "Hello from thread!" << std::endl;
});

// Regular function
void worker() { /* ... */ }
std::thread t2(worker);

// Member function
class Worker {
    void run() { /* ... */ }
};
Worker w;
std::thread t3(&Worker::run, &w);

// Must join or detach before destruction!
t1.join();  // Wait for thread to finish
t2.detach(); // Run independently
```

### Thread Lifecycle

```cpp
std::thread t(worker);

t.joinable();  // Check if thread is running
t.join();      // Wait for thread to finish (blocks)
t.detach();    // Let thread run independently

// After join() or detach(), joinable() returns false
```

---

## 🔒 Mutex (Mutual Exclusion)

### Basic Mutex

```cpp
#include <mutex>

std::mutex mtx;
int shared_data = 0;

// Manual lock/unlock (NOT RECOMMENDED - not exception-safe)
mtx.lock();
shared_data++;
mtx.unlock();
```

### RAII Locks (RECOMMENDED)

```cpp
// lock_guard - Simple, automatic lock/unlock
{
    std::lock_guard<std::mutex> lock(mtx);
    shared_data++;
} // Automatically unlocks here

// unique_lock - More flexible, can manually unlock
{
    std::unique_lock<std::mutex> lock(mtx);
    shared_data++;
    lock.unlock();  // Can unlock early

    // Do non-critical work here

    lock.lock();  // Can re-lock
    shared_data++;
}

// scoped_lock (C++17) - Lock multiple mutexes atomically
std::mutex mtx1, mtx2;
{
    std::scoped_lock lock(mtx1, mtx2);  // Deadlock-free!
    // Access data protected by both mutexes
}
```

---

## 📢 Condition Variables

### Wait for Notification

```cpp
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

// Waiting thread
void wait_for_signal() {
    std::unique_lock<std::mutex> lock(mtx);

    // Wait until ready is true
    cv.wait(lock, []{ return ready; });

    // Continue when notified and ready == true
}

// Notifying thread
void send_signal() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one();  // Wake one waiting thread
}
```

### Notify Strategies

```cpp
cv.notify_one();   // Wake ONE waiting thread
cv.notify_all();   // Wake ALL waiting threads

// Use notify_one() when:
// - Only one thread should handle the event
// - Example: Task added to queue

// Use notify_all() when:
// - All threads need to react to event
// - Example: Shutdown signal
```

### Why Predicate is Important

```cpp
// ❌ BAD: Without predicate (spurious wakeup!)
cv.wait(lock);
if (queue.empty()) {
    // Oops! Woke up but no work available
}

// ✅ GOOD: With predicate
cv.wait(lock, []{ return !queue.empty(); });
// Guaranteed to have work when wait() returns
```

---

## ⚛️ Atomic Operations

### Atomic Types

```cpp
#include <atomic>

std::atomic<int> counter{0};
std::atomic<bool> flag{false};

// Thread-safe operations (no mutex needed!)
counter++;           // Atomic increment
counter--;           // Atomic decrement
counter += 5;        // Atomic add
flag = true;         // Atomic write
bool value = flag;   // Atomic read

// Explicit operations
counter.fetch_add(1);
counter.store(42);
int val = counter.load();
```

### When to Use Atomic vs Mutex

```cpp
// ✅ Use atomic for:
std::atomic<int> simple_counter;     // Single variable, simple operations
std::atomic<bool> shutdown_flag;     // Boolean flags

// ✅ Use mutex for:
std::mutex mtx;
std::queue<Task> task_queue;  // Complex data structures
int x, y;                     // Multiple related variables
```

---

## 🎯 Common Patterns

### Producer-Consumer

```cpp
std::queue<int> queue;
std::mutex mtx;
std::condition_variable cv;
bool done = false;

// Producer
void produce(int value) {
    {
        std::lock_guard<std::mutex> lock(mtx);
        queue.push(value);
    }
    cv.notify_one();
}

// Consumer
void consume() {
    while (true) {
        std::unique_lock<std::mutex> lock(mtx);

        cv.wait(lock, []{ return !queue.empty() || done; });

        if (done && queue.empty()) {
            break;
        }

        int value = queue.front();
        queue.pop();
        lock.unlock();

        // Process value
    }
}
```

### Thread-Safe Singleton

```cpp
class Singleton {
public:
    static Singleton& getInstance() {
        static Singleton instance;  // Thread-safe in C++11+
        return instance;
    }

private:
    Singleton() {}
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
};
```

### RAII Lock Wrapper

```cpp
class ThreadSafeCounter {
public:
    void increment() {
        std::lock_guard<std::mutex> lock(mtx_);
        count_++;
    }

    int get() const {
        std::lock_guard<std::mutex> lock(mtx_);
        return count_;
    }

private:
    mutable std::mutex mtx_;
    int count_ = 0;
};
```

---

## ⚠️ Common Pitfalls

### Deadlock

```cpp
// ❌ BAD: Locking in different order
// Thread 1:
lock(mtx_a);
lock(mtx_b);  // Deadlock if thread 2 has mtx_b!

// Thread 2:
lock(mtx_b);
lock(mtx_a);  // Deadlock if thread 1 has mtx_a!

// ✅ GOOD: Always lock in same order
lock(mtx_a);
lock(mtx_b);

// ✅ BETTER: Use scoped_lock (C++17)
std::scoped_lock lock(mtx_a, mtx_b);  // Deadlock-free!
```

### Forgetting to Join

```cpp
// ❌ BAD: Thread destroyed without join/detach
{
    std::thread t(worker);
}  // Destructor called - std::terminate() if not joined!

// ✅ GOOD: Always join or detach
{
    std::thread t(worker);
    t.join();  // Wait for completion
}

// ✅ ALSO GOOD: Use RAII wrapper
class ThreadGuard {
    std::thread& t_;
public:
    explicit ThreadGuard(std::thread& t) : t_(t) {}
    ~ThreadGuard() { if (t_.joinable()) t_.join(); }
};
```

### Race Condition

```cpp
// ❌ BAD: Check-then-act without lock
if (!queue.empty()) {  // Check
    auto item = queue.front();  // Act - TOO LATE!
}

// ✅ GOOD: Lock covers entire operation
{
    std::lock_guard<std::mutex> lock(mtx);
    if (!queue.empty()) {
        auto item = queue.front();
        queue.pop();
    }
}
```

### Holding Lock Too Long

```cpp
// ❌ BAD: Long operation while holding lock
{
    std::lock_guard<std::mutex> lock(mtx);
    auto task = queue.front();
    queue.pop();
    task();  // SLOW! Blocks all other threads
}

// ✅ GOOD: Release lock before slow operation
Task task;
{
    std::lock_guard<std::mutex> lock(mtx);
    task = queue.front();
    queue.pop();
}
task();  // Execute outside lock
```

---

## 🔧 Debugging Tools

### Compile with Sanitizers

```bash
# Thread Sanitizer (detects data races)
g++ -fsanitize=thread -g source.cpp -o program

# Address Sanitizer (detects memory errors)
g++ -fsanitize=address -g source.cpp -o program

# Both
g++ -fsanitize=thread,address -g source.cpp -o program
```

### Valgrind Helgrind (Linux only)

```bash
valgrind --tool=helgrind ./program
```

---

## 📝 Best Practices

### ✅ DO

- Use RAII locks (lock_guard, unique_lock)
- Use condition variables for waiting (not busy loops)
- Use atomic for simple counters/flags
- Lock mutexes in consistent order
- Keep critical sections short
- Document thread-safety requirements
- Test with thread sanitizer

### ❌ DON'T

- Manual lock/unlock (not exception-safe)
- Busy-wait loops (waste CPU)
- Forget to join threads
- Hold locks during long operations
- Access shared data without synchronization
- Lock in different order from different threads
- Assume operations are atomic unless documented

---

## 🎓 Quick Reference Table

| Primitive               | Use Case                      | Key Methods              |
| ----------------------- | ----------------------------- | ------------------------ |
| std::thread             | Create thread                 | join(), detach()         |
| std::mutex              | Protect shared data           | lock(), unlock()         |
| std::lock_guard         | RAII lock (simple)            | Constructor locks        |
| std::unique_lock        | RAII lock (flexible)          | lock(), unlock()         |
| std::condition_variable | Wait for notification         | wait(), notify_one/all() |
| std::atomic             | Lock-free shared variable     | load(), store(), ++/--   |
| std::scoped_lock        | Lock multiple mutexes (C++17) | Constructor locks all    |

---

## 🚀 Example: Complete Thread Pool (Minimal)

```cpp
class SimplePool {
    std::vector<std::thread> workers_;
    std::queue<std::function<void()>> tasks_;
    std::mutex mtx_;
    std::condition_variable cv_;
    bool stop_ = false;

public:
    SimplePool(size_t n) {
        for (size_t i = 0; i < n; ++i) {
            workers_.emplace_back([this] {
                while (true) {
                    std::function<void()> task;
                    {
                        std::unique_lock<std::mutex> lock(mtx_);
                        cv_.wait(lock, [this]{ return stop_ || !tasks_.empty(); });
                        if (stop_ && tasks_.empty()) return;
                        task = std::move(tasks_.front());
                        tasks_.pop();
                    }
                    task();
                }
            });
        }
    }

    ~SimplePool() {
        {
            std::lock_guard<std::mutex> lock(mtx_);
            stop_ = true;
        }
        cv_.notify_all();
        for (auto& w : workers_) w.join();
    }

    void submit(std::function<void()> task) {
        {
            std::lock_guard<std::mutex> lock(mtx_);
            tasks_.push(std::move(task));
        }
        cv_.notify_one();
    }
};
```

---

**Print this out and keep it handy while implementing TODO 9.1!** 📌
