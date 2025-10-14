#include <gtest/gtest.h>
#include "worker_pool.h"
#include <atomic>
#include <chrono>
#include <thread>
#include <vector>

namespace flash {
namespace test {

class WorkerPoolTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Setup runs before each test
    }
    
    void TearDown() override {
        // Cleanup runs after each test
    }
};

// ============================================================================
// Basic Functionality Tests
// ============================================================================

TEST_F(WorkerPoolTest, CreatesPoolWithSpecifiedWorkers) {
    WorkerPool pool(4);
    EXPECT_EQ(pool.num_workers(), 4);
}

TEST_F(WorkerPoolTest, UsesHardwareConcurrencyByDefault) {
    WorkerPool pool(0);  // 0 means auto-detect
    EXPECT_GT(pool.num_workers(), 0);
    EXPECT_LE(pool.num_workers(), std::thread::hardware_concurrency() + 1);
}

TEST_F(WorkerPoolTest, StartsSuccessfully) {
    WorkerPool pool(2);
    EXPECT_NO_THROW(pool.start());
}

TEST_F(WorkerPoolTest, PreventDoubleStart) {
    WorkerPool pool(2);
    pool.start();
    
    // Second start should be safe (just prints warning)
    EXPECT_NO_THROW(pool.start());
    
    pool.shutdown();
}

TEST_F(WorkerPoolTest, ShutdownSuccessfully) {
    WorkerPool pool(2);
    pool.start();
    EXPECT_NO_THROW(pool.shutdown());
}

TEST_F(WorkerPoolTest, ShutdownWithoutStart) {
    WorkerPool pool(2);
    // Shutdown without start should be safe
    EXPECT_NO_THROW(pool.shutdown());
}

TEST_F(WorkerPoolTest, DestructorCleansUp) {
    {
        WorkerPool pool(2);
        pool.start();
        // Destructor should call shutdown automatically
    }
    // If we get here without hanging, test passes
    SUCCEED();
}

// ============================================================================
// Task Execution Tests
// ============================================================================

TEST_F(WorkerPoolTest, ExecutesSingleTask) {
    WorkerPool pool(2);
    std::atomic<bool> executed{false};
    
    pool.start();
    
    pool.submit([&executed]() {
        executed = true;
    });
    
    pool.shutdown();
    
    EXPECT_TRUE(executed);
}

TEST_F(WorkerPoolTest, ExecutesMultipleTasks) {
    WorkerPool pool(4);
    std::atomic<int> counter{0};
    const int num_tasks = 100;
    
    pool.start();
    
    for (int i = 0; i < num_tasks; ++i) {
        pool.submit([&counter]() {
            counter++;
        });
    }
    
    pool.shutdown();
    
    EXPECT_EQ(counter, num_tasks);
}

TEST_F(WorkerPoolTest, ExecutesTasksConcurrently) {
    WorkerPool pool(4);
    std::atomic<int> concurrent_count{0};
    std::atomic<int> max_concurrent{0};
    
    pool.start();
    
    // Submit tasks that increment concurrent_count, sleep, then decrement
    for (int i = 0; i < 8; ++i) {
        pool.submit([&concurrent_count, &max_concurrent]() {
            int current = ++concurrent_count;
            
            // Update max if needed
            int expected = max_concurrent.load();
            while (expected < current && 
                   !max_concurrent.compare_exchange_weak(expected, current)) {
                // Retry if another thread updated max_concurrent
            }
            
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            --concurrent_count;
        });
    }
    
    pool.shutdown();
    
    // With 4 workers and 8 tasks, we should see at least 2 tasks running concurrently
    EXPECT_GE(max_concurrent, 2);
}

TEST_F(WorkerPoolTest, HandlesTaskExceptions) {
    WorkerPool pool(2);
    std::atomic<int> good_tasks{0};
    
    pool.start();
    
    // Submit task that throws
    pool.submit([]() {
        throw std::runtime_error("Test exception");
    });
    
    // Submit good tasks - should still execute
    for (int i = 0; i < 10; ++i) {
        pool.submit([&good_tasks]() {
            good_tasks++;
        });
    }
    
    pool.shutdown();
    
    // Good tasks should all execute despite the exception
    EXPECT_EQ(good_tasks, 10);
}

TEST_F(WorkerPoolTest, ExecutesTasksInOrder) {
    WorkerPool pool(1);  // Single worker for deterministic order
    std::vector<int> results;
    std::mutex results_mutex;
    
    pool.start();
    
    for (int i = 0; i < 10; ++i) {
        pool.submit([&results, &results_mutex, i]() {
            std::lock_guard<std::mutex> lock(results_mutex);
            results.push_back(i);
        });
    }
    
    pool.shutdown();
    
    // With single worker, tasks should execute in order
    EXPECT_EQ(results.size(), 10);
    for (int i = 0; i < 10; ++i) {
        EXPECT_EQ(results[i], i);
    }
}

// ============================================================================
// Thread Safety Tests
// ============================================================================

TEST_F(WorkerPoolTest, HandlesConcurrentSubmissions) {
    WorkerPool pool(4);
    std::atomic<int> counter{0};
    const int num_submitters = 10;
    const int tasks_per_submitter = 100;
    
    pool.start();
    
    // Submit tasks from multiple threads concurrently
    std::vector<std::thread> submitters;
    for (int i = 0; i < num_submitters; ++i) {
        submitters.emplace_back([&pool, &counter, tasks_per_submitter]() {
            for (int j = 0; j < tasks_per_submitter; ++j) {
                pool.submit([&counter]() {
                    counter++;
                });
            }
        });
    }
    
    // Wait for all submitters to finish
    for (auto& t : submitters) {
        t.join();
    }
    
    pool.shutdown();
    
    EXPECT_EQ(counter, num_submitters * tasks_per_submitter);
}

TEST_F(WorkerPoolTest, ThreadSafeCounterIncrement) {
    WorkerPool pool(8);
    std::atomic<int> counter{0};
    const int num_tasks = 10000;
    
    pool.start();
    
    for (int i = 0; i < num_tasks; ++i) {
        pool.submit([&counter]() {
            counter++;
        });
    }
    
    pool.shutdown();
    
    // Every task should increment exactly once
    EXPECT_EQ(counter, num_tasks);
}

// ============================================================================
// Shutdown Behavior Tests
// ============================================================================

TEST_F(WorkerPoolTest, RejectsTasksAfterShutdown) {
    WorkerPool pool(2);
    pool.start();
    pool.shutdown();
    
    bool accepted = pool.submit([]() {});
    EXPECT_FALSE(accepted);
}

TEST_F(WorkerPoolTest, CompletesAllTasksBeforeShutdown) {
    WorkerPool pool(4);
    std::atomic<int> counter{0};
    const int num_tasks = 1000;
    
    pool.start();
    
    // Submit many tasks
    for (int i = 0; i < num_tasks; ++i) {
        pool.submit([&counter]() {
            counter++;
        });
    }
    
    // Shutdown waits for all tasks
    pool.shutdown();
    
    // All tasks should have completed
    EXPECT_EQ(counter, num_tasks);
}

TEST_F(WorkerPoolTest, ShutdownWaitsForRunningTasks) {
    WorkerPool pool(2);
    std::atomic<bool> task_started{false};
    std::atomic<bool> task_finished{false};
    
    pool.start();
    
    // Submit task that takes time
    pool.submit([&task_started, &task_finished]() {
        task_started = true;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        task_finished = true;
    });
    
    // Wait for task to start
    while (!task_started) {
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
    
    // Shutdown should wait for task to finish
    pool.shutdown();
    
    EXPECT_TRUE(task_finished);
}

// ============================================================================
// Utility Method Tests
// ============================================================================

TEST_F(WorkerPoolTest, ReportsPendingTasks) {
    WorkerPool pool(1);  // Single worker
    std::atomic<bool> release{false};
    
    pool.start();
    
    // Submit blocking task
    pool.submit([&release]() {
        while (!release) {
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    });
    
    // Submit more tasks that will be queued
    for (int i = 0; i < 10; ++i) {
        pool.submit([]() {});
    }
    
    std::this_thread::sleep_for(std::chrono::milliseconds(50));
    
    // Should have queued tasks (first task is executing, others waiting)
    size_t pending = pool.pending_tasks();
    EXPECT_GT(pending, 0);
    
    release = true;
    pool.shutdown();
}

TEST_F(WorkerPoolTest, ReturnsCorrectWorkerCount) {
    WorkerPool pool(7);
    EXPECT_EQ(pool.num_workers(), 7);
}

// ============================================================================
// Performance Tests
// ============================================================================

TEST_F(WorkerPoolTest, HandlesHighThroughput) {
    WorkerPool pool(8);
    std::atomic<int> counter{0};
    const int num_tasks = 10000;
    
    pool.start();
    
    auto start = std::chrono::steady_clock::now();
    
    for (int i = 0; i < num_tasks; ++i) {
        pool.submit([&counter]() {
            counter++;
            // Simulate tiny work
            volatile int x = 0;
            for (int j = 0; j < 100; ++j) {
                x += j;
            }
        });
    }
    
    pool.shutdown();
    
    auto end = std::chrono::steady_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    EXPECT_EQ(counter, num_tasks);
    
    // Should complete 10000 tiny tasks in reasonable time (< 5 seconds)
    EXPECT_LT(duration.count(), 5000);
    
    std::cout << "[Performance] Completed " << num_tasks << " tasks in " 
              << duration.count() << "ms" << std::endl;
}

TEST_F(WorkerPoolTest, ScalesWithWorkerCount) {
    const int num_tasks = 1000;
    
    // Test with 1 worker
    auto test_with_workers = [num_tasks](size_t workers) {
        WorkerPool pool(workers);
        std::atomic<int> counter{0};
        
        auto start = std::chrono::steady_clock::now();
        
        pool.start();
        
        for (int i = 0; i < num_tasks; ++i) {
            pool.submit([&counter]() {
                counter++;
                // Simulate work
                std::this_thread::sleep_for(std::chrono::microseconds(100));
            });
        }
        
        pool.shutdown();
        
        auto end = std::chrono::steady_clock::now();
        return std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
    };
    
    auto time_1_worker = test_with_workers(1);
    auto time_4_workers = test_with_workers(4);
    
    std::cout << "[Scalability] 1 worker: " << time_1_worker << "ms, "
              << "4 workers: " << time_4_workers << "ms" << std::endl;
    
    // 4 workers should be significantly faster (at least 2x)
    EXPECT_LT(time_4_workers, time_1_worker / 2);
}

// ============================================================================
// Edge Cases
// ============================================================================

TEST_F(WorkerPoolTest, HandlesEmptyTaskSubmission) {
    WorkerPool pool(2);
    
    pool.start();
    
    // Submit empty lambda
    bool accepted = pool.submit([]() {});
    EXPECT_TRUE(accepted);
    
    pool.shutdown();
}

TEST_F(WorkerPoolTest, HandlesZeroTaskLoad) {
    WorkerPool pool(4);
    
    pool.start();
    // Don't submit any tasks
    pool.shutdown();
    
    // Should complete without hanging
    SUCCEED();
}

TEST_F(WorkerPoolTest, HandlesRapidStartShutdownCycles) {
    for (int i = 0; i < 10; ++i) {
        WorkerPool pool(2);
        pool.start();
        pool.shutdown();
    }
    
    SUCCEED();
}

} // namespace test
} // namespace flash
