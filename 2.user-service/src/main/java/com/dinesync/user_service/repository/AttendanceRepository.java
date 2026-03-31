package com.dinesync.user_service.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.user_service.entity.Attendance;

@Repository
public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByUserId(Long userId);
    List<Attendance> findByDateBetween(
        LocalDate startDate, LocalDate endDate);
}