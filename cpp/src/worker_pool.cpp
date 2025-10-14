#include "worker_pool.h"
#include <iostream>

namespace flash {

// ============================================================================
// TODO 9.1.2: Implement WorkerPool constructor
// ============================================================================
WorkerPool::WorkerPool(size_t num_workers)
    : running_(false)
    , shutdown_requested_(false)
    , num_workers_(num_workers)
{
    // Auto-detect optimal thread count if not specified
    if (num_workers_ == 0) {
        num_workers_ = std::thread::hardware_concurrency();
        if (num_workers_ == 0) {
            num_workers_ = 4; // Fallback if detection fails
        }
    }
    
    std::cout << "[WorkerPool] Creating pool with " << num_workers_ << " workers" << std::endl;
}

// ============================================================================
// WorkerPool destructor - RAII cleanup
// ============================================================================
WorkerPool::~WorkerPool() {
    if (running_) {
        shutdown();  // Ensure graceful shutdown
    }
}

// ============================================================================
// Start worker threads
// ============================================================================
void WorkerPool::start() {
    if (running_) {
        std::cerr << "[WorkerPool] Already running!" << std::endl;
        return;
    }
    
    running_ = true;
    shutdown_requested_ = false;
    
    // Launch worker threads
    for (size_t i = 0; i < num_workers_; ++i) {
        workers_.emplace_back(&WorkerPool::worker_thread, this);
    }
    
    std::cout << "[WorkerPool] Started " << num_workers_ << " workers" << std::endl;
}

// ============================================================================
// Worker thread main loop - THE HEART OF THE POOL
// ============================================================================
void WorkerPool::worker_thread() {
    while (running_) {
        Task task;
        
        {
            // Lock mutex and wait for work
            std::unique_lock<std::mutex> lock(queue_mutex_);
            
            // Wait until: task available OR shutdown requested
            // Predicate prevents spurious wakeups
            condition_.wait(lock, [this]() {
                return !task_queue_.empty() || shutdown_requested_;
            });
            
            // Exit if shutdown requested and no tasks left
            if (shutdown_requested_ && task_queue_.empty()) {
                break;
            }
            
            // Get task from queue
            if (!task_queue_.empty()) {
                task = std::move(task_queue_.front());
                task_queue_.pop();
            }
        }
        // Lock released here! Other threads can now access queue
        
        // Execute task outside of lock - this enables true concurrency!
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

// ============================================================================
// Submit task to queue
// ============================================================================
bool WorkerPool::submit(Task task) {
    // Reject tasks if shutting down
    if (shutdown_requested_) {
        return false;
    }
    
    // Add task to queue (with lock)
    {
        std::lock_guard<std::mutex> lock(queue_mutex_);
        task_queue_.push(std::move(task));
    }
    
    // Wake up one worker to process the task
    // Using notify_one() instead of notify_all() for efficiency
    condition_.notify_one();
    return true;
}

// ============================================================================
// Gracefully shutdown worker pool
// ============================================================================
void WorkerPool::shutdown() {
    std::cout << "[WorkerPool] Shutting down..." << std::endl;
    
    // Signal all workers to exit
    shutdown_requested_ = true;
    
    // Wake ALL workers so they can see the shutdown signal
    // Using notify_all() here (not notify_one()) because we need
    // every thread to wake up and exit
    condition_.notify_all();
    
    // Wait for all workers to finish their current tasks and exit
    for (auto& worker : workers_) {
        if (worker.joinable()) {
            worker.join();
        }
    }
    
    running_ = false;
    std::cout << "[WorkerPool] Shutdown complete" << std::endl;
}

// ============================================================================
// Utility methods
// ============================================================================
size_t WorkerPool::pending_tasks() const {
    std::lock_guard<std::mutex> lock(queue_mutex_);
    return task_queue_.size();
}

size_t WorkerPool::num_workers() const {
    return num_workers_;
}

} // namespace flash
