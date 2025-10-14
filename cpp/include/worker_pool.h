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
