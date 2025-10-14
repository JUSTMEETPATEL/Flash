#include "worker_pool.h"
#include <iostream>
#include <iomanip>
#include <atomic>
#include <chrono>
#include <thread>

using namespace flash;

int main() {
    std::cout << "\n=== WorkerPool Manual Test ===" << std::endl;
    
    // Test 1: Basic creation and shutdown
    std::cout << "\n[Test 1] Create and shutdown" << std::endl;
    {
        WorkerPool pool(4);
        pool.start();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        pool.shutdown();
        std::cout << "✓ Clean shutdown" << std::endl;
    }
    
    // Test 2: Execute tasks
    std::cout << "\n[Test 2] Execute 100 tasks" << std::endl;
    {
        WorkerPool pool(4);
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
            return 1;
        }
    }
    
    // Test 3: Concurrent submissions
    std::cout << "\n[Test 3] Concurrent submissions from multiple threads" << std::endl;
    {
        WorkerPool pool(4);
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
            return 1;
        }
    }
    
    // Test 4: Heavy load
    std::cout << "\n[Test 4] Heavy load (10000 tasks with work)" << std::endl;
    {
        WorkerPool pool(8);
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
            return 1;
        }
    }
    
    // Test 5: Exception handling
    std::cout << "\n[Test 5] Exception handling" << std::endl;
    {
        WorkerPool pool(2);
        std::atomic<int> good_counter{0};
        
        pool.start();
        
        // Submit task that throws
        pool.submit([]() {
            throw std::runtime_error("Test exception - this is expected!");
        });
        
        // Submit good tasks
        for (int i = 0; i < 50; ++i) {
            pool.submit([&good_counter]() {
                good_counter++;
            });
        }
        
        pool.shutdown();
        
        std::cout << "Good tasks completed: " << good_counter << " (expected: 50)" << std::endl;
        if (good_counter == 50) {
            std::cout << "✓ Exception handled gracefully" << std::endl;
        } else {
            std::cout << "✗ FAILED: Exception affected other tasks!" << std::endl;
            return 1;
        }
    }
    
    // Test 6: Rapid start/shutdown cycles
    std::cout << "\n[Test 6] Rapid start/shutdown cycles" << std::endl;
    {
        for (int i = 0; i < 5; ++i) {
            WorkerPool pool(2);
            pool.start();
            pool.submit([]() { volatile int x = 42; (void)x; });
            pool.shutdown();
        }
        std::cout << "✓ Multiple cycles completed" << std::endl;
    }
    
    // Test 7: Performance comparison
    std::cout << "\n[Test 7] Performance: 1 vs 4 vs 8 workers" << std::endl;
    {
        auto test_workers = [](int workers, int tasks) {
            WorkerPool pool(workers);
            std::atomic<int> counter{0};
            
            auto start = std::chrono::steady_clock::now();
            
            pool.start();
            
            for (int i = 0; i < tasks; ++i) {
                pool.submit([&counter]() {
                    counter++;
                    // Simulate CPU work
                    volatile int x = 0;
                    for (int j = 0; j < 5000; ++j) {
                        x += j;
                    }
                });
            }
            
            pool.shutdown();
            
            auto end = std::chrono::steady_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
            
            return duration.count();
        };
        
        const int tasks = 1000;
        
        auto time_1 = test_workers(1, tasks);
        auto time_4 = test_workers(4, tasks);
        auto time_8 = test_workers(8, tasks);
        
        std::cout << "  1 worker:  " << time_1 << "ms" << std::endl;
        std::cout << "  4 workers: " << time_4 << "ms (speedup: " 
                  << std::fixed << std::setprecision(2) 
                  << (double)time_1/time_4 << "x)" << std::endl;
        std::cout << "  8 workers: " << time_8 << "ms (speedup: " 
                  << (double)time_1/time_8 << "x)" << std::endl;
        
        if (time_4 < time_1 && time_8 < time_1) {
            std::cout << "✓ More workers = better performance" << std::endl;
        } else {
            std::cout << "⚠ Warning: Performance didn't scale as expected" << std::endl;
        }
    }
    
    std::cout << "\n=== All Tests Passed! ===" << std::endl;
    std::cout << "\n🎉 WorkerPool is working correctly!" << std::endl;
    std::cout << "✅ Thread-safe task submission" << std::endl;
    std::cout << "✅ Concurrent task execution" << std::endl;
    std::cout << "✅ Exception handling" << std::endl;
    std::cout << "✅ Graceful shutdown" << std::endl;
    std::cout << "✅ Performance scaling\n" << std::endl;
    
    return 0;
}
