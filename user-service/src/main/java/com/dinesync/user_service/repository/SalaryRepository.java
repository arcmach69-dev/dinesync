package com.dinesync.user_service.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.user_service.entity.Salary;

@Repository
public interface SalaryRepository 
        extends JpaRepository<Salary, Long> {
    List<Salary> findByMonthAndYear(Integer month, Integer year);
    List<Salary> findByUserId(Long userId);
    List<Salary> findByStatus(
        com.dinesync.user_service.entity.SalaryStatus status);
}